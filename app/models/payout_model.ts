// models/payout.ts

export type PayoutMethod = "UPI" | "BANK";

export type PayoutStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export interface Payout {
  id: string;
  teamCaptainId: string;
  teamId: string;
  tournamentId: string;
  amount: number;
  method: PayoutMethod;

  // UPI-specific
  upiId?: string;

  // Bank-specific
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;

  status: PayoutStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
