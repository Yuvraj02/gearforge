// app/tournaments/[tournamentId]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Config */
const SLOT_COUNT = 25; // 5x5 grid

/** Types */
type Team = { id: string; name: string };
type LeaderboardRow = { rank: number; teamId: string; teamName: string };
type ContextMenuState = { open: boolean; x: number; y: number; teamId: string | null };

export default function TournamentPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const queryClient = useQueryClient();

  /** TODO: Replace with your real auth/user fetch */
  const userRole: "admin" | "organizer" | "player" = "admin"; // set from your session/user API
  const canEdit = userRole !== "player";

  const [activeTab, setActiveTab] = React.useState<"participants" | "leaderboard">("participants");
  const [finished, setFinished] = React.useState(false);

  // DnD sensors (only relevant if canEdit)
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  /** Fetch participants */
  const {
    data: participantsData,
    isLoading: participantsLoading,
    isError: participantsError,
  } = useQuery({
    queryKey: ["participants", tournamentId],
    queryFn: async (): Promise<Team[]> => {
      // TODO: REPLACE with your API call using tournamentId
      // const res = await fetch(`/api/tournaments/${tournamentId}/participants`);
      // if (!res.ok) throw new Error("Failed to load participants");
      // return (await res.json()) as Team[];
      return [
        { id: "team-0", name: "TEAM A" },
        { id: "team-1", name: "TEAM B" },
        { id: "team-2", name: "TEAM C" },
        { id: "team-3", name: "TEAM D" },
        { id: "team-4", name: "TEAM E" },
        { id: "team-5", name: "TEAM F" },
        { id: "team-6", name: "TEAM G" },
        { id: "team-7", name: "TEAM H" },
        { id: "team-8", name: "TEAM I" },
        { id: "team-9", name: "TEAM J" },
        { id: "team-10", name: "TEAM K" },
        { id: "team-11", name: "TEAM L" },
        { id: "team-12", name: "TEAM M" },
        { id: "team-13", name: "TEAM N" },
        { id: "team-14", name: "TEAM O" },
        { id: "team-33", name: "TEAM P" },
        { id: "team-42", name: "TEAM Q" },
        { id: "team-52", name: "TEAM R" },
        { id: "team-70", name: "TEAM S" },
        { id: "team-19", name: "TEAM T" },
        { id: "team-26", name: "TEAM U" },
        { id: "team-37", name: "TEAM V" },
        { id: "team-48", name: "TEAM W" },
        { id: "team-59", name: "TEAM X" },
        { id: "team-55", name: "TEAM Y" },
      ];
    },
  });

  // Local state
  const [pool, setPool] = React.useState<Team[]>([]);
  const [ranking, setRanking] = React.useState<Array<Team | null>>(Array(SLOT_COUNT).fill(null));

  React.useEffect(() => {
    if (participantsData) {
      setPool(participantsData);
      setRanking(Array(SLOT_COUNT).fill(null));
    }
  }, [participantsData]);

  /** Leaderboard (visible for players too) */
  const {
    data: leaderboardData,
    isFetching: leaderboardLoading,
    isError: leaderboardError,
  } = useQuery({
    queryKey: ["leaderboard", tournamentId],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      // TODO: REPLACE with your API call
      // const res = await fetch(`/api/tournaments/${tournamentId}/leaderboard`);
      // if (!res.ok) throw new Error("Failed to load leaderboard");
      // return (await res.json()) as LeaderboardRow[];
      return (ranking
        .map((t, i) => (t ? { rank: i + 1, teamId: t.id, teamName: t.name } : null))
        .filter(Boolean) as LeaderboardRow[]);
    },
    enabled: finished || activeTab === "leaderboard",
  });

  /** Finish tournament (editors only) */
  const finishTournament = useMutation({
    mutationFn: async () => {
      // TODO: REPLACE with your API call
      // await fetch(`/api/tournaments/${tournamentId}/finish_tournament`, { method: "POST", ... })
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true };
    },
    onSuccess: async () => {
      setFinished(true);
      setActiveTab("leaderboard");
      await queryClient.invalidateQueries({ queryKey: ["leaderboard", tournamentId] });
    },
  });

  /** Context menu (only when canEdit) */
  const [menu, setMenu] = React.useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    teamId: null,
  });
  function closeMenu() {
    setMenu({ open: false, x: 0, y: 0, teamId: null });
  }
  function openMenu(teamId: string, e: React.MouseEvent) {
    if (!canEdit) return;
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

  /** Move logic (for DnD/menu) */
  function moveTeamToSlot(teamId: string, targetIndex: number) {
    if (!canEdit) return;
    setRanking((prev) => {
      const next = [...prev];
      const fromSlotIndex = next.findIndex((t) => t?.id === teamId);
      const teamFromPool = pool.find((t) => t.id === teamId);
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
        let out = p.filter((t) => t.id !== teamId);
        if (occupying && !out.some((t) => t.id === occupying.id)) out = [...out, occupying];
        return out;
      });
      return next;
    });
  }

  /** NEW: remove team from slot back to pool */
  function removeTeamToPool(teamId: string) {
    setRanking((prev) => {
      const next = [...prev];
      const idx = next.findIndex((t) => t?.id === teamId);
      if (idx >= 0) {
        const team = next[idx]!;
        next[idx] = null;
        setPool((p) => (p.some((t) => t.id === team.id) ? p : [...p, team]));
      }
      return next;
    });
    closeMenu();
  }

  /** DnD handler */
  function handleDragEnd(event: DragEndEvent) {
    if (!canEdit) return;
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const draggedFromPool = pool.find((t) => t.id === activeId);
    const draggedFromSlotIndex = ranking.findIndex((t) => t?.id === activeId);
    const draggedTeam =
      draggedFromPool ?? (draggedFromSlotIndex >= 0 ? ranking[draggedFromSlotIndex]! : null);
    if (!draggedTeam) return;

    if (overId === "pool") {
      setRanking((prev) => {
        const next = [...prev];
        if (draggedFromSlotIndex >= 0) next[draggedFromSlotIndex] = null;
        return next;
      });
      setPool((p) => (p.some((t) => t.id === draggedTeam.id) ? p : [...p, draggedTeam]));
      return;
    }

    if (overId.startsWith("slot-")) {
      const targetIndex = Number(overId.split("-")[1]);
      moveTeamToSlot(activeId, targetIndex);
    }
  }

  /** UI classes */
  const tabBase = "text-white/80 border-b-2 rounded-tl rounded-tr px-3 py-2 select-none";
  const activeTabClass = "bg-gray-800 text-white border-b-blue-500";
  const inactiveTabClass = "border-b-transparent hover:text-white";

  return (
    <div className="w-full min-h-screen bg-gray-900 overflow-hidden">
      {/* Tabs (show Leaderboard for players too) */}
      <div className="w-full flex justify-center gap-3 pt-6">
        <button
          className={`cursor-pointer ${tabBase} ${activeTab === "participants" ? activeTabClass : inactiveTabClass}`}
          onClick={() => setActiveTab("participants")}
        >
          <p className="text-2xl">Participants</p>
        </button>
        <button
          className={`cursor-pointer ${tabBase} ${activeTab === "leaderboard" ? activeTabClass : inactiveTabClass}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          <p className="text-2xl">Leaderboard</p>
        </button>
      </div>

      {/* Body */}
      {canEdit ? (
        activeTab === "participants" ? (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="w-full flex items-start justify-center gap-8 p-6">
              <Participants
                teams={pool}
                loading={participantsLoading}
                error={participantsError}
                onCardContextMenu={openMenu}
                draggable={canEdit}
                droppableToPool={canEdit}
              />
              <RankingGrid
                slots={ranking}
                onSlotContextMenu={(teamId, e) => {
                  if (!teamId) return;
                  openMenu(teamId, e);
                }}
              />
            </div>

            <div className="flex justify-center gap-4 pb-6">
              <button
                onClick={() => finishTournament.mutate()}
                disabled={finishTournament.isPending}
                className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 disabled:opacity-60"
              >
                {finishTournament.isPending ? "Finishing..." : "Finish Tournament"}
              </button>
              <button
                onClick={() => {
                  setPool((prev) => {
                    const rankedTeams = ranking.filter((t): t is Team => !!t);
                    const merged = [...prev, ...rankedTeams];
                    const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values());
                    return unique;
                  });
                  setRanking(Array(SLOT_COUNT).fill(null));
                }}
                className="rounded-md bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2"
              >
                Reset Selections
              </button>
            </div>

            {/* Context menu (editors only) */}
            {menu.open && menu.teamId && (
              <div
                style={{ top: menu.y, left: menu.x, zIndex: 50 }}
                className="fixed bg-gray-900 border border-white/10 rounded-md shadow-lg p-2 max-h-[70vh] overflow-auto"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* NEW: remove option when right-clicked team is placed in a slot */}
                {ranking.some((t) => t?.id === menu.teamId) && (
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
        ) : (
          <div className="w-full flex justify-center p-6">
            <Leaderboard
              data={leaderboardData}
              loading={leaderboardLoading}
              error={leaderboardError}
              finished={finished}
            />
          </div>
        )
      ) : (
        // PLAYER VIEW: switch between Participants (read-only grid) and Leaderboard
        <>
          {activeTab === "participants" ? (
            <div className="w-full flex items-start justify-center p-6">
              <Participants
                teams={pool}
                loading={participantsLoading}
                error={participantsError}
                onCardContextMenu={() => {}}
                draggable={false}
                droppableToPool={false}
                gridLikeRanking
              />
            </div>
          ) : (
            <div className="w-full flex justify-center p-6">
              <Leaderboard
                data={leaderboardData}
                loading={leaderboardLoading}
                error={leaderboardError}
                finished={finished}
              />
            </div>
          )}
        </>
      )}

      <div className="text-xs text-gray-500 text-center pb-2">tournamentId: {tournamentId}</div>
    </div>
  );
}

/** Participants (left) */
function Participants({
  teams,
  loading,
  error,
  onCardContextMenu,
  draggable,
  droppableToPool,
  gridLikeRanking = false,
}: {
  teams: Team[];
  loading: boolean;
  error: boolean;
  onCardContextMenu: (teamId: string, e: React.MouseEvent) => void;
  draggable: boolean;
  droppableToPool: boolean;
  /** When true (player view), render 5×5 grid styled like ranking slots */
  gridLikeRanking?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg">
      <h3 className="text-white/90 font-medium">
        {gridLikeRanking ? "Participants" : "Teams"}
      </h3>

      <PoolDropZone droppable={droppableToPool} gridLikeRanking={gridLikeRanking}>
        {loading && <div className="text-white/60 text-sm">Loading teams…</div>}
        {error && <div className="text-red-300 text-sm">Failed to load teams</div>}
        {!loading && !error && teams.length === 0 && (
          <div className="text-white/50 text-sm">No unplaced teams</div>
        )}

        {!loading && !error && (
          <div className={gridLikeRanking ? "grid grid-cols-5 gap-3" : "grid grid-cols-1 gap-2"}>
            {teams.map((team) => (
              <ParticipantCard
                key={team.id}
                team={team}
                onContextMenu={draggable ? (e) => onCardContextMenu(team.id, e) : undefined}
                draggable={draggable}
                gridLikeRanking={gridLikeRanking}
              />
            ))}
          </div>
        )}
      </PoolDropZone>
    </div>
  );
}

function PoolDropZone({
  children,
  droppable,
  gridLikeRanking = false,
}: {
  children: React.ReactNode;
  droppable: boolean;
  gridLikeRanking?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  const refProp = droppable ? { ref: setNodeRef } : {};
  const highlight = droppable && isOver;

  return (
    <div
      {...refProp}
      className={`rounded-md p-3 border ${
        highlight ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/10"
      }`}
    >
      <div className="text-xs text-white/70 mb-2">
        {gridLikeRanking ? " " : droppable ? "Pool (drag here to unassign)" : "Pool"}
      </div>
      {children}
    </div>
  );
}

function ParticipantCard({
  team,
  onContextMenu,
  draggable,
  gridLikeRanking = false,
}: {
  team: Team;
  onContextMenu?: (e: React.MouseEvent) => void;
  draggable: boolean;
  gridLikeRanking?: boolean;
}) {
  // Hook is safe to call; we only attach listeners if draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: team.id });

  const style: React.CSSProperties = {
    transform: draggable && transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: draggable && isDragging ? 0.65 : 1,
    cursor: draggable ? "grab" : "default",
  };

  // When gridLikeRanking, match SlotCard sizing/feel
  const baseClasses =
    "border text-white rounded-md transition-all shadow-sm select-none";
  const rankingLikeClasses =
    "border-white/10 bg-white/10 px-2 py-2 w-[180px] h-[80px] flex flex-col justify-between";
  const simpleListClasses =
    "border-white/10 bg-white/10 px-3 py-2 w-full";

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      onContextMenu={onContextMenu}
      style={style}
      className={`${baseClasses} ${gridLikeRanking ? rankingLikeClasses : simpleListClasses}`}
      title={team.name}
    >
      {gridLikeRanking ? (
        <>
          <div className="text-[11px] opacity-0">.</div>
          <div className="text-sm min-h-[1.25rem] flex items-center justify-center text-center">
            {team.name}
          </div>
        </>
      ) : (
        <span className="text-sm">{team.name}</span>
      )}
    </div>
  );
}

/** Ranking grid (right) — only rendered for editors */
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
          <SlotCard key={index} index={index} team={team} onContextMenu={onSlotContextMenu} />
        ))}
      </div>
    </div>
  );
}

function SlotCard({
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
      onContextMenu={(e) => onContextMenu(team?.id ?? null, e)}
      className={`border rounded-md px-2 py-2 w-[180px] h-[80px] transition-all ${
        isOver ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/10"
      } text-white shadow-sm flex flex-col justify-between`}
    >
      <div className="text-[11px] opacity-70">Slot #{index + 1}</div>
      <div className="text-sm min-h-[1.25rem]">
        {team ? <span>{team.name}</span> : <em className="text-white/60 not-italic">Drop team</em>}
      </div>
    </div>
  );
}

/** Leaderboard */
function Leaderboard({
  data,
  loading,
  error,
  finished,
}: {
  data?: LeaderboardRow[];
  loading: boolean;
  error: boolean;
  finished: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-lg min-w-[28rem]">
      <h3 className="text-white/90 font-medium">Leaderboard</h3>

      {loading && <div className="text-white/60 text-sm">Loading leaderboard…</div>}
      {error && <div className="text-red-300 text-sm">Failed to load leaderboard</div>}

      {!loading && !error && !finished && (
        <div className="text-white/60 text-sm">
          Waiting for the tournament to finish. Click <b>Finish Tournament</b> on the Participants tab.
        </div>
      )}

      {!loading && !error && finished && (!data || data.length === 0) && (
        <div className="text-white/60 text-sm">No results yet.</div>
      )}

      {!loading && !error && finished && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data
            .sort((a, b) => a.rank - b.rank)
            .map((row) => (
              <LeaderboardCard key={row.teamId} row={row} />
            ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({ row }: { row: LeaderboardRow }) {
  return (
    <div className="border border-white/10 bg-white/10 text-white rounded-md px-3 py-2 w-full">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Rank #{row.rank}</div>
        <div className="font-medium">{row.teamName}</div>
      </div>
    </div>
  );
}
