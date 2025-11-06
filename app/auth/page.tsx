'use client'

import { useMutation } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import React, { ChangeEvent, useEffect, useState } from "react"
import { login } from "../api"
import { loginUser, setUser } from "../userSlice"
import { useRouter } from "next/navigation"
import axios, { AxiosError } from "axios"
import { useAppDispatch, useAppSelector } from "../hooks"
import { signIn, useSession } from "next-auth/react"

/*
    NOTE: 

    This file is divided into two auth sections 
    1. First is Traditional Authentication (Email & Password)
    2. Second is OAuth (Google)
    So if any changes related to user data have to be made, make the changes in both the parts

*/

function AuthenticationPage() {

    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isValidEmail, setIsValidEmail] = useState<boolean>(true)
    const [isValidPassword, setIsValidPassword] = useState<boolean>(true)
    const [hasProfile, setHasProfile] = useState<boolean>(false)
    const [userId, setUserId] = useState<string>("")
    const [sysLogin, setSysLogin] = useState<boolean>(false)
    const { data: session, status } = useSession()
    const isLoggedIn = useAppSelector((state) => state.users.isLoggedIn)
    const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
    const dispatch = useAppDispatch()

    useEffect(() => {
    }, [password, email, setEmail, setPassword])

    const login_user = useMutation({
        mutationKey: ['login_user'],
        mutationFn: async () => login({ email: email, password: password }),
        onSuccess: (data) => {
            setIsValidEmail(true)
            setIsValidPassword(true)
            dispatch(loginUser())
            setSysLogin(true)
            console.log(data.data)
            dispatch(setUser(data.data))
            router.push("/")
            console.log("User Logged in Successfully")
        },
        onError: (error: AxiosError) => {
            console.log(error)
        }
    })

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        login_user.mutate()
    }

    useEffect(() => {

        if (login_user.isError) {
            switch (login_user.error.status) {
                case 404:
                    setIsValidEmail(false)
                    break;
                case 401:
                    setIsValidEmail(true)
                    setIsValidPassword(false)
                    break;
            }
        }

        if (status === "authenticated" && session.user && !isLoggedIn) {
            (async () => {
                let url : string = process.env.NEXT_PUBLIC_BASE_API_LOCAL!
                if(process.env.NEXT_NODE_ENV === "prod"){
                    url = process.env.NEXT_PUBLIC_BASE_API_PROD!
                }else if(process.env.NEXT_NODE_ENV === "dev"){
                    url = process.env.NEXT_PUBLIC_BASE_API_DEV!
                }
                const response = await axios.post(`${url}/auth/oauth/upsert`, {
                    input: {
                        provider: session.user?.provider,
                        providerAccountId: session.user?.providerAccountId,
                        email: session.user?.email,
                        name: session.user?.name,
                        image: session.user?.image
                    }
                }, { withCredentials: true })

                if (response.status !== 200) {
                    //HANDLE ERROR RIGHT HERE  
                }

                if (response.data.hasProfile) {
                    setHasProfile(true)

                    // setUserId(response.data.user_id)
                }
                dispatch(loginUser())
                setUserId(response.data.user_id)
            })()
        }
    }, [login_user.isError, status, session, isLoggedIn, dispatch, login_user.error?.status])

    // wherever you have the effect
    useEffect(() => {
        if (!isLoggedIn || sysLogin) return;

        const target = hasProfile ? "/" : `/user_profile/profile_setup?user_id=${encodeURIComponent(userId)}`;

        router.replace(target);
        // router.refresh() is usually unnecessary right after replace
    }, [isLoggedIn, hasProfile, sysLogin, userId, router]);

    return (<>
        <div className="flex justify-center items-center min-h-screen px-4">

            <form className="h-fit w-full max-w-sm bg-[#242528] rounded-2xl p-4 flex flex-col justify-center">

                <h1 className="text-2xl text-white self-center mt-2">Sign in</h1>
                <div className="p-2 flex flex-col gap-3 mt-2">
                    <input
                        type="email"
                        onChange={handleEmailInput}
                        className="rounded-xl bg-[#161719] w-full p-2"
                        placeholder="Enter Your Email"
                    />
                    <span className={isValidEmail ? "hidden" : ""}><p className="text-red-600" >Email does not exist</p></span>
                    <input
                        type="password"
                        onChange={handlePasswordInput}
                        className="rounded-xl bg-[#161719] w-full p-2"
                        placeholder="Enter Your Password"
                    />
                    <span className={isValidPassword ? "hidden" : ""}><p className="text-red-600" >Incorrect Password</p></span>
                    <Link href={"auth/forgot_pwd"}><p className="ml-1 text-[0.9rem] hover:underline cursor-pointer w-fit">Forgot Password ?</p></Link>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="
    w-full rounded-xl border p-2 cursor-pointer
    transition-transform duration-150 ease-out
    hover:bg-green-500 hover:text-white
    active:scale-95 active:bg-green-600 active:text-white
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60
    select-none
  "
                        >
                            Login
                        </button>

                        <Link className="w-full" href={"/auth/register"}>
                            <button
                                type="button"
                                className="w-full rounded-xl border p-2 cursor-pointer transition-transform duration-150 ease-out
                                        hover:bg-blue-500 hover:text-white
                                         active:scale-95 active:bg-blue-600 active:text-white
                                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                                         select-none">
                                Register
                            </button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 my-4">
                        <div className="h-px bg-gray-300 flex-1" />
                        <span className="text-sm text-gray-500">or</span>
                        <div className="h-px bg-gray-300 flex-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => signIn("google")}
                            className="
    flex w-full items-center bg-blue-600 cursor-pointer rounded-xl
    transition-transform duration-150 ease-out
    hover:border
    active:scale-95 active:brightness-95
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70
    select-none
  "
                        >
                            <Image className="bg-white" src={"/google-symbol.png"} width={40} height={40} alt="Google Logo" />
                            <p className="w-full self-center text-white">Sign in With Google</p>
                        </button>
                        {/* <button className="flex w-full items-center bg-[#5968F0] cursor-pointer hover:border"><Image className="bg-white" src={"/discord-symbol.png"} width={40} height={50} alt="Discord logo" /><p className="w-full self-center text-white">Sign in With Discord</p></button > */}
                    </div>
                </div>
            </form>
        </div>
    </>)
}

export default AuthenticationPage