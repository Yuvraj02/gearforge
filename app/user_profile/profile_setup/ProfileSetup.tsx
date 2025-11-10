'use client'

import { updateUser } from "@/app/api"
import { useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent, useState } from "react"
import { AxiosError } from "axios"
import { useAppDispatch } from "@/app/hooks"
import { setUser } from "@/app/userSlice"

function ProfileSetup() {

    const params = useSearchParams()
    const user_id = params.get("user_id")
    const [username, setUsername] = useState<string>('')
    const [name, setName] = useState<string>('') 
    const [isUserExist, setExistingUser] = useState<boolean>(false)
    const router = useRouter()
    const usernameInputHandler = (e:ChangeEvent<HTMLInputElement>)=> setUsername(e.target.value)
    const nameInputHandler = (e:ChangeEvent<HTMLInputElement>) => setName(e.target.value)
    const dispatch = useAppDispatch()

    const update_user = useMutation({
        mutationKey:[`update_user_${username}`],
        mutationFn:() => updateUser(user_id!,username,name),
        onSuccess:(data)=>{
            document.cookie = `has_profile=1; path=/; samesite=lax`;
            router.replace("/")
            //-============================== GET DETAILS HERE OF THE USER
            // console.log("User Data:==========", data)
            dispatch(setUser(data.data))
            router.refresh()
        },
        onError(error: AxiosError) {
            if(error.status===409){
                setExistingUser(true)
            }
        },
    })

    return (<div className="flex justify-center items-center w-full h-screen">
            <form className="bg-[#242528] p-5 flex flex-col gap-3 w-xl rounded-xl">
                <div className="flex justify-center"><h1 className="text-3xl text-white pt-2">Profile Setup</h1></div>
                <div className="flex items-center mt-4">
                        <div className="h-px bg-gray-300 flex-1" />
                    </div>
                <div>  
                    <div className="py-2 px-1"><p className="text-2xl">Name</p></div>
                    <div> <input onChange={nameInputHandler} className="rounded-xl bg-[#161719] w-full p-2" placeholder="Enter Your Name"></input></div>
                </div>
                <div>
                    <div className="py-2 px-1"><p className="text-2xl">Username</p></div>
                    <div> <input onChange={usernameInputHandler} className="rounded-xl bg-[#161719] w-full p-2" placeholder="Your Username"></input></div>
                </div>
                <span className={!isUserExist ? "hidden" : ""}><p className="text-red-600" >Username Already Exists! Try a different username</p></span>
                <div className="flex justify-center items-center pt-4">
                    <button type="button" onClick={()=>update_user.mutate()} className="rounded-xl border p-2 cursor-pointer bg-blue-600 text-white hover:bg-blue-700">Submit</button>
                </div>
                
            </form>
    </div>)
}

export default ProfileSetup