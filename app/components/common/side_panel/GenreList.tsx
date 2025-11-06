"use client"

import Link from "next/link"
import { useAppSelector } from "@/app/hooks"
import { useState } from "react"
import { MdCategory, MdKeyboardArrowRight, MdKeyboardArrowDown, MdArrowForward } from "react-icons/md"
import { usePathname } from "next/navigation"

function GenreList() {
    const [expandedGenre, setExpand] = useState<boolean>(false)
    const genreList = useAppSelector((state)=>state.genres.genres ?? [])
    const pathname = usePathname() ?? ""
    const currentSlug = pathname.split("/")[2] ?? "" // /genres/[slug]

    return (
        <div className="relative flex flex-col gap-2 select-none">
            <div onClick={()=>setExpand(prev=>!prev)} className="relative flex gap-2 items-center hover:bg-neutral-700 hover:text-white hover:rounded-xl p-2 cursor-pointer">
                <MdCategory />
                <div>Genre</div>
                <span><MdKeyboardArrowRight className={expandedGenre ? `h-0 w-0 left-0` : `transition-all text-2xl duration-300 ease-in-out`}/></span>
                <span><MdKeyboardArrowDown  className={expandedGenre ? `transition-all text-2xl duration-300 ease-in-out` : `h-0 w-0 left-0`}/> </span>
            </div>

            <div className={expandedGenre ? `h-fit px-2 flex flex-col gap-2` : `h-0 w-0 left-0 overflow-hidden`}>
                {genreList.length === 0 ? (
                    <div></div>
                ) : (
                    genreList.slice(0,10).map((value) => {
                        const isActive = currentSlug === String(value.slug)
                        return (
                            <Link
                                key={value.id}
                                href={`/genres/${encodeURIComponent(value.slug)}`}
                                className={
                                    expandedGenre
                                        ? `block transition-all duration-300 ease-out mb-0 ml-4 p-1 visible text-left whitespace-normal break-words ${isActive ? "bg-neutral-700 text-white rounded-xl" : "hover:text-white hover:rounded-xl"}`
                                        : `h-0 w-0 left-0 invisible`
                                }
                            >
                                {value.name}
                            </Link>
                        )
                    })
                )}

               <div className={expandedGenre ? `mb-2 ml-4 p-1 visible` : `h-0 w-0 left-0 invisible`}>
                    
                    <Link
                        href={"/genres"}
                        className={
                            expandedGenre
                                ? `transition-all duration-300 ease-out mb-0 ml-0 p-1 visible text-left whitespace-normal break-words flex items-center gap-2 ${pathname === "/genres" || pathname === "/genres/" ? "bg-neutral-700 text-white rounded-xl" : "hover:text-white hover:rounded-xl"}`
                                : `h-0 w-0 left-0 invisible`
                        }
                    >
                        <span>Explore More</span>
                        <MdArrowForward className="text-2xl"/>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default GenreList
