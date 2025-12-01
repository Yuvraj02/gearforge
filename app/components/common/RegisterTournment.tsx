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
import { useSearchParams } from "next/navigation";

// ---------- Minimal Razorpay typings ----------
type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string>;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

type RazorpayInstance = {
  open: () => void;
  on?: (event: string, cb: (e: unknown) => void) => void;
};
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  tournamentId?: string;
  preset?: Partial<Tournament>;
};

// Local helper type so we can carry user_id without editing external types
type PlayerRowWithId = PlayerRow & { user_id?: string };

export default function RegisterTournament({ tournamentId: propTid, preset }: Props) {
  // --------- Auth & tournament context ---------
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournament_id") ?? propTid ?? null;

  const me = useAppSelector((s) => s.users.user);
  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const hasHydrated = useAppSelector((s) => s.users.hasHydrated);

  const tournamentDivision = preset?.tournament_division ?? 3;
  const maxSize = preset?.max_team_size ?? 5;
  const minSize = preset?.min_team_size ?? 3;

  const captainDivision =
    typeof me?.division === "number"
      ? me.division
      : typeof me?.division_score === "number"
      ? me.division_score!
      : 3;

  const captainTooHigh = captainDivision < tournamentDivision;

  // --------- Local state ---------
  const [teamName, setTeamName] = React.useState<string>("");
  const [adding, setAdding] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);

  const captain: PlayerRowWithId = {
    email: me?.email ?? "",
    username: me?.user_name ?? "",
    role: "captain",
    status: "verified",
    note: undefined,
    user_id: me?.user_id, // ensure captain has id if available
  };

  // bump key once to avoid stale saved players without user_id
  const STORAGE_KEY = React.useMemo(
    () => `gf_reg_team_v2_${tournamentId ?? "default"}`,
    [tournamentId]
  );

  const [players, setPlayers] = React.useState<PlayerRowWithId[]>([captain]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { teamName?: string; players?: PlayerRowWithId[] };
        setPlayers(saved?.players?.length ? saved.players : [captain]);
        if (typeof saved?.teamName === "string") setTeamName(saved.teamName);
      } else {
        setPlayers([captain]);
      }
    } catch {
      setPlayers([captain]);
    }
    return () => localStorage.removeItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamName, players }));
  }, [STORAGE_KEY, teamName, players]);

  const currentCount = players.length;

  // ---- LOOKUP ----
  type LookupResult =
    | { username: string; name: string; division: number; user_id: string }
    | null;

  const lookupMutation = useMutation<LookupResult, unknown, string>({
    mutationKey: ["lookup_player_by_email", tournamentId],
    mutationFn: async (email: string) => {
      const data = await getUserByEmail(email.trim());
      const user = data.data as {
        user_id?: string;
        user_name?: string;
        username?: string;
        name?: string;
        full_name?: string;
        division?: number;
        division_score?: number;
      } | undefined;

      if (!user?.user_id) return null;

      const username = user.user_name ?? user.username ?? null;
      const name = user.name ?? user.full_name ?? "";
      const division =
        typeof user.division === "number"
          ? user.division
          : typeof user.division_score === "number"
          ? user.division_score
          : NaN;

      return username && Number.isFinite(division)
        ? { username, name, division: Number(division), user_id: user.user_id }
        : null;
    },
  });

  const onLookup = async (email: string): Promise<LookupResult> => {
    try {
      return await lookupMutation.mutateAsync(email);
    } catch {
      return null;
    }
  };

  const addPlayer = async (p: NewPlayer & { division?: number; user_id?: string }) => {
    if (currentCount >= maxSize) return;

    const exists = players.some((x) => x.username.toLowerCase() === p.username.toLowerCase());
    if (exists) {
      alert("This player is already in the team.");
      return;
    }

    if (typeof p.division === "number" && p.division < tournamentDivision) {
      alert(
        `Player division (${p.division}) is higher than the tournament requirement (${tournamentDivision}). They cannot be added.`
      );
      return;
    }

    let note: string | undefined;
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
        user_id: p.user_id, // keep user_id for backend payload
      },
    ]);
    setAdding(false);
  };

  const removePlayer = (username: string) => {
    setPlayers((prev) => prev.filter((p) => p.username !== username));
  };

  const canProceed =
    !captainTooHigh &&
    players.length >= minSize &&
    players.length <= maxSize &&
    players.every((p) => p.status === "verified") &&
    teamName.trim().length > 0;

  // ---- Razorpay SDK loader ----
  async function loadRazorpay(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (document.getElementById("razorpay-sdk")) return true;
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // ---- Register + Payment flow (NO DB write until success) ----
  type CreateOrderResponse = {
    order: { id: string; amount: number; currency: string };
    key: string;
  };

  const registerMutation = useMutation<void, unknown, void>({
    mutationKey: ["register_team", tournamentId],
    mutationFn: async () => {
      // Step 1: create order (no DB write)
      const res = await fetch("/api/backend/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, amount: 100 }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { order, key } = (await res.json()) as CreateOrderResponse;

      if (!order?.id) {
        console.error("Missing order_id in create-order response", { order });
        throw new Error("order_id missing");
      }

      // Step 2: load Razorpay + open checkout
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Razorpay SDK failed to load");

      const options: RazorpayOptions = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "GearForge",
        description: `Tournament registration: ${teamName}`,
        order_id: order.id,
        prefill: {
          name: me?.user_name ?? "",
          email: me?.email ?? "",
        },
        notes: {
          tournamentId: tournamentId ?? "",
          teamName,
        },

        // Step 3: on success -> verify + SAVE team
        handler: async (response: RazorpaySuccessResponse) => {
          // Build exactly what backend expects:
          //  - players: string[] of UUIDs
          //  - team_captain: uuid
          //  - team_captain_email: string
          const player_ids = Array.from(
            new Set(players.map((p) => p.user_id).filter((id): id is string => Boolean(id)))
          );

          const captainRow = players.find((p) => p.role === "captain");
          const team_captain = captainRow?.user_id ?? me?.user_id ?? null;
          const team_captain_email = captainRow?.email ?? me?.email ?? null;

          const verify = await fetch("/api/backend/register_team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tournamentId,
              teamName,
              players: player_ids, // <-- backend expects "players"
              team_captain,
              team_captain_email,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verify.ok) {
            const msg = await verify.text();
            alert(`Payment verified but registration failed:\n${msg}`);
            return;
          }

          localStorage.removeItem(STORAGE_KEY);
          setConfirmOpen(false);
          window.location.href = `/tournaments/${tournamentId}/success`;
        },
        modal: {
          ondismiss: () => {
            // user closed → do nothing (no DB write)
          },
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      // helpful diagnostics
      rzp.on?.("payment.failed", (e) => {
        // surface why it failed in test mode
        console.error("payment.failed", e);
        alert("Payment failed");
      });
      rzp.open();
    },
  });

  // --------- Returns ---------
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

  const existingEmails = players.map((p) => p.email).filter(Boolean) as string[];
  const existingUsernames = players.map((p) => p.username).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#161719] w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold text-white">Register Team</h2>

        {captainTooHigh && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 text-red-300 px-4 py-3">
            Your division ({captainDivision}) is higher than the tournament requirement ({tournamentDivision}). You cannot register for this tournament.
          </div>
        )}

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

        {/* Captain */}
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
          <p className="text-xs text-gray-400 mt-2">Captain details are automatically filled and cannot be edited.</p>
        </div>

        {/* Players List */}
        <PlayersList players={players} onRemove={removePlayer} max={maxSize} min={minSize} />

        {/* Add Player */}
        {currentCount < maxSize && !adding && (
          <button
            onClick={() => setAdding(true)}
            disabled={captainTooHigh}
            className={`px-3 py-2 rounded-lg ${
              captainTooHigh ? "bg-[#222327] text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
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

        <Guidelines />

        {/* Submit */}
        <div className="pt-2">
          <button
            disabled={!canProceed || registerMutation.isPending}
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-2 rounded-xl ${
              !canProceed ? "bg-[#222327] text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
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
          <p className="text-xs text-gray-400 mt-2">You must have at least {minSize} verified players to proceed.</p>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        teamName={teamName}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => registerMutation.mutate()}
        disabled={!canProceed || registerMutation.isPending}
      />
    </div>
  );
}
