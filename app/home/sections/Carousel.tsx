'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const imageList: string[] = ['/r6.png', '/fc-25.jpeg'];

function Carousel() {
  // Slides with clones at both ends for seamless loop
  const slides = [imageList[imageList.length - 1], ...imageList, imageList[0]];
  const realCount = imageList.length;

  // Start at 1 (the first real slide)
  const [current, setCurrent] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // React-level transition toggle (for normal moves & snap-back)
  const [transitionOn, setTransitionOn] = useState(true);

  // Autoplay
  const [autoPlay, setAutoPlay] = useState(true);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef(0);

  // drag refs
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);

  // Measure width (resizes too)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const setW = () => {
      widthRef.current = el.clientWidth;
      // console.log('[width] =', widthRef.current);
    };
    setW();
    const ro = new ResizeObserver(setW);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ----- Auto-advance -----
  useEffect(() => {
    if (!autoPlay || isDragging || !transitionOn) return;
    const id = setInterval(() => goNext(), 5000);
    return () => clearInterval(id);
  }, [autoPlay, isDragging, transitionOn, current]);

  // After any user interaction we pause auto for 20s
  useEffect(() => {
    if (autoPlay) return;
    const t = setTimeout(() => setAutoPlay(true), 20000);
    return () => clearTimeout(t);
  }, [autoPlay]);

  // ----- Navigation: NEXT only (you said no arrows; swipe uses both directions) -----
  const goNext = () => {
    if (isDragging) return;
    setAutoPlay(false);
    setTransitionOn(true);
    setDragX(0);
    setCurrent((c) => {
      const nv = c + 1;
      // console.log('goNext:', c, '->', nv);
      return nv;
    });
  };

  // ----- Pointer events (mouse/touch/pen) -----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setAutoPlay(false);
    setIsDragging(true);
    setTransitionOn(false); // while actively dragging, disable transition
    setDragX(0);
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // console.log('[down] current=', current);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - startXRef.current;
    setDragX(dx);
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
  };

  const finishDrag = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);

    const dx = clientX - startXRef.current;
    const w = widthRef.current || 1;
    const distanceThreshold = Math.max(80, w * 0.15);

    const dt = Math.max(1, performance.now() - lastTRef.current);
    const vx = (clientX - lastXRef.current) / dt; // px/ms
    const velocityThreshold = 0.55 / 16;

    setTransitionOn(true); // enable transition for settle animation
    setDragX(0);

    if (dx <= -distanceThreshold || vx < -velocityThreshold) {
      // swipe left -> next
      setCurrent((c) => c + 1);
      // console.log('[finishDrag] LEFT -> next, new current scheduled');
    } else if (dx >= distanceThreshold || vx > velocityThreshold) {
      // swipe right -> prev
      setCurrent((c) => c - 1);
      // console.log('[finishDrag] RIGHT -> prev, new current scheduled');
    } else {
      // snap back (no index change)
      // console.log('[finishDrag] snap back');
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    finishDrag(e.clientX);
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
    setTransitionOn(true);
    setDragX(0);
  };

  // ----- Transition end: fix clone → real with IMPERATIVE snap (no animation) -----
  const handleTransitionEnd = () => {
    // Log current state at the moment the slide animation completes
    console.log(
      `[handleTransitionEnd] current=${current}, realCount=${realCount}, transitionOn=${transitionOn}`
    );

    const track = trackRef.current;
    if (!track) return;

    if (current === 0) {
      console.log('→ On LEFT clone, snapping to last real slide (imperative)');
      // 1) Disable CSS transition on the element itself
      track.style.transition = 'none';

      // 2) Update React state to the last real slide
      setCurrent(realCount);

      // 3) Snap transform immediately to the last real slide
      const w = widthRef.current || 0;
      track.style.transform = `translateX(${-realCount * w}px)`;

      // 4) Force reflow so the browser applies the snap right now
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      track.offsetHeight;

      // 5) Re-enable React-driven transitions and clear inline override
      requestAnimationFrame(() => {
        track.style.transition = ''; // allow class-based transitions again
        setTransitionOn(true);
        console.log('→ Snap completed (LEFT). Transition re-enabled.');
      });
    } else if (current === realCount + 1) {
      console.log('→ On RIGHT clone, snapping to first real slide (imperative)');
      track.style.transition = 'none';
      setCurrent(1);
      const w = widthRef.current || 0;
      track.style.transform = `translateX(${-1 * w}px)`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      track.offsetHeight;
      requestAnimationFrame(() => {
        track.style.transition = '';
        setTransitionOn(true);
        console.log('→ Snap completed (RIGHT). Transition re-enabled.');
      });
    } else {
      console.log('→ Normal transition end (no clone correction)');
    }
  };

  // ----- Derived transform (React-driven) -----
  // Base position is the current slide offset plus any live drag delta
  const x = -(current * (widthRef.current || 0)) + dragX;
  const trackStyle = {
    transform: `translateX(${x}px)`,
  };
  const trackClass = transitionOn
    ? 'transition-transform duration-300 ease-out'
    : 'transition-none';

  return (
    /**
     * Mobile: full-bleed (w-screen + centering).
     * Desktop: width = 100vw - sidebar width; parent already accounts for sidebar margin.
     */
    <section
      className="
        relative select-none -mt-16
        w-screen left-1/2 -translate-x-1/2
        md:[--sidebar-w:15rem]
        md:w-[calc(100vw-var(--sidebar-w))] md:left-auto md:translate-x-0
      "
    >
      <div
        ref={containerRef}
        className="
          relative h-[42vh] min-h-[16rem] md:h-[64vh]
          overflow-hidden touch-pan-y
          cursor-grab active:cursor-grabbing
        "
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className={`absolute inset-0 flex ${trackClass}`}
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="relative w-full shrink-0">
              <Image
                src={src}
                alt={`Slide ${i}`}
                fill
                priority={i === current} // current gets priority
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex w-full gap-2 justify-center mt-4">
        {imageList.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${
              i === ((current - 1 + realCount) % realCount)
                ? 'bg-blue-400'
                : 'bg-white/80'
            }`}
            onClick={() => {
              if (isDragging) return;
              setAutoPlay(false);
              setTransitionOn(true);
              // Current is 1..N; dot index i maps to i+1
              setCurrent(i + 1);
              setDragX(0);
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default Carousel;
