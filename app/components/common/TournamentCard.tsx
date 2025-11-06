'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tournament } from '@/app/models/tournament_model'
import { useMutation } from '@tanstack/react-query'

// Accept API shapes too (string money, nullables, ISO strings)
type CardTournament = Tournament & {
  start_date: string | Date
  end_date: string | Date
  cover?: string | null
  entry_fee?: number | string | null
  pool_price?: number | string | null
  total_slots?: number | null
  registered_slots?: number | null
}

function toIST(d: string | Date | undefined) {
  if (!d) return ''
  const dt = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(dt.getTime())) return ''
  return (
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dt) + ' IST'
  )
}

const toNumber = (v: number | string | null | undefined): number => {
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const formatINR = (n: number | string | null | undefined) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(n))

export default function TournamentCard({
  t,
  live,
  showRegister,
  isAdmin = false,                // NEW
}: {
  t: CardTournament;
  live: boolean;
  showRegister?: boolean;
  isAdmin?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  // --- derived ---
  const comingSoon = !!t.coming_soon;
  const regClosed = t.registration_status === 'close';
  const totalSlots = toNumber(t.total_slots);
  const registered = toNumber(t.registered_slots);
  const progress = totalSlots > 0 ? Math.round((registered / totalSlots) * 100) : 0;
  const isFull = totalSlots > 0 && registered >= totalSlots;
  const coverOk = !!t.cover && (t.cover as string).trim().toLowerCase() !== 'none' && !imgError;

  // --- admin mutation placeholder ---
  const mutateMeta = useMutation({
    mutationKey: ['patch_tournament_meta', t.tournament_id],
    // TODO: wire your API call here:
    // mutationFn: (body: { coming_soon?: boolean; registration_status?: 'open' | 'close' }) =>
    //   patchTournamentMeta(t.tournament_id, body),
    mutationFn: async (_body: { coming_soon?: boolean; registration_status?: 'open' | 'close' }) => {
      // PLACEHOLDER: remove when API exists
      return Promise.resolve(true);
    },
  });

  function toggleComingSoon(next: boolean) {
    // keep rule: if registrations are open, coming_soon must be false
    const body = {
      coming_soon: t.registration_status === 'open' ? false : next,
    } as const;
    mutateMeta.mutate(body);
    t.coming_soon = body.coming_soon;
  }

  function toggleRegistration() {
    const next = t.registration_status === 'open' ? 'close' : 'open' as const;
    // rule: opening registration forces coming_soon=false
    const body = {
      registration_status: next,
      coming_soon: next === 'open' ? false : t.coming_soon ?? false,
    } as const;
    mutateMeta.mutate(body);
    t.registration_status = body.registration_status;
    t.coming_soon = body.coming_soon;
  }

  return (
    <article
      className="relative flex-shrink-0 bg-neutral-900/60 border border-neutral-800 rounded-lg overflow-hidden shadow-sm"
      style={{ minWidth: '220px', width: 'min(48vw,320px)' }}
      aria-labelledby={`t-${t.tournament_id}-title`}
    >
      {/* cover */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {coverOk ? (
          <Image
            src={t.cover as string}
            alt={t.name}
            fill
            sizes="(max-width:480px) 80vw, (max-width:1024px) 45vw, 320px"
            style={{ objectFit: 'cover' }}
            onError={() => setImgError(true)}
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
            Image not available
          </div>
        )}

        {live && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
            LIVE
          </span>
        )}
        {!live && comingSoon && (
          <span className="absolute top-3 left-3 bg-amber-500 text-black text-xs font-semibold px-2 py-1 rounded shadow">
            COMING SOON
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 id={`t-${t.tournament_id}-title`} className="text-sm font-semibold text-white truncate">
            {t.name}
          </h3>
          {/* Show date only if not coming soon */}
          {!comingSoon && (
            <div className="text-xs text-neutral-400">{toIST(t.start_date)}</div>
          )}
        </div>

        {live ? (
          <div className="mt-3 flex items-center justify-end">
            <Link
              href={`/tournaments/${encodeURIComponent(t.tournament_id)}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-500"
            >
              View
            </Link>
          </div>
        ) : (
          <>
            {/* progress etc. still visible when not live */}
            <div className="mt-2 flex items-center gap-3 text-sm text-neutral-400">
              <span className="text-xs">
                {registered}/{totalSlots} registered
              </span>
              <div className="flex-1 bg-neutral-800 rounded h-2 overflow-hidden">
                <div className="bg-white h-full" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-neutral-300">
              <span>Entry: {formatINR(t.entry_fee)}</span>
              <span>Prize: {formatINR(t.pool_price)}</span>
            </div>

            {/* Register / Coming soon / Closed */}
            <div className="mt-3 flex items-center justify-end">
              {showRegister && !comingSoon && (
                !isFull ? (
                  <Link
                    href={`/tournaments/register?tournament_id=${encodeURIComponent(t.tournament_id)}`}
                    className={[
                      "inline-flex items-center gap-2 px-3 py-2 font-medium rounded",
                      regClosed ? "bg-neutral-700 text-neutral-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500",
                    ].join(' ')}
                    aria-disabled={regClosed}
                    tabIndex={regClosed ? -1 : 0}
                    onClick={(e) => { if (regClosed) e.preventDefault(); }}
                  >
                    {regClosed ? 'Closed' : 'Register'}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-disabled
                    title="Tournament is full"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-700 text-neutral-300 font-medium rounded cursor-not-allowed opacity-60"
                  >
                    Full
                  </button>
                )
              )}
              {showRegister && comingSoon && (
                <span className="text-xs px-2 py-1 rounded bg-amber-500 text-black font-semibold">
                  Coming soon
                </span>
              )}
            </div>
          </>
        )}

        {/* Admin toggles */}
        {isAdmin && !live && (
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-300">Coming soon</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!t.coming_soon}
                onChange={(e) => toggleComingSoon(e.target.checked)}
                disabled={t.registration_status === 'open'}
                title={t.registration_status === 'open' ? 'Disable registrations to enable coming soon' : ''}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-300">Registrations</span>
              <button
                type="button"
                onClick={toggleRegistration}
                className={`relative inline-flex h-5 w-10 items-center rounded-full
                  ${t.registration_status === 'open' ? 'bg-emerald-600' : 'bg-neutral-600'}`}
                aria-pressed={t.registration_status === 'open'}
                title={t.registration_status === 'open' ? 'Open' : 'Closed'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${t.registration_status === 'open' ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
