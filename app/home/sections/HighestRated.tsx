'use client'
import DraggableScroll from "@/app/components/common/DraggableScroll"
import GameCard from "@/app/components/common/GameCard"
import LoadingSpinner from "@/app/components/common/LoadingSpinner"
import { CoverArt } from "@/app/models/cover_art_model"
import { GameCardModel } from "@/app/models/game_card_model"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// const highestRated:string[] = ['Game 1', 'Game 2', 'Game 3']
const apiKey = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN

function HighestRated() {

    let gameIds: string[] = []

    const gameQuery = useQuery({
        queryKey: ['highest_rated'],
        queryFn: async () => {

            const response = await axios.post(`/api/games`, 'fields id, cover; sort rating desc;', {
                headers: {
                    'Client-ID': '8t38bg3wjw6cfu643bmvww73yp3d0h',
                    'Authorization': 'Bearer ' + apiKey
                }
            })
            return response.data
        }
    })

    if (gameQuery.isFetched) {
        gameIds = gameQuery.data.map((e: GameCardModel) => e.id)
    }
    const coverQuery = useQuery({
        queryFn: async () => {
            const response = await axios.post('/api/covers', `fields id,game,height,url,width, image_id; where game = (${gameIds.join(",")});`, {
                headers: {
                    'Client-ID': '8t38bg3wjw6cfu643bmvww73yp3d0h',
                    'Authorization': 'Bearer ' + apiKey
                }
            })
            return response.data
        },

        enabled: gameQuery.isFetched,

        queryKey: ['game_cover']
    })

    if (gameQuery.isLoading) {
        return <LoadingSpinner />
    }

    if (gameQuery == null) {
        return (<div>There is some error</div>)
    }

    if (gameQuery.isFetched) {
        if (coverQuery.isLoading) {
            return (<LoadingSpinner />)
        }

        if (coverQuery.isError) {
            return (<div>Error Loading Cover</div>)
        }
    }

    if(gameQuery.isError){
        return (<div>Connection Error. Plase Try Refreshing the Page</div>)
    }

    return (<div className="mt-12 ml-12 mr-12 mb-4">
        <p className="text-white text-3xl">
            Highest Rated
        </p>

        <div className="flex flex-col">

            {<DraggableScroll>
                {gameQuery.data.map((value: GameCardModel, index: number) => {

                    value.cover = coverQuery.data.find((currElem: CoverArt) => currElem.game === value.id)
            
                    return (<div key={index}><GameCard game={value} /></div>)
                })}
            </DraggableScroll>
            }
            <div className="flex flex-row-reverse">
                <p className="p-2 cursor-pointer hover:text-white">View All Highest Rated</p>
            </div>
        </div>
    </div>)
}

export default HighestRated