import { useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
//  FretForge — TuningMeter
//  SVG arc gauge with an animated needle showing cents offset
//  Green = in tune (±5 cents), amber = close, red = way off
//  The visual centerpiece of the tuner page
// ═══════════════════════════════════════════════════════════════

// Tuning tolerance thresholds (in cents)
const IN_TUNE_THRESHOLD = 5; // ±5 cents = "in tune" (green zone)
const CLOSE_THRESHOLD = 15; // ±15 cents = "close" (amber zone)
// Beyond ±15 cents = "off" (red zone)

export default function TuningMeter({ cents = 0, isActive = false, note = null }) {
  // ─── Gauge geometry ─────────────────────────────────────────
  // The arc spans from -50 to +50 cents mapped to a 240° arc
  // Center of SVG = (200, 200), radius = 160
  const cx = 200;
  const cy = 200;
  const radius = 155;
  const startAngle = -120; // degrees from top (left side of arc)
  const endAngle = 120; // degrees from top (right side of arc)
  const totalArcDeg = endAngle - startAngle; // 240°

  // ─── Color based on accuracy ────────────────────────────────
  const tuningStatus = useMemo(() => {
    if (!isActive || note === null) return "inactive";
    const absCents = Math.abs(cents);
    if (absCents <= IN_TUNE_THRESHOLD) return "in-tune";
    if (absCents <= CLOSE_THRESHOLD) return "close";
    return "off";
  }, [cents, isActive, note]);

  const statusColors = {
    inactive: { needle: "#475569", glow: "transparent", text: "#475569" },
    "in-tune": { needle: "#00ff9f", glow: "#00ff9f", text: "#00ff9f" },
    close: { needle: "#ffb000", glow: "#ffb000", text: "#ffb000" },
    off: { needle: "#ff2d6b", glow: "#ff2d6b", text: "#ff2d6b" },
  };
  const colors = statusColors[tuningStatus];

  // ─── Convert angle to SVG coordinates ───────────────────────
  function polarToCartesian(angleDeg, r = radius) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  // ─── Build the arc path ─────────────────────────────────────
  function describeArc(startDeg, endDeg, r = radius) {
    const start = polarToCartesian(endDeg, r);
    const end = polarToCartesian(startDeg, r);
    const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  // ─── Needle angle calculation ───────────────────────────────
  // Map cents (-50 to +50) to the arc angle range (-120° to +120°)
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const needleAngle = isActive && note
    ? startAngle + ((clampedCents + 50) / 100) * totalArcDeg
    : 0; // Center when inactive

  const needleTip = polarToCartesian(needleAngle, radius - 15);
  const needleBase1 = polarToCartesian(needleAngle - 90, 6);
  const needleBase2 = polarToCartesian(needleAngle + 90, 6);

  // ─── Tick marks ─────────────────────────────────────────────
  const ticks = [];
  for (let c = -50; c <= 50; c += 10) {
    const angle = startAngle + ((c + 50) / 100) * totalArcDeg;
    const outerPoint = polarToCartesian(angle, radius + 8);
    const isMajor = c === 0 || c === -50 || c === 50 || c === -25 || c === 25;
    const innerPoint = polarToCartesian(angle, radius + (isMajor ? -12 : -6));
    const labelPoint = polarToCartesian(angle, radius + 22);
    ticks.push({ c, angle, outerPoint, innerPoint, labelPoint, isMajor });
  }

  // ─── Status label ───────────────────────────────────────────
  const statusLabel = useMemo(() => {
    if (!isActive || note === null) return "Play a string";
    if (tuningStatus === "in-tune") return "In Tune!";
    if (cents < 0) return "Tune Up ↑";
    return "Tune Down ↓";
  }, [isActive, note, tuningStatus, cents]);

  return (
    <div className="tuning-meter" style={styles.container}>
      <svg viewBox="0 0 400 350" style={styles.svg}>
        <defs>
          {/* Glow filter for the needle and active arc */}
          <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc track */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#1a2332"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Green center zone indicator (±5 cents) */}
        {(() => {
          const zoneStart = startAngle + ((50 - IN_TUNE_THRESHOLD) / 100) * totalArcDeg;
          const zoneEnd = startAngle + ((50 + IN_TUNE_THRESHOLD) / 100) * totalArcDeg;
          return (
            <path
              d={describeArc(zoneStart, zoneEnd)}
              fill="none"
              stroke="#00ff9f22"
              strokeWidth="20"
              strokeLinecap="round"
            />
          );
        })()}

        {/* Tick marks */}
        {ticks.map((tick) => (
          <g key={tick.c}>
            <line
              x1={tick.innerPoint.x}
              y1={tick.innerPoint.y}
              x2={tick.outerPoint.x}
              y2={tick.outerPoint.y}
              stroke={tick.c === 0 ? "#00ff9f88" : "#475569"}
              strokeWidth={tick.isMajor ? 2 : 1}
            />
            {tick.isMajor && (
              <text
                x={tick.labelPoint.x}
                y={tick.labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#475569"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
              >
                {tick.c > 0 ? `+${tick.c}` : tick.c}
              </text>
            )}
          </g>
        ))}

        {/* Center line marker */}
        {(() => {
          const centerOuter = polarToCartesian(0, radius + 10);
          const centerInner = polarToCartesian(0, radius - 14);
          return (
            <line
              x1={centerInner.x}
              y1={centerInner.y}
              x2={centerOuter.x}
              y2={centerOuter.y}
              stroke="#00ff9f"
              strokeWidth="2.5"
              opacity="0.6"
            />
          );
        })()}

        {/* Needle */}
        <g filter={isActive && note ? "url(#needleGlow)" : undefined}>
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={colors.needle}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          {/* Needle center dot */}
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill={colors.needle}
            opacity="0.9"
            style={{ transition: "fill 0.2s ease" }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="4"
            fill="#0a0e17"
          />
        </g>

        {/* Note display — big and centered */}
        <text
          x={cx}
          y={cy + 55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive && note ? colors.text : "#475569"}
          fontSize="44"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          filter={tuningStatus === "in-tune" ? "url(#softGlow)" : undefined}
          style={{ transition: "fill 0.2s ease" }}
        >
          {note ? `${note.note}${note.octave}` : "—"}
        </text>

        {/* Cents display */}
        <text
          x={cx}
          y={cy + 95}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive && note ? colors.text : "#475569"}
          fontSize="14"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="500"
          opacity="0.8"
          style={{ transition: "fill 0.2s ease" }}
        >
          {note ? `${cents > 0 ? "+" : ""}${cents} cents` : ""}
        </text>

        {/* Status label */}
        <text
          x={cx}
          y={cy + 118}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          fontSize="13"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
          letterSpacing="0.5"
          style={{ transition: "fill 0.2s ease" }}
        >
          {statusLabel}
        </text>
      </svg>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "420px",
    margin: "0 auto",
  },
  svg: {
    width: "100%",
    height: "auto",
  },
};
