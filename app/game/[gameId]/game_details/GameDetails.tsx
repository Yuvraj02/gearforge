'use client'
import { useState } from "react"
import About from "./sections/About"
import Media from "./sections/Media"
import Platforms from "./sections/Paltforms"
import { GameModel } from "@/app/models/game_model"

interface GameDetailsProps {
    gameModel: GameModel
    companiesName: string[]
}

function GameDetails({ gameModel, companiesName }: GameDetailsProps) {
    const [clickedItem, setClickItem] = useState<string>('About')

    const onClickItemHandler = (item: string) => {
        setClickItem(item)
    }

    // This function now renders child components without passing down style props
    function renderSection(sectionName: string, gameModel: GameModel) {
        switch (sectionName) {
            case 'About':
                return <About gameModel={gameModel} companies_name={companiesName} />
            case 'Media':
                return <Media gameModel={gameModel} />
            case 'Platforms':
                return <Platforms gameId={gameModel.id}/>
            default:
                return <div>Some Error</div>
        }
    }

    const tabBaseStyle = "py-2 px-4 cursor-pointer transition-colors duration-200 ease-in-out";
    const activeTabStyle = "bg-gray-800 text-white border-b-2 border-blue-500";
    const inactiveTabStyle = "text-gray-400 hover:bg-gray-700 hover:text-white rounded-t-lg";

    return (
        <div className="mt-4 w-full">
            <div className="text-sm sm:text-lg flex border-b border-gray-700 select-none">
                <div onClick={() => onClickItemHandler('About')} className={`${tabBaseStyle} ${clickedItem === 'About' ? activeTabStyle : inactiveTabStyle}`}>About</div>
                <div onClick={() => onClickItemHandler('Media')} className={`${tabBaseStyle} ${clickedItem === 'Media' ? activeTabStyle : inactiveTabStyle}`}>Media</div>
                <div onClick={() => onClickItemHandler('Platforms')} className={`${tabBaseStyle} ${clickedItem === 'Platforms' ? activeTabStyle : inactiveTabStyle}`}>Platforms</div>
            </div>
            <div className="w-full bg-gray-800 p-4 rounded-b-xl rounded-tr-xl">
                {renderSection(clickedItem, gameModel)}
            </div>
        </div>
    )
}

export default GameDetails;