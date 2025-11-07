'use client'

import React from 'react'
import { usePlatformsQuery } from '@/app/game/hooks/game'

interface PlatformsProps {
  gameId?: number
}

function Platforms({ gameId }: PlatformsProps) {

  const { data: platforms, isLoading, isError } = usePlatformsQuery(gameId!)
  console.log("Platforms data:", platforms);
  if (!gameId) return <div className="text-neutral-400">Platform information not available</div>
  if (isLoading) return <div className="text-neutral-400">Loading platforms…</div>
  if (isError) return <div className="text-rose-400">Failed to load platforms</div>

  return (
    <div className="text-white">
      {platforms && platforms.length > 0 ? platforms.join(', ') : 'N/A'}
    </div>
  )
}

export default Platforms