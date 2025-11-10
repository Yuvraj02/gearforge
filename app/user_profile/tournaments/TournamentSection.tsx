"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../../hooks";
import { getUserTournaments } from "../../api"; // (ids: string[]) => Promise<Tournament[]>
import { Tournament } from "@/app/models/tournament_model";
import { MdFilterList, MdSort } from "react-icons/md";

function formatWhen(d?: Date | string) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt.getTime()) ? "" : dt.toLocaleString();
}

function parseDate(d?: string | Date): number {
  if (!d) return 0;
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt.getTime()) ? 0 : dt.getTime();
}

function List({
  title,
  items,
  emptyText,
  loading,
  error,
}: {
  title: string;
  items: Tournament[];
  emptyText: string;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
      <h3 className="text-white font-medium mb-3">{title}</h3>

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((t) => (
            <li
              key={t.tournament_id}
              className="rounded-xl bg-[#141518] border border-black/60 px-3 py-2 flex items-center justify-between"
            >
              <div>
                <div className="text-white">{t.name}</div>
                <div className="text-xs text-gray-400">
                  {t.game_category ? `${t.game_category} • ` : ""}
                  {formatWhen(t.start_date)}
                  {t.end_date ? ` → ${formatWhen(t.end_date)}` : ""}
                </div>
              </div>
              <div
                className={`text-xs ${
                  t.status === "upcoming"
                    ? "text-green-700"
                    : t.status === "ended"
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
              >
                {t.status ?? ""}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-400">{emptyText}</div>
      )}
    </div>
  );
}

type Filters = {
  status: string; // "all" | "upcoming"  | "ended" | "cancelled"
  startFrom?: string; // yyyy-mm-dd
  startTo?: string; // yyyy-mm-dd
  endFrom?: string;
  endTo?: string;
  gameCategory?: string; // optional
};

type SortState = {
  key: "start_date" | "end_date";
  order: "desc" | "asc";
};

function FilterSortBar({
  filters,
  setFilters,
  sortState,
  setSortState,
  availableStatuses,
  availableCategories,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  sortState: SortState;
  setSortState: (s: SortState) => void;
  availableStatuses: string[];
  availableCategories: string[];
}) {
  return (
    <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-white/90 text-sm">
            <MdFilterList className="text-white/80" size={18} />
            Filters
          </span>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-[#0f1012] border border-black/60 text-white text-sm rounded-lg px-2 py-1"
            title="Status"
          >
            <option value="all">All status</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.gameCategory ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                gameCategory: e.target.value || undefined,
              })
            }
            className="bg-[#0f1012] border border-black/60 text-white text-sm rounded-lg px-2 py-1"
            title="Game"
          >
            <option value="">All games</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>Start</span>
            <input
              type="date"
              value={filters.startFrom ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, startFrom: e.target.value || undefined })
              }
              className="bg-[#0f1012] border border-black/60 text-white text-xs rounded-lg px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.startTo ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, startTo: e.target.value || undefined })
              }
              className="bg-[#0f1012] border border-black/60 text-white text-xs rounded-lg px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>End</span>
            <input
              type="date"
              value={filters.endFrom ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, endFrom: e.target.value || undefined })
              }
              className="bg-[#0f1012] border border-black/60 text-white text-xs rounded-lg px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endTo ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, endTo: e.target.value || undefined })
              }
              className="bg-[#0f1012] border border-black/60 text-white text-xs rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-white/90 text-sm">
            <MdSort className="text-white/80" size={18} />
            Sort
          </span>
          <select
            value={sortState.key}
            onChange={(e) =>
              setSortState({
                ...sortState,
                key: e.target.value as SortState["key"],
              })
            }
            className="bg-[#0f1012] border border-black/60 text-white text-sm rounded-lg px-2 py-1"
            title="Sort by"
          >
            <option value="start_date">Start date</option>
            <option value="end_date">End date</option>
          </select>

          <select
            value={sortState.order}
            onChange={(e) =>
              setSortState({
                ...sortState,
                order: e.target.value as SortState["order"],
              })
            }
            className="bg-[#0f1012] border border-black/60 text-white text-sm rounded-lg px-2 py-1"
            title="Order"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function TournamentsSection() {
  const user = useAppSelector((s) => s.users.user);

  const participatedIds: string[] = Array.isArray(user?.participated_tournaments)
    ? user.participated_tournaments
    : [];

  const wonIds: string[] = Array.isArray(user?.won_tournaments)
    ? user.won_tournaments
    : [];

  const participatedQuery = useQuery<Tournament[]>({
    queryKey: ["tournaments", "participated", participatedIds],
    queryFn: () => getUserTournaments(participatedIds),
    enabled: participatedIds.length > 0,
    staleTime: 60_000,
  });

  const wonQuery = useQuery<Tournament[]>({
    queryKey: ["tournaments", "won", wonIds],
    queryFn: () => getUserTournaments(wonIds),
    enabled: wonIds.length > 0,
    staleTime: 60_000,
  });

  const participatedAll = participatedQuery.data ?? [];
  const wonAll = wonQuery.data ?? [];

  // Build available options from the data
  const allData = useMemo(
    () => [...participatedAll, ...wonAll],
    [participatedAll, wonAll]
  );
  const availableStatuses = useMemo(() => {
    const set = new Set(
      allData
        .map((t) => (t.status || "").toLowerCase())
        .filter((s) => !!s) as string[]
    );
    // common statuses fallback
    ["upcoming", "ended", "cancelled"].forEach((s) => set.add(s));
    return Array.from(set);
  }, [allData]);

  const availableCategories = useMemo(() => {
    const set = new Set(
      allData
        .map((t) => t.game_category)
        .filter((c): c is string => !!c && c.trim().length > 0)
    );
    return Array.from(set);
  }, [allData]);

  // Filters + Sort state
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    gameCategory: undefined,
    startFrom: undefined,
    startTo: undefined,
    endFrom: undefined,
    endTo: undefined,
  });

  const [sortState, setSortState] = useState<SortState>({
    key: "start_date",
    order: "desc", // default: latest on top
  });

  // Core filter + sort util
  const applyFilterSort = useMemo(() => {
    return (items: Tournament[]) => {
      let list = items;

      // Status
      if (filters.status !== "all") {
        const s = filters.status.toLowerCase();
        list = list.filter((t) => (t.status || "").toLowerCase() === s);
      }

      // Game category
      if (filters.gameCategory) {
        const g = filters.gameCategory.toLowerCase();
        list = list.filter(
          (t) => (t.game_category || "").toLowerCase() === g
        );
      }

      // Date ranges
      if (filters.startFrom) {
        const from = new Date(filters.startFrom).getTime();
        list = list.filter((t) => parseDate(t.start_date) >= from);
      }
      if (filters.startTo) {
        const to = new Date(filters.startTo).getTime();
        list = list.filter((t) => parseDate(t.start_date) <= to);
      }
      if (filters.endFrom) {
        const from = new Date(filters.endFrom).getTime();
        list = list.filter((t) => parseDate(t.end_date) >= from);
      }
      if (filters.endTo) {
        const to = new Date(filters.endTo).getTime();
        list = list.filter((t) => parseDate(t.end_date) <= to);
      }

      // Sort
      list = [...list].sort((a, b) => {
        const ka = sortState.key === "start_date" ? a.start_date : a.end_date;
        const kb = sortState.key === "start_date" ? b.start_date : b.end_date;
        const da = parseDate(ka);
        const db = parseDate(kb);
        return sortState.order === "desc" ? db - da : da - db;
      });

      return list;
    };
  }, [filters, sortState]);

  const registeredUpcoming = useMemo(() => {
    const base = participatedAll.filter((t) => t.status === "upcoming");
    return applyFilterSort(base);
  }, [participatedAll, applyFilterSort]);

  const participatedFiltered = useMemo(() => {
    return applyFilterSort(participatedAll);
  }, [participatedAll, applyFilterSort]);

  const wonEnded = useMemo(() => {
    const base = wonAll.filter((t) => t.status === "ended");
    return applyFilterSort(base);
  }, [wonAll, applyFilterSort]);

  return (
    <div className="space-y-4">
      <FilterSortBar
        filters={filters}
        setFilters={setFilters}
        sortState={sortState}
        setSortState={setSortState}
        availableStatuses={availableStatuses}
        availableCategories={availableCategories}
      />

      <List
        title="Registered Tournaments"
        items={registeredUpcoming}
        loading={participatedQuery.isFetching}
        error={participatedQuery.isError ? "Failed to load tournaments." : null}
        emptyText="No upcoming registrations."
      />

      <List
        title="Participated Tournaments"
        items={participatedFiltered}
        loading={participatedQuery.isFetching}
        error={participatedQuery.isError ? "Failed to load tournaments." : null}
        emptyText="No past participations."
      />

      <List
        title="Won Tournaments"
        items={wonEnded}
        loading={wonQuery.isFetching}
        error={wonQuery.isError ? "Failed to load tournaments." : null}
        emptyText="No wins yet."
      />
    </div>
  );
}
