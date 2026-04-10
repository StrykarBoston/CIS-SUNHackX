import { useState } from 'react';
import { ThreatGauge, AnimatedNumber, PriorityBadge, ConfidenceBar, RawOutput } from '../components/UIComponents';
import LiveOSINTMap from '../components/LiveOSINTMap';

// ============================================================
// Agent Progress Row
// ============================================================
function AgentProgressRow({ agent, index }) {
  const icons = {
    waiting: '⏳',
    running: '🔄',
    retrying: '🔁',
    complete: '✅',
    error: '❌',
  };
  const descriptions = [
    'Ingesting & filtering data from OSINT sources...',
    'Detecting escalation signals & sentiment analysis...',
    'Generating response options & modeling civilian impact...',
    'Compiling commander-grade brief with traceable citations...',
    'Generating final commander brief output...',
  ];
  const agentColors = ['#3b82f6', '#22c55e', '#f59e0b', '#6b7280', '#991b1b'];

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300
      ${agent.status === 'running' ? 'bg-[#1f293740] border-[#3b82f640] animate-pulse-glow' :
        agent.status === 'complete' ? 'bg-[#10b98108] border-[#10b98130]' :
        agent.status === 'error' ? 'bg-[#ef444408] border-[#ef444430]' :
        'bg-transparent border-gray-200 dark:border-[#1f293730]'}`}
    >
      <span className={`text-lg ${agent.status === 'running' ? 'animate-spin-slow' : ''}`}>
        {icons[agent.status] || '⏳'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: agentColors[index] }}
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-[#f9fafb]">
            Agent {agent.id} — {agent.name}
          </span>
        </div>
        <p className="text-xs text-[#6b7280] truncate">{descriptions[index]}</p>
        {agent.status === 'complete' && (
          <div className="progress-track mt-1.5">
            <div className="progress-fill w-full" style={{ background: agentColors[index], animation: 'progressFill 0.5s ease-out' }} />
          </div>
        )}
        {agent.status === 'running' && (
          <div className="progress-track mt-1.5">
            <div className="progress-fill w-2/3" style={{ background: agentColors[index], animation: 'progressFill 2s ease-out' }} />
          </div>
        )}
      </div>
      <span className="text-xs font-mono text-[#6b7280] w-10 text-right tabular-nums">
        {agent.status === 'complete' ? `${agent.seconds}s` : ''}
      </span>
    </div>
  );
}

// ============================================================
// Dashboard Page
// ============================================================
export default function Dashboard({
  userInput, setUserInput, isLoading, generateBrief,
  agentStatuses, elapsedSeconds, currentBrief, agentOutputs,
  totalSeconds, error,
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const a1 = agentOutputs.agent1;
  const a2 = agentOutputs.agent2;
  const a3 = agentOutputs.agent3;
  const a4 = agentOutputs.agent4;
  const a5 = agentOutputs.agent5;

  // Commander Brief is a5 (Agent 5 = Output)
  const brief = a5;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Civilian impact comes from Agent 3 (Scenario Simulator) now
  const civilianImpact = a3?.overall_civilian_impact;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ---- Generate Brief Card ---- */}
      <div className="intel-card border-l-4 border-l-[#ef4444]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb] mb-1">
          GENERATE INTELLIGENCE BRIEF
        </h2>
        <p className="text-sm text-[#6b7280] mb-4">
          5 specialized AI agents will analyze, simulate, and compile a commander-grade brief
        </p>

        {/* Data Sources Banner */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['News APIs', 'Social Media', 'RSS/Feeds', 'Wikipedia', 'Web Search'].map(src => (
            <span key={src} className="badge bg-gray-100 dark:bg-[#1f2937] text-[#6b7280] border border-gray-300 dark:border-[#374151] text-[10px]">
              {src}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateBrief()}
            placeholder="Enter region or conflict topic... (e.g. South China Sea, Ukraine-Russia border)"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#0a0f1e] border border-gray-200 dark:border-[#1f2937] text-gray-900 dark:text-[#f9fafb]
              placeholder-[#4b5563] text-sm focus:outline-none focus:border-[#ef4444] focus:ring-1
              focus:ring-[#ef444440] transition-all"
            disabled={isLoading}
          />
          <button
            onClick={generateBrief}
            disabled={isLoading || !userInput.trim()}
            className={`px-8 py-3 rounded-lg font-bold text-sm tracking-wide transition-all
              ${isLoading
                ? 'bg-[#374151] text-[#6b7280] cursor-not-allowed'
                : 'bg-[#ef4444] text-white hover:bg-[#dc2626] hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]'
              }`}
          >
            {isLoading ? 'GENERATING...' : 'GENERATE BRIEF ▶'}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-[#4b5563] mt-3">
          Target: under 5 minutes · 5 agents · CrewAI orchestrator · Fully traceable
        </p>
      </div>

      {/* ---- Error Banner ---- */}
      {error && (
        <div className="p-4 rounded-lg bg-[#ef444415] border border-[#ef444440] animate-fade-in">
          <p className="text-sm text-[#ef4444] font-medium">⚠️ Pipeline Error</p>
          <p className="text-xs text-[#f87171] mt-1">{error}</p>
          <p className="text-xs text-[#6b7280] mt-2">Check your API key in Settings and try again.</p>
        </div>
      )}

      {/* ---- Agent Progress Section ---- */}
      {isLoading && (
        <div className="intel-card animate-fade-in space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider">
              CrewAI Agent Pipeline
            </h3>
            <span className="text-[10px] text-gray-400 dark:text-[#4b5563] font-mono">Ollama (local LLM)</span>
          </div>
          {agentStatuses.map((agent, i) => (
            <AgentProgressRow key={agent.id} agent={agent} index={i} />
          ))}
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-200 dark:border-[#1f2937] mt-3">
            <span className="text-yellow-400">⚡</span>
            <span className="text-sm font-mono text-gray-600 dark:text-[#9ca3af] tabular-nums">
              {formatTime(elapsedSeconds)} elapsed
            </span>
            <span className="text-xs text-gray-400 dark:text-[#4b5563]">· Target: {'<'}5 min</span>
          </div>
        </div>
      )}

      {/* ---- Results Section (after generation completes) ---- */}
      {currentBrief && brief && (
        <div className="space-y-6">
          {/* ROW 0 — Daily OSINT Alert */}
          {a1?.alert_flag && a1?.daily_summary && (
            <div className="intel-card border-l-4 border-l-[#f59e0b] bg-amber-50 dark:bg-[#f59e0b10] animate-fade-in-up mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📢</span>
                <h3 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
                  Real-Time Daily Update
                </h3>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-[#f9fafb] mb-1">
                {a1.daily_summary}
              </p>
              {a1.alert_reason && (
                <p className="text-xs text-gray-700 dark:text-[#d1d5db]">
                  <span className="font-bold">Alert Trigger:</span> {a1.alert_reason}
                </p>
              )}
            </div>
          )}

          {/* ROW 0.5 — Live OSINT Map */}
          {a1?.findings && a1.findings.length > 0 && (
            <div className="intel-card animate-fade-in-up mb-6 border-0 p-0 overflow-hidden bg-transparent shadow-none">
              <div className="bg-white dark:bg-[#111827] px-6 py-4 border-b border-gray-200 dark:border-[#1f2937] rounded-t-xl flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#3b82f6]">🌍</span> Real-Time OSINT Geo-Tracking
                </h3>
                <span className="text-[10px] text-[#6b7280] font-mono tracking-widest">{a1.findings.length} EVENTS PLOTTED</span>
              </div>
              <LiveOSINTMap findings={a1.findings} />
            </div>
          )}

          {/* ROW 1 — Threat Gauge + Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Gauge */}
            <div className="intel-card animate-fade-in-up flex flex-col items-center justify-center py-8">
              <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-6">
                Threat Assessment
              </h3>
              <ThreatGauge score={brief.threat_score || a2?.threat_score || 5} />
              {/* Sentiment trend from Conflict Detector */}
              {(brief.sentiment_trend || a2?.sentiment_analysis) && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-[#6b7280]">Sentiment:</span>
                  <PriorityBadge level={brief.sentiment_trend || a2?.sentiment_analysis?.trending_direction || 'N/A'} />
                </div>
              )}
              <RawOutput data={a2} label="Raw Conflict Detector Output" />
            </div>

            {/* Executive Summary */}
            <div className="intel-card animate-fade-in-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider">
                  Executive Summary
                </h3>
                <span className="classification-banner text-[10px] px-3 py-1 rounded">
                  {brief.classification || 'UNCLASSIFIED // FOR OFFICIAL USE ONLY'}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-[#d1d5db] leading-relaxed mb-4">
                {brief.executive_summary}
              </p>
              {brief.market_and_industry_summary && (
                <div className="bg-gray-50 dark:bg-[#111827] p-3 rounded-lg border border-gray-200 dark:border-[#1f2937] mb-4">
                  <h4 className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>📈</span> Macro-Economic & Market Impact
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-[#9ca3af] leading-relaxed">
                    {brief.market_and_industry_summary}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-[11px] text-[#6b7280]">
                <span>Brief ID: <span className="text-gray-600 dark:text-[#9ca3af] font-mono">{brief.brief_id}</span></span>
                <span>Generated: <span className="text-gray-600 dark:text-[#9ca3af] font-mono">
                  {new Date(brief.generated_at || currentBrief.generatedAt).toLocaleString()}
                </span></span>
              </div>
              <RawOutput data={brief} label="Raw Commander Brief Output" />
            </div>
          </div>

          {/* ROW 2 — Priority Recommendations */}
          {brief.top_3_recommendations && (
            <div className="intel-card animate-fade-in-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-1">
                Source-Traced Recommendations
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-[#4b5563] mb-4">Every recommendation traces back to its source agent</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brief.top_3_recommendations.map((rec, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-[#0a0f1e] rounded-xl p-4 border border-gray-200 dark:border-[#1f2937] hover:border-gray-300 dark:border-[#374151] transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl font-black text-[#ef4444]">{rec.rank || i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-[#f9fafb] leading-snug">{rec.action}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-3 leading-relaxed">{rec.rationale}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <PriorityBadge level={rec.urgency} />
                      <PriorityBadge level={rec.risk} />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[#4b5563] mt-2">📎 Source: {rec.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROW 3 — Key Findings Table */}
          {brief.key_findings && (
            <div className="intel-card animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
                Key Intelligence Findings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#1f2937] text-[#6b7280] text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-3">#</th>
                      <th className="text-left py-3 px-3">Finding</th>
                      <th className="text-left py-3 px-3">Source Agent</th>
                      <th className="text-left py-3 px-3">Confidence</th>
                      <th className="text-left py-3 px-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.key_findings.map((f, i) => (
                      <tr key={i} className={`border-b border-gray-200 dark:border-[#1f293750] ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-gray-50 dark:bg-[#0d1220]'}`}>
                        <td className="py-3 px-3 text-[#6b7280] font-mono text-xs">{i + 1}</td>
                        <td className="py-3 px-3 text-gray-800 dark:text-[#d1d5db] text-xs leading-relaxed max-w-md">{f.finding}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs text-[#3b82f6] font-medium">{f.source_agent}</span>
                        </td>
                        <td className="py-3 px-3 w-32">
                          <ConfidenceBar value={f.confidence} />
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge level={f.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <RawOutput data={a1} label="Raw OSINT Output" />
            </div>
          )}

          {/* ROW 4 — Scenarios */}
          {a3?.scenarios && (
            <div className="animate-fade-in-up delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
                Strategic Scenarios & Projected Outcomes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {a3.scenarios.map((sc, i) => (
                  <div
                    key={i}
                    className={`intel-card relative overflow-hidden
                      ${sc.id === a3.recommended_scenario_id ? 'border-[#10b981] ring-1 ring-[#10b98130]' : ''}`}
                  >
                    {sc.id === a3.recommended_scenario_id && (
                      <div className="absolute top-0 left-0 right-0 bg-[#10b981] text-[#0a0f1e] text-[10px] font-bold text-center py-1 tracking-wider">
                        ★ RECOMMENDED
                      </div>
                    )}
                    <div className={sc.id === a3.recommended_scenario_id ? 'mt-5' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-black text-gray-400 dark:text-[#4b5563]">#{sc.id}</span>
                        <PriorityBadge level={sc.type} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-[#f9fafb] mb-2">{sc.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-4 leading-relaxed line-clamp-3">{sc.description}</p>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[#6b7280]">Success Probability</span>
                          <ConfidenceBar value={sc.success_probability} color="#10b981" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Timeline</span>
                          <span className="text-gray-600 dark:text-[#9ca3af] font-mono">{sc.timeline_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Risk</span>
                          <PriorityBadge level={sc.risk_level} />
                        </div>
                      </div>
                      {/* Inline civilian impact from this scenario */}
                      {sc.civilian_impact && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#1f293750] space-y-1 text-[11px]">
                          <p className="text-[#6b7280] uppercase tracking-wide font-bold mb-1">Civilian Impact</p>
                          <div className="flex justify-between">
                            <span className="text-[#6b7280]">IDPs</span>
                            <span className="text-[#f59e0b] font-mono">{(sc.civilian_impact.idp_estimate || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b7280]">Casualties</span>
                            <span className="text-[#ef4444] font-mono">{(sc.civilian_impact.casualty_estimate || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b7280]">Healthcare</span>
                            <PriorityBadge level={sc.civilian_impact.healthcare_disruption} />
                          </div>
                        </div>
                      )}
                    </div>
                    <RawOutput data={sc} label="Scenario Data" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROW 5 — Civilian Impact Overview (from Agent 3's overall_civilian_impact) */}
          {civilianImpact && (
            <div className="animate-fade-in-up delay-600" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
                Civilian Impact Assessment
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricTile
                  icon="👥"
                  label="Estimated IDPs"
                  value={civilianImpact.total_idp_estimate}
                  isAlert={civilianImpact.total_idp_estimate > 100000}
                />
                <MetricTile
                  icon="⚠️"
                  label="Casualty Estimate"
                  value={civilianImpact.total_casualty_estimate}
                  isAlert={true}
                />
                <MetricTile
                  icon="🏗️"
                  label="Infrastructure Damage"
                  value={civilianImpact.overall_infrastructure_damage_percent}
                  suffix="%"
                  isAlert={civilianImpact.overall_infrastructure_damage_percent > 50}
                />
                <MetricTile
                  icon="⏱️"
                  label="Response Window"
                  value={civilianImpact.response_window_days}
                  suffix=" days"
                  isAlert={civilianImpact.response_window_days < 14}
                />
              </div>
              <RawOutput data={a3} label="Raw Scenario Simulator Output" />
            </div>
          )}

          {/* ROW 6 — Sources */}
          {a1?.findings && (
            <div className="intel-card animate-fade-in-up delay-700" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <button
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider">
                  Intelligence Sources Cited ({a1.findings.length})
                </h3>
                <span className={`text-[#6b7280] transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {sourcesOpen && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  {a1.findings.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-gray-200 dark:border-[#1f293740]">
                      <span className="text-gray-400 dark:text-[#4b5563] font-mono w-6">{i + 1}</span>
                      <span className="text-gray-600 dark:text-[#9ca3af] font-medium">{f.source}</span>
                      <span className="badge bg-gray-100 dark:bg-[#1f2937] text-[#6b7280] border border-gray-300 dark:border-[#374151] text-[9px]">{f.source_type || 'OSINT'}</span>
                      <a href={f.source_url} target="_blank" rel="noopener" className="text-[#3b82f6] hover:underline truncate flex-1">
                        {f.source_url}
                      </a>
                      <span className="text-gray-400 dark:text-[#4b5563] font-mono">{f.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROW 7 — Gen Metadata */}
          {totalSeconds != null && (
            <div className={`rounded-lg px-4 py-3 text-center text-xs font-mono animate-fade-in
              ${totalSeconds < 120 ? 'bg-[#10b98110] text-[#10b981] border border-[#10b98130]' :
                totalSeconds < 240 ? 'bg-[#f59e0b10] text-[#f59e0b] border border-[#f59e0b30]' :
                totalSeconds < 300 ? 'bg-[#3b82f610] text-[#3b82f6] border border-[#3b82f630]' :
                'bg-[#ef444410] text-[#ef4444] border border-[#ef444430]'}`}>
              Generated in {totalSeconds}s · 5 agents · CrewAI Pipeline · Model: claude-sonnet-4 · {new Date(currentBrief.generatedAt).toLocaleString()}
              {totalSeconds < 300 && ' · ✅ Under 5 min target'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Metric Tile (for civilian impact data)
// ============================================================
function MetricTile({ icon, label, value, suffix = '', isAlert }) {
  return (
    <div className={`intel-card flex flex-col items-center text-center py-6 
      ${isAlert ? 'border-[#ef444440]' : ''}`}>
      <span className="text-2xl mb-2">{icon}</span>
      <p className={`text-3xl font-black mb-1 ${isAlert ? 'text-[#ef4444]' : 'text-gray-900 dark:text-[#f9fafb]'}`}>
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
