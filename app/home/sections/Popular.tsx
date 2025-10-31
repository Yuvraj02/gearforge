'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import GameCard from '@/app/components/common/GameCard';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { GameCardModel } from '@/app/models/game_card_model';
import { CoverArt } from '@/app/models/cover_art_model';

// --- Type Definitions ---
interface Popularity {
  id: number;
  game_id: number;
  value: number;
  [key: string]: number | string | undefined;
}
type GameWithCover = GameCardModel & { cover?: CoverArt };
interface Page<T> {
  data: T[];
  nextCursor?: number;
}

const apiKey: string = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN!;
const clientId: string = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID!;
const GAMES_PER_PAGE = 12;
const POPULARITY_FETCH_LIMIT = 50;

const fetchPopularGames = async ({ pageParam = 0 }): Promise<Page<GameWithCover>> => {
  const { data: popularData } = await axios.post<Popularity[]>(
    '/api/igdb/popularity_primitives',
    `fields id,game_id,value; sort value desc; limit ${POPULARITY_FETCH_LIMIT}; offset ${pageParam};`,
    {
      headers: { 'Client-ID': clientId, Authorization: 'Bearer ' + apiKey },
    }
  );

  const seen = new Set<number>();
  const uniqueGameIds: number[] = [];
  for (const p of popularData) {
    const id = Number(p.game_id);
    if (Number.isFinite(id) && !seen.has(id)) {
      seen.add(id);
      uniqueGameIds.push(id);
      if (uniqueGameIds.length >= GAMES_PER_PAGE) break;
    }
  }

  if (uniqueGameIds.length === 0) {
    return { data: [], nextCursor: undefined };
  }

  const gameIdsString = uniqueGameIds.join(',');

  const [gamesResponse, coversResponse] = await Promise.all([
    axios.post<GameCardModel[]>(
      '/api/igdb/games',
      `fields *; where id=(${gameIdsString}); limit ${uniqueGameIds.length};`,
      { headers: { 'Client-ID': clientId, Authorization: 'Bearer ' + apiKey } }
    ),
    axios.post<CoverArt[]>(
      '/api/igdb/covers',
      `fields *; where game=(${gameIdsString}); limit ${uniqueGameIds.length};`,
      { headers: { 'Client-ID': clientId, Authorization: 'Bearer ' + apiKey } }
    ),
  ]);

  const gamesById = new Map<number, GameCardModel>(
    gamesResponse.data.map((g) => [Number(g.id), g])
  );
  const coversByGameId = new Map<number, CoverArt>(
    (coversResponse.data || []).map((c) => [Number(c.game), c])
  );

  const combinedData = uniqueGameIds
    .map((id) => {
      const game = gamesById.get(id);
      if (!game) return null;
      return { ...game, cover: coversByGameId.get(id) };
    })
    .filter(Boolean) as GameWithCover[];

  return {
    data: combinedData,
    nextCursor: pageParam + POPULARITY_FETCH_LIMIT,
  };
};

function Popular() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['popular_games_infinite_vertical'],
    queryFn: fetchPopularGames,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
  });

  const { ref, inView } = useInView({
    rootMargin: '400px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const games = data?.pages.flatMap((page) => page.data) ?? [];

  const uniqueGames = Array.from(new Map(games.map(game => [game.id, game])).values());

  return (
    <div className="bg-transparent rounded-lg mx-auto max-w-7xl mb-8 px-4 sm:px-6 md:px-8 py-4">
      <h2 className="text-white text-2xl md:text-3xl font-bold mb-6 pb-3 border-b border-gray-700">
        Recently Popular
      </h2>

      {status === 'error' && (
        <div className="text-red-400 bg-red-900/50 p-4 rounded-md text-center">
          <strong>Error:</strong> {(error as Error)?.message || 'Unknown error'}. Please try refreshing.
        </div>
      )}

      {
        status === 'pending' && (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        )
      }

      {status === 'success' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-15 gap-y-10">
            {uniqueGames.map((game) => (
              <div key={game.id} className="flex flex-col items-center px-3 sm:px-4">
                <GameCard game={game} />
                <p
                  title={game.name || 'Unknown Game'}
                  className="text-gray-200 font-medium text-sm text-center mt-3 w-full truncate"
                >
                  {game.name || 'Unknown Game'}
                </p>
              </div>
            ))}
          </div>

          <div ref={ref} className="h-1" />

          <div className="text-center pt-10">
            {isFetchingNextPage && <LoadingSpinner />}
            {!hasNextPage && uniqueGames.length > 0 && (
              <p className="text-gray-500 text-lg">You've reached the end! 🚀</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Popular;
