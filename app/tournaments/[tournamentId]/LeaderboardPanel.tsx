"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/app/api";

/** Backend types */
type LeaderboardItem = {
  rank: number;
  team_id: string;
  team_name: string;
  players?: string[];
  position_in_tournament?: string;
  tournament_id: string;
};

type LeaderboardResponse = { data: LeaderboardItem[] };
type LeaderboardRow = { rank: number; teamId: string; teamName: string };

function toLeaderboardRows(resp: LeaderboardResponse | undefined): LeaderboardRow[] {
  if (!resp?.data?.length) return [];
  const rows = resp.data
    .filter((it) => typeof it.rank === "number" && it.team_id)
    .map((it) => ({
      rank: it.rank,
      teamId: it.team_id,
      teamName: it.team_name ?? it.team_id,
    }))
    .sort((a, b) => a.rank - b.rank);

  // quick debug
  console.debug("[Leaderboard] mapped rows:", rows.length, rows.slice(0, 3));
  return rows;
}

export default function LeaderboardPanel({
  tournamentId,
  finished, // kept for message only; not gating render anymore
  active,
}: {
  tournamentId: string;
  finished: boolean;
  active?: boolean;
}) {
  const {
    data,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["leaderboardRaw", tournamentId],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const resp = await getLeaderboard(tournamentId, "CAT_BR");
      console.debug("[Leaderboard] raw response:", resp);
      return resp;
    },
    enabled: !!active,        // fetch whenever the Leaderboard tab is open
    staleTime: 0,
    gcTime: 0,             // if you’re on React Query v5, use gcTime: 0
    refetchOnWindowFocus: true,
  });

  const rows = React.useMemo(() => toLeaderboardRows(data), [data]);

  return (
    <Leaderboard
      data={rows}
      loading={isFetching}
      error={!!isError}
      finished={finished}
    />
  );
}

/** Presentational */
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

      {/* SHOW DATA WHENEVER WE HAVE IT */}
      {!loading && !error && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((row) => (
            <LeaderboardCard key={`${row.rank}-${row.teamId}`} row={row} />
          ))}
        </div>
      )}

      {/* Otherwise, show a helpful empty state */}
      {!loading && !error && (!data || data.length === 0) && (
        <div className="text-white/60 text-sm">
          {finished
            ? "No results yet."
            : "Waiting for results. If the backend already has them, keep this tab open."}
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({ row }: { row: { rank: number; teamId: string; teamName: string } }) {
  return (
    <div className="border border-white/10 bg-white/10 text-white rounded-md px-3 py-2 w-full">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Rank #{row.rank}</div>
        <div className="font-medium">{row.teamName}</div>
      </div>
    </div>
  );
}
