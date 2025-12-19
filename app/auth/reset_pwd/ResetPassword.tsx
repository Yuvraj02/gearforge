'use client'

import { resetPassword, verifyResetLink } from "@/app/api"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import React, { ChangeEvent, useEffect, useMemo, useState } from "react"
import { MdOutlineVisibilityOff, MdVisibility, MdVisibilityOff } from "react-icons/md"

function ResetPassword() {
  const queryParams = useSearchParams()
  const router = useRouter()
  const token = useMemo(() => queryParams.get("token") ?? "", [queryParams])

  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isSamePassword, setSamePassword] = useState<boolean>(true)
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false)
  const [isConfirmPasswordVisible, setConfirmPasswordVisibile] = useState<boolean>(false)
  const [isValidPasswordLength, setValidPasswordLength] = useState<boolean>(true)

  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
  const handleConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)

  const handleSetPasswordClick = (e: React.FormEvent) => {
    e.preventDefault()
    update_pwd.mutate()
  }

  useEffect(() => {
    setValidPasswordLength(password.length === 0 || password.length >= 8)
    setSamePassword(confirmPassword === "" || password === confirmPassword)
  }, [confirmPassword, password])

  const verification_q = useQuery({
    queryKey: ["verification_token", token],
    queryFn: async () => verifyResetLink(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const update_pwd = useMutation({
    mutationKey: ["pwd_update"],
    mutationFn: async () => resetPassword(verification_q.data!.user_id, confirmPassword),
    onError: (error: AxiosError) => {
      console.error(error)
    },
    onSuccess: () => {
      router.replace("/auth")
    },
  })

  if (verification_q.isLoading || verification_q.isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#161719]">
        <div className="w-full max-w-md flex flex-col items-center gap-3 text-white">
          <div
            className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"
            aria-label="Loading"
          />
          <p className="text-sm text-white/80 text-center">
            Validating your reset link…
          </p>
        </div>
      </div>
    )
  }

  if (verification_q.isError || !verification_q.data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#161719]">
        <div className="w-full max-w-md text-white/90 bg-[#242528] p-6 rounded-2xl text-center">
          Invalid or expired link. Please request a new password reset.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#161719]">
      <form
        onSubmit={handleSetPasswordClick}
        className="w-full max-w-md bg-[#242528] rounded-2xl p-5 sm:p-6 flex flex-col"
      >
        <h1 className="text-xl sm:text-2xl text-white text-center mt-1">
          Set New Password
        </h1>

        <div className="mt-4 flex flex-col gap-3">
          <div className="relative w-full">
            <input
              onChange={handlePasswordInput}
              className="p-2.5 bg-[#161719] text-white rounded-xl w-full outline-none ring-1 ring-transparent focus:ring-white/15"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((s) => !s)}
              className="absolute right-3 p-1 top-1/2 -translate-y-1/2 hover:bg-neutral-700 rounded-2xl text-white text-xl"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <MdVisibility /> : <MdOutlineVisibilityOff />}
            </button>
          </div>

          {!isValidPasswordLength && (
            <p className="text-red-500 text-sm">Password must be at least 8 characters</p>
          )}

          <div className="relative w-full">
            <input
              onChange={handleConfirmPassword}
              className="p-2.5 bg-[#161719] text-white rounded-xl w-full outline-none ring-1 ring-transparent focus:ring-white/15"
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisibile((s) => !s)}
              className="absolute right-3 p-1 top-1/2 -translate-y-1/2 hover:bg-neutral-700 rounded-2xl text-white text-xl"
              aria-label={isConfirmPasswordVisible ? "Hide confirmation" : "Show confirmation"}
            >
              {isConfirmPasswordVisible ? <MdVisibility /> : <MdVisibilityOff />}
            </button>
          </div>

          {!isSamePassword && <p className="text-red-500 text-sm">Passwords do not match</p>}

          <button
            type="submit"
            disabled={
              update_pwd.isPending ||
              !isValidPasswordLength ||
              !isSamePassword ||
              confirmPassword.length === 0
            }
            className="border p-2.5 w-full rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {update_pwd.isPending ? "Setting…" : "Set Password"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
