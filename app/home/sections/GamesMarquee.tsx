'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import gamesData from "../sections/games.json"
import { GameCardModel } from '@/app/models/game_card_model'

function GamesMarquee() {
  const [games, setGames] = useState<GameCardModel[]>([])

  useEffect(() => {
    // Duplicate the array to create seamless loop and transform data to match GameCardModel
    const transformedGames = gamesData.games.map(game => ({
      ...game,
      cover: {
        id: 0,
        game: 0,
        height: 0,
        width: 0,
        image_id: '',
        url: game.cover.url
      }
    }));
    setGames([...transformedGames, ...transformedGames])
  }, [])

  return (
    <div className="marquee-wrapper" style={{ overflow: 'hidden' }}>
      {/* marquee viewport */}
      <div className="marquee-root">
        {/* the track contains duplicated items and is animated */}
        <div className="marquee-track" aria-hidden={games.length === 0}>
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

      {/* Inline styles to ensure animation works without tailwind config changes */}
      <style jsx>{`
        /* Prevent body overflow from marquee */
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
          animation: marquee 40s linear infinite;
          will-change: transform;
          transform: translateZ(0);
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

        /* Ensure images do not cause overflow */
        .cover :global(img) {
          max-width: 100%;
          height: auto;
          display: block;
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

        /* Pause animation on hover */
        .marquee-root:hover .marquee-track {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Tablet styles (768px - 1024px) */
        @media (max-width: 1024px) {
          .marquee-wrapper {
            padding: 1.5rem 0;
          }

          .marquee-track {
            gap: 0.875rem;
            animation-duration: 45s;
          }

          .marquee-item {
            width: 180px;
          }

          .name {
            font-size: 0.8125rem;
          }
        }

        /* Mobile landscape / Small tablet (641px - 768px) */
        @media (max-width: 768px) {
          .marquee-wrapper {
            padding: 1.25rem 0;
          }

          .marquee-track {
            gap: 0.75rem;
            animation-duration: 50s;
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

        /* Mobile portrait (up to 640px) */
        @media (max-width: 640px) {
          .marquee-wrapper {
            padding: 1rem 0;
          }

          .marquee-track {
            gap: 0.625rem;
            animation-duration: 55s;
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

        /* Extra small mobile (up to 480px) */
        @media (max-width: 480px) {
          .marquee-wrapper {
            padding: 0.75rem 0;
          }

          .marquee-track {
            gap: 0.5rem;
            animation-duration: 60s;
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

        /* Very small devices (up to 360px) */
        @media (max-width: 360px) {
          .marquee-item {
            width: 110px;
          }

          .marquee-track {
            animation-duration: 65s;
          }
        }
      `}</style>
    </div>
  )
}

export default GamesMarquee