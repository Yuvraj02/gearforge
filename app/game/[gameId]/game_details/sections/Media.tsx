'use client'

import LoadingSpinner from "@/app/components/common/LoadingSpinner"
import { GameModel } from "@/app/models/game_model"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Image from "next/image"

interface MediaModel {
    gameModel: GameModel
}

interface Video {
    id: number
    game: number //Id of the game
    video_id: string
    name: string
}

interface Screenshots {
    id: number,
    game: number,
    url: string,
    image_id: string // image_id is a string
}

const apiKey: string = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN!

const requestHeaders = {
    'Client-ID': '8t38bg3wjw6cfu643bmvww73yp3d0h',
    'Authorization': 'Bearer ' + apiKey
}

function Media({ gameModel }: MediaModel) {

    const vidQuery = useQuery({
        queryKey: [`${gameModel.id}_videos`],
        queryFn: async () => {
            const response = await axios.post('/api/igdb/game_videos', `fields id,name,game,video_id; where game = ${gameModel.id};`, {
                headers: requestHeaders
            })
            return response.data
        }
    })

    const ssQuery = useQuery({
        queryKey: [`${gameModel.id}_ss`],
        queryFn: async () => {
            const response = await axios.post('/api/igdb/screenshots', `fields id,game,url, image_id; where game = ${gameModel.id};`, {
                headers: requestHeaders
            })
            return response.data
        }
    })

    if (vidQuery.isLoading || ssQuery.isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="w-full flex flex-col items-center gap-8">

            {vidQuery.isSuccess && vidQuery.data.length > 0 && (
                <div className="w-full">
                    <h3 className="text-2xl text-white mb-4 text-center">Videos</h3>
                    {vidQuery.data.map((value: Video) => (
                        <div key={value.id} className="w-full flex flex-col items-center p-2 mb-4">
                            <div className="text-lg text-white mb-2">{value.name}</div>
                            {/* Responsive iframe container */}
                            <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                    className='absolute top-0 left-0 w-full h-full rounded-lg'
                                    src={`https://www.youtube.com/embed/${value.video_id}`}
                                    title={value.name}
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {ssQuery.isSuccess && ssQuery.data.length > 0 && (
                <div className="w-full">
                    <h3 className="text-2xl text-white mb-4 text-center">Screenshots</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ssQuery.data.map((value: Screenshots) => (
                            <div key={value.id}>
                                <Image
                                    className="rounded-lg w-full h-auto"
                                    src={`https://images.igdb.com/igdb/image/upload/t_720p/${value.image_id}.jpg`}
                                    height={720}
                                    width={1280}
                                    alt="Game Screenshot"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Media