'use client';

export default function Carousel() {
  const bg = '/r6.png'; // make sure this exists in /public

  return (
    <section className="hero" style={{ backgroundImage: `url('${bg}')` }}>
      <div className="overlay" />
      <div className="inner">
        <div className="copy w-screen">
          <h1 className="title fade-up delay-1 w-screen">Welcome to GearForge</h1>
          <p className="subtitle fade-up delay-2">
            Build your squad. Climb your division. Win real tournaments. GearForge levels the field so talent decides the outcome.
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Sizing */
        .hero {
          position: relative;
          width: 100%;
          min-height: 18rem;
          height: 64vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .hero { height: 42vh; }
        }

        /* Readability overlay */
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.7),
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.2)
          );
        }

        /* Content */
        .inner {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 1rem;
        }
        @media (min-width: 640px) {
          .inner { padding: 2rem; }
        }
        @media (min-width: 1024px) {
          .inner { padding: 4rem; }
        }

        .copy { max-width: 72ch; }
        .title {
          margin: 0;
          color: #fff;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          font-size: clamp(1.875rem, 4vw + 0.5rem, 3.5rem);
        }
        .subtitle {
          margin-top: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          font-size: clamp(0.95rem, 1.2vw + 0.6rem, 1.25rem);
        }

        /* Animation */
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.6s ease-out both;
        }
        .delay-1 { animation-delay: 100ms; }
        .delay-2 { animation-delay: 300ms; }
      `}</style>
    </section>
  );
}
