import React from "react";

type CircularProgressProps = {
  value: number; // 0-100
  size?: number; // px
  thickness?: number; // px
  label?: string;
  className?: string;
  color?: string; // CSS color for the arc
};

/**
 * Displays a circular, multi-color progress ring using a conic-gradient.
 * - Arc starts at the top (−90deg) and fills clockwise to `value` percent.
 * - The filled arc uses a multi-color gradient: green → yellow → orange → red.
 * - The remainder of the circle is a subtle track.
 */
export function CircularProgress({
  value,
  size = 112,
  thickness = 12,
  label,
  className,
  color = "hsl(142 72% 29%)",
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  // Track style (full ring background)
  const trackStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "9999px",
    backgroundColor: "hsl(var(--muted))",
    WebkitMask:
      `radial-gradient(calc(50% - ${thickness}px),#0000 98%,#000 100%)`,
    mask: `radial-gradient(calc(50% - ${thickness}px),#0000 98%,#000 100%)`,
    position: "relative",
  };

  // Filled arc style up to `clamped` percent with a single color
  const fillStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "9999px",
    backgroundImage:
      `conic-gradient(from -90deg,
        ${color} ${clamped}%,
        #0000 ${clamped}%,
        #0000 100%)`,
    WebkitMask:
      `radial-gradient(calc(50% - ${thickness}px),#0000 98%,#000 100%)`,
    mask: `radial-gradient(calc(50% - ${thickness}px),#0000 98%,#000 100%)`,
  };

  const centerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    pointerEvents: "none",
  };

  return (
    <div className={className} style={{ width: size, height: size, position: "relative" }}>
      <div style={trackStyle} />
      <div style={fillStyle} />
      <div style={centerStyle}>
        <div className="text-base font-semibold">
          {Math.round(clamped)}%
        </div>
        {label && <div className="text-xs text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

export default CircularProgress;


