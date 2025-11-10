import { GameModel } from "@/app/models/game_model";
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

type IGDBEngine = { id: number; name?: string };
const apiKey: string = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN!;

const requestHeaders = {
  "Client-ID": "8t38bg3wjw6cfu643bmvww73yp3d0h",
  "Authorization": "Bearer " + apiKey
};

export function useGameQuery(gameId: number){

    return useQuery({
        queryFn: async () => {
            const response = await axios.post('/api/igdb/games', `fields *; where id=${gameId};`, {
                headers: requestHeaders
            })

            return response.data
        },
        queryKey: [`game_${gameId}`]
    })
}

export function useCoverQuery(gameId: number, coverId?: string| null){
        
    return useQuery({
        queryFn:async()=>{
            const response = await axios.post('/api/igdb/covers', `fields game,height,image_id,url; where game = ${gameId};`,{
                headers:requestHeaders
            })
            return response.data
        },

        queryKey:[`${gameId}_cover`],
        enabled:coverId==null
    })
}

// Get the franchise(collection) info for a given gameId
export function useFranchiseQuery(gameId: number) {
    return useQuery({
        queryKey: [`franchise_of_${gameId}`],
        queryFn: async () => {
            // First, get the collection ID from the game
            const resp = await axios.post(
                '/api/igdb/games',
                `fields collections; where id=${gameId};`,
                { headers: requestHeaders }
            );
            const game = resp.data[0];
            if (!game?.collections) return null;

            // Next, get franchise (collection) details
            const collectionResp = await axios.post(
                '/api/igdb/collections',
                `fields id, name, games; where id=${game.collections[0]};`,
                { headers: requestHeaders }
            );

            return collectionResp.data[0];
        }
    });
}


export function useGenreQuery(genreId: number, page: number = 1, pageSize: number = 10){

    return useQuery<GameModel[], Error>({
        queryFn: async () : Promise<GameModel[]> => {
            const offset = (page - 1) * pageSize

            // first request: genres referenced directly
            const body1 = `fields *; where genres=${genreId}; limit ${pageSize}; offset ${offset};`
            const response1 = await axios.post('/api/igdb/games', body1, {
                headers: requestHeaders
            })

            // second request: genre id enclosed in parentheses
            const body2 = `fields *; where genres=(${genreId}); limit ${pageSize}; offset ${offset};`
            const response2 = await axios.post('/api/igdb/games', body2, {
                headers: requestHeaders
            })

            const data1 = Array.isArray(response1.data) ? response1.data : []
            const data2 = Array.isArray(response2.data) ? response2.data : []

            // combine and dedupe by id
            const combined = [...data1, ...data2]
            const dedupMap = new Map<number, unknown>()
            for (const item of combined) {
                if (item && typeof item.id === "number") dedupMap.set(item.id, item)
            }
            const result = Array.from(dedupMap.values()) as GameModel[]

            return result
        },
        queryKey: [`genre_${genreId}`, `page_${page}`, `size_${pageSize}`]
    })
}

export function useGameEngineQuery(gameId: number) {
  return useQuery<string[], Error>({
    queryKey: [`game_engines_${gameId}`],
    queryFn: async (): Promise<string[]> => {
      // 1) get the game_engines ids from the game
      const gameResp = await axios.post('/api/igdb/games', `fields game_engines; where id=${gameId};`, {
        headers: requestHeaders,
      });
      const game = gameResp.data?.[0];
      if (!game) return [];
      const engineIds = Array.isArray(game.game_engines) ? game.game_engines : (game.game_engines ? [game.game_engines] : []);
      if (!engineIds || engineIds.length === 0) return [];

      const idsString = engineIds.join(',');
      // 2) fetch engine details
      const engResp = await axios.post('/api/igdb/game_engines', `fields id,name; where id=(${idsString});`, {
        headers: requestHeaders,
      });
      const engines = Array.isArray(engResp.data) ? engResp.data : [];
      return engines.map((e: IGDBEngine) => e.name).filter((name): name is string => name !== undefined);
    },
    staleTime: 60_000,
  })
}

export function usePlatformsQuery(gameId: number) {
  return useQuery<string[], Error>({
    queryKey: [`game_platforms_${gameId}`],
    queryFn: async (): Promise<string[]> => {
      try {
        const gameResp = await axios.post(
          '/api/igdb/games',
          `fields platforms; where id=${gameId};`,
          { headers: requestHeaders }
        )
        const game = gameResp.data?.[0]
        if (!game) return []
        const platformIds = Array.isArray(game.platforms)
          ? game.platforms
          : game.platforms
          ? [game.platforms]
          : []
        if (!platformIds.length) return []

        const fetches = platformIds.map(async (pid: number) => {
          try {
            const resp = await axios.post(
              '/api/igdb/platforms',
              `fields id,name; where id = ${pid};`,
              { headers: requestHeaders }
            )
            const rec = Array.isArray(resp.data) ? resp.data[0] : resp.data
            return rec?.name ?? null
          } catch (perErr) {
            console.error('platform fetch failed for id', pid, perErr)
            return null
          }
        })

        const results = await Promise.all(fetches)
        return Array.from(new Set(results.filter(Boolean) as string[]))
      } catch (err) {
        console.error('usePlatformsQuery error', err)
        throw err as Error
      }
    },
    enabled: !!gameId,
    staleTime: 60_000,
  })
}