import { useState } from 'react';
import { PriorityBadge, ConfidenceBar, EmptyState } from '../components/UIComponents';

export default function OsintExplorer({ agentOutputs, setActivePage }) {
  const a1 = agentOutputs.agent1;
  const [search, setSearch] = useState('');

  if (!a1?.findings) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb] mb-6">OSINT EXPLORER</h2>
        <EmptyState
          icon="🔍"
          title="No OSINT Data Available"
          message="Run a brief generation first to explore OSINT findings."
          action="Go to Dashboard"
          onAction={() => setActivePage('dashboard')}
        />
      </div>
    );
  }

  const filtered = a1.findings.filter(f =>
    !search || 
    f.headline.toLowerCase().includes(search.toLowerCase()) ||
    f.summary.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    f.location.toLowerCase().includes(search.toLowerCase())
  );

  const categoryColors = {
    military: '#ef4444',
    political: '#8b5cf6',
    humanitarian: '#f59e0b',
    economic: '#3b82f6',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb]">OSINT EXPLORER</h2>
          <p className="text-xs text-[#6b7280] mt-1">
            Region: <span className="text-gray-600 dark:text-[#9ca3af] font-medium">{a1.region}</span> · 
            {a1.total_findings} findings · 
            {a1.alert_flag && <span className="text-[#ef4444] ml-1">⚠ ALERT FLAG</span>}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search findings..."
          className="w-full sm:w-72 px-4 py-2 rounded-lg bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-[#1f2937] text-sm
            text-gray-900 dark:text-[#f9fafb] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((f, i) => (
          <div key={f.id || i} className="intel-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <PriorityBadge level={f.category} />
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: categoryColors[f.category] || '#6b7280' }}
              />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#f9fafb] mb-2 leading-snug">{f.headline}</h4>
            <p className="text-xs text-gray-600 dark:text-[#9ca3af] leading-relaxed mb-3">{f.summary}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b7280]">
              <span>📰 {f.source}</span>
              <span>📍 {f.location}</span>
              <span>📅 {f.date}</span>
            </div>
            <div className="mt-3">
              <span className="text-[10px] text-[#6b7280] uppercase">Confidence</span>
              <ConfidenceBar value={f.confidence} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#6b7280] text-sm py-12">No findings match "{search}"</p>
      )}
    </div>
  );
}
