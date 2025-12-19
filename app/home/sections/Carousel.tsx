'use client';

import React from 'react';
import Image from 'next/image';

export default function Carousel() {
  const [ready, setReady] = React.useState(false);
  const [showArrow, setShowArrow] = React.useState(true);

  React.useEffect(() => {
    const onScroll = () => {
      setShowArrow(window.scrollY <= 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollDown = React.useCallback(() => {
    const next = document.querySelector('#below-hero') as HTMLElement | null;

    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // fallback: scroll exactly one hero height
    const hero = document.querySelector('.hero') as HTMLElement | null;
    const by = hero?.getBoundingClientRect().height ?? window.innerHeight * 0.7;
    window.scrollBy({ top: by, behavior: 'smooth' });
  }, []);

  return (
    <section className="hero">
      {/* desktop bg */}
      <div className="bg-wrap bg-desktop">
        <Image
          src="/bgmi-mobile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          onLoadingComplete={() => setReady(true)}
        />
      </div>

      {/* mobile bg */}
      <div className="bg-wrap bg-mobile">
        <Image
          src="/bgmi-mobile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          onLoadingComplete={() => setReady(true)}
        />
      </div>

      {/* overlay */}
      <div className={`overlay ${ready ? 'show' : ''}`} />

      {/* content */}
      <div className="inner">
        {/* key fix: animation class only applies AFTER ready */}
        <div className={`copy ${ready ? 'reveal' : 'hidden'}`}>
          <h1 className={`title ${ready ? 'fade-up delay-1' : ''}`}>Welcome to GearForge</h1>
          <p className={`subtitle ${ready ? 'fade-up delay-2' : ''}`}>
            Build your squad. Climb your division. Win real tournaments. GearForge levels the field
            so talent decides the outcome.
          </p>
        </div>
      </div>

      {/* scroll arrow */}
      <button
        type="button"
        onClick={scrollDown}
        className={`scroll-arrow ${showArrow ? 'scroll-arrow--show' : 'scroll-arrow--hide'}`}
        aria-label="Scroll to content"
      >
        <span className="chevron" />
      </button>

      <style jsx>{`
        .hero {
          position: relative;
          width: 100%;
          background: #0b0b0f;
          overflow: hidden;
          height: calc(100vh - 60px); /* desktop */
        }

        .bg-wrap {
          position: absolute;
          inset: 0;
        }
        .bg-desktop {
          display: block;
        }
        .bg-mobile {
          display: none;
        }

        /* mobile layout */
        @media (max-width: 768px) {
          .hero {
            height: auto;
            min-height: 55vh;
          }
          .bg-desktop {
            display: none;
          }
          .bg-mobile {
            display: block;
          }
        }

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
        .overlay.show {
          opacity: 1;
        }

        /* darker overlay on mobile */
        @media (max-width: 768px) {
          .overlay.show {
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.78),
              rgba(0, 0, 0, 0.55),
              rgba(0, 0, 0, 0.35)
            );
          }
        }

        .inner {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
        }
        @media (min-width: 640px) {
          .inner {
            padding: 2rem 2.5rem;
          }
        }
        @media (min-width: 1024px) {
          .inner {
            padding: 3.5rem 2.5rem;
          }
        }

        /* mobile centering */
        @media (max-width: 768px) {
          .inner {
            min-height: 55vh;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            padding-top: 2.4rem;
            padding-bottom: 3.2rem;
          }
        }

        .copy {
          width: 100%;
          max-width: min(64rem, 92vw);
        }

        .hidden {
          visibility: hidden;
          opacity: 0;
        }
        .reveal {
          visibility: visible;
          opacity: 1;
          transition: opacity 250ms ease;
        }

        .title {
          margin: 0;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.05;
          font-size: clamp(1.75rem, 5.2vw, 3.2rem);
        }
        .subtitle {
          margin-top: 0.7rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          font-size: clamp(0.95rem, 3.2vw, 1.2rem);
          max-width: 40rem;
        }
        @media (max-width: 768px) {
          .subtitle {
            max-width: 100%;
          }
        }

        .scroll-arrow {
          position: absolute;
          left: 50%;
          bottom: 1rem;
          transform: translateX(-50%);
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          z-index: 2;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .scroll-arrow--show {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%);
        }
        .scroll-arrow--hide {
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%) translateY(6px);
        }

        .chevron {
          display: block;
          width: 14px;
          height: 14px;
          border-right: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(45deg);
          animation: bounce 1.2s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) rotate(45deg);
          }
          50% {
            transform: translateY(4px) rotate(45deg);
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-up {
          animation: fadeUp 0.6s ease-out both;
        }
        .delay-1 {
          animation-delay: 120ms;
        }
        .delay-2 {
          animation-delay: 280ms;
        }
      `}</style>
    </section>
  );
}
