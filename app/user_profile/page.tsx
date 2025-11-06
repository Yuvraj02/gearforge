"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useAppDispatch} from "../hooks";
import { logoutUser } from "../userSlice";
import { logout as logoutApi } from "../api";

import ProfileSection from "./ProfileSection";
import TournamentsSection from "./tournaments/TournamentSection";
import SecuritySection from "./SecuritySection";

type TabKey = "profile" | "tournaments" | "security";

const tabs: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "tournaments", label: "Tournaments" },
  { key: "security", label: "Security" },
];

export default function UserProfilePage() {
  const [active, setActive] = React.useState<TabKey>("profile");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const logUserOut = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => logoutApi(),
    onSuccess: async () => {
      dispatch(logoutUser());
      queryClient.removeQueries({ queryKey: ["auto_login"] });
      queryClient.removeQueries({ queryKey: ["refresh_token"] });
      queryClient.removeQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith("user_"),
      });
      await signOut({ redirect: false });
      router.replace("/");
      router.refresh();
    },
  });

  return (
    <main className="pt-24 md:pt-28 px-3 md:px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)] gap-4">
        {/* Sidebar */}
        <aside className="bg-[#1b1c1e] border border-black/70 rounded-2xl p-3 md:p-4 h-fit sticky top-24">
          {/* Mobile: tabs row */}
          <div className="flex md:hidden gap-2 mb-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-3 py-2 rounded-xl text-sm ${
                  active === t.key
                    ? "bg-[#242528] text-white"
                    : "bg-[#141518] text-gray-300 hover:bg-[#1c1d20]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical menu */}
          <nav className="hidden md:flex md:flex-col gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`w-full text-left px-3 py-2 rounded-xl cursor-pointer ${
                  active === t.key
                    ? "bg-[#242528] text-white"
                    : "bg-[#141518] text-gray-300 hover:bg-[#1c1d20]"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="h-px bg-black/60 my-2" />

            <button
              onClick={() => logUserOut.mutate()}
              className="cursor-pointer w-full text-left px-3 py-2 rounded-xl border border-red-900/40 text-red-400 hover:bg-[#2a1c1c] hover:text-red-200 transition"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="min-h-[60vh]">
          {active === "profile" && <ProfileSection />}
          {active === "tournaments" && <TournamentsSection />}
          {active === "security" && (
            <SecuritySection onLogout={() => logUserOut.mutate()} />
          )}
        </section>
      </div>
    </main>
  );
}
