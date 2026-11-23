import type { SVGProps } from 'react';

/**
 * The thin octagonal frame that sits around the project card.
 * Matches the reference site exactly: an SVG polygon drawn 12px outside
 * the card, with a non-scaling stroke so the border stays 1px at any size.
 */
export function OctagonFrame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible text-ink/40"
      {...props}
    >
      <polygon
        points="7,0 93,0 100,5 100,95 93,100 7,100 0,95 0,5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** CSS clip-path that cuts the card corners at 45°. */
export const OCTAGON_CLIP =
  'polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0 calc(100% - 22px), 0 22px)';
