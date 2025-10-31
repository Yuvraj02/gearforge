"use client";

import React from "react";

export type NewPlayer = { email: string; username: string };

type Props = {
  onAdd: (player: NewPlayer) => void;
  onCancel: () => void;
  maxWidthClass?: string; // optional layout tweak
};

export default function PlayerForm({ onAdd, onCancel, maxWidthClass }: Props) {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [errEmail, setErrEmail] = React.useState<string | null>(null);
  const [errUsername, setErrUsername] = React.useState<string | null>(null);

  const validate = () => {
    let ok = true;
    setErrEmail(null);
    setErrUsername(null);

    const e = email.trim();
    const u = username.trim();

    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setErrEmail("Enter a valid email.");
      ok = false;
    }
    if (u.length < 3) {
      setErrUsername("Username must be at least 3 characters.");
      ok = false;
    }
    return ok;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd({ email: email.trim(), username: username.trim() });
  };

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl bg-[#1b1c1e] border border-black/70 p-4 ${maxWidthClass ?? ""}`}
    >
      <h3 className="text-white font-medium mb-3">Add Player</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errEmail) setErrEmail(null);
            }}
            className={`w-full bg-[#141518] border ${errEmail ? "border-red-600" : "border-black/60"} rounded-xl px-3 py-2 text-white focus:outline-none`}
            placeholder="player@email.com"
          />
          {errEmail && <div className="text-xs text-red-400 mt-1">{errEmail}</div>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errUsername) setErrUsername(null);
            }}
            className={`w-full bg-[#141518] border ${errUsername ? "border-red-600" : "border-black/60"} rounded-xl px-3 py-2 text-white focus:outline-none`}
            placeholder="in-game username"
          />
          {errUsername && <div className="text-xs text-red-400 mt-1">{errUsername}</div>}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-[#141518] hover:bg-[#1c1d20] text-gray-300 px-3 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
