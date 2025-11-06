'use client'
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { Tournament } from "@/app/models/tournament_model"
import { useMutation } from "@tanstack/react-query"
import { createTournament } from "../../api"
import { AxiosError } from "axios"

export default function CreateTournamentPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [cover, setCover] = useState("") // URL
  const [gameCategory, setGameCategory] = useState<string>("CAT_BR") // dropdown
  const [minTeamSize, setMinTeamSize] = useState<number>(1)
  const [maxTeamSize, setMaxTeamSize] = useState<number>(1)
  const [totalSlots, setTotalSlots] = useState<number>(8)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [tournamentDivision, setTournamentDivision] = useState<number>(1)
  const [poolPrice, setPoolPrice] = useState<number>(0)
  const [entryFee, setEntryFee] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [comingSoon, setComingSoon] = useState<boolean>(false);
  const [registrationStatus, setRegistrationStatus] = useState<'open' | 'close'>('open');

  // if registrations open, force coming_soon false
  function setRegStatus(next: 'open' | 'close') {
    setRegistrationStatus(next);
    if (next === 'open') setComingSoon(false);
  }

  function validate(): boolean {
    if (!name.trim()) {
      setError("Game name is required.")
      return false
    }
    if (!startDate || !endDate) {
      setError("Start and end date/time are required.")
      return false
    }
    const s = new Date(startDate).getTime()
    const e = new Date(endDate).getTime()
    if (Number.isNaN(s) || Number.isNaN(e) || s >= e) {
      setError("Start date must be before end date.")
      return false
    }
    if (minTeamSize < 1) {
      setError("Min team size must be at least 1.")
      return false
    }
    if (maxTeamSize < 1) {
      setError("Max team size must be at least 1.")
      return false
    }
    if (minTeamSize > maxTeamSize) {
      setError("Min team size cannot be greater than max team size.")
      return false
    }
    if (totalSlots <= 0) {
      setError("Total slots must be at least 1.")
      return false
    }
    setError(null)
    return true
  }

  const create_tournament = useMutation({
    mutationKey: ['create_tournament'],
    mutationFn: (payload: Tournament) => createTournament(payload),
    onSuccess: () => {
      console.log('Tournament Created Sucessfully')
    },
    onError: (error: AxiosError) => {
      console.log(error)
    }
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const id = uuidv4()

    // Keep the same payload style you already use; just include min/max team sizes.
    const payload: Tournament = {
      tournament_id: id,
      name: name.trim(),
      game_category: gameCategory,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      tournament_date: new Date(startDate),
      cover: cover.trim() || undefined,
      max_team_size: Number(maxTeamSize),
      min_team_size: Number(minTeamSize),
      total_slots: Number(totalSlots),
      registered_slots: 0,
      registered_id: undefined,
      winner_id: undefined,
      runnerup_id: undefined,
      tournament_division: Number(tournamentDivision),
      pool_price: Number(poolPrice),
      entry_fee: Number(entryFee),
      created_at: new Date(),
      updated_at: new Date(),
      status: "upcoming",
      registration_status: registrationStatus,
      coming_soon: registrationStatus === 'open' ? false : comingSoon,
    }

    // API CHANGES TO BE MADE HERE-> BACKEND CODE WILL BE JOINED HERE
    try {
      create_tournament.mutate(payload);
      const key = "tournaments_local_additions";
      const existingRaw = sessionStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      (Array.isArray(existing) ? existing : []).push(payload);
      sessionStorage.setItem(key, JSON.stringify(existing));
      router.push("/tournaments");
    } catch (err) {
      const message = typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message ?? "Unknown error")
        : "Unknown error";
      setError(`Failed to save tournament: ${message}`);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-white">Create Tournament</h1>

        {error && <div className="text-sm text-rose-400">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-300">Game name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              placeholder="Enter game / tournament name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Cover (URL)</label>
            <input
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Game category</label>
            <select
              value={gameCategory}
              onChange={(e) => setGameCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
            >
              <option value="CAT_BR">CAT_BR</option>
              <option value="CAT_FPS">CAT_FPS</option>
              <option value="CAT_SPORTS">CAT_SPORTS</option>
            </select>
          </div>

          {/* NEW: Min team size */}
          <div>
            <label className="text-sm text-neutral-300">Min team size</label>
            <input
              type="number"
              value={minTeamSize}
              onChange={(e) =>
                setMinTeamSize(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={1}
            />
          </div>

          {/* NEW: Max team size */}
          <div>
            <label className="text-sm text-neutral-300">Max team size</label>
            <input
              type="number"
              value={maxTeamSize}
              onChange={(e) =>
                setMaxTeamSize(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={1}
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Total slots</label>
            <input
              type="number"
              value={totalSlots}
              onChange={(e) =>
                setTotalSlots(Math.max(1, Number(e.target.value || 1)))
              }
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={1}
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Start date & time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">End date & time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Tournament division</label>
            <input
              type="number"
              value={tournamentDivision}
              onChange={(e) => setTournamentDivision(Number(e.target.value || 1))}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={0}
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Pool price (INR)</label>
            <input
              type="number"
              value={poolPrice}
              onChange={(e) => setPoolPrice(Number(e.target.value || 0))}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={0}
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Entry fee (INR)</label>
            <input
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(Number(e.target.value || 0))}
              className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 text-white"
              min={0}
            />
          </div>
        </div>

        {/* --- NEW: Coming soon + Registration switch --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded bg-neutral-800 px-3 py-2">
            <label className="text-sm text-neutral-200">Coming soon</label>
            <input
              type="checkbox"
              checked={comingSoon}
              onChange={(e) => setComingSoon(e.target.checked)}
              disabled={registrationStatus === 'open'} // opens => must be false
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between rounded bg-neutral-800 px-3 py-2">
            <label className="text-sm text-neutral-200">Registrations</label>
            {/* simple switch: checkbox styled by CSS; value = open/close */}
            <button
              type="button"
              onClick={() => setRegStatus(registrationStatus === 'open' ? 'close' : 'open')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full
        ${registrationStatus === 'open' ? 'bg-emerald-600' : 'bg-neutral-600'}`}
              aria-pressed={registrationStatus === 'open'}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition
        ${registrationStatus === 'open' ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className="ml-2 text-sm text-neutral-300">
              {registrationStatus === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={saving}
            className={
              "px-4 py-2 rounded font-medium " +
              (saving
                ? "bg-neutral-700 text-neutral-300 cursor-not-allowed"
                : "bg-amber-600 text-black")
            }
          >
            {saving ? "Saving…" : "Create Tournament"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/tournaments")}
            className="text-sm text-neutral-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
