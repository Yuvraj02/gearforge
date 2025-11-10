'use client'

import React from 'react'

type FormatTab = 'br' | 'fps'

const BR_TEAMS: string[] = [
  'Alpha Wolves',
  'Crimson Squad',
  'Night Raiders',
  'Phantom Unit',
  'Skyline Esports',
  'Iron Vanguard',
  'Stormbreakers',
  'Shadow Company',
  'Blaze Hunters',
  'Aurora 5'
]

export default function TournamentFormat(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState<FormatTab>('br')

  return (
    <section
      id="tournament-format"
      className="w-full max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8"
      aria-labelledby="tournament-format-heading"
    >
      <div className="bg-gradient-to-b from-neutral-900/30 to-transparent rounded-2xl p-6 md:p-10 flex flex-col gap-8">
        {/* Header + tabs */}
        <div className="flex flex-col gap-4">
          <h2
            id="tournament-format-heading"
            className="text-2xl md:text-3xl font-extrabold text-white"
          >
            Tournament Formats
          </h2>
          <p className="text-neutral-300 max-w-3xl">
            Pick a structure to view how teams enter, progress and how prize pools are shared. These
            presets match the way we run most esports cups on the platform.
          </p>

          <div className="inline-flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('br')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'br'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Battle Royale Format
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fps')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'fps'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              First Person Shooter Format
            </button>
          </div>
        </div>

        {/* Content + visual (zig zag -> content left, animation right) */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Text/content */}
          <div className="w-full md:w-7/12 lg:w-8/12 space-y-4">
            {activeTab === 'br' ? <BattleRoyaleContent /> : <FPSContent />}
          </div>

          {/* Animation / visual side */}
          <div className="w-full md:w-5/12 lg:w-4/12">
            {activeTab === 'br' ? (
              <AnimatedTopTen teams={BR_TEAMS} />
            ) : (
              <AnimatedFPSBracket />
            )}
          </div>
        </div>
      </div>

      {/* local styles for smooth animation */}
      <style jsx>{`
        @keyframes floatRow {
          0% {
            transform: translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateX(4px);
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 0.9;
          }
        }
        @keyframes pulseNode {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
    </section>
  )
}

/* ----------------- battle royale panel ----------------- */
function BattleRoyaleContent(): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="text-lg md:text-xl font-semibold text-white">Battle Royale Format</h3>
      <ul className="space-y-2 text-neutral-200 text-sm md:text-base">
        <li>1. A total of 25 teams compete in the event.</li>
        <li>
          2. Team registration is confirmed through a nominal participation charge decided for that
          specific tournament.
        </li>
        <li>
          3. Minimum and maximum team size is decided by the tournament&apos;s structure (solo, duo,
          squad).
        </li>
        <li>
          4. Champion team receives 100% of the prize share declared in the tournament brief.
        </li>
        <li>5. Runner up team receives 50% of the declared prize share.</li>
        <li>6. Teams ranked 3 to 10 receive 40% of the declared prize share.</li>
      </ul>

      {/* division info from excel */}
      <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
        <h4 className="text-sm font-semibold text-white">
          Division Scores Distribution System (from sheet)
        </h4>
        <p className="text-neutral-300 text-sm">
          The BR scoring sheet defines Division 1 (score ≥ 1500), Division 2 (score ≥ 600) and
          Division 3 (default = 50). Each division has separate slabs for Winner, Runner Up, Rank
          3–10 and the rest of the teams. These values are read from the tournament&apos;s division
          format file and applied automatically on the leaderboard.
        </p>
        <ul className="text-neutral-200 text-xs md:text-sm space-y-1">
          <li>• Higher division = higher prize pool applied on top of the base distribution.</li>
          <li>• Higher division = lower entry fees to promote qualified teams.</li>
          <li>
            • Division 1 tournament players will be sponsored by GearForge to participate in
            national level tournaments.
          </li>
        </ul>
      </div>
    </div>
  )
}

/* ----------------- fps panel ----------------- */
function FPSContent(): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="text-lg md:text-xl font-semibold text-white">First Person Shooter Format</h3>
      <ul className="space-y-2 text-neutral-200 text-sm md:text-base">
        <li>1. 16 teams participate in a 5v5 knockout structure.</li>
        <li>
          2. Final stage match rules define the prize share for the two finalists as declared in the
          tournament details.
        </li>
        <li>3. Teams reaching level 3 (2 teams) receive 40% of the prize money.</li>
        <li>4. Teams reaching level 4 (4 teams) receive 25% of the prize money.</li>
        <li>
          So, winning one match level places the team into a prize-eligible slot in this format.
        </li>
      </ul>

      <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
        <h4 className="text-sm font-semibold text-white">
          FPS Scoring & Divisions (from sheet)
        </h4>
        <p className="text-neutral-300 text-sm">
          The FPS section in the sheet mirrors the BR idea: divisions hold their own winner, runner
          up and placement rows, and there is a note for the Round of 16 format. Higher divisions get
          access to better prize pools and are allowed to enter at a lower participation fee.
        </p>
        <ul className="text-neutral-200 text-xs md:text-sm space-y-1">
          <li>• Higher division = better prize slots per round.</li>
          <li>• Higher division = lower entry fees.</li>
          <li>• Division 1 FPS teams can be put forward by GearForge for national-level events.</li>
        </ul>
      </div>
    </div>
  )
}

/* ----------------- BR animation ----------------- */
function AnimatedTopTen({ teams }: { teams: string[] }): React.ReactElement {
  return (
    <div className="bg-black/10 border border-white/10 rounded-lg p-4 w-full">
      <h4 className="text-sm font-semibold text-white mb-3">Top 10 Leaderboard (live)</h4>
      <ul className="space-y-2">
        {teams.slice(0, 10).map((team, idx) => (
          <li
            key={team}
            className="flex items-center justify-between bg-white/5 rounded-md px-3 py-2 text-sm text-white"
            style={{
              animation: 'floatRow 4s ease-in-out infinite',
              animationDelay: `${idx * 0.12}s`
            }}
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-xs text-white/80">
                {idx + 1}
              </span>
              {team}
            </span>
            <span className="text-xs text-neutral-200">{1200 - idx * 23} pts</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------- FPS animation ----------------- */
function AnimatedFPSBracket(): React.ReactElement {
  // simple 16-team → 8 → 4 → 2 → 1 visual
  return (
    <div className="bg-black/10 border border-white/10 rounded-lg p-4 w-full">
      <h4 className="text-sm font-semibold text-white mb-3">Knockout tree (FPS)</h4>
      <div className="grid grid-cols-4 gap-3 min-h-[180px]">
        {/* round 1 */}
        <div className="flex flex-col gap-2 justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <BracketNode key={index} label={`R1 Match ${index + 1}`} delay={index * 0.2} />
          ))}
        </div>
        {/* round 2 */}
        <div className="flex flex-col gap-6 justify-around">
          {Array.from({ length: 2 }).map((_, index) => (
            <BracketNode key={index} label={`Lvl 3 Team ${index + 1}`} delay={0.8 + index * 0.25} />
          ))}
        </div>
        {/* round 3 */}
        <div className="flex flex-col gap-6 justify-around">
          <BracketNode label="Semi-final" delay={1.4} />
        </div>
        {/* final */}
        <div className="flex flex-col gap-6 justify-center">
          <BracketNode label="Final / Winner" delay={1.8} highlighted />
        </div>
      </div>
      <p className="mt-3 text-neutral-300 text-xs leading-relaxed">
        Progressing one level places the team into a prize-eligible slot as per the division format.
      </p>
    </div>
  )
}

function BracketNode({
  label,
  delay,
  highlighted = false
}: {
  label: string
  delay?: number
  highlighted?: boolean
}): React.ReactElement {
  return (
    <div
      className={`rounded-md border px-2 py-2 text-[0.65rem] text-white/90 bg-white/5 relative transition-transform duration-200 ${
        highlighted ? 'border-white/80 bg-white/10' : 'border-white/10'
      }`}
      style={{
        animation: 'pulseNode 4s ease-in-out infinite',
        animationDelay: delay ? `${delay}s` : undefined
      }}
    >
      {label}
      <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-px bg-white/20 md:block hidden" />
    </div>
  )
}
