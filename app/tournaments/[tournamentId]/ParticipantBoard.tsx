// app/tournaments/[tournamentId]/ParticipantBoard.tsx
"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getParticipants, finishTournament as finishTournamentApi } from "@/app/api";
import type { Team } from "@/app/models/team_model";

const SLOT_COUNT = 25;

type RankKey =
  `rank_${1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25}`;

export type FinishPayload = {
  tournament_id: string;
  game_category: string;
} & Partial<Record<RankKey, string>>;

type RawTeam = Partial<Team> & {
  team_id?: string;
  teamName?: string;
  name?: string;
};

function normalizeTeams(raw: RawTeam[]): Team[] {
  const mapped = (raw ?? [])
    .map((r, idx) => ({
      teamId: (r.teamId ?? r.team_id ?? "").trim() || `__temp_${idx}`,
      players: Array.isArray(r.players) ? (r.players as string[]) : [],
      team_name: (r.team_name ?? r.teamName ?? r.name ?? `Team ${idx + 1}`).toString(),
      position_in_tournament: r.position_in_tournament ?? "",
      tournament_id: r.tournament_id ?? "",
    }))
    .filter((t) => !!t.teamId);

  // dedupe by id
  return Array.from(new Map(mapped.map((t) => [t.teamId, t])).values());
}

function buildFinishPayload(
  tournamentId: string,
  game_category: string,
  ranking: Array<Team | null>
): FinishPayload {
  const out: FinishPayload = { tournament_id: tournamentId, game_category };
  const limit = Math.min(SLOT_COUNT, ranking.length);
  for (let i = 0; i < limit; i++) {
    const t = ranking[i];
    if (!t) continue;
    const key = `rank_${i + 1}` as RankKey;
    out[key] = t.teamId;
  }
  return out;
}

export default function ParticipantsBoard({
  tournamentId,
  canEdit,        // false => player
  locked = false, // true => ended
  onFinished,
}: {
  tournamentId: string;
  canEdit: boolean;
  locked?: boolean;
  onFinished: () => void;
}) {
  const queryClient = useQueryClient();

  // ---------- Flags (no early return) ----------
  const forceReadOnlyGrid = !canEdit || locked; // player OR ended
  const editable = canEdit && !locked;

  // ---------- Sensors (always created to keep hook order stable) ----------
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 2 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  // ---------- Data fetch (always) ----------
  const {
    data: participantsDataRaw = [],
    isLoading: participantsLoading,
    isError: participantsError,
  } = useQuery({
    queryKey: ["participants", tournamentId],
    queryFn: async (): Promise<RawTeam[]> => getParticipants(tournamentId),
  });

  // ---------- Local state (always) ----------
  const [pool, setPool] = React.useState<Team[]>([]);
  const [ranking, setRanking] = React.useState<Array<Team | null>>(Array(SLOT_COUNT).fill(null));

  React.useEffect(() => {
    const normalized = normalizeTeams(participantsDataRaw);
    setPool(normalized);
    setRanking(Array(SLOT_COUNT).fill(null));
  }, [participantsDataRaw]);

  // ---------- Mutation (always create hook; guard its use with `editable`) ----------
  const finishTournament = useMutation({
    mutationFn: async () => {
      if (!editable) return; // no-op when not editable
      const payload = buildFinishPayload(tournamentId, "CAT_BR", ranking);
      return await finishTournamentApi(payload);
    },
    onSuccess: async () => {
      onFinished();
      await queryClient.invalidateQueries({ queryKey: ["leaderboardRaw", tournamentId] });
    },
  });

  // ---------- Context menu (always set up, guarded by `editable`) ----------
  type ContextMenuState = { open: boolean; x: number; y: number; teamId: string | null };
  const [menu, setMenu] = React.useState<ContextMenuState>({ open: false, x: 0, y: 0, teamId: null });
  const closeMenu = () => setMenu({ open: false, x: 0, y: 0, teamId: null });
  function openMenu(teamId: string, e: React.MouseEvent) {
    if (!editable) return;
    e.preventDefault();
    setMenu({ open: true, x: e.clientX, y: e.clientY, teamId });
  }
  React.useEffect(() => {
    if (!menu.open) return;
    const onClick = () => closeMenu();
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [menu.open]);

  // ---------- Move helpers (always defined; guarded inside) ----------
  const moveTeamToSlot = React.useCallback(
    (teamId: string, targetIndex: number) => {
      if (!editable) return;
      setRanking((prev) => {
        const next = [...prev];
        const fromSlotIndex = next.findIndex((t) => t?.teamId === teamId);
        const teamFromPool = pool.find((t) => t.teamId === teamId);
        const draggedTeam = teamFromPool ?? (fromSlotIndex >= 0 ? next[fromSlotIndex]! : null);
        if (!draggedTeam) return prev;

        const occupying = next[targetIndex];

        if (fromSlotIndex >= 0) {
          next[targetIndex] = draggedTeam;
          next[fromSlotIndex] = occupying ?? null;
          return next;
        }

        next[targetIndex] = draggedTeam;
        setPool((p) => {
          let out = p.filter((t) => t.teamId !== teamId);
          if (occupying && !out.some((t) => t.teamId === occupying.teamId)) out = [...out, occupying];
          return normalizeTeams(out);
        });
        return next;
      });
    },
    [editable, pool]
  );

  const removeTeamToPool = React.useCallback(
    (teamId: string) => {
      if (!editable) return;
      setRanking((prev) => {
        const next = [...prev];
        const idx = next.findIndex((t) => t?.teamId === teamId);
        if (idx >= 0) {
          const team = next[idx]!;
          next[idx] = null;
          setPool((p) => normalizeTeams(p.some((t) => t.teamId === team.teamId) ? p : [...p, team]));
        }
        return next;
      });
      closeMenu();
    },
    [editable]
  );

  // ---------- Drag overlay (always) ----------
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeTeam = React.useMemo<Team | null>(() => {
    if (!activeId) return null;
    return pool.find((t) => t.teamId === activeId) ?? ranking.find((t) => t?.teamId === activeId) ?? null;
  }, [activeId, pool, ranking]);

  // ---------- DnD handlers (always defined; guarded inside) ----------
  function handleDragStart(event: DragStartEvent) {
    if (!editable) return;
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const overId = event.over?.id ? String(event.over.id) : null;
    const active = String(event.active.id);
    setActiveId(null);

    if (!editable || !overId) return;

    if (overId === "pool" || overId.startsWith("pool-") || overId === "pool-column") {
      setRanking((prev) => {
        const next = [...prev];
        const fromSlotIndex = next.findIndex((t) => t?.teamId === active);
        if (fromSlotIndex >= 0) {
          const team = next[fromSlotIndex]!;
          next[fromSlotIndex] = null;
          setPool((p) => normalizeTeams(p.some((t) => t.teamId === team.teamId) ? p : [...p, team]));
        }
        return next;
      });
      return;
    }

    if (overId.startsWith("slot-")) {
      const targetIndex = Number(overId.split("-")[1]);
      moveTeamToSlot(active, targetIndex);
    }
  }

  // ---------- Render ----------
  // Player OR ended => only 5×5 participants grid. Admin (live/upcoming) => interactive board.
  const showReadOnlyGrid = forceReadOnlyGrid;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {showReadOnlyGrid ? (
        // PLAYER/ENDED VIEW: 5x5 grid only
        <div className="w-full flex items-start justify-center p-6">
          <Participants
            teams={pool}
            loading={participantsLoading}
            error={participantsError}
            onCardContextMenu={() => {}}
            draggable={false}
            droppableToPool={false}
            gridLikeRanking // show 5x5 grid
          />
        </div>
      ) : (
        // ADMIN VIEW: list + ranking
        <>
          <div className="w-full flex items-start justify-center gap-8 p-6">
            <Participants
              teams={pool}
              loading={participantsLoading}
              error={participantsError}
              onCardContextMenu={(teamId, e) => openMenu(teamId, e)}
              draggable={true}
              droppableToPool={true}
              gridLikeRanking={false}
            />
            <RankingGrid
              slots={ranking}
              onSlotContextMenu={(teamId, e) => teamId && openMenu(teamId, e)}
            />
          </div>

          <div className="flex justify-center gap-4 pb-6">
            <button
              onClick={() => finishTournament.mutate()}
              disabled={finishTournament.isPending || !editable}
              className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 disabled:opacity-60"
              title={!editable ? "Editing disabled" : undefined}
            >
              {finishTournament.isPending ? "Finishing..." : "Finish Tournament"}
            </button>
            <button
              onClick={() => {
                if (!editable) return;
                setPool((prev) => {
                  const rankedTeams = ranking.filter((t): t is Team => !!t);
                  return normalizeTeams([...prev, ...rankedTeams]);
                });
                setRanking(Array(SLOT_COUNT).fill(null));
              }}
              disabled={!editable}
              className="rounded-md bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 disabled:opacity-60"
              title={!editable ? "Editing disabled" : undefined}
            >
              Reset Selections
            </button>
          </div>
        </>
      )}

      <DragOverlay>{activeTeam ? <OverlayCard team={activeTeam} /> : null}</DragOverlay>

      {/* Context menu (only meaningful when editable; markup can exist safely) */}
      {menu.open && menu.teamId && editable && (
        <div
          style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 50 }}
          className="bg-gray-900 border border-white/10 rounded-md shadow-lg p-2 max-h-[70vh] overflow-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          {ranking.some((t) => t?.teamId === menu.teamId) && (
            <>
              <button
                className="w-full text-left text-sm px-3 py-2 text-red-200 hover:bg-red-500/10 rounded"
                onClick={() => removeTeamToPool(menu.teamId!)}
              >
                Remove (send to pool)
              </button>
              <div className="my-2 h-px bg-white/10" />
            </>
          )}

          <div className="text-white/70 text-xs px-2 pb-2">Move to slot…</div>
          <div className="grid grid-cols-5 gap-1 p-1">
            {Array.from({ length: SLOT_COUNT }).map((_, i) => (
              <button
                key={i}
                className="text-left text-sm px-2 py-2 text-white/90 hover:bg-white/10 rounded"
                onClick={() => {
                  moveTeamToSlot(menu.teamId!, i);
                  closeMenu();
                }}
              >
                Slot #{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </DndContext>
  );
}

/* ================= Subcomponents ================= */

const Participants = React.memo(function Participants({
  teams,
  loading,
  error,
  onCardContextMenu,
  draggable,
  droppableToPool,
  gridLikeRanking = false, // player/ended => true (5×5). admin => false (list)
}: {
  teams: Team[];
  loading: boolean;
  error: boolean;
  onCardContextMenu: (teamId: string, e: React.MouseEvent) => void;
  draggable: boolean;
  droppableToPool: boolean;
  gridLikeRanking?: boolean;
}) {
  const { setNodeRef: setColumnRef, isOver: isOverColumn } = useDroppable({ id: "pool-column" });

  return (
    <div
      ref={droppableToPool ? setColumnRef : undefined}
      className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg"
    >
      <h3 className="text-white/90 font-medium">
        {gridLikeRanking ? "Participants" : "Teams"}
      </h3>

      <PoolDropZone
        droppable={droppableToPool && !gridLikeRanking}
        isOverColumn={isOverColumn}
        gridLike={gridLikeRanking}
      >
        {loading && <div className="text-white/60 text-sm">Loading teams…</div>}
        {error && <div className="text-red-300 text-sm">Failed to load teams</div>}
        {!loading && !error && teams.length === 0 && (
          <div className="text-white/50 text-sm">No unplaced teams</div>
        )}

        {!loading && !error && (
          <div className={gridLikeRanking ? "grid grid-cols-5 gap-3" : "grid grid-cols-1 gap-2"}>
            {teams.map((team) => (
              <ParticipantCard
                key={team.teamId}
                team={team}
                onContextMenu={(e) => onCardContextMenu(team.teamId, e)}
                draggable={draggable && !gridLikeRanking}         // no drag in 5×5
                droppableToPool={droppableToPool && !gridLikeRanking} // no drop targets in 5×5
                gridLikeRanking={gridLikeRanking}
              />
            ))}
          </div>
        )}
      </PoolDropZone>
    </div>
  );
});

function PoolDropZone({
  children,
  droppable,
  isOverColumn,
  gridLike,
}: {
  children: React.ReactNode;
  droppable: boolean;
  isOverColumn: boolean;
  gridLike: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  const refProp = droppable ? { ref: setNodeRef } : {};
  const highlight = droppable && (isOver || isOverColumn);

  return (
    <div
      {...refProp}
      className={`rounded-md p-3 border ${
        highlight ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/10"
      }`}
    >
      <div className="text-xs text-white/70 mb-2">
        {gridLike ? " " : droppable ? "Pool (drag here to unassign)" : "Pool"}
      </div>
      {children}
    </div>
  );
}

const ParticipantCard = React.memo(function ParticipantCard({
  team,
  onContextMenu,
  draggable,
  droppableToPool,
  gridLikeRanking = false,
}: {
  team: Team;
  onContextMenu?: (e: React.MouseEvent) => void;
  draggable: boolean;
  droppableToPool: boolean;
  gridLikeRanking?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: team.teamId });
  const { setNodeRef: setDropRef, isOver: isOverCard } = useDroppable({ id: `pool-card-${team.teamId}` });

  const style: React.CSSProperties = {
    opacity: draggable && isDragging ? 0.35 : 1,
    cursor: draggable ? "grab" : "default",
    touchAction: "none",
    userSelect: "none",
    outline: droppableToPool && isOverCard ? "1px solid rgba(96,165,250,0.6)" : "none",
  };

  const base = "border text-white rounded-md transition-all shadow-sm select-none";
  const rankingLike = "border-white/10 bg-white/10 px-2 py-2 w-[180px] h-[80px] flex flex-col justify-between";
  const simpleList = "border-white/10 bg-white/10 px-3 py-2 w-full";

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        if (droppableToPool) setDropRef(el);
      }}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      onContextMenu={onContextMenu}
      style={style}
      className={`${base} ${gridLikeRanking ? rankingLike : simpleList}`}
      tabIndex={draggable ? 0 : -1}
      title={team.team_name}
      data-key={team.teamId}
    >
      {gridLikeRanking ? (
        <>
          <div className="text-[11px] opacity-0">.</div>
          <div className="text-sm min-h-[1.25rem] flex items-center justify-center text-center">
            {team.team_name}
          </div>
        </>
      ) : (
        <span className="text-sm">{team.team_name}</span>
      )}
    </div>
  );
});

function RankingGrid({
  slots,
  onSlotContextMenu,
}: {
  slots: Array<Team | null>;
  onSlotContextMenu: (teamId: string | null, e: React.MouseEvent) => void;
}) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <h3 className="text-white/90 font-medium mb-3">Ranking (Top 25)</h3>
      <div className="grid grid-cols-5 gap-3">
        {slots.map((team, index) => (
          <SlotCard key={`slot-${index}`} index={index} team={team} onContextMenu={onSlotContextMenu} />
        ))}
      </div>
    </div>
  );
}

const SlotCard = React.memo(function SlotCard({
  index,
  team,
  onContextMenu,
}: {
  index: number;
  team: Team | null;
  onContextMenu: (teamId: string | null, e: React.MouseEvent) => void;
}) {
  const droppableId = `slot-${index}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      onContextMenu={(e) => onContextMenu(team?.teamId ?? null, e)}
      className={`border rounded-md px-2 py-2 w-[180px] h-[80px] transition-all ${
        isOver ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/10"
      } text-white shadow-sm flex flex-col justify-between`}
    >
      <div className="text-[11px] opacity-70">Slot #{index + 1}</div>
      <div className="text-sm min-h-[1.25rem]">
        {team ? <span>{team.team_name}</span> : <em className="text-white/60 not-italic">Drop team</em>}
      </div>
    </div>
  );
});

function OverlayCard({ team }: { team: Team }) {
  return (
    <div
      className="border border-white/20 bg-white/10 text-white rounded-md px-3 py-2 shadow-lg"
      style={{ willChange: "transform" }}
    >
      <span className="text-sm">{team.team_name}</span>
    </div>
  );
}
