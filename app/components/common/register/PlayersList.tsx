"use client";

import React from "react";

export type PlayerRow = {
  email: string;
  username: string;
  role: "captain" | "member";
  status: "verified" | "pending" | "ineligible" | "not_found" | "error";
  note?: string;
};

type Props = {
  players: PlayerRow[];
  onRemove: (username: string) => void;
  max: number;
  min: number;
};

export default function PlayersList({ players, onRemove, max, min }: Props) {
  return (
    <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Team Members</h3>
        <span className="text-sm text-gray-400">
          {players.length}/{max} players • Min required: {min}
        </span>
      </div>

      {players.length === 0 ? (
        <div className="text-gray-400 text-sm">No players added yet.</div>
      ) : (
        <ul className="space-y-2">
          {players.map((p) => (
            <li
              key={`${p.role}-${p.username}`}
              className="rounded-xl bg-[#141518] border border-black/60 px-3 py-2 flex items-center justify-between"
            >
              <div>
                <div className="text-white">
                  {p.username}{" "}
                  <span className="ml-2 text-xs text-gray-400">{p.email}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {p.role === "captain" ? "Captain" : "Member"} • {p.status}
                  {p.note ? ` • ${p.note}` : ""}
                </div>
              </div>
              {p.role !== "captain" && (
                <button
                  onClick={() => onRemove(p.username)}
                  className="text-sm bg-[#1f2023] hover:bg-[#2a2b2f] text-gray-300 px-2 py-1 rounded-md"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
