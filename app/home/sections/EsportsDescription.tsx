'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function EsportsDescription(): React.ReactElement {
  return (
    <section
      id="esports-description"
      className="w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8"
      aria-labelledby="esports-heading"
    >
      <div className="bg-gradient-to-b from-neutral-900/30 to-transparent rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        {/* Left: GIF / media */}
        <div className="w-full md:w-5/12 lg:w-4/12 flex justify-center">
          <div className="relative w-64 h-64 md:w-60 md:h-60 lg:w-72 lg:h-72 rounded-xl overflow-hidden bg-black/20">
            <Image
              src="/esports.gif"
              alt="Esports highlight"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-7/12 lg:w-8/12 md:pl-4">
          <h2
            id="esports-heading"
            className="text-2xl md:text-3xl font-extrabold text-white"
          >
            What is e-sports and why it matters
          </h2>

          {/* justify on small, left on md+ */}
          <p className="mt-4 text-neutral-300 leading-relaxed max-w-3xl text-justify md:text-left">
            E-sports is competitive gaming organized at every level, from local cups to global
            championships. It blends teamwork, strategy and fast execution with live events,
            ladders and real rewards. It gives players a clear path to compete, improve and get
            noticed.
          </p>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">
                1
              </span>
              <div className="text-justify md:text-left">
                <div className="font-semibold text-white">Organized competition</div>
                <div className="text-neutral-400">
                  Structured brackets, fair rules, instant results.
                </div>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">
                2
              </span>
              <div className="text-justify md:text-left">
                <div className="font-semibold text-white">Player growth</div>
                <div className="text-neutral-400">Rank up, join teams, find your level.</div>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">
                3
              </span>
              <div className="text-justify md:text-left">
                <div className="font-semibold text-white">Spectator experience</div>
                <div className="text-neutral-400">Streams, live brackets and community.</div>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none w-9 h-9 rounded-lg bg-white/10 text-white grid place-items-center">
                4
              </span>
              <div className="text-justify md:text-left">
                <div className="font-semibold text-white">Real rewards</div>
                <div className="text-neutral-400">Prize pools, sponsors, visibility.</div>
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
              href="https://discord.gg/J8cS4Tds"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-md transition-colors duration-200 hover:bg-[#5865F2] hover:text-white"
            >
              Join Discord community
            </Link>

            <Link
              href="https://www.reddit.com/r/gearforge/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-md transition-colors duration-200 hover:bg-[#FF4500] hover:text-white"
            >
              Join Reddit community
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
