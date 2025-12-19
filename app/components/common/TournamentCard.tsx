'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tournament } from '@/app/models/tournament_model'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTournamentStatus } from '@/app/api'

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
  isAdmin = false,
}: {
  t: CardTournament
  live: boolean
  showRegister?: boolean
  isAdmin?: boolean
}) {
  const [imgError, setImgError] = useState(false)

  const comingSoon = !!t.coming_soon
  const regClosed = t.registration_status === 'close'
  const totalSlots = toNumber(t.total_slots)
  const registered = toNumber(t.registered_slots)
  const progress = totalSlots > 0 ? Math.round((registered / totalSlots) * 100) : 0
  const isFull = totalSlots > 0 && registered >= totalSlots
  const showAdminControls = !!isAdmin && t.status === 'upcoming'

  // ---------- IMAGE NORMALIZATION + DEBUG ----------
  const rawCover = (t.cover ?? '').trim()

  let src = ''
  if (rawCover && rawCover.toLowerCase() !== 'none') {
    if (rawCover.includes('/uploads/')) {
      // Handle things like "http://localhost:8080/uploads/bgmit2.jpeg"
      const idx = rawCover.indexOf('/uploads/')
      src = rawCover.slice(idx) // -> "/uploads/bgmit2.jpeg"
    } else if (rawCover.startsWith('http')) {
      // Other full URLs (e.g. IGDB), if you ever have them
      src = rawCover
    } else if (rawCover.startsWith('/')) {
      // Already a root-relative path
      src = rawCover
    } else {
      // Just a filename -> assume it's under /uploads
      src = `/uploads/${rawCover.replace(/^\/+/, '')}`
    }
  }

  const coverOk = !!src && !imgError

  console.log('[TournamentCard] render', {
    id: t.tournament_id,
    name: t.name,
    rawCover,
    normalizedSrc: src,
    coverOk,
    imgError,
  })
  // -------------------------------------------------

  type PatchBody = {
    registration_status?: 'open' | 'close'
    coming_soon?: boolean
  }
  const qc = useQueryClient()
  const mutateMeta = useMutation({
    mutationKey: ['patch_tournament_meta', t.tournament_id],
    mutationFn: (body: PatchBody) =>
      updateTournamentStatus(body.registration_status, body.coming_soon, t.tournament_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
    },
    onError: (err) => {
      console.error('Failed to update tournament meta:', err)
      alert('Update failed. Please try again.')
    },
  })

  function toggleComingSoon(next: boolean) {
    mutateMeta.mutate({
      coming_soon: t.registration_status === 'open' ? false : next,
    })
  }

  function toggleRegistration() {
    const next = (t.registration_status === 'open' ? 'close' : 'open') as 'open' | 'close'
    mutateMeta.mutate({
      registration_status: next,
      coming_soon: next === 'open' ? false : t.coming_soon ?? false,
    })
  }

  const stopAll = (e: React.SyntheticEvent) => {
    e.stopPropagation()
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
            src={src}
            alt={t.name}
            fill
            sizes="(max-width:480px) 80vw, (max-width:1024px) 45vw, 320px"
            style={{ objectFit: 'cover' }}
            unoptimized // ⬅ IMPORTANT: bypass Next image optimizer
            onLoad={() => {
              console.log('[TournamentCard] image onLoad', {
                id: t.tournament_id,
                src,
              })
            }}
            onError={() => {
              console.error('[TournamentCard] image onError', {
                id: t.tournament_id,
                src,
              })
              setImgError(true)
            }}
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
          {!comingSoon && <div className="text-xs text-neutral-400">{toIST(t.start_date)}</div>}
        </div>

        {live ? (
          <div className="mt-3 flex items-center justify-end">
            <Link
              href={`/tournaments/${encodeURIComponent(t.tournament_id)}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-500"
              data-interactive="true"
              onClick={stopAll}
              onMouseDown={stopAll}
              onKeyDown={stopAll}
            >
              View
            </Link>
          </div>
        ) : (
          <>
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

            <div className="mt-3 flex items-center justify-end">
              {showRegister && !comingSoon && (
                !isFull ? (
                  <Link
                    href={`/tournaments/register?tournament_id=${encodeURIComponent(t.tournament_id)}`}
                    className={[
                      'inline-flex items-center gap-2 px-3 py-2 font-medium rounded',
                      regClosed
                        ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500',
                    ].join(' ')}
                    aria-disabled={regClosed}
                    tabIndex={regClosed ? -1 : 0}
                    data-interactive="true"
                    onClick={(e) => {
                      if (regClosed) e.preventDefault()
                      stopAll(e)
                    }}
                    onMouseDown={stopAll}
                    onKeyDown={stopAll}
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
                    data-interactive="true"
                    onClick={stopAll}
                    onMouseDown={stopAll}
                    onKeyDown={stopAll}
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

        {showAdminControls && (
          <div
            className="mt-3 flex items-center justify-between gap-2 text-xs"
            data-interactive="true"
            onClick={stopAll}
            onMouseDown={stopAll}
            onKeyDown={stopAll}
          >
            <label
              className="flex items-center gap-2"
              data-interactive="true"
              onClick={stopAll}
              onMouseDown={stopAll}
              onKeyDown={stopAll}
            >
              <span className="text-neutral-300">Coming soon</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!t.coming_soon}
                onChange={(e) => toggleComingSoon(e.target.checked)}
                data-interactive="true"
                onClick={stopAll}
                onMouseDown={stopAll}
                onKeyDown={stopAll}
              />
            </label>

            <div
              className="flex items-center gap-2"
              data-interactive="true"
              onClick={stopAll}
              onMouseDown={stopAll}
              onKeyDown={stopAll}
            >
              <span className="text-neutral-300">Registrations</span>
              <button
                type="button"
                onClick={toggleRegistration}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${t.registration_status === 'open' ? 'bg-emerald-600' : 'bg-neutral-600'
                  }`}
                data-interactive="true"
                onMouseDown={stopAll}
                onKeyDown={stopAll}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${t.registration_status === 'open' ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
