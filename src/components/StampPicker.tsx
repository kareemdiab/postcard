"use client";

import { useState } from "react";
import { Stamp, STAMPS, DEFAULT_STAMP_ID } from "@/components/Stamp";

export function StampPicker() {
  const [selected, setSelected] = useState<string>(DEFAULT_STAMP_ID);

  return (
    <div className="flex flex-col gap-2 text-sm text-ink/80">
      <span>Pick a stamp</span>
      <input type="hidden" name="stamp_id" value={selected} />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {STAMPS.map((stamp) => (
          <button
            key={stamp.id}
            type="button"
            onClick={() => setSelected(stamp.id)}
            aria-pressed={selected === stamp.id}
            className={`rounded-sm p-1 transition-shadow ${
              selected === stamp.id ? "ring-2 ring-teal ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
            }`}
          >
            <Stamp id={stamp.id} className="aspect-[25/32] w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
