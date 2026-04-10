import { useState } from 'react';
import { PriorityBadge, ConfidenceBar, EmptyState } from '../components/UIComponents';

// Mini gauge for scenario probability
function MiniGauge({ value, size = 120 }) {
  const radius = 45;
  const circumference = Math.PI * radius;
  const offset = circumference - (value || 0) * circumference;
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 60 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox="0 0 120 78">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" className="stroke-gray-200 dark:stroke-[#1f2937]" strokeWidth="8" strokeLinecap="round" />
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="gauge-arc" style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
        <text x="60" y="58" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="Inter">{pct}%</text>
      </svg>
    </div>
  );
}

export default function SimulationLab({ agentOutputs, setActivePage }) {
  const a3 = agentOutputs.agent3;

  if (!a3?.scenarios) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb] mb-6">SIMULATION LAB</h2>
        <EmptyState
          icon="🎮"
          title="No Simulations Available"
          message="Generate a brief to run scenario simulations."
          action="Go to Dashboard"
          onAction={() => setActivePage('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb]">SIMULATION LAB</h2>
        <p className="text-xs text-[#6b7280] mt-1">
          Simulation Confidence: <span className="text-gray-600 dark:text-[#9ca3af] font-mono">{Math.round((a3.simulation_confidence || 0) * 100)}%</span> ·
          Recommended: Scenario #{a3.recommended_scenario_id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {a3.scenarios.map((sc, i) => (
          <ScenarioCard key={i} scenario={sc} isRecommended={sc.id === a3.recommended_scenario_id} index={i} />
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({ scenario: sc, isRecommended, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`intel-card relative overflow-hidden animate-fade-in-up
        ${isRecommended ? 'border-[#10b981] ring-1 ring-[#10b98130]' : ''}`}
      style={{ animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 bg-[#10b981] text-[#0a0f1e] text-[10px] font-bold text-center py-1 tracking-wider">
          ★ RECOMMENDED SCENARIO
        </div>
      )}
      <div className={isRecommended ? 'mt-6' : ''}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-black text-gray-400 dark:text-[#4b5563]">#{sc.id}</span>
          <PriorityBadge level={sc.type} />
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-[#f9fafb] mb-3">{sc.title}</h4>
        <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-4 leading-relaxed">{sc.description}</p>

        {/* Probability gauge */}
        <MiniGauge value={sc.success_probability} />
        <p className="text-[10px] text-[#6b7280] text-center mb-4 uppercase tracking-wide">Success Probability</p>

        <div className="space-y-3 text-xs border-t border-gray-200 dark:border-[#1f2937] pt-4">
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Timeline</span>
            <span className="text-gray-600 dark:text-[#9ca3af] font-mono font-semibold">{sc.timeline_days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Risk Level</span>
            <PriorityBadge level={sc.risk_level} />
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b7280]">Resources</span>
            <span className="text-gray-600 dark:text-[#9ca3af] text-right max-w-[60%] leading-snug">{sc.resources_required}</span>
          </div>
        </div>

        {/* Expandable key actions */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-[11px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors w-full text-left flex items-center gap-1"
        >
          <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          Key Actions ({sc.key_actions?.length || 0})
        </button>
        {expanded && sc.key_actions && (
          <ul className="mt-2 space-y-1.5 animate-fade-in">
            {sc.key_actions.map((action, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-gray-600 dark:text-[#9ca3af]">
                <span className="text-[#3b82f6] mt-0.5">▸</span>
                {action}
              </li>
            ))}
          </ul>
        )}

        {/* Projected outcome */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
          <p className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">Projected Outcome</p>
          <p className="text-xs text-gray-800 dark:text-[#d1d5db] leading-relaxed">{sc.projected_outcome}</p>
        </div>
      </div>
    </div>
  );
}
