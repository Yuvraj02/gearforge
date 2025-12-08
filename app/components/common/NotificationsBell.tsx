"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";
import axios, { AxiosResponse } from "axios";

export type NotificationType =
  | "CLAIM_PAYOUT"
  | "TOURNAMENT_PUBLISHED"
  | "TOURNAMENT_COMPLETED"
  | "BRACKET_RELEASED"
  | "MATCH_SCHEDULED"
  | "MATCH_STARTING_SOON"
  | "MATCH_RESULT"
  | "TEAM_INVITE"
  | "TEAM_INVITE_ACCEPTED"
  | "TEAM_INVITE_REJECTED"
  | "ANNOUNCEMENT"
  | "SYSTEM_MESSAGE";

export type NotificationData = {
  tournamentId?: string;
  matchId?: string;
  [key: string]: string | number | boolean | null | undefined;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
  data?: NotificationData;
  action_url?: string | null;
};

/**
 * ✅ GET notifications via axios + TanStack Query
 *
 * Replace the URL with your actual backend route.
 * If you have a pre-configured axios instance (e.g. apiClient),
 * import and use that instead of plain `axios`.
 */
const fetchNotifications = async (): Promise<Notification[]> => {
  // TODO: update URL to your backend endpoint
  const response: AxiosResponse<Notification[]> = await axios.get(
    "/api/notifications",
    {
      withCredentials: true,
    }
  );

  return response.data;
};

/**
 * ✅ POST mark notification as read via axios
 *
 * Replace the URL pattern with your actual backend route.
 */
const markNotificationReadRequest = async (id: string): Promise<void> => {
  // TODO: update URL to your backend endpoint
  await axios.post(
    `/api/notifications/${id}/read`,
    undefined,
    {
      withCredentials: true,
    }
  );
};

type Props = {
  teamCaptainId?: string;
};

export default function NotificationsBell({ teamCaptainId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);
  const anchorRef = React.useRef<HTMLButtonElement | null>(null);

  const { data, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: teamCaptainId !== undefined && teamCaptainId !== "",
    staleTime: 30_000,
  });

  const notifications: Notification[] = data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Mutation: mark single notification as read
  const markAsReadMutation = useMutation<
    void,
    Error,
    string,
    { previousNotifications: Notification[] | undefined }
  >({
    mutationKey: ["notification_mark_read"],
    mutationFn: (id: string) => markNotificationReadRequest(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousNotifications =
        queryClient.getQueryData<Notification[]>(["notifications"]);

      if (previousNotifications) {
        const updated = previousNotifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        queryClient.setQueryData<Notification[]>(["notifications"], updated);
      }

      return { previousNotifications };
    },
    onError: (
      _error: Error,
      _id: string,
      context: { previousNotifications: Notification[] | undefined } | undefined
    ) => {
      if (context && context.previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          ["notifications"],
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

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
    if (!open || anchorRef.current === null || portalEl === null) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      portalEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
      portalEl.style.left = "50%";
      portalEl.style.transform = "translateX(-50%)";
      portalEl.style.width = "90vw";
    } else {
      portalEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
      portalEl.style.left = `${rect.right + window.scrollX - 288}px`;
      portalEl.style.transform = "none";
      portalEl.style.width = "18rem";
    }
  }, [open, portalEl]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (anchorRef.current) {
        const anchor = anchorRef.current;
        const targetNode = e.target as Node | null;

        if (targetNode && (anchor === targetNode || anchor.contains(targetNode))) {
          return;
        }
      }

      if (portalEl) {
        const targetNode = e.target as Node | null;
        if (targetNode && portalEl.contains(targetNode)) {
          return;
        }
      }

      setOpen(false);
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

  const handleNotificationClick = (n: Notification) => {
    setOpen(false);

    if (!n.is_read) {
      markAsReadMutation.mutate(n.id);
    }

    if (n.action_url && n.action_url.length > 0) {
      router.push(n.action_url);
      return;
    }

    switch (n.type) {
      case "CLAIM_PAYOUT": {
        const tournamentId = n.data?.tournamentId;
        if (tournamentId && tournamentId.length > 0) {
          router.push(`/tournaments/${tournamentId}/payout`);
        } else {
          router.push("/payouts");
        }
        break;
      }
      default:
        router.push("/notifications");
        break;
    }
  };

  const anchorButton = (
    <button
      ref={anchorRef}
      onClick={() => setOpen((v) => !v)}
      className="relative inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[#1c1d20] transition"
      aria-label="Notifications"
    >
      <FiBell className="text-lg" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-500 text-[10px] leading-[16px] text-white text-center px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  const menuCard = (
    <div className="rounded-xl border border-black/70 bg-[#1b1c1e] shadow-lg shadow-black/50 p-3 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-gray-200 font-medium">Notifications</span>
        {isLoading && (
          <span className="text-[11px] text-gray-400">Loading...</span>
        )}
        {isError && (
          <span className="text-[11px] text-red-400">Failed to load</span>
        )}
      </div>

      {notifications.length === 0 && !isLoading ? (
        <div className="py-4 text-xs text-gray-400 text-center">
          No notifications yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                className={`w-full text-left px-3 py-2 rounded-md transition text-sm ${
                  n.is_read
                    ? "bg-transparent hover:bg-[#242528]"
                    : "bg-[#242528] hover:bg-[#2c2d32]"
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-100 truncate">
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-1 text-[11px] text-gray-400 line-clamp-2">
                    {n.body}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {anchorButton}
      {open && portalEl ? createPortal(menuCard, portalEl) : null}
    </>
  );
}
