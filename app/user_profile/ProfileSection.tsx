"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../userSlice";
import { updateUser } from "../api"; // accepts (userId, username, name); returns { data: User } or User
import { MdEdit, MdCheck, MdClose } from "react-icons/md";
import type { User } from "../models/user_model";
import { AxiosError } from "axios";

type ApiEnvelope<T> = { data: T };

const DIVISION_MAX: Record<number, number> = {
  3: 600,
  2: 1500,
  1: 1500,
};

export default function ProfileSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.users.user);
  const hasHydrated = useAppSelector((s) => s.users.hasHydrated);

  const division = user?.division ?? 3;
  const points = user?.division_score ?? 0;

  const nextDiv = division > 1 ? division - 1 : null;
  const max = DIVISION_MAX[division] ?? 0;
  const ratio = nextDiv ? Math.min(1, Math.max(0, max ? points / max : 0)) : 1;

  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");

  const [errName, setErrName] = React.useState<string | null>(null);
  const [errUsername, setErrUsername] = React.useState<string | null>(null);
  const [errApi, setErrApi] = React.useState<string | null>(null);

  const userId = user?.user_id ?? "";

  const beginEdit = () => {
    setName(user?.name ?? "");
    setUsername(user?.user_name ?? "");
    setErrName(null);
    setErrUsername(null);
    setErrApi(null);
    setEditing(true);
  };

  const dirty =
    (name ?? "") !== (user?.name ?? "") ||
    (username ?? "") !== (user?.user_name ?? "");

  const validate = () => {
    let ok = true;
    setErrName(null);
    setErrUsername(null);

    const n = (name ?? "").trim();
    const u = (username ?? "").trim();

    if (n.length === 0) {
      setErrName("Name cannot be empty.");
      ok = false;
    }
    if (u.length === 0) {
      setErrUsername("Username cannot be empty.");
      ok = false;
    }
    return ok;
  };

  const { mutate: saveProfile, isPending } = useMutation({
    mutationKey: ["update_user_profile", userId, username, name],
    mutationFn: async () => {
      if (!userId) throw new Error("Missing user id.");
      if (!validate()) throw new Error("Please fix the highlighted fields.");
      return updateUser(userId, username.trim(), name.trim());
    },
    onSuccess: (resp: ApiEnvelope<User> | User) => {
      setErrApi(null);
      setErrUsername(null);

      const updated = (resp as ApiEnvelope<User>).data
        ? (resp as ApiEnvelope<User>).data
        : (resp as User);

      // merge so we don't drop fields the API didn't send back
      const merged: User = { ...user, ...updated };
      dispatch(setUser(merged));
      setEditing(false);
    },
    onError: (e: AxiosError) => {
      // Map server errors to a friendly username error
      const status =
        e?.response?.status ?? e?.status ?? null;

      if (status === 500 || status === 409) {
        // API says username clash (as requested: show this on HTTP 500 too)
        setErrUsername("Username Already Exists");
        setErrApi(null);
        return;
      }

      // fallback generic error
      const msg = e?.message || "Failed to update profile.";
      setErrApi(msg);
    },
  });

  if (!hasHydrated) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4 animate-pulse h-28" />
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4 animate-pulse h-56" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Division card */}
      <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Current Division</h2>
          <span className="text-gray-300">Div {division}</span>
        </div>

        {nextDiv ? (
          <>
            <div className="mt-3 h-2 w-full rounded-full bg-[#0f1012] overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Score: <span className="text-gray-200">{points}</span> / {max} to
              reach Div {nextDiv}
            </div>
          </>
        ) : (
          <div className="mt-2 text-sm text-green-300">Top Division</div>
        )}
      </div>

      {/* Identity card */}
      <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Profile</h2>
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-[#141518] text-gray-300 hover:bg-[#1c1d20]"
              >
                <MdClose /> Cancel
              </button>
              <button
                disabled={!dirty || isPending}
                onClick={() => saveProfile()}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${!dirty || isPending
                    ? "bg-[#222327] text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                title={!dirty ? "No changes to save" : undefined}
              >
                <MdCheck /> Save
              </button>
            </div>
          ) : (
            <button
              onClick={beginEdit}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-[#141518] text-gray-300 hover:bg-[#1c1d20]"
            >
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {errApi && (
          <div className="mt-3 text-sm text-red-400" role="alert" aria-live="polite">
            {errApi}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="bg-[#141518] border border-black/60 rounded-xl p-3">
            <div className="text-sm text-gray-400 mb-1">Name</div>
            {editing ? (
              <>
                <input
                  className={`w-full bg-transparent focus:outline-none rounded-md px-2 py-1 border ${errName ? "border-red-600" : "border-black/60"
                    }`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errName) setErrName(null);
                  }}
                  placeholder="Your name"
                />
                {errName && (
                  <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">
                    {errName}
                  </div>
                )}
              </>
            ) : (
              <div className="text-white">{user?.name || "—"}</div>
            )}
          </div>

          {/* Username */}
          <div className="bg-[#141518] border border-black/60 rounded-xl p-3">
            <div className="text-sm text-gray-400 mb-1">Username</div>
            {editing ? (
              <>
                <input
                  className={`w-full bg-transparent focus:outline-none rounded-md px-2 py-1 border ${errUsername ? "border-red-600" : "border-black/60"
                    }`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errUsername) setErrUsername(null);
                  }}
                  placeholder="Your username"
                />
                {errUsername && (
                  <div className="mt-1 text-xs text-red-400" role="alert" aria-live="polite">
                    {errUsername}
                  </div>
                )}
              </>
            ) : (
              <div className="text-white">{user?.user_name || "—"}</div>
            )}
          </div>

          {/* Email (readonly) */}
          <div className="bg-[#141518] border border-black/60 rounded-xl p-3 md:col-span-2">
            <div className="text-sm text-gray-400 mb-1">Email</div>
            <div className="text-white break-all">{user?.email || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
