'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gamesData from '../sections/games.json'
import { GameCardModel } from '@/app/models/game_card_model'

function GamesMarquee() {
  const [games, setGames] = useState<GameCardModel[]>([])

  const rootRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  // animation state
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number>(0)
  const xRef = useRef<number>(0) // current translateX (px)
  const halfWidthRef = useRef<number>(0)

  // interaction state
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startTranslateRef = useRef(0)

  useEffect(() => {
    const transformedGames = gamesData.games.map((game) => ({
      ...game,
      cover: {
        id: 0,
        game: 0,
        height: 0,
        width: 0,
        image_id: '',
        url: game.cover.url,
      },
    }))

    // duplicate for infinite loop
    setGames([...transformedGames, ...transformedGames])
  }, [])

  const applyTransform = (x: number) => {
    const track = trackRef.current
    if (!track) return
    track.style.transform = `translate3d(${x}px, 0, 0)`
  }

  const recalcWidths = () => {
    const track = trackRef.current
    if (!track) return
    const total = track.scrollWidth
    halfWidthRef.current = total / 2
  }

  const step = (ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts

    // speed in px/s (tweak if you want)
    const speed = 60

    if (!pausedRef.current && !draggingRef.current) {
      let x = xRef.current - speed * dt
      const half = halfWidthRef.current

      // wrap seamlessly
      if (half > 0 && x <= -half) x += half
      xRef.current = x
      applyTransform(x)
    }

    rafRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    // start animation loop
    rafRef.current = requestAnimationFrame(step)

    // measure and re-measure on resize
    const onResize = () => {
      recalcWidths()

      // keep x in a safe range after resize
      const half = halfWidthRef.current
      if (half > 0) {
        let x = xRef.current
        while (x <= -half) x += half
        while (x > 0) x -= half
        xRef.current = x
        applyTransform(x)
      }
    }

    window.addEventListener('resize', onResize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // once games render, measure width
    if (games.length === 0) return
    const t = setTimeout(() => {
      recalcWidths()
      applyTransform(xRef.current)
    }, 0)
    return () => clearTimeout(t)
  }, [games.length])

  const onPointerDown = (e: React.PointerEvent) => {
    const root = rootRef.current
    if (!root) return

    // only left click for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return

    // prevent image drag/select behavior
    e.preventDefault()

    draggingRef.current = true
    pointerIdRef.current = e.pointerId
    startXRef.current = e.clientX
    startTranslateRef.current = xRef.current

    root.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    if (pointerIdRef.current !== e.pointerId) return

    const dx = e.clientX - startXRef.current
    let x = startTranslateRef.current + dx

    const half = halfWidthRef.current
    if (half > 0) {
      // wrap during drag too, so it feels infinite
      while (x <= -half) x += half
      while (x > 0) x -= half
    }

    xRef.current = x
    applyTransform(x)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    if (pointerIdRef.current !== e.pointerId) return

    draggingRef.current = false
    pointerIdRef.current = null
  }

  const onPointerCancel = (e: React.PointerEvent) => endDrag(e)

  const onMouseEnter = () => {
    pausedRef.current = true
  }
  const onMouseLeave = () => {
    pausedRef.current = false
  }

  const onDragStart = (e: React.DragEvent) => {
    // hard block native drag ghost
    e.preventDefault()
  }

  return (
    <div className="marquee-wrapper" style={{ overflow: 'hidden' }}>
      <div
        ref={rootRef}
        className="marquee-root"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={onPointerCancel}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragStart={onDragStart}
        role="region"
        aria-label="Games marquee"
      >
        <div ref={trackRef} className="marquee-track" aria-hidden={games.length === 0}>
          {games.map((game, index) => (
            <div
              key={`${game.id}-${index}`}
              className="marquee-item"
              aria-hidden={index >= games.length / 2 ? 'true' : 'false'}
            >
              <div className="card">
                <div className="cover">
                  {game.cover?.url && (
                    <Image
                      src={game.cover.url}
                      alt={game.name}
                      fill
                      draggable={false}
                      className="object-cover"
                      sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                    />
                  )}
                </div>
                <div className="caption">
                  <h3 className="name">{game.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(body) {
          overflow-x: hidden;
          max-width: 100vw;
        }

        .marquee-wrapper {
          width: 100%;
          max-width: 100vw;
          padding: 2rem 0;
          overflow: hidden;
          overflow-x: clip;
        }

        .marquee-root {
          position: relative;
          width: 100%;
          max-width: 100vw;
          overflow: hidden;
          overflow-x: clip;
          -ms-overflow-style: none;
          scrollbar-width: none;

          /* critical for drag UX */
          touch-action: pan-y;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }

        .marquee-root:active {
          cursor: grabbing;
        }

        .marquee-root::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .marquee-track {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: max-content;

          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        /* kill native image dragging/selection everywhere inside */
        .marquee-root :global(img) {
          -webkit-user-drag: none;
          user-drag: none;
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none; /* prevents ghost drag cursor */
        }

        .marquee-item {
          flex: 0 0 auto;
          width: 200px;
          box-sizing: border-box;
        }

        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          pointer-events: auto;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: scale(1.05);
        }

        .cover {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 0.5rem;
          overflow: hidden;
          background: rgba(17, 24, 39, 0.6);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }

        .card:hover .cover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .caption {
          width: 100%;
          text-align: center;
          padding: 0 0.25rem;
        }

        .name {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 1024px) {
          .marquee-wrapper {
            padding: 1.5rem 0;
          }
          .marquee-track {
            gap: 0.875rem;
          }
          .marquee-item {
            width: 180px;
          }
          .name {
            font-size: 0.8125rem;
          }
        }

        @media (max-width: 768px) {
          .marquee-wrapper {
            padding: 1.25rem 0;
          }
          .marquee-track {
            gap: 0.75rem;
          }
          .marquee-item {
            width: 160px;
          }
          .cover {
            border-radius: 0.375rem;
          }
          .name {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 640px) {
          .marquee-wrapper {
            padding: 1rem 0;
          }
          .marquee-track {
            gap: 0.625rem;
          }
          .marquee-item {
            width: 140px;
          }
          .card {
            gap: 0.375rem;
          }
          .cover {
            border-radius: 0.25rem;
          }
          .name {
            font-size: 0.6875rem;
          }
        }

        @media (max-width: 480px) {
          .marquee-wrapper {
            padding: 0.75rem 0;
          }
          .marquee-track {
            gap: 0.5rem;
          }
          .marquee-item {
            width: 120px;
          }
          .card {
            gap: 0.25rem;
          }
          .name {
            font-size: 0.625rem;
          }
        }

        @media (max-width: 360px) {
          .marquee-item {
            width: 110px;
          }
        }
      `}</style>
    </div>
  )
}

export default GamesMarquee
