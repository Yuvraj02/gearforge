"use client";

import React from "react";

export default function Guidelines() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-2xl bg-[#1b1c1e] border border-black/70 p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-white font-medium">Tournament Guidelines</span>
        <span className="text-gray-400 text-sm">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-3 text-sm text-gray-300 space-y-2">
          <p>
            This section will outline the complete ruleset, match procedures, reporting
            standards, and penalties. Prize pool distribution logic will also be listed here.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Eligibility and division requirements</li>
            <li>Match scheduling and forfeits</li>
            <li>Reporting results and disputes</li>
            <li>Prize money distribution and tax notes</li>
          </ul>
        </div>
      )}
    </div>
  );
}
