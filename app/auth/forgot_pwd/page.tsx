'use client'

import { requestPasswordReset } from "@/app/api"
import { useMutation } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useState } from "react"

function ForgotPassword(){

        const [email, setEmail] = useState<string>("")

        const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
                  
            useEffect(() => {
            }, [email, setEmail])
        
        const send_reset_pwd_req = useMutation({
            mutationKey:['reset_pwd_req'],
            mutationFn: async () => requestPasswordReset(email)
        })
        
        const handleSendResetEmailClick = () => {
            send_reset_pwd_req.mutate()
        }

    return (<>
    <div className="flex justify-center items-center h-screen">
    
                <form className="h-fit w-[25vw] bg-[#242528] rounded-2xl p-4 flex flex-col justify-center">
    
                    <h1 className="text-2xl text-white self-center mt-2">Enter Your Email</h1>
                    <div className="p-2 flex flex-col gap-3 mt-2">
                        <div className="relative w-full ">
                            <input onChange={handleEmailInput} className="p-2 bg-[#161719] rounded w-full" type={"text"} placeholder="Email"></input>
                        </div>
                        
                        <span>{false? <p className="text-red-600" >User does not exist</p> : ""}</span>
                        <div className="flex gap-2">
                          
                            <button type="submit" onClick={handleSendResetEmailClick} className="border p-2 w-full rounded-xl cursor-pointer hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out">Send Password Reset Mail</button >
                        </div>
                    </div>
                </form>
            </div>
    </>)
}
export default ForgotPassword