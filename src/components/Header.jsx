import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-[#0d1220] border-b border-gray-200 dark:border-[#1f2937]"
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
        <p className="text-xs text-gray-600 dark:text-[#9ca3af] tracking-[0.2em] font-medium uppercase">
          Autonomous Intelligence & Prediction System
        </p>
      </div>

      {/* Right — Clock & Status */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2937] transition-colors text-gray-600 dark:text-gray-300"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-mono text-gray-900 dark:text-[#f9fafb] tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-[10px] text-gray-600 dark:text-[#9ca3af] font-mono">
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
