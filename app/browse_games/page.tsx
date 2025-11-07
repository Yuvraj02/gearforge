'use client'
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import GameCard from '@/app/components/common/GameCard';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import SearchBar from '@/app/components/common/SearchBar';
import { GameCardModel } from '@/app/models/game_card_model';
import { CoverArt } from '@/app/models/cover_art_model';

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

const fetchSearchGames = async (term: string): Promise<GameWithCover[]> => {
  if (!term || term.trim().length === 0) return [];
  const searchLimit = 50;
  // fetch games matching search
  const gamesResp = await axios.post<GameCardModel[]>(
    '/api/igdb/games',
    `fields *; search "${term}"; limit ${searchLimit};`,
    { headers: { 'Client-ID': clientId, Authorization: 'Bearer ' + apiKey } }
  );

  const gameIds = (gamesResp.data || []).map((g) => Number(g.id)).filter(Boolean);
  if (gameIds.length === 0) return [];

  const idsString = gameIds.join(',');
  const coversResp = await axios.post<CoverArt[]>(
    '/api/igdb/covers',
    `fields *; where game=(${idsString}); limit ${gameIds.length};`,
    { headers: { 'Client-ID': clientId, Authorization: 'Bearer ' + apiKey } }
  );

  const coversByGame = new Map<number, CoverArt>((coversResp.data || []).map((c) => [Number(c.game), c]));
  return gameIds
    .map((id) => {
      const g = gamesResp.data.find((gg) => Number(gg.id) === id);
      if (!g) return null;
      return { ...g, cover: coversByGame.get(id) };
    })
    .filter(Boolean) as GameWithCover[];
};

function BrowseGames(){
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

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
  const uniqueGames = useMemo(() => Array.from(new Map(games.map(game => [game.id, game])).values()), [games]);

  // search query - when debouncedTerm present, fetch search results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search_games', debouncedTerm],
    queryFn: () => fetchSearchGames(debouncedTerm),
    enabled: debouncedTerm.length > 0,
    staleTime: 60_000,
  });

  const gamesToShow = debouncedTerm.length > 0 ? (searchResults ?? []) : uniqueGames;
  const loadingGrid = status === 'pending' || (debouncedTerm.length > 0 && isSearching);

  return (
    <div className="bg-transparent rounded-lg mx-auto max-w-7xl mb-8 px-4 sm:px-6 md:px-8 py-4">
      {/* header: title + genres button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Browse Games</h2>

        {/*Genres button */}
        <Link
          href="/genres"
          className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-white/95 to-neutral-200/95 text-neutral-900 rounded-full shadow-lg ring-1 ring-white/10 hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-150"
          aria-label="Go to genres"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="flex-shrink-0">
            <rect x="3" y="3" width="8" height="8" fill="currentColor" />
            <rect x="13" y="3" width="8" height="8" fill="currentColor" />
            <rect x="3" y="13" width="8" height="8" fill="currentColor" />
            <rect x="13" y="13" width="8" height="8" fill="currentColor" />
          </svg>

          <span className="text-sm font-medium">Filter by Genres</span>
        </Link>
      </div>

      {/* Search bar replaces the "Recently Popular" heading */}
      <div className="mb-6 pb-3 border-b border-gray-700">
        <SearchBar
          name="game_search"
          type="text"
          placeholder="Search games, e.g. Valorant, FIFA, Apex..."
          className="w-full bg-neutral-800/20 text-neutral-300 px-4 py-3 rounded-xl flex items-center gap-3"
          onTermChange={setSearchTerm} 
        />
      </div>

      {status === 'error' && (
        <div className="text-red-400 bg-red-900/50 p-4 rounded-md text-center">
          <strong>Error:</strong> {(error as Error)?.message || 'Unknown error'}. Please try refreshing.
        </div>
      )}

      {loadingGrid && (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </div>
      )}

      {!loadingGrid && gamesToShow.length === 0 && (
        <div className="text-neutral-400 text-center py-12">No games found.</div>
      )}

      {!loadingGrid && gamesToShow.length > 0 && (
        <>
          {debouncedTerm.length > 0 && (
            <div className="mb-4 text-sm text-neutral-300">Showing results for <span className="font-semibold text-white">"{debouncedTerm}"</span></div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-15 gap-y-10">
            {gamesToShow.map((game) => (
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

          {/* only use infinite loader when not in search mode */}
          {!debouncedTerm.length && <div ref={ref} className="h-1" />}

          <div className="text-center pt-10">
            {isFetchingNextPage && !debouncedTerm.length && <LoadingSpinner />}
            {!hasNextPage && uniqueGames.length > 0 && !debouncedTerm.length && (
              <p className="text-gray-500 text-lg">{`You've reached the end! 🚀`}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BrowseGames;