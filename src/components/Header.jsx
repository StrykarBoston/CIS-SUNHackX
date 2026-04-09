import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 bg-[#0d1220] border-b border-[#1f2937]"
      style={{ backdropFilter: 'blur(12px)' }}>
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <path d="M16 2L4 8v8c0 7.2 5.12 13.92 12 16 6.88-2.08 12-8.8 12-16V8L16 2z"
            fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M16 8l-6 3.5v5c0 4.2 2.56 8.12 6 9.5 3.44-1.38 6-5.3 6-9.5v-5L16 8z"
            fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1" />
          <circle cx="16" cy="16" r="3" fill="#ef4444" />
        </svg>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#ef4444] tracking-wide leading-tight">
            CONFLICT.AI
          </h1>
        </div>
      </div>

      {/* Center — Subtitle (hidden on mobile) */}
      <div className="hidden md:block text-center">
        <p className="text-xs text-[#9ca3af] tracking-[0.2em] font-medium uppercase">
          Autonomous Intelligence & Prediction System
        </p>
      </div>

      {/* Right — Clock & Status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-mono text-[#f9fafb] tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-[10px] text-[#9ca3af] font-mono">
            {time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b98115] border border-[#10b98130]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
          </span>
          <span className="text-xs font-semibold text-[#10b981] uppercase tracking-wide hidden sm:inline">
            System Active
          </span>
        </div>
      </div>
    </header>
  );
}
