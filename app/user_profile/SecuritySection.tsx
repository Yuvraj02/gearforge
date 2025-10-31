"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "../hooks";
import { updateUserPassword } from "../api"; // implement: ({ currentPassword, newPassword }) => ...
import { AxiosError } from "axios";

export default function SecuritySection({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const user = useAppSelector((s) => s.users.user);
  const userId: string = user.user_id
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const { mutate: savePassword, isPending } = useMutation({
    mutationKey: ["change_password"],
    mutationFn: async () =>
      updateUserPassword(userId, currentPassword, newPassword),
    onSuccess: () => {
      setOk("Password updated.");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: AxiosError) => {
      setOk(null);
      if (e?.status === 401) {
        setError("Incorrect Current Password. Please Check Again")
      } else {
        setError(e?.message || "Failed to update password");
      }
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    savePassword();
  };

  return (
    <div className="space-y-4">
      {/* Email */}
      <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
        <h2 className="text-lg font-medium text-white">Security</h2>
        <div className="mt-3 bg-[#141518] border border-black/60 rounded-xl p-3">
          <div className="text-sm text-gray-400 mb-1">Email</div>
          <div className="text-white break-all">{user?.email || "—"}</div>
        </div>
      </div>

      {/* Password */}
      <form
        onSubmit={submit}
        className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4 space-y-3"
      >
        <h3 className="text-white font-medium">Update Password</h3>

        <label className="block">
          <span className="text-sm text-gray-400">Current Password</span>
          <input
            type="password"
            className="mt-1 w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 focus:outline-none"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-400">New Password</span>
            <input
              type="password"
              className="mt-1 w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-400">Confirm Password</span>
            <input
              type="password"
              className="mt-1 w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}
        {ok && <div className="text-green-400 text-sm">{ok}</div>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className={`px-4 py-2 rounded-xl ${isPending
                ? "bg-[#222327] text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
          >
            Save
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl border border-red-900/40 text-red-400 hover:bg-[#2a1c1c] hover:text-red-200 transition"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
