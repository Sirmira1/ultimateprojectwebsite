/**
 * The signature — hand-drawn cubic bézier pen strokes, autograph style:
 * a fast double-spike N, a tall open A, and a grand ember orbit that
 * encircles the whole mark. Pen order matters: particles are written
 * along these paths in sequence by the scroll-driven light pen.
 *
 * To swap in a real signature later: replace these path strings
 * (same pen-stroke order) and everything else just works.
 */

export const SIG_VIEWBOX = "0 0 1000 440";

export const SIG_PATHS: { d: string; ember?: boolean }[] = [
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

const gauss = () => Math.random() + Math.random() + Math.random() - 1.5;

/**
 * Samples `count` points along the signature (in pen order) into world
 * coordinates. Returns positions (xyz per point). Because points are laid
 * down sequentially, particle i's pen-progress is simply i/count.
 * Client-only: uses an offscreen SVG for path measurement.
 */
export function sampleSignature(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", SIG_VIEWBOX);
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  document.body.appendChild(svg);

  const els = SIG_PATHS.map((p) => {
    const el = document.createElementNS(ns, "path");
    el.setAttribute("d", p.d);
    svg.appendChild(el);
    return el;
  });
  const lengths = els.map((el) => el.getTotalLength());
  const total = lengths.reduce((a, b) => a + b, 0);

  // world mapping: ~12 units wide, centered, y flipped
  const S = 12 / 1000;
  const CX = 512;
  const CY = 234;

  let pathIdx = 0;
  let consumed = 0; // total length consumed by previous paths
  for (let i = 0; i < count; i++) {
    const target = (i / count) * total;
    while (pathIdx < els.length - 1 && target > consumed + lengths[pathIdx]) {
      consumed += lengths[pathIdx];
      pathIdx++;
    }
    const pt = els[pathIdx].getPointAtLength(target - consumed);
    // most particles hug the stroke; a few form a wider ink halo
    const halo = Math.random() < 0.12 ? 0.5 : 0.055;
    positions[i * 3] = (pt.x - CX) * S + gauss() * halo;
    positions[i * 3 + 1] = -(pt.y - CY) * S + gauss() * halo;
    positions[i * 3 + 2] = gauss() * halo * 1.4;
  }

  document.body.removeChild(svg);
  return positions;
}
