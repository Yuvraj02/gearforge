// models/notification.ts

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

export interface NotificationData {
  tournamentId?: string;
  matchId?: string;
  // extend as needed for other notification types
  [key: string]: string | number | boolean | null | undefined;
}

export interface Notification {
  id: string;
  teamCaptainId: string;
  teamId: string | null;
  tournamentId: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  data?: NotificationData;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string; // ISO timestamp
}
