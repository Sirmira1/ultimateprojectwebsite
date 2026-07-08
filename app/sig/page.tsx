"use client";

/**
 * TEMP — signature design bench v2. Deleted before ship.
 * Reference-driven: sharp double-spike N + tall A whose tail
 * explodes into a grand encircling orbit ellipse.
 */

const SIG_VIEWBOX = "0 0 1000 440";

const SIG_PATHS: { d: string; ember?: boolean }[] = [
  // N — fast zigzag: entry, tall spike, baseline, second spike, mid exit
  {
    d: "M 152 318 C 178 288, 210 200, 234 148 C 244 124, 256 99, 262 95 C 268 93, 266 110, 262 128 C 250 184, 240 262, 244 296 C 247 318, 257 314, 268 290 C 284 252, 302 186, 318 140 C 328 112, 340 94, 348 96 C 354 99, 353 116, 349 138 C 344 162, 340 190, 342 210",
  },
  // A — wide open bowl, tall stem, tail
  {
    d: "M 568 186 C 534 170, 492 192, 476 234 C 461 274, 474 308, 505 313 C 534 317, 561 289, 572 250 C 577 231, 580 208, 582 192 C 586 165, 593 136, 603 114 C 613 95, 625 82, 633 83 C 641 84, 643 98, 640 116 C 634 152, 628 210, 629 248 C 630 272, 634 282, 642 287",
  },
  // orbit — the grand ellipse encircling everything, in ember
  {
    d: "M 642 287 C 720 320, 830 338, 905 315 C 962 296, 985 262, 955 235 C 920 205, 795 196, 640 205 C 480 214, 300 224, 175 240 C 80 253, 38 275, 45 302 C 53 334, 175 370, 375 380 C 495 386, 610 372, 672 350",
    ember: true,
  },
];

export default function SigBench() {
  return (
    <div style={{ background: "#08070b", minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <svg viewBox={SIG_VIEWBOX} style={{ width: "min(92vw, 1100px)" }}>
        {SIG_PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.ember ? "#ff5c28" : "#ece7df"}
            strokeWidth={p.ember ? 2.5 : 3}
            strokeLinecap="round"
            opacity={0.95}
          />
        ))}
      </svg>
    </div>
  );
}
