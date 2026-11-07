type StampId =
  | "compass"
  | "airmail"
  | "summit"
  | "seaside"
  | "sunshine"
  | "love"
  | "dove"
  | "paradise";

type StampDef = {
  id: StampId;
  caption: string;
  bg: string;
  fg: string;
  icon: (fg: string) => React.ReactNode;
};

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const STAMPS: StampDef[] = [
  {
    id: "compass",
    caption: "EXPLORE",
    bg: "#3f6a63",
    fg: "#f4ecd8",
    icon: (fg) => (
      <>
        <circle r="15" fill="none" stroke={fg} strokeWidth="2" />
        <polygon points="0,-9 4,2 0,9 -4,2" fill={fg} />
        <circle r="1.6" fill={fg} />
      </>
    ),
  },
  {
    id: "airmail",
    caption: "AIR MAIL",
    bg: "#b1473b",
    fg: "#f4ecd8",
    icon: (fg) => (
      <>
        <path d="M -14 9 L 14 -11 L -2 2 Z" fill={fg} />
        <path d="M -2 2 L 14 -11 L 2 11 Z" fill={fg} opacity="0.65" />
      </>
    ),
  },
  {
    id: "summit",
    caption: "SUMMIT",
    bg: "#7c8c6b",
    fg: "#f4ecd8",
    icon: (fg) => (
      <>
        <circle cx="8" cy="-10" r="3" fill={fg} />
        <polygon points="-15,10 -4,-8 4,6" fill={fg} />
        <polygon points="-2,10 7,-10 16,10" fill={fg} opacity="0.75" />
      </>
    ),
  },
  {
    id: "seaside",
    caption: "SEASIDE",
    bg: "#5b7c99",
    fg: "#f4ecd8",
    icon: (fg) => (
      <>
        <polygon points="2,-14 2,8 -10,8" fill={fg} />
        <line x1="2" y1="-14" x2="2" y2="10" stroke={fg} strokeWidth="1.5" />
        <path d="M -12 10 L 16 10 L 10 16 L -6 16 Z" fill={fg} />
        <path
          d="M -16 21 Q -8 17 0 21 T 16 21"
          fill="none"
          stroke={fg}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "sunshine",
    caption: "SUNSHINE",
    bg: "#d9a441",
    fg: "#2b2420",
    icon: (fg) => (
      <>
        <circle r="7" fill={fg} />
        {RAY_ANGLES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={Math.cos(rad) * 10}
              y1={Math.sin(rad) * 10}
              x2={Math.cos(rad) * 16}
              y2={Math.sin(rad) * 16}
              stroke={fg}
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </>
    ),
  },
  {
    id: "love",
    caption: "WITH LOVE",
    bg: "#a3603f",
    fg: "#f4ecd8",
    icon: (fg) => <path d="M0,10 C-14,-2 -10,-14 0,-6 C10,-14 14,-2 0,10 Z" fill={fg} />,
  },
  {
    id: "dove",
    caption: "PAR AVION",
    bg: "#d3bd94",
    fg: "#2b2420",
    icon: (fg) => (
      <path
        d="M -16 2 Q -8 -10 0 0 Q 8 -10 16 2"
        fill="none"
        stroke={fg}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "paradise",
    caption: "PARADISE",
    bg: "#2b2420",
    fg: "#d9a441",
    icon: (fg) => (
      <>
        <path d="M0 14 Q 4 0 0 -10" fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M0 -10 Q -14 -14 -16 -4" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <path d="M0 -10 Q 14 -14 16 -4" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <path d="M0 -10 Q -10 -18 -4 -22" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <path d="M0 -10 Q 10 -18 4 -22" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
];

export const DEFAULT_STAMP_ID: StampId = "compass";

const W = 100;
const H = 128;
const HOLE_R = 3.5;
const HOLE_INSET = 6;
const HOLE_STEP = 11;

function ticks(length: number, inset: number, step: number) {
  const result: number[] = [];
  for (let pos = inset; pos <= length - inset + 0.001; pos += step) {
    result.push(pos);
  }
  return result;
}

const xTicks = ticks(W, HOLE_INSET, HOLE_STEP);
const yTicks = ticks(H, HOLE_INSET, HOLE_STEP);

export function Stamp({
  id,
  className,
}: {
  id?: string | null;
  className?: string;
}) {
  const def = STAMPS.find((s) => s.id === id) ?? STAMPS.find((s) => s.id === DEFAULT_STAMP_ID)!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${def.caption} stamp`}>
      <rect x="0" y="0" width={W} height={H} fill={def.bg} />
      {xTicks.map((x) => (
        <g key={`x-${x}`}>
          <circle cx={x} cy={0} r={HOLE_R} fill="var(--color-cream)" />
          <circle cx={x} cy={H} r={HOLE_R} fill="var(--color-cream)" />
        </g>
      ))}
      {yTicks.map((y) => (
        <g key={`y-${y}`}>
          <circle cx={0} cy={y} r={HOLE_R} fill="var(--color-cream)" />
          <circle cx={W} cy={y} r={HOLE_R} fill="var(--color-cream)" />
        </g>
      ))}
      <rect
        x="7"
        y="7"
        width={W - 14}
        height={H - 14}
        fill="none"
        stroke={def.fg}
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <g transform={`translate(${W / 2}, ${H * 0.42})`}>{def.icon(def.fg)}</g>
      <text
        x={W / 2}
        y={H - 15}
        textAnchor="middle"
        fontSize="9"
        fill={def.fg}
        fontFamily="var(--font-type)"
        letterSpacing="0.5"
      >
        {def.caption}
      </text>
    </svg>
  );
}
