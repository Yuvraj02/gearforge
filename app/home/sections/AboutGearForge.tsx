// ...existing code...
'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function AboutGearForge(): React.ReactElement {
  const [tournamentsCount, setTournamentsCount] = useState(0)
  const [playersCount, setPlayersCount] = useState(0)
  const [prizeCount, setPrizeCount] = useState(0)

  useEffect(() => {
    // simple count animation
    const animate = (target: number, setter: (n: number) => void, duration = 900) => {
      let start = 0
      const step = Math.max(1, Math.floor(target / (duration / 16)))
      const id = setInterval(() => {
        start += step
        if (start >= target) {
          setter(target)
          clearInterval(id)
        } else {
          setter(start)
        }
      }, 16)
    }

    animate(120, setTournamentsCount)
    animate(8200, setPlayersCount)
    animate(2000000, setPrizeCount)
  }, [])

  const formatINR = (n: number) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M+` : `₹${n.toLocaleString()}`

  return (
    <section
      className="w-full min-h-[60vh] flex items-center bg-gradient-to-b from-neutral-900/40 via-transparent to-neutral-900/10 rounded-xl p-6 md:p-10 my-6 overflow-hidden"
      aria-labelledby="about-gearforge"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 gap-8 items-stretch">
        {/* GearForge about content (full width) */}
        <div className="flex flex-col justify-center gap-6">
          <h2 id="about-gearforge" className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            GearForge — Where competitive legends are made
          </h2>

          <p className="text-neutral-300 text-base md:text-lg max-w-3xl">
            We run fast, fair and unforgettable esports tournaments — from community cups to
            pro-level championships. Join teams, watch live brackets, earn prizes and grow your
            competitive legacy on a platform built for players and organizers.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Primary: white button */}
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black font-medium hover:opacity-95 transition"
              aria-label="View all tournaments"
            >
              View Tournaments
            </Link>

            {/* Secondary: subtle white outline */}
            <Link
              href="/tournaments/create_tournament"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/6 transition"
              aria-label="Host a tournament"
            >
              Host a Tournament
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            <li className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Fast brackets</div>
                <div className="text-xs text-neutral-400">Automated brackets & results</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 2l2.9 6.26L21 9.27l-5 3.73L17.8 21 12 17.77 6.2 21 8 13l-5-3.73 6.1-1.01L12 2z" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Fair play</div>
                <div className="text-xs text-neutral-400">Anti-cheat & transparent rules</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Live experience</div>
                <div className="text-xs text-neutral-400">Live scoreboards & viewer features</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 7h18M7 21h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Organizer tools</div>
                <div className="text-xs text-neutral-400">Payouts, scheduling, and reporting</div>
              </div>
            </li>
          </ul>

          <div className="flex gap-4 flex-wrap items-center mt-6">
            <div className="bg-neutral-800/40 rounded-lg p-4 text-center min-w-[96px]">
              <div className="text-2xl font-bold text-white">{tournamentsCount}+</div>
              <div className="text-xs text-neutral-400">Tournaments</div>
            </div>

            <div className="bg-neutral-800/40 rounded-lg p-4 text-center min-w-[96px]">
              <div className="text-2xl font-bold text-white">{playersCount.toLocaleString()}</div>
              <div className="text-xs text-neutral-400">Players</div>
            </div>

            <div className="bg-neutral-800/40 rounded-lg p-4 text-center min-w-[96px]">
              <div className="text-2xl font-bold text-white">{formatINR(prizeCount)}</div>
              <div className="text-xs text-neutral-400">Prize Pool</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
// ...existing code...