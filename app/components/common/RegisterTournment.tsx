"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/app/hooks";
import PlayerForm, { NewPlayer } from "./register/PlayerForm";
import PlayersList, { PlayerRow } from "./register/PlayersList";
import ConfirmModal from "./register/ConfirmModal";
import Guidelines from "./register/Guidlines";
import type { AxiosError } from "axios"; // type-only import for guards

// ---------- typed helpers (no `any`) ----------
function isAxiosError<T = unknown>(err: unknown): err is AxiosError<T> {
  return typeof err === "object" && err !== null && "isAxiosError" in err;
}

function extractStatus(err: unknown): number | null {
  if (isAxiosError(err)) {
    return err.response?.status ?? null;
  }
  if (typeof err === "object" && err !== null) {
    const e = err as { status?: number; cause?: { status?: number } };
    return e.status ?? e.cause?.status ?? null;
  }
  return null;
}
// ---------------------------------------------

export type Tournament = {
  tournament_id: string;
  name: string;
  game_category: string;
  start_date: Date;
  end_date: Date;
  cover?: string;
  max_team_size?: number;
  min_team_size?: number;
  total_slots?: number;
  registered_slots?: number;
  registered_id?: string[];
  winner_id?: string;
  runnerup_id?: string;
  tournament_division?: number;
  pool_price?: number;
  entry_fee?: number;
  created_at?: Date;
  updated_at?: Date;
  status: "upcoming" | "live" | "ended";
  tournament_date?: Date;
};

type Props = {
  tournamentId?: string;
  preset?: Partial<Tournament>;
};

type ValidateResponse = {
  ok: boolean;
  eligible: boolean;
  note?: string;
};

export default function RegisterTournament({ tournamentId, preset }: Props) {
  const me = useAppSelector((s) => s.users.user);

  const maxSize = preset?.max_team_size ?? 5;
  const minSize = preset?.min_team_size ?? 3;
  // const requiredDivision = preset?.tournament_division ?? 3; // keep if you’ll show it

  const [teamName, setTeamName] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const captain: PlayerRow = {
    email: me?.email ?? "",
    username: me?.user_name ?? "",
    role: "captain",
    status: "verified",
    note: "Captain",
  };

  const [players, setPlayers] = React.useState<PlayerRow[]>([captain]);
  const currentCount = players.length;

  // ---- VALIDATE PLAYER (Add) ----
  const validateMutation = useMutation<ValidateResponse, unknown, NewPlayer>({
    mutationKey: ["validate_player", tournamentId],
    mutationFn: async (p: NewPlayer): Promise<ValidateResponse> => {
      console.log(p)
      // ******* CONNECT ENDPOINT HERE *******
      // const res = await axios.post(`/api/tournaments/${tournamentId}/validate-player`, {
      //   email: p.email, username: p.username
      // });
      // return res.data as ValidateResponse;

      // Temp OK so UI works until backend is wired:
      return { ok: true, eligible: true };
    },
  });

  const addPlayer = async (p: NewPlayer) => {
    if (currentCount >= maxSize) return;

    // prevent duplicate usernames locally
    const exists = players.some(
      (x) => x.username.toLowerCase() === p.username.toLowerCase()
    );
    if (exists) {
      alert("This username is already on the team.");
      return;
    }

    try {
      const resp = await validateMutation.mutateAsync(p);
      if (resp.ok && resp.eligible) {
        setPlayers((prev) => [
          ...prev,
          {
            email: p.email,
            username: p.username,
            role: "member",
            status: "verified",
            note: resp.note,
          },
        ]);
      } else {
        setPlayers((prev) => [
          ...prev,
          {
            email: p.email,
            username: p.username,
            role: "member",
            status: "ineligible",
            note: resp.note ?? "Division ineligible for this tournament.",
          },
        ]);
      }
    } catch (e: unknown) {
      const status = extractStatus(e);

      if (status === 404) {
        alert(
          "This player was not found. Ask them to register on GearForge first, then try again."
        );
      }

      setPlayers((prev) => [
        ...prev,
        {
          email: p.email,
          username: p.username,
          role: "member",
          status: status === 404 ? "not_found" : "error",
          note:
            status === 404
              ? "Not registered on GearForge"
              : "Verification failed",
        },
      ]);
    } finally {
      setAdding(false);
    }
  };

  const removePlayer = (username: string) => {
    setPlayers((prev) => prev.filter((p) => p.username !== username));
  };

  const canProceed =
    players.length >= minSize &&
    players.length <= maxSize &&
    players.every((p) => p.status === "verified") &&
    teamName.trim().length > 0;

  // ---- FINAL REGISTRATION ----
  const registerMutation = useMutation<{ ok: boolean }, unknown, void>({
    mutationKey: ["register_team", tournamentId],
    mutationFn: async () => {
      // ******* CONNECT ENDPOINT HERE *******
      // const res = await axios.post(`/api/tournaments/${tournamentId}/register-team`, {
      //   team_name: teamName.trim(),
      //   members: players.map(p => ({ email: p.email, username: p.username, role: p.role })),
      // });
      // return res.data as { ok: boolean };

      return { ok: true };
    },
    onSuccess: () => {
      alert("Registration confirmed. Redirecting to payment gateway...");
      setConfirmOpen(false);
      // router.push(`/payments/checkout?t=${tournamentId}`);
    },
  });

  return (
    <div className="min-h-screen bg-[#161719] w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold text-white">Register Team</h2>

        {/* Team name */}
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
          <label className="block text-sm text-gray-400 mb-1">Team Name</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white focus:outline-none"
            placeholder="Enter your exact in-game team name"
          />
        </div>

        {/* Captain (prefilled) */}
        <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
          <h3 className="text-white font-medium mb-3">Captain</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                disabled
                value={me?.email ?? ""}
                className="w-full bg-[#141518] border border-black/60 rounded-xl px-3 py-2 text-white opacity-80"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                disabled
                value={me?.user_name ?? ""}
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
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg"
          >
            Add Player
          </button>
        )}

        {adding && <PlayerForm onAdd={addPlayer} onCancel={() => setAdding(false)} />}

        {/* Guidelines */}
        <Guidelines />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            disabled={!canProceed}
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-2 rounded-xl ${
              !canProceed
                ? "bg-[#222327] text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
            title={
              !teamName.trim()
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
