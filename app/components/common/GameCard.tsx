//Implement this as game model
'use client'
import { GameCardModel } from "@/app/models/game_card_model"
import Image from "next/image"

interface CardProps{
    game:GameCardModel
}

function GameCard(props:CardProps) {

    // if(props.game.cover===undefined){
    //     return <div className="h-54 w-54 rounded-xl flex flex-col bg-gray-900"></div>
    // }

    const imageUrl : string = `https://images.igdb.com/igdb/image/upload/t_720p/${props.game.cover.image_id}.jpg`

    console.log(imageUrl)
    return (<div className="h-54 w-54 rounded-2xl flex flex-col">
        <Image className ="h-full w-full rounded-2xl" src={imageUrl} height={1280} width={720} alt="Image banner"/>
        <div></div>
    </div>)
}
export default GameCard