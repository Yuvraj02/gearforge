'use client'

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiKey: string = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN!;
const clientId : string  = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID!;

const requestHeaders = {
  "Client-ID": clientId,
  "Authorization": "Bearer " + apiKey
};

export function useHighestRatedQuery(limit = 20) {
  // console.log(clientId, apiKey)
  return useQuery({
    queryKey: ["highest_rated", limit],
    queryFn: async () => {
      const { data } = await axios.post(
        `/api/igdb/games`,
        `fields id, cover; sort rating desc; limit ${limit};`,
        { headers: requestHeaders }
      );
      return data;
    },
    staleTime: 60_000,
  });
}

/**
 * Fetch covers for a set of game IDs.
 * - Unique cache key per ID set (prevents clobbering)
 * - Limit >= number of IDs to avoid partial results
 * - placeholderData keeps the previous covers visible while refetching (v5 way)
 */
export function useCoversQuery(
  gameQueryIsFetched: boolean,
  gameIds: Array<number | string>
) {
  const ids = (gameIds ?? [])
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));

  const keyIds = [...ids].sort((a, b) => a - b).join(",");

  return useQuery({
    queryKey: ["game_cover", keyIds],
    enabled: gameQueryIsFetched && ids.length > 0,
    queryFn: async () => {
      const limit = Math.max(ids.length, 20);
      const { data } = await axios.post(
        "/api/igdb/covers",
        `fields id,game,height,url,width,image_id; where game = (${ids.join(",")}); limit ${limit};`,
        { headers: requestHeaders }
      );
      return data;
    },
    placeholderData: (prev) => prev, // v5 replacement for keepPreviousData
    staleTime: 60_000,
  });
}