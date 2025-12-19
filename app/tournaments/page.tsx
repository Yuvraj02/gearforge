'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getTournaments } from '../api';
import TournamentCard from '@/app/components/common/TournamentCard';
import DraggableScroll from '@/app/components/common/DraggableScroll';
import { Tournament } from '@/app/models/tournament_model';
import { useAppSelector } from '../hooks';

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
  tournament_division: number;
  pool_price: string;
  entry_fee: string;
  created_at: string;
  updated_at: string;
  status: 'upcoming' | 'live' | 'ended';
  tournament_date: string;
  min_team_size: number | null;
  max_team_size: number | null;
  coming_soon: boolean | null;
  registration_status: 'open' | 'close' | null;
};

type ApiResponse =
  | { status: 'success'; data: ApiTournament[] }
  | { status: 'error'; data: unknown };

function toNumber(n: string | number | null): number {
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
    coming_soon: !!t.coming_soon,
    registration_status: t.registration_status ?? 'open',
  };
}

export default function TournamentsPage(): React.ReactElement {
  const router = useRouter();
  const isLoggedIn = useAppSelector((s) => s.users.isLoggedIn);
  const role = useAppSelector((s) => s.users.user?.role);

  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
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
  const ended = list.filter((t) => t.status === 'ended');

  const isAdmin = isLoggedIn && role === 'admin';

  const clickableCard = (
    t: Tournament,
    options?: { showRegister?: boolean; ariaLabel?: string }
  ) => {
    const isComingSoon = !!t.coming_soon;

    const go = () => {
      if (isComingSoon) return;  // ✅ block
      router.push(`/tournaments/${t.tournament_id}`);
    };

    const onClickCard = (e: React.MouseEvent) => {
      if (isComingSoon) return;  // ✅ block
      const el = e.target as HTMLElement;
      if (el.closest('[data-interactive="true"]')) return;
      go();
    };

    const onKey = (e: React.KeyboardEvent) => {
      if (isComingSoon) return;  // ✅ block
      const el = e.target as HTMLElement;
      if (el.closest('[data-interactive="true"]')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    };

    return (
      <div key={t.tournament_id} className="inline-block mr-3 align-top overflow-visible">
        <div
          role={isComingSoon ? undefined : "link"}
          tabIndex={isComingSoon ? -1 : 0}
          aria-disabled={isComingSoon ? true : undefined}
          onClick={onClickCard}
          onKeyDown={onKey}
          aria-label={
            options?.ariaLabel ??
            (isComingSoon ? `${t.name} coming soon` :
              (t.status === 'ended' ? `View results for ${t.name}` : `Open ${t.name}`))
          }
          className={[
            "group rounded-xl overflow-visible select-none transition-colors duration-150 focus:outline-none",
            isComingSoon ? "cursor-not-allowed opacity-90" : "cursor-pointer",
          ].join(" ")}
        >
          <div
            className={[
              "rounded-xl p-[1px] bg-transparent transition-colors duration-150",
              isComingSoon ? "" : "group-hover:bg-white/12 group-focus-visible:bg-white/20",
            ].join(" ")}
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


  const listNode = (items: Tournament[], showRegister = false): React.ReactElement => (
    <div className="overflow-x-auto overflow-y-visible">
      <div className="py-2 px-2 sm:px-4">
        <DraggableScroll>{items.map((t) => clickableCard(t, { showRegister }))}</DraggableScroll>
      </div>
    </div>
  );

  // 404 / "Not even a single tournament found" case
  const isNotFound =
    isError &&
    (error?.message?.includes('404') ||
      error?.message?.includes('Not even a single tournament found'));

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col w-full min-h-screen gap-8 p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Tournaments</h1>
          {isAdmin ? (
            <Link
              href="/tournaments/create_tournament"
              className="inline-flex items-center gap-2 px-3 py-2 bg-amber-600 text-black font-medium rounded hover:bg-amber-500"
            >
              Create tournament
            </Link>
          ) : (
            <div />
          )}
        </header>

        {isLoading && <div className="text-neutral-300">Loading…</div>}

        {isNotFound && (
          <div className="text-sm text-neutral-400">No Recent Tournaments</div>
        )}

        {!isLoading && !isError && (
          <>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Live Tournaments</h2>
                <span className="text-sm text-neutral-400">{live.length} live</span>
              </div>
              {live.length === 0 ? (
                <div className="text-sm text-neutral-400">No live tournaments right now.</div>
              ) : (
                listNode(live)
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Upcoming Tournaments</h2>
                <span className="text-sm text-neutral-400">{upcoming.length} upcoming</span>
              </div>
              {upcoming.length === 0 ? (
                <div className="text-sm text-neutral-400">No upcoming tournaments.</div>
              ) : (
                listNode(upcoming, true)
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Ended Tournaments</h2>
                <span className="text-sm text-neutral-400">{ended.length} ended</span>
              </div>
              {ended.length === 0 ? (
                <div className="text-sm text-neutral-400">No ended tournaments.</div>
              ) : (
                listNode(ended)
              )}
            </section>
          </>
        )}

        {/* If some other error (not 404), show the original message */}
        {isError && !isNotFound && (
          <div className="text-rose-400 text-sm">
            {(error && error.message) || 'Failed to load tournaments'}
          </div>
        )}
      </div>
    </div>
  );
}
