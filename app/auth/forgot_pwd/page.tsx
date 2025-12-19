'use client'

import { requestPasswordReset } from "@/app/api"
import { useMutation } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"

function ForgotPassword() {
  const [email, setEmail] = useState<string>("")

  const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)

  const send_reset_pwd_req = useMutation({
    mutationKey: ['reset_pwd_req'],
    mutationFn: async () => requestPasswordReset(email),
  })

  const handleSendResetEmailClick = (e: React.FormEvent) => {
    e.preventDefault()
    send_reset_pwd_req.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#161719]">
      <form
        onSubmit={handleSendResetEmailClick}
        className="w-full max-w-md bg-[#242528] rounded-2xl p-5 sm:p-6 flex flex-col justify-center"
      >
        <h1 className="text-xl sm:text-2xl text-white text-center mt-1">
          Enter Your Email
        </h1>

        <div className="mt-4 flex flex-col gap-3">
          <div className="w-full">
            <input
              value={email}
              onChange={handleEmailInput}
              className="p-2.5 bg-[#161719] rounded-xl w-full text-white placeholder:text-neutral-400 outline-none ring-1 ring-transparent focus:ring-white/15"
              type="email"
              placeholder="Email"
            />
          </div>

          <span>{false ? <p className="text-red-600">User does not exist</p> : ""}</span>

          <button
            type="submit"
            disabled={send_reset_pwd_req.isPending || !email.trim()}
            className={[
              "border p-2.5 w-full rounded-xl transition-all duration-200 ease-in-out font-medium",
              "hover:bg-blue-500 hover:text-white",
              (send_reset_pwd_req.isPending || !email.trim())
                ? "bg-gray-600 text-gray-800 cursor-not-allowed border-gray-600 hover:bg-gray-600 hover:text-gray-800"
                : "cursor-pointer",
            ].join(" ")}
          >
            {send_reset_pwd_req.isPending ? "Sending…" : "Send Password Reset Mail"}
          </button>

          {/* optional tiny hint on small screens */}
          <p className="text-xs text-neutral-400 text-center mt-1">
            We’ll send a reset link to your email.
          </p>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword
