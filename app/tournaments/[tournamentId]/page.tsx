// app/tournaments/[tournamentId]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/app/hooks";
import ParticipantsBoard from "./ParticipantBoard";
import LeaderboardPanel from "./LeaderboardPanel";
import type { Tournament } from "@/app/models/tournament_model";
import { getTournamentById } from "@/app/api";


export default function TournamentPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();

  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const userRole: "admin" | "player" = useAppSelector((s) => s.users.user.role);
  const isAdmin = isLoggedIn && userRole === "admin";

  // Local "finished" is used to auto-switch to the leaderboard right after finishing from the admin board.
  // The real lock comes from tournament.status === "ended".
  const [finishedLocal, setFinishedLocal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"participants" | "leaderboard">("participants");

  // ===== Query tournament details (status, name, dates, etc.) =====
  const {
    data: tournament,
    isLoading: tLoading,
    isError: tError,
  } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: async () => await getTournamentById(tournamentId),
    retry: 1,
  });

  const status: Tournament["status"] | undefined = tournament?.status; // 'upcoming' | 'live' | 'ended'
  const isLocked = status === "ended";
  const canEditParticipants = isAdmin && !isLocked;
  
  // If the tournament has ended, we treat it as finished for the leaderboard UI.
  const finishedForLeaderboard = isLocked || finishedLocal;

  // If ended, default to Leaderboard tab (once we know status)
  React.useEffect(() => {
    if (status === "ended") setActiveTab("leaderboard");
  }, [status]);

  const tabBase = "text-white/80 border-b-2 rounded-tl rounded-tr px-3 py-2 select-none";
  const activeTabClass = "bg-gray-800 text-white border-b-blue-500";
  const inactiveTabClass = "border-b-transparent hover:text-white";

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-semibold">
              {tournament?.name ?? "Tournament"}
            </h1>
            <p className="text-white/60 text-sm">
              ID: <span className="font-mono">{tournamentId}</span>
              {status ? (
                <>
                  {" · "}Status:{" "}
                  <span
                    className={
                      status === "ended"
                        ? "text-red-300"
                        : status === "live"
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {status}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {/* You can add cover or dates here if you want */}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex justify-center gap-3 pt-4">
        <button
          className={`cursor-pointer ${tabBase} ${
            activeTab === "participants" ? activeTabClass : inactiveTabClass
          }`}
          onClick={() => setActiveTab("participants")}
          disabled={tLoading || tError}
        >
          <p className="text-2xl">Participants</p>
        </button>
        <button
          className={`cursor-pointer ${tabBase} ${
            activeTab === "leaderboard" ? activeTabClass : inactiveTabClass
          }`}
          onClick={() => setActiveTab("leaderboard")}
          disabled={tLoading || tError}
        >
          <p className="text-2xl">Leaderboard</p>
        </button>
      </div>

      {/* States for tournament fetch */}
      {tLoading && (
        <div className="w-full flex justify-center items-center py-16">
          <div className="text-white/70 text-sm">Loading tournament…</div>
        </div>
      )}

      {tError && (
        <div className="w-full flex justify-center items-center py-16">
          <div className="text-red-300 text-sm">
            Failed to load tournament details. Wire your API in <code>fetchTournamentDetails</code>.
          </div>
        </div>
      )}

      {/* Main Body (render only if we have tournament OR you want to allow rendering even if fetch fails) */}
      {!tLoading && !tError && (
        <>
          {isAdmin ? (
            activeTab === "participants" ? (
              <ParticipantsBoard
                tournamentId={tournamentId}
                canEdit={canEditParticipants}
                locked={isLocked}
                onFinished={() => {
                  setFinishedLocal(true);
                  setActiveTab("leaderboard");
                  // Optionally refetch tournament here if your server sets status to "ended" upon finishing
                  // queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
                }}
              />
            ) : (
              <div className="w-full flex justify-center p-6">
                <LeaderboardPanel
                  tournamentId={tournamentId}
                  finished={finishedForLeaderboard}
                  active={activeTab === "leaderboard"}
                />
              </div>
            )
          ) : (
            // PLAYER VIEW
            <>
              {activeTab === "participants" ? (
                <ParticipantsBoard
                  tournamentId={tournamentId}
                  canEdit={false}
                  locked={isLocked}
                  onFinished={() => {}}
                />
              ) : (
                <div className="w-full flex justify-center p-6">
                  <LeaderboardPanel
                    tournamentId={tournamentId}
                    finished={finishedForLeaderboard}
                    active={activeTab === "leaderboard"}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="text-xs text-gray-500 text-center pb-3">tournamentId: {tournamentId}</div>
    </div>
  );
}
