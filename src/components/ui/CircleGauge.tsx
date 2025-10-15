import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Chart } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type CircleGaugeProps = {
  value: number; // 0-100
  size?: number; // px
  thickness?: number; // px (ring thickness)
  color?: string; // CSS color
  trackColor?: string; // optional track color if needed later
  label?: string;
  className?: string;
};

/**
 * A non-filled circular gauge using Chart.js Doughnut.
 * - Draws a single arc from the top (-90deg) clockwise to `value` percent.
 * - Thin ring (controlled by cutout) to resemble a boundary line.
 * - No remaining track is drawn (clean boundary arc only).
 */
export default function CircleGauge({
  value,
  size = 200,
  thickness = 12,
  color = "hsl(142 72% 29%)",
  label,
  className,
}: CircleGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const [displayed, setDisplayed] = useState(0);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const start = performance.now();
    const durationMs = 1000;
    const startVal = displayed;
    const delta = clamped - startVal;

    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(startVal + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  const cutout = `${Math.max(0, Math.min(98, 100 - thickness))}%`;

  const data = useMemo(() => ({
    labels: [],
    datasets: [
      // Foreground arc only (no background ring)
      {
        data: [100],
        backgroundColor: ["#0000"],
        borderColor: [color],
        borderWidth: thickness,
        circumference: (displayed / 100) * 360,
        rotation: -90,
        cutout,
        hoverOffset: 0,
        borderRadius: Math.max(0, Math.min(thickness / 2, 12)),
      },
    ],
  }) as const, [displayed, color, cutout, thickness]);

  const endCapPlugin = useMemo(() => ({
    id: "circleGaugeEndCap",
    afterDatasetsDraw(c: Chart) {
      const chart = c as Chart;
      const ctx = chart.ctx as CanvasRenderingContext2D;
      const meta = chart.getDatasetMeta(0); // foreground arc dataset
      const arc: any = meta.data[0];
      if (!arc) return;

      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      const radius = (arc.outerRadius + arc.innerRadius) / 2;
      const startAngle = -Math.PI / 2; // top
      const endAngle = startAngle + (displayed / 100) * Math.PI * 2;

      const capX = centerX + radius * Math.cos(endAngle);
      const capY = centerY + radius * Math.sin(endAngle);

      // Glow stroke overlay along the arc
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();
      ctx.restore();

      // End cap dot
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(capX, capY, Math.max(3, thickness * 0.45), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  }), [displayed, color, thickness]);

  const options = useMemo(() => ({
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      duration: 900,
      easing: "easeOutCubic",
    },
  }) as const, []);

  return (
    <div className={className} style={{ position: "relative", width: size, height: size }}>
      <Doughnut
        data={data}
        options={options}
        width={size}
        height={size}
        plugins={[endCapPlugin]}
        ref={(instance) => {
          // @ts-expect-error react-chartjs-2 typing
          chartRef.current = instance?.chart ?? null;
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          textAlign: "center",
          flexDirection: "column",
        }}
      >
        <div className="text-2xl font-semibold">{Math.round(displayed)}%</div>
        {label && <div className="text-xs text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  );
}


