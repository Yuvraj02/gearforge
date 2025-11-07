'use client';

import React from 'react';
import Image from 'next/image';

export default function Carousel() {
  const [ready, setReady] = React.useState(false);

  return (
    <section
      className="hero"
      style={{
        marginTop: 'calc(-1 * var(--nav-h, 64px))',
        paddingTop: 'var(--nav-h, 64px)',
      }}
    >
      {/* Background image */}
      <div className="bg-wrap">
        <Image
          src="/r6.png"
          alt=""
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover' }}
          onLoadingComplete={() => setReady(true)}
        />
      </div>

      {/* Overlay */}
      <div className={`overlay ${ready ? 'show' : ''}`} />

      {/* Foreground */}
      <div className="inner">
        <div className={`copy ${ready ? 'reveal' : 'hidden'}`}>
          <h1 className="title fade-up delay-1">Welcome to GearForge</h1>
          <p className="subtitle fade-up delay-2">
            Build your squad. Climb your division. Win real tournaments. GearForge levels the field
            so talent decides the outcome.
          </p>
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          min-height: 18rem;
          height: 64vh;
          overflow: hidden;
          background-color: #0b0b0f;
        }
        @media (max-width: 768px) {
          .hero { height: 48vh; }
        }
        @media (max-width: 420px) {
          .hero { height: 44vh; }
        }

        .bg-wrap { position: absolute; inset: 0; }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.7),
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.2)
          );
          opacity: 0;
          transition: opacity 250ms ease;
          pointer-events: none;
        }
        .overlay.show { opacity: 1; }

        .inner {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 1rem;
        }
        @media (min-width: 640px) { .inner { padding: 2rem; } }
        @media (min-width: 1024px) { .inner { padding: 4rem; } }

        .copy {
          width: 100%;
          max-width: min(90ch, 92vw);
          /* Prevent overflow on tiny screens */
          overflow-wrap: anywhere;
          word-break: break-word;
          text-wrap: balance;
        }
        .hidden { visibility: hidden; opacity: 0; }
        .reveal { visibility: visible; }

        .title {
          margin: 0;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          /* Smaller lower bound on mobile */
          font-size: clamp(1.4rem, 6vw + 0.25rem, 3.2rem);
        }
        .subtitle {
          margin-top: 0.6rem;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.5;
          /* Scale down a bit more on small screens */
          font-size: clamp(0.9rem, 3.2vw + 0.5rem, 1.2rem);
          max-width: 70ch;
        }
        @media (max-width: 480px) {
          .subtitle { max-width: 100%; }
        }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease-out both; }
        .delay-1 { animation-delay: 100ms; }
        .delay-2 { animation-delay: 300ms; }
      `}</style>
    </section>
  );
}
