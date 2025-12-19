"use client";

import React from "react";

// include user_id here so the caller receives it
export type NewPlayer = { email: string; username: string; division?: number; user_id?: string };

// carry user_id in the lookup result too
type LookupResult = { username: string; name: string; division: number; user_id: string };

type Props = {
  onAdd: (player: NewPlayer) => void;
  onCancel: () => void;
  onLookup: (email: string) => Promise<LookupResult | null>;
  tournamentDivision: number;
  existingEmails: string[];
  existingUsernames: string[];
  maxWidthClass?: string;
};

export default function PlayerForm({
  onAdd,
  onCancel,
  onLookup,
  tournamentDivision,
  existingEmails,
  existingUsernames,
  maxWidthClass,
}: Props) {
  const [email, setEmail] = React.useState("");
  const [errEmail, setErrEmail] = React.useState<string | null>(null);

  const [checking, setChecking] = React.useState(false);
  const [found, setFound] = React.useState<LookupResult | null>(null);
  const [notFoundMsg, setNotFoundMsg] = React.useState<string | null>(null);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setFound(null);
    setNotFoundMsg(null);

    const trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      setErrEmail("Enter a valid email.");
      return;
    }
    setErrEmail(null);

    // duplicate email guard
    if (existingEmails.some((em) => em.toLowerCase() === trimmed.toLowerCase())) {
      setNotFoundMsg("This player is already in the team.");
      return;
    }

    try {
      setChecking(true);
      const res = await onLookup(trimmed);
      if (res && res.username && res.name) {
        // duplicate username guard
        if (existingUsernames.some((u) => u.toLowerCase() === res.username.toLowerCase())) {
          setNotFoundMsg("This player is already in the team.");
          return;
        }
        setFound(res);
      } else {
        setNotFoundMsg("Player not found. Ask them to register on GearForge before adding.");
      }
    } finally {
      setChecking(false);
    }
  };

  const verdict = React.useMemo(() => {
    if (!found) return null;
    const pd = found.division;
    if (pd < tournamentDivision) {
      return {
        status: "block" as const,
        text: `This player’s division (${pd}) is higher than the tournament requirement (${tournamentDivision}). They cannot be added.`,
        className: "text-red-400",
      };
    }
    if (pd > tournamentDivision) {
      return {
        status: "warn" as const,
        text: `This player’s division (${pd}) is lower than the tournament requirement (${tournamentDivision}). You can still add them.`,
        className: "text-yellow-400",
      };
    }
    return { status: "ok" as const, text: "", className: "" };
  }, [found, tournamentDivision]);

  const handleAdd = () => {
    if (!found) return;
    if (verdict?.status === "block") return;
    // PASS user_id through to parent
    onAdd({
      email: email.trim(),
      username: found.username,
      division: found.division,
      user_id: found.user_id,
    });
  };

  const addDisabled =
    !found ||
    verdict?.status === "block" ||
    existingEmails.some((em) => em.toLowerCase() === email.trim().toLowerCase()) ||
    existingUsernames.some((u) => u.toLowerCase() === (found?.username ?? "").toLowerCase());

  return (
    <form
      onSubmit={handleCheck}
      className={`rounded-2xl bg-[#1b1c1e] border border-black/70 p-4 ${maxWidthClass ?? ""}`}
    >
      <h3 className="text-white font-medium mb-3">Add Player</h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errEmail) setErrEmail(null);
              if (found) setFound(null);
              if (notFoundMsg) setNotFoundMsg(null);
            }}
            className={`w-full bg-[#141518] border ${errEmail ? "border-red-600" : "border-black/60"} rounded-xl px-3 py-2 text-white focus:outline-none`}
            placeholder="player@email.com"
          />
          {errEmail && <div className="text-xs text-red-400 mt-1">{errEmail}</div>}
        </div>

        <button
          type="submit"
          disabled={checking || !email.trim()}
          className={`px-4 py-2 rounded-lg ${
            checking || !email.trim()
              ? "bg-[#222327] text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
          aria-busy={checking}
        >
          {checking ? "Checking…" : "Check"}
        </button>
      </div>

      {found && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              disabled
              value={found.username}
              className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              disabled
              value={found.name}
              className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Division</label>
            <input
              disabled
              value={String(found.division)}
              className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
            />
          </div>
        </div>
      )}

      {verdict && verdict.text && (
        <div className={`mt-3 text-sm ${verdict.className}`}>{verdict.text}</div>
      )}
      {notFoundMsg && <div className="mt-3 text-sm text-red-400">{notFoundMsg}</div>}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={addDisabled}
          className={`px-3 py-2 rounded-lg ${
            addDisabled ? "bg-[#222327] text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
          title={
            !found
              ? "Check a valid email first"
              : verdict?.status === "block"
              ? "Player is not eligible for this tournament"
              : "Add this player to the team"
          }
        >
          Add Player
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
