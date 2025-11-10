"use client";

import React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/app/hooks";
import PlayerForm, { NewPlayer } from "./register/PlayerForm";
import PlayersList, { PlayerRow } from "./register/PlayersList";
import ConfirmModal from "./register/ConfirmModal";
import Guidelines from "./register/Guidlines";
import { Tournament } from "@/app/models/tournament_model";
import { getUserByEmail } from "@/app/api";

type Props = {
  tournamentId?: string;
  preset?: Partial<Tournament>;
};


export default function RegisterTournament({ tournamentId, preset }: Props) {
  // --------- Auth & tournament context ---------
  const me = useAppSelector((s) => s.users.user);
  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const hasHydrated = useAppSelector((s) => s.users.hasHydrated);

  const tournamentDivision = preset?.tournament_division ?? 3;
  const maxSize = preset?.max_team_size ?? 5;
  const minSize = preset?.min_team_size ?? 3;

  // Captain division from either `division` or `division_score`
  const captainDivision =
    typeof me?.division === "number"
      ? me.division
      : typeof me?.division_score === "number"
        ? me.division_score!
        : 3;

  const captainTooHigh = captainDivision < tournamentDivision;

  // --------- Local state (declare ALL hooks before any return) ---------
  const [teamName, setTeamName] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const captain: PlayerRow = {
    email: me?.email ?? "",
    username: me?.user_name ?? "",
    role: "captain",
    status: "verified",
    note: undefined,
  };

  // Persistence key per tournament
  const STORAGE_KEY = React.useMemo(
    () => `gf_reg_team_${tournamentId ?? "default"}`,
    [tournamentId]
  );

  const [players, setPlayers] = React.useState<PlayerRow[]>([captain]);

  // Load persisted data on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { teamName?: string; players?: PlayerRow[] };
        if (saved?.players && Array.isArray(saved.players) && saved.players.length > 0) {
          setPlayers(saved.players);
        } else {
          setPlayers([captain]);
        }
        if (typeof saved?.teamName === "string") setTeamName(saved.teamName);
      } else {
        setPlayers([captain]);
      }
    } catch {
      setPlayers([captain]);
    }
    return () => {
      localStorage.removeItem(STORAGE_KEY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY]);

  // Save snapshot on change
  React.useEffect(() => {
    const snapshot = JSON.stringify({ teamName, players });
    localStorage.setItem(STORAGE_KEY, snapshot);
  }, [STORAGE_KEY, teamName, players]);

  const currentCount = players.length;

  // ---- LOOKUP (use onSuccess to capture data) ----
  type LookupResult = { username: string; name: string; division: number } | null;

  const lookupMutation = useMutation<LookupResult, unknown, string>({
    mutationKey: ["lookup_player_by_email", tournamentId],
    mutationFn: async (email: string) => {
      const data = await getUserByEmail(email.trim()); // response treated directly as user
      const user = data.data //because the user is inside data of the response
      if (!user) return null;

      const username = user.user_name ?? user.username ?? null;
      const name = user.name ?? user.full_name ?? "";
      const division: number =
        typeof user.division === "number"
          ? user.division
          : typeof user.division_score === "number"
            ? user.division_score
            : NaN;

      return username && Number.isFinite(division)
        ? { username, name, division }
        : null;
    },
  });


  const onLookup = async (email: string) => {
    try {
      return await lookupMutation.mutateAsync(email);
    } catch {
      return null;
    }
  };

  const addPlayer = async (p: NewPlayer & { division?: number }) => {
    if (currentCount >= maxSize) return;

    // Check if already exists
    const exists = players.some(
      (x) => x.username.toLowerCase() === p.username.toLowerCase()
    );
    if (exists) {
      alert("This player is already in the team.");
      return;
    }

    // Division comparison: 1 = highest, 3 = lowest
    // if player.division < tournamentDivision → too high, cannot join
    if (typeof p.division === "number" && p.division < tournamentDivision) {
      alert(
        `Player division (${p.division}) is higher than the tournament requirement (${tournamentDivision}). They cannot be added.`
      );
      return;
    }

    // if player.division > tournamentDivision → lower, but allowed with warning
    let note: string | undefined = undefined;
    if (typeof p.division === "number" && p.division > tournamentDivision) {
      note = `This player’s division (${p.division}) is lower than the tournament requirement (${tournamentDivision}). You can still add them.`;
    }

    setPlayers((prev) => [
      ...prev,
      {
        email: p.email,
        username: p.username,
        role: "member",
        status: "verified",
        note,
      },
    ]);
    setAdding(false);
  };



  const removePlayer = (username: string) => {
    setPlayers((prev) => prev.filter((p) => p.username !== username));
  };

  // Disable proceed if captain is not eligible
  const canProceed =
    !captainTooHigh &&
    players.length >= minSize &&
    players.length <= maxSize &&
    players.every((p) => p.status === "verified") &&
    teamName.trim().length > 0;

  const registerMutation = useMutation<{ ok: boolean }, unknown, void>({
    mutationKey: ["register_team", tournamentId],
    mutationFn: async () => {
      return { ok: true };
    },
    onSuccess: () => {
      alert("Registration confirmed. Redirecting to payment gateway...");
      setConfirmOpen(false);
      // router.push(`/payments/checkout?t=${tournamentId}`);
    },
  });

  // --------- Returns (after all hooks are declared) ---------
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#161719] w-full flex items-center justify-center">
        <div className="text-neutral-300">Loading…</div>
      </div>
    );
  }

  if (!isLoggedIn || !me) {
    return (
      <div className="min-h-screen bg-[#161719] w-full flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-black/70 bg-[#1b1c1e] rounded-2xl p-6 text-center">
          <h2 className="text-white text-xl font-semibold">Please log in</h2>
          <p className="text-sm text-gray-400 mt-2">
            Please login to GearForge to proceed with tournament registration.
          </p>
          <Link
            href="/auth?returnTo=/tournaments/register"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // --------- Main UI ---------
  const existingEmails = players.map((p) => p.email).filter(Boolean) as string[];
  const existingUsernames = players.map((p) => p.username).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#161719] w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold text-white">Register Team</h2>

        {/* Captain eligibility banner */}
        {captainTooHigh && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 text-red-300 px-4 py-3">
            Your division ({captainDivision}) is higher than the tournament requirement ({tournamentDivision}). You cannot register for this tournament.
          </div>
        )}

        {/* Team name */}
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
          <label className="block text-sm text-gray-400 mb-1">Team Name</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white focus:outline-none"
            placeholder="Enter your exact in-game team name"
            disabled={captainTooHigh}
          />
        </div>

        {/* Captain (prefilled) */}
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
          <h3 className="text-white font-medium mb-3">Captain</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                disabled
                value={me.email ?? ""}
                className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                disabled
                value={me.user_name ?? ""}
                className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Division</label>
              <input
                disabled
                value={String(captainDivision)}
                className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Captain details are automatically filled and cannot be edited.
          </p>
        </div>

        {/* Players List */}
        <PlayersList players={players} onRemove={removePlayer} max={maxSize} min={minSize} />

        {/* Add Player */}
        {currentCount < maxSize && !adding && (
          <button
            onClick={() => setAdding(true)}
            disabled={captainTooHigh}
            className={`px-3 py-2 rounded-lg ${captainTooHigh
              ? "bg-[#222327] text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            title={captainTooHigh ? "Captain ineligible for this tournament" : "Add a player"}
          >
            Add Player
          </button>
        )}

        {adding && (
          <PlayerForm
            onAdd={addPlayer}
            onCancel={() => setAdding(false)}
            onLookup={onLookup}
            existingEmails={existingEmails}
            existingUsernames={existingUsernames}
            tournamentDivision={tournamentDivision}
          />
        )}

        {/* Guidelines */}
        <Guidelines />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            disabled={!canProceed}
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-2 rounded-xl ${!canProceed
              ? "bg-[#222327] text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            title={
              captainTooHigh
                ? "Captain’s division is higher than the tournament’s requirement"
                : !teamName.trim()
                  ? "Enter your exact in-game team name"
                  : `You must have between ${minSize} and ${maxSize} verified players`
            }
          >
            Review & Register
          </button>
          <p className="text-xs text-gray-400 mt-2">
            You must have at least {minSize} verified players to proceed.
          </p>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        teamName={teamName}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => registerMutation.mutate()}
        disabled={!canProceed}
      />
    </div>
  );
}
