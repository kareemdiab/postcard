"use client";

import { useState } from "react";
import Image from "next/image";
import { Stamp } from "@/components/Stamp";

type PostcardCardProps = {
  imageUrl: string;
  message: string;
  senderLabel: string;
  createdAt: string;
  recipientLabel?: string;
  stampId?: string | null;
};

export function PostcardCard({
  imageUrl,
  message,
  senderLabel,
  createdAt,
  recipientLabel,
  stampId,
}: PostcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  const postmark = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="group block w-full max-w-sm text-left [perspective:1200px]"
      aria-label="Flip postcard"
    >
      <div
        className={`relative h-64 w-full rounded-sm shadow-postcard transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front: photo */}
        <div className="absolute inset-0 -rotate-1 overflow-hidden rounded-sm border-2 border-stamp/40 bg-kraft transition-transform duration-300 [backface-visibility:hidden] group-hover:rotate-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2 py-0.5 font-type text-[10px] text-ink">
            {senderLabel}
          </span>
        </div>

        {/* Back: message */}
        <div className="absolute inset-0 flex rounded-sm border-2 border-stamp/40 bg-cream p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex-1 overflow-hidden border-r border-dashed border-stamp/40 pr-3">
            <p className="line-clamp-6 font-script text-xl leading-snug text-ink">
              {message}
            </p>
          </div>
          <div className="flex w-24 flex-col items-end justify-between pl-3">
            <Stamp id={stampId} className="h-16 w-12 rotate-3 drop-shadow-sm" />
            <div className="text-right">
              {recipientLabel && (
                <p className="font-type text-[10px] text-ink/70">
                  To: {recipientLabel}
                </p>
              )}
              <p className="font-type text-[10px] text-ink/50">{postmark}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
