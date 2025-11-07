'use client'

import React from 'react'
import Link from 'next/link'

export default function EsportsDescription(): React.ReactElement {
  return (
    <section
      id="esports-description"
      className="w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8"
      aria-labelledby="esports-heading"
    >
      <div className="bg-gradient-to-b from-neutral-900/30 to-transparent rounded-2xl p-6 md:p-10 flex flex-col gap-8">
        {/* Full-width banner / Text */}
        <div className="w-full">
          <h2 id="esports-heading" className="text-2xl md:text-3xl font-extrabold text-white">
            What is e‑sports — and why it matters
          </h2>

          <p className="mt-4 text-neutral-300 leading-relaxed max-w-4xl">
            E‑sports is competitive gaming organized at every level — from friendly local cups to
            global championships. It combines teamwork, strategy and lightning‑fast skill with the
            excitement of live events, organized ladders and real prize pools. Whether you play for
            fun, for a team, or to go pro, e‑sports gives players a clear path to compete, improve
            and get recognized.
          </p>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">1</span>
              <div>
                <div className="font-semibold text-white">Organized Competition</div>
                <div className="text-neutral-400">Structured brackets, fair rules and instant results.</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">2</span>
              <div>
                <div className="font-semibold text-white">Player Growth</div>
                <div className="text-neutral-400">Rank up, join teams and find your competitive level.</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">3</span>
              <div>
                <div className="font-semibold text-white">Spectator Experience</div>
                <div className="text-neutral-400">Live brackets, streams and community features for fans.</div>
              </div>
            </li>

            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">4</span>
              <div>
                <div className="font-semibold text-white">Real Rewards</div>
                <div className="text-neutral-400">Cash prizes, sponsorships and visibility for top teams.</div>
              </div>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md font-medium hover:opacity-95 transition"
            >
              Explore Tournaments
            </Link>

            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-md hover:bg-white/6 transition"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}