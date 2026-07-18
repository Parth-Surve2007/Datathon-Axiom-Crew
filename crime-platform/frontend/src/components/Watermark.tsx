"use client";

/**
 * Watermark — full-screen fixed KSP emblem rendered as a very faint
 * blurred background element. Rendered once in the dashboard layout.
 * The image referenced is /vercel.svg in public/ (replaced by user with KSP emblem).
 */
export default function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <img
        src="/vercel.svg"
        alt=""
        className="w-[80vmin] h-[80vmin] object-contain opacity-[0.03] blur-[6px] grayscale invert"
        style={{ userSelect: 'none', draggable: 'false' } as React.CSSProperties}
      />
    </div>
  );
}
