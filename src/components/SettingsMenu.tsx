"use client";

import { useEffect, useRef, useState } from "react";

export function SettingsMenu({
  signOutAction,
}: {
  signOutAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hover:text-teal"
      >
        Settings
      </button>

      {open && (
        <div
          role="menu"
          className="card absolute right-0 top-full z-10 mt-2 min-w-32 overflow-hidden py-1"
        >
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left hover:bg-stamp/10 hover:text-red"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
