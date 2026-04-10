import { useEffect, useRef, useState } from 'react';

// ============================================================
// Threat Level Gauge (SVG arc)
// ============================================================
export function ThreatGauge({ score = 0, size = 200 }) {
  const radius = 80;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 10) * circumference;

  const getColor = (s) => {
    if (s <= 3) return '#10b981';
    if (s <= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s <= 3) return 'LOW';
    if (s <= 6) return 'MEDIUM';
    if (s <= 8) return 'HIGH';
    return 'CRITICAL';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          className="stroke-gray-200 dark:stroke-[#1f2937]"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-arc"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        {/* Score text */}
        <text x="100" y="85" textAnchor="middle" fill={color}
          fontSize="42" fontWeight="800" fontFamily="Inter">
          {score}
        </text>
        <text x="100" y="105" textAnchor="middle" fill="#9ca3af"
          fontSize="12" fontWeight="500" fontFamily="Inter">
          / 10
        </text>
      </svg>
      <span
        className="badge mt-2"
        style={{
          background: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
          fontSize: '0.8rem',
          padding: '4px 16px',
        }}
      >
        {getLabel(score)}
      </span>
    </div>
  );
}

// ============================================================
// Animated Counter
// ============================================================
export function AnimatedNumber({ value, duration = 2000, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value == null) return;
    const target = Number(value);
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(target * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================
// Priority Badge
// ============================================================
export function PriorityBadge({ level }) {
  const config = {
    HIGH: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
    MEDIUM: { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
    LOW: { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
    CRITICAL: { bg: '#ef444430', text: '#ef4444', border: '#ef4444' },
    IMMEDIATE: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
    '24H': { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
    '72H': { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f640' },
    DIPLOMATIC: { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f640' },
    MILITARY: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
    ECONOMIC: { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
    SEVERE: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
    MODERATE: { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
    MILD: { bg: '#10b98120', text: '#10b981', border: '#10b98140' },
    military: { bg: '#ef444420', text: '#ef4444', border: '#ef444440' },
    political: { bg: '#8b5cf620', text: '#8b5cf6', border: '#8b5cf640' },
    humanitarian: { bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b40' },
    economic: { bg: '#3b82f620', text: '#3b82f6', border: '#3b82f640' },
  };

  const c = config[level] || { bg: '#374151', text: '#9ca3af', border: '#4b5563' };

  return (
    <span
      className="badge"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {level}
    </span>
  );
}

// ============================================================
// Confidence Bar
// ============================================================
export function ConfidenceBar({ value, color = '#3b82f6' }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="progress-track flex-1">
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            animation: 'progressFill 1s ease-out',
          }}
        />
      </div>
      <span className="text-xs font-mono text-gray-600 dark:text-[#9ca3af] w-10 text-right">{pct}%</span>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================
export function EmptyState({ icon = '📊', title, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-[#9ca3af] max-w-md mb-6">{message}</p>
      {action && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-lg bg-[#ef4444] text-white font-semibold text-sm
            hover:bg-[#dc2626] transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ============================================================
// Collapsible Raw Output
// ============================================================
export function RawOutput({ data, label = 'Raw Agent Output' }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  return (
    <div className="mt-3 border-t border-gray-200 dark:border-[#1f2937] pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 dark:text-[#4b5563] hover:text-gray-600 dark:text-[#9ca3af] transition-colors flex items-center gap-1"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {label}
      </button>
      {open && (
        <pre className="mt-2 p-3 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg text-[10px] text-[#6b7280] overflow-x-auto max-h-60 overflow-y-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
