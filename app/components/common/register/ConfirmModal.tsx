"use client";

import React from "react";

type Props = {
  open: boolean;
  teamName: string;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

export default function ConfirmModal({
  open,
  teamName,
  onClose,
  onConfirm,
  disabled,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="w-[95%] max-w-2xl rounded-2xl bg-[#1b1c1e] border border-black/70 p-5">
        <h3 className="text-white text-lg font-semibold">Confirm Registration</h3>

        <div className="mt-3 space-y-3 text-sm text-gray-300">
          <div className="rounded-xl bg-[#141518] border border-black/60 p-3">
            <p className="font-medium text-white mb-1">Important</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Enter your <span className="text-white font-medium">Team Name</span> exactly as it appears in-game. Any
                mismatch or unregistered team will result in disqualification with{" "}
                <span className="text-white font-medium">no refund</span>.
              </li>
              <li>
                You are registering team <span className="text-white font-medium">{teamName || "(unnamed)"}</span>.
                Verify all member usernames and emails are correct before proceeding.
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#141518] border border-black/60 p-3">
            <p className="font-medium text-white mb-1">Fair-Play & Cheating Guidelines</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No third-party tools, overlays, automation, or exploits.</li>
              <li>Account sharing and smurfing are prohibited.</li>
              <li>All gameplay must be recorded when requested by admins.</li>
              <li>Admins reserve the right to request proof and disqualify teams for any rule violations.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-[#141518] hover:bg-[#1c1d20] text-gray-300 px-3 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            disabled={disabled}
            onClick={onConfirm}
            className={`px-3 py-2 rounded-lg ${
              disabled
                ? "bg-[#222327] text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            Confirm Registration
          </button>
        </div>
      </div>
    </div>
  );
}
