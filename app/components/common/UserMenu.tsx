"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAppDispatch } from "@/app/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { logout as logoutApi } from "@/app/api";
import { logoutUser } from "@/app/userSlice";

type Props = {
  username: string;
  division: number;
  divisionPoints: number;
};

const DIVISION_MAX: Record<number, number> = {
  3: 600,
  2: 1500,
  1: 1500,
};

export default function UserMenu({ username, division, divisionPoints }: Props) {
  const [open, setOpen] = React.useState(false);
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);
  const anchorRef = React.useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  React.useEffect(() => {
    if (!open || !anchorRef.current || !portalEl) return;
    const rect = anchorRef.current.getBoundingClientRect();
    portalEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
    portalEl.style.left = `${rect.right + window.scrollX - 288}px`;
  }, [open, portalEl]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        anchorRef.current &&
        (anchorRef.current === e.target || anchorRef.current.contains(e.target as Node))
      )
        return;
      if (portalEl && !portalEl.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [portalEl]);

  const nextDivision = division > 1 ? division - 1 : null;
  const max = DIVISION_MAX[division] ?? 0;
  const ratio = nextDivision ? Math.min(1, divisionPoints / max) : 1;

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

  const anchorButton = (
    <button
      ref={anchorRef}
      onClick={() => setOpen((v) => !v)}
      className="px-2 py-1 rounded-md hover:bg-[#1c1d20] transition inline-flex items-center gap-1 min-w-[6.5rem] justify-center text-sm md:text-base cursor-pointer "
    >
      <span className="truncate max-w-[6rem]">{username}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        className={`transition-transform ${open ? "rotate-180" : ""}`}
      >
        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
      </svg>
    </button>
  );

  const menuCard = (
    <div
      role="menu"
      className="w-[18rem] rounded-xl border border-black/70 bg-[#1b1c1e] shadow-lg shadow-black/50 p-3"
    >
      {/* Division info */}
      <div className="mb-3 rounded-lg bg-[#141518] border border-black/60 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            Division <span className="text-white font-medium">{division}</span>
          </span>
          {nextDivision ? (
            <span className="text-gray-400">
              Next: <span className="text-blue-300">Div {nextDivision}</span>
            </span>
          ) : (
            <span className="text-green-300">Top Division</span>
          )}
        </div>

        {nextDivision && (
          <>
            <div className="mt-2 h-2 w-full rounded-full bg-[#0f1012] overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-[width] duration-300"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Points: <span className="text-gray-200">{divisionPoints}</span> / {max} to reach Div {nextDivision}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1">
        <Link
          href="/user_profile"
          className="w-full text-left px-3 py-2 rounded-md hover:bg-[#242528] transition"
          onClick={() => setOpen(false)}
        >
          Profile
        </Link>
        <button
          onClick={() => logUserOut.mutate()}
          className="cursor-pointer w-full text-left px-3 py-2 rounded-md hover:bg-[#2a1c1c] text-red-400 hover:text-red-300 transition border border-transparent hover:border-red-900/40"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {anchorButton}
      {open && portalEl ? createPortal(menuCard, portalEl) : null}
    </>
  );
}
