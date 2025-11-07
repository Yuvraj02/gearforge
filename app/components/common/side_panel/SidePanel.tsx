'use client';

import Link from 'next/link';
import Image from 'next/image';
// import GenreList from './GenreList';
import { MdOutlineSportsMartialArts } from 'react-icons/md';
import { MdHome } from "react-icons/md";
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import React, { useEffect } from 'react';
import { togglePanel } from './sidePanelSlice';
import { usePathname } from 'next/navigation';
// import { MdSportsEsports } from "react-icons/md";

export default function SidePanel() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.sidePanel.isOpen);
  const pathname = usePathname();

  // Close on route change (mobile only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
      dispatch(togglePanel());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      dispatch(togglePanel());
    }
  };

  const panelItem =
    'flex gap-2 p-2 items-center cursor-pointer hover:bg-neutral-700 hover:text-white hover:rounded-xl active:scale-[0.98] transition will-change-transform select-none';

  return (
    <>
      {/* Mobile overlay (below navbar). Hidden on desktop. */}
      {isOpen && (
        <div
          aria-hidden
          onClick={closeOnMobile}
          className="
            fixed inset-x-0 bottom-0 top-[56px]  /* match mobile navbar height */
            z-30 bg-black/50 supports-[backdrop-filter]:backdrop-blur-sm
            md:hidden
          "
        />
      )}

      {/* Sidebar under navbar. Always visible on desktop. Mobile slides in/out. */}
      <aside
        aria-label="Sidebar"
        className={`
          fixed left-0 z-40 w-60 bg-[#242528] border-r border-black/40 shadow-xl
          top-[56px] md:top-[64px]                       /* align under navbar */
          h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] /* fill remaining height */
          overflow-y-auto
          transform transition-transform duration-300 ease-out will-change-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Mobile-only logo/header row */}
        <div className="sticky top-0 z-10 bg-[#242528] border-b border-white/10 px-4 py-3 md:hidden mt-2">
          <Link
            href="/"
            className="flex items-center gap-2 select-none"
            onClick={closeOnMobile}
          >
            <Image
              src="/gearforge.svg"
              alt="GearForge Logo"
              width={28}
              height={28}
              className="h-7 w-auto"
              draggable={false}
              priority
            />
            <span className="text-white font-semibold tracking-tight">GearForge</span>
          </Link>
        </div>

        {/* Body */}
        <div className="flex flex-col px-4 py-4 gap-2">
          <Link href="/home" onClick={closeOnMobile}>
            <div className={panelItem}>
              <MdHome />
              <div>Home</div>
            </div>
          </Link>
          <Link href="/tournaments" onClick={closeOnMobile}>
            <div className={panelItem}>
              <MdOutlineSportsMartialArts />
              <div>E-Sports Tournaments</div>
            </div>
          </Link>

          {/* <GenreList /> */}
          {/* <Link href="/browse_games" onClick={closeOnMobile}>
            <div className={panelItem}>
              <MdSportsEsports />
              <div>Browse Games</div>
            </div>
          </Link> */}
          
        </div>
      </aside>
    </>
  );
}
