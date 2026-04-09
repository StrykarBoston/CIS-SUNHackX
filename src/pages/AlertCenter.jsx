import { PriorityBadge, EmptyState } from '../components/UIComponents';

export default function AlertCenter({ briefHistory, setBriefHistory, viewBrief, setActivePage }) {
  if (!briefHistory || briefHistory.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-[#f9fafb] mb-6">PAST INTELLIGENCE BRIEFS</h2>
        <EmptyState
          icon="📂"
          title="No Briefs Generated Yet"
          message="Generate your first intelligence brief from the Dashboard to see it here."
          action="Go to Dashboard"
          onAction={() => setActivePage('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#f9fafb]">PAST INTELLIGENCE BRIEFS</h2>
        <button
          onClick={() => setBriefHistory([])}
          className="text-xs text-[#6b7280] hover:text-[#ef4444] transition-colors px-3 py-1.5 rounded border border-[#1f2937] hover:border-[#ef444440]"
        >
          Clear History
        </button>
      </div>
      <div className="intel-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937] text-[#6b7280] text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-3">#</th>
              <th className="text-left py-3 px-3">Region / Topic</th>
              <th className="text-left py-3 px-3">Threat Level</th>
              <th className="text-left py-3 px-3">Score</th>
              <th className="text-left py-3 px-3">Time</th>
              <th className="text-left py-3 px-3">Generated At</th>
              <th className="text-left py-3 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {briefHistory.map((brief, i) => {
              const a5 = brief.agent5 || {};
              return (
                <tr key={i} className={`border-b border-[#1f293750] hover:bg-[#1f293730] transition-colors
                  ${i % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0d1220]'}`}>
                  <td className="py-3 px-3 text-[#6b7280] font-mono text-xs">{i + 1}</td>
                  <td className="py-3 px-3 text-[#d1d5db] font-medium">{brief.topic}</td>
                  <td className="py-3 px-3">
                    <PriorityBadge level={a5.threat_level || brief.agent2?.threat_level || 'N/A'} />
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-lg font-bold text-[#f9fafb]">{a5.threat_score || brief.agent2?.threat_score || '–'}</span>
                    <span className="text-xs text-[#6b7280]">/10</span>
                  </td>
                  <td className="py-3 px-3 text-[#9ca3af] font-mono text-xs">{brief.totalSeconds}s</td>
                  <td className="py-3 px-3 text-[#9ca3af] text-xs">
                    {new Date(brief.generatedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => viewBrief(brief)}
                      className="px-3 py-1.5 rounded-md bg-[#3b82f620] text-[#3b82f6] text-xs font-semibold
                        hover:bg-[#3b82f630] transition-colors border border-[#3b82f640]"
                    >
                      View Brief
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
