"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/app/api";
import { AxiosError } from "axios";

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

  console.debug("[Leaderboard] mapped rows:", rows.length, rows.slice(0, 3));
  return rows;
}

function isNotFoundish(err: unknown): boolean {
  const anyErr = err as AxiosError;

  const status =
    anyErr?.status ??
    anyErr?.response?.status ??
    anyErr?.cause

  if (status === 404) return true;

  const msg = String(anyErr?.message ?? "");
  if (msg.includes("404")) return true;
  if (/not found/i.test(msg)) return true;
  if (/no leaderboard/i.test(msg)) return true;

  return false;
}

export default function LeaderboardPanel({
  tournamentId,
  finished,
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
    error,
    refetch,
  } = useQuery<LeaderboardResponse, Error>({
    queryKey: ["leaderboardRaw", tournamentId],
    queryFn: async (): Promise<LeaderboardResponse> => {
      try {
        const resp = await getLeaderboard(tournamentId, "CAT_BR");
        console.debug("[Leaderboard] raw response:", resp);
        return resp;
      } catch (e) {
        // If backend says "nothing yet" / 404, treat it as empty results (not an error UI).
        if (isNotFoundish(e)) {
          console.debug("[Leaderboard] no data yet (treated as empty):", e);
          return { data: [] };
        }
        throw e;
      }
    },
    enabled: !!active,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    retry: (failureCount, err) => {
      // Don’t spam retries on “not found / no data yet”
      if (isNotFoundish(err)) return false;
      return failureCount < 2;
    },
  });

  const rows = React.useMemo(() => toLeaderboardRows(data), [data]);

  // Only show error UI if it's a real error AND we are active
  const showError = !!active && isError && !isNotFoundish(error);

  return (
    <Leaderboard
      data={rows}
      loading={!!active && isFetching}
      error={showError}
      finished={finished}
      active={!!active}
      onRetry={refetch}
    />
  );
}

/** Presentational */
function Leaderboard({
  data,
  loading,
  error,
  finished,
  active,
  onRetry,
}: {
  data?: LeaderboardRow[];
  loading: boolean;
  error: boolean;
  finished: boolean;
  active: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 bg-white/5 rounded-lg w-full max-w-full">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-white/90 font-medium">Leaderboard</h3>
        {active && error && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs px-2 py-1 rounded bg-white/10 text-white/80 hover:bg-white/15"
          >
            Retry
          </button>
        )}
      </div>

      {!active && (
        <div className="text-white/60 text-sm">
          Open the Leaderboard tab to load results.
        </div>
      )}

      {active && loading && <div className="text-white/60 text-sm">Loading leaderboard…</div>}

      {active && error && (
        <div className="text-red-300 text-sm">
          Failed to load leaderboard. Tap Retry.
        </div>
      )}

      {/* SHOW DATA WHENEVER WE HAVE IT */}
      {active && !loading && !error && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((row) => (
            <LeaderboardCard key={`${row.rank}-${row.teamId}`} row={row} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {active && !loading && !error && (!data || data.length === 0) && (
        <div className="text-white/60 text-sm">
          {finished
            ? "Results aren’t published yet."
            : "No leaderboard data yet. Keep this tab open and it will refresh automatically whenever the leaderboard is available"}
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({
  row,
}: {
  row: { rank: number; teamId: string; teamName: string };
}) {
  return (
    <div className="border border-white/10 bg-white/10 text-white rounded-md px-3 py-2 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
        <div className="text-sm opacity-80">Rank #{row.rank}</div>
        <div className="font-medium break-words sm:text-right">{row.teamName}</div>
      </div>
    </div>
  );
}
