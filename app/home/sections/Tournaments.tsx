'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { getTournaments } from '@/app/api';
import { Tournament } from '@/app/models/tournament_model';
import TournamentCard from '@/app/components/common/TournamentCard';
import DraggableScroll from '@/app/components/common/DraggableScroll';
import { useAppSelector } from '@/app/hooks';

// ---- API shapes coming from backend ----
type ApiTournament = {
  tournament_id: string;
  name: string;
  game_category: string;
  start_date: string;
  end_date: string;
  cover: string | null;
  total_slots: number | null;
  registered_slots: number | null;
  registered_id: string[];
  winner_id: string | null;
  runnerup_id: string | null;
  tournament_division: number | null;
  pool_price: string | number | null;
  entry_fee: string | number | null;
  created_at: string;
  updated_at: string;
  status: 'upcoming' | 'live' | 'ended';
  tournament_date: string;
  min_team_size: number | null;
  max_team_size: number | null;
  // if your API already returns these, keep them; otherwise they'll be undefined
  coming_soon?: boolean;
  registration_status?: 'open' | 'close';
};

type ApiResponse =
  | { status: 'success'; data: ApiTournament[] }
  | { status: 'error'; data: unknown };

// ---- small helpers (same as your /tournaments page) ----
function toNumber(n: string | number | null | undefined): number {
  if (typeof n === 'number') return n;
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}
function toDate(s: string): Date {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}
function normalize(t: ApiTournament): Tournament {
  const cover =
    t.cover && t.cover.trim().toLowerCase() !== 'none' ? t.cover.trim() : undefined;

  return {
    tournament_id: t.tournament_id,
    name: t.name,
    game_category: t.game_category,
    start_date: toDate(t.start_date),
    end_date: toDate(t.end_date),
    cover,
    max_team_size: t.max_team_size ?? undefined,
    min_team_size: t.min_team_size ?? undefined,
    total_slots: t.total_slots ?? undefined,
    registered_slots: t.registered_slots ?? undefined,
    registered_id: Array.isArray(t.registered_id) ? t.registered_id : undefined,
    winner_id: t.winner_id ?? undefined,
    runnerup_id: t.runnerup_id ?? undefined,
    tournament_division: t.tournament_division ?? undefined,
    pool_price: toNumber(t.pool_price),
    entry_fee: toNumber(t.entry_fee),
    created_at: toDate(t.created_at),
    updated_at: toDate(t.updated_at),
    status: t.status,
    tournament_date: toDate(t.tournament_date),
    coming_soon: t.coming_soon ?? false,                 // pass-through if present
    registration_status: t.registration_status, // pass-through if present
  };
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null; // hide whole section if empty
  return (
    <section className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="text-sm text-neutral-400">{count}</span>
      </div>
      {children}
    </section>
  );
}

export default function Tournaments(): React.ReactElement | null {
  const router = useRouter();
  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const role = useAppSelector((s) => s.users.user?.role);
  const isAdmin = isLoggedIn && role === 'admin';

  const { data, isLoading, isError } = useQuery<ApiResponse, Error>({
    queryKey: ['tournaments'],
    queryFn: getTournaments,
  });

  const list: Tournament[] =
    data && data.status === 'success' && Array.isArray(data.data)
      ? data.data.map(normalize)
      : [];

  const live = list.filter((t) => t.status === 'live');
  const upcoming = list
    .filter((t) => t.status === 'upcoming')
    .sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

  // If nothing to show and not loading, render nothing on Home
  if (!isLoading && !isError && live.length === 0 && upcoming.length === 0) return null;

  const clickableCard = (t: Tournament, options?: { showRegister?: boolean; ariaLabel?: string }) => {
    const go = () => router.push(`/tournaments/${t.tournament_id}`);
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    };

    return (
      <div key={t.tournament_id} className="inline-block mr-3 align-top overflow-visible">
        <div
          role="link"
          tabIndex={0}
          aria-label={options?.ariaLabel ?? (t.status === 'ended' ? `View results for ${t.name}` : `Open ${t.name}`)}
          onClick={go}
          onKeyDown={onKey}
          className={[
            'group rounded-xl overflow-visible cursor-pointer select-none',
            'transition-colors duration-150',
            'focus:outline-none',
          ].join(' ')}
        >
          <div
            className={[
              'rounded-xl p-[1px]',
              'bg-transparent',
              'transition-colors duration-150',
              'group-hover:bg-white/12',
              'group-focus-visible:bg-white/20',
            ].join(' ')}
          >
            <TournamentCard
              t={t}
              live={t.status === 'live'}
              showRegister={!!options?.showRegister}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    );
  };

  const listRow = (items: Tournament[], showRegister = false) => (
    <div className="overflow-x-auto overflow-y-visible">
      <div className="py-2 px-2 sm:px-4">
        <DraggableScroll>
          {items.map((t) => clickableCard(t, { showRegister }))}
        </DraggableScroll>
      </div>
    </div>
  );

  return (
    <div className="w-full h-fit px-4 sm:px-6 md:px-8 py-6">
      {isLoading && <div className="text-neutral-300">Loading…</div>}
      {isError && <div className="text-rose-400 text-sm">Failed to load tournaments.</div>}

      {!isLoading && !isError && (
        <>
          <Section title="Live Tournaments" count={live.length}>
            {listRow(live)}
          </Section>

          <Section title="Upcoming Tournaments" count={upcoming.length}>
            {listRow(upcoming, true)}
          </Section>
          {/* No "Ended" on Home by requirement */}
        </>
      )}
    </div>
  );
}
