import { PriorityBadge, ConfidenceBar, EmptyState } from '../components/UIComponents';

export default function IntelligenceBrief({ currentBrief, agentOutputs, setActivePage }) {
  const a1 = agentOutputs.agent1;
  const a2 = agentOutputs.agent2;
  const a3 = agentOutputs.agent3;
  const a4 = agentOutputs.agent4; // Intelligence Brief Writer
  const a5 = agentOutputs.agent5; // Commander Brief (final output)

  // Use Commander Brief (a5) as primary, fall back to Intelligence Brief Writer (a4)
  const brief = a5 || a4;
  const civilianImpact = a3?.overall_civilian_impact;

  if (!currentBrief || !brief) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb] mb-6">COMMANDER BRIEF</h2>
        <EmptyState
          icon="📋"
          title="No Brief Available"
          message="Generate a brief from the Dashboard to view the full commander-grade report."
          action="Go to Dashboard"
          onAction={() => setActivePage('dashboard')}
        />
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleCopy = () => {
    const text = buildPlainText(brief, a1, a2, a3, a4, currentBrief);
    navigator.clipboard.writeText(text).then(() => {
      alert('Commander Brief copied to clipboard!');
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-0">
      {/* Top actions */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb]">COMMANDER BRIEF</h2>
          <p className="text-xs text-[#6b7280] mt-0.5">Output — Final Intelligence Product</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-gray-600 dark:text-[#9ca3af] text-xs font-semibold hover:bg-[#374151] transition-colors border border-gray-300 dark:border-[#374151]">
            🖨️ Print Brief
          </button>
          <button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-[#3b82f620] text-[#3b82f6] text-xs font-semibold hover:bg-[#3b82f630] transition-colors border border-[#3b82f640]">
            📋 Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Classification Header */}
      <div className="classification-banner rounded-t-lg">
        {brief.classification || 'UNCLASSIFIED // FOR OFFICIAL USE ONLY'}
      </div>

      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] border-t-0 rounded-b-xl p-6 md:p-8 space-y-8">
        {/* Brief info */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 pb-4 border-b border-gray-200 dark:border-[#1f2937]">
          <div>
            <p className="text-xs text-[#6b7280]">Brief ID</p>
            <p className="text-sm font-mono text-gray-900 dark:text-[#f9fafb] font-bold">{brief.brief_id}</p>
          </div>
          <div>
            <p className="text-xs text-[#6b7280]">Target Delivery</p>
            <p className="text-sm font-mono text-[#10b981] font-bold">{brief.target_delivery || 'under 5 minutes'}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-[#6b7280]">Generated</p>
            <p className="text-sm font-mono text-gray-600 dark:text-[#9ca3af]">{new Date(brief.generated_at || currentBrief.generatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY */}
        <Section number="1" title="EXECUTIVE SUMMARY">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <PriorityBadge level={brief.threat_level} />
            <span className="text-sm text-gray-600 dark:text-[#9ca3af]">Threat Score: <span className="text-gray-900 dark:text-[#f9fafb] font-bold">{brief.threat_score}/10</span></span>
            {(brief.sentiment_trend || a2?.sentiment_analysis?.trending_direction) && (
              <span className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Sentiment: <PriorityBadge level={brief.sentiment_trend || a2?.sentiment_analysis?.trending_direction} />
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 dark:text-[#d1d5db] leading-relaxed">{brief.executive_summary}</p>
          
          {/* Inject OSINT Daily Summary if available */}
          {a1?.daily_summary && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-[#f59e0b10] border-l-4 border-l-[#f59e0b] rounded-r-lg">
              <h4 className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>📢</span> Real-Time OSINT Daily Update
              </h4>
              <p className="text-xs text-gray-900 dark:text-[#d1d5db] leading-relaxed font-semibold">
                {a1.daily_summary}
              </p>
              {a1.alert_reason && (
                <p className="text-[10px] text-gray-700 dark:text-[#9ca3af] mt-1">
                  Trigger: {a1.alert_reason}
                </p>
              )}
            </div>
          )}

          {/* Inject Market & Economic Summary if available */}
          {brief.market_and_industry_summary && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-[#1f2937] rounded-lg">
              <h4 className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>📈</span> Macro-Economic & Market Impact
              </h4>
              <p className="text-xs text-gray-700 dark:text-[#9ca3af] leading-relaxed">
                {brief.market_and_industry_summary}
              </p>
            </div>
          )}
        </Section>

        {/* 2. THREAT ASSESSMENT */}
        <Section number="2" title="THREAT ASSESSMENT">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black" style={{ color: brief.threat_score >= 7 ? '#ef4444' : brief.threat_score >= 4 ? '#f59e0b' : '#10b981' }}>
                {brief.threat_score}
              </span>
              <span className="text-lg text-[#6b7280]">/ 10</span>
              <PriorityBadge level={brief.threat_level} />
            </div>
            {a2?.escalation_signals && (
              <div>
                <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Escalation Signals (Conflict Detector)</p>
                <ul className="space-y-1.5">
                  {a2.escalation_signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800 dark:text-[#d1d5db]">
                      <span className="text-[#ef4444] mt-0.5">▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Sentiment breakdown from Conflict Detector */}
            {a2?.sentiment_analysis && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Sentiment Analysis</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="text-gray-600 dark:text-[#9ca3af]">Score: <span className="text-gray-900 dark:text-[#f9fafb] font-mono font-bold">{a2.sentiment_analysis.sentiment_score}</span></span>
                  <span className="text-gray-600 dark:text-[#9ca3af]">Trend: <PriorityBadge level={a2.sentiment_analysis.trending_direction} /></span>
                  {a2.sentiment_analysis.breakdown && (
                    <>
                      <span className="text-[#ef4444]">Negative: {a2.sentiment_analysis.breakdown.negative}%</span>
                      <span className="text-gray-600 dark:text-[#9ca3af]">Neutral: {a2.sentiment_analysis.breakdown.neutral}%</span>
                      <span className="text-[#10b981]">Positive: {a2.sentiment_analysis.breakdown.positive}%</span>
                    </>
                  )}
                </div>
              </div>
            )}
            {a2?.reasoning && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Detailed Analysis</p>
                <p className="text-xs text-gray-600 dark:text-[#9ca3af] leading-relaxed whitespace-pre-line">{a2.reasoning}</p>
              </div>
            )}
          </div>
        </Section>

        {/* 3. KEY INTELLIGENCE FINDINGS */}
        {brief.key_findings && (
          <Section number="3" title="KEY INTELLIGENCE FINDINGS">
            <ol className="space-y-4">
              {brief.key_findings.map((f, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-sm font-mono text-gray-400 dark:text-[#4b5563] shrink-0 w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-[#d1d5db] leading-relaxed">{f.finding}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#3b82f6]">📎 {f.source_agent}</span>
                      <span className="text-[10px] text-[#6b7280]">Confidence: {Math.round((f.confidence || 0) * 100)}%</span>
                      <PriorityBadge level={f.priority} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* 4. STRATEGIC SCENARIOS */}
        {a3?.scenarios && (
          <Section number="4" title="STRATEGIC SCENARIOS & PROJECTED OUTCOMES">
            <div className="space-y-4">
              {a3.scenarios.map((sc, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-gray-400 dark:text-[#4b5563] font-bold">#{sc.id}</span>
                    <PriorityBadge level={sc.type} />
                    <span className="text-sm font-bold text-gray-900 dark:text-[#f9fafb]">{sc.title}</span>
                    {sc.id === a3.recommended_scenario_id && (
                      <span className="badge bg-[#10b98120] text-[#10b981] border border-[#10b98140]">★ Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-[#9ca3af] leading-relaxed mb-2">{sc.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
                    <span>Success: <span className="text-[#10b981] font-mono">{Math.round(sc.success_probability * 100)}%</span></span>
                    <span>Timeline: <span className="text-gray-600 dark:text-[#9ca3af] font-mono">{sc.timeline_days}d</span></span>
                    <span>Risk: <PriorityBadge level={sc.risk_level} /></span>
                  </div>
                  {/* Scenario civilian impact */}
                  {sc.civilian_impact && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-[#1f293730] flex flex-wrap gap-4 text-xs text-[#6b7280]">
                      <span>IDPs: <span className="text-[#f59e0b] font-mono">{(sc.civilian_impact.idp_estimate || 0).toLocaleString()}</span></span>
                      <span>Casualties: <span className="text-[#ef4444] font-mono">{(sc.civilian_impact.casualty_estimate || 0).toLocaleString()}</span></span>
                      <span>Healthcare: <PriorityBadge level={sc.civilian_impact.healthcare_disruption} /></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {brief.scenarios_summary && (
              <p className="text-sm text-gray-800 dark:text-[#d1d5db] leading-relaxed mt-4">{brief.scenarios_summary}</p>
            )}
          </Section>
        )}

        {/* 5. CIVILIAN IMPACT */}
        {civilianImpact && (
          <Section number="5" title="CIVILIAN IMPACT">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Metric label="IDPs" value={(civilianImpact.total_idp_estimate || 0).toLocaleString()} />
              <Metric label="Casualties" value={(civilianImpact.total_casualty_estimate || 0).toLocaleString()} color="#ef4444" />
              <Metric label="Infra Damage" value={`${civilianImpact.overall_infrastructure_damage_percent || 0}%`} />
              <Metric label="Response Window" value={`${civilianImpact.response_window_days || 0} days`} />
            </div>
            {brief.civilian_impact_summary && (
              <p className="text-sm text-gray-800 dark:text-[#d1d5db] leading-relaxed mb-4">{brief.civilian_impact_summary}</p>
            )}
            
            {/* Inject Most Disrupted Industries and Market Volatility */}
            {(civilianImpact.most_disrupted_industries || civilianImpact.market_volatility_indicators) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-[#1f293750]">
                {civilianImpact.most_disrupted_industries && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="text-[#f59e0b]">🏭</span> Disrupted Industries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {civilianImpact.most_disrupted_industries.map((ind, i) => (
                        <span key={i} className="badge bg-[#1f2937] border border-[#374151] text-[#d1d5db] text-xs">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {civilianImpact.market_volatility_indicators && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="text-[#ef4444]">📉</span> Market Indicators
                    </h4>
                    <ul className="space-y-1">
                      {civilianImpact.market_volatility_indicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-800 dark:text-[#d1d5db]">
                          <span className="text-[#f59e0b] mt-0.5">•</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Section>
        )}

        {/* 6. PRIORITY RECOMMENDATIONS */}
        {brief.top_3_recommendations && (
          <Section number="6" title="SOURCE-TRACED RECOMMENDATIONS">
            <ol className="space-y-4">
              {brief.top_3_recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-xl font-black text-[#ef4444] shrink-0 w-8">{rec.rank || i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#f9fafb] mb-1">{rec.action}</p>
                    <p className="text-xs text-gray-600 dark:text-[#9ca3af] leading-relaxed mb-2">{rec.rationale}</p>
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge level={rec.urgency} />
                      <PriorityBadge level={rec.risk} />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[#4b5563] mt-1.5">📎 Source: {rec.source}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* 7. SOURCES & CITATIONS */}
        {brief.sources_cited && (
          <Section number="7" title="SOURCES & CITATIONS">
            <ul className="space-y-1">
              {brief.sources_cited.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#9ca3af]">
                  <span className="text-gray-400 dark:text-[#4b5563] font-mono w-5">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
            {/* Citation chain from Intelligence Brief Writer */}
            {a4?.citation_chain && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#1f293730]">
                <p className="text-[10px] text-gray-400 dark:text-[#4b5563] uppercase tracking-wider mb-2">Traceable Citation Chain</p>
                <div className="space-y-1.5">
                  {a4.citation_chain.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-[#3b82f6]">↳</span>
                      <span className="text-gray-600 dark:text-[#9ca3af]">{c.claim}</span>
                      <span className="text-gray-400 dark:text-[#4b5563]">— {c.agent}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* 8. NEXT ASSESSMENT */}
        <div className="pt-6 border-t border-gray-200 dark:border-[#1f2937] flex justify-between text-sm">
          <span className="text-[#6b7280]">Next Assessment:</span>
          <span className="text-gray-900 dark:text-[#f9fafb] font-bold">{brief.next_assessment}</span>
        </div>
      </div>

      {/* Bottom classification */}
      <div className="classification-banner rounded-b-lg mt-0">
        {brief.classification || 'UNCLASSIFIED // FOR OFFICIAL USE ONLY'}
      </div>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-[#f9fafb] mb-4 uppercase tracking-wider">
        <span className="text-[#ef4444]">{number}.</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
      <p className={`text-lg font-bold ${color ? '' : 'text-gray-900 dark:text-[#f9fafb]'}`} style={color ? { color } : {}}>{value}</p>
      <p className="text-[10px] text-[#6b7280] uppercase tracking-wide">{label}</p>
    </div>
  );
}

function buildPlainText(brief, a1, a2, a3, a4, currentBrief) {
  let text = `${brief.classification || 'UNCLASSIFIED // FOR OFFICIAL USE ONLY'}\n`;
  text += `\nBrief ID: ${brief.brief_id}\n`;
  text += `Generated: ${new Date(brief.generated_at || currentBrief.generatedAt).toLocaleString()}\n`;
  text += `Target Delivery: ${brief.target_delivery || 'under 5 minutes'}\n`;
  text += `\n1. EXECUTIVE SUMMARY\n${brief.executive_summary}\n`;
  text += `\nThreat Level: ${brief.threat_level} (${brief.threat_score}/10)\n`;
  if (brief.key_findings) {
    text += `\n3. KEY FINDINGS\n`;
    brief.key_findings.forEach((f, i) => {
      text += `  ${i + 1}. ${f.finding} [${f.source_agent}] (${Math.round(f.confidence * 100)}%)\n`;
    });
  }
  if (brief.top_3_recommendations) {
    text += `\n6. SOURCE-TRACED RECOMMENDATIONS\n`;
    brief.top_3_recommendations.forEach((r, i) => {
      text += `  ${r.rank || i + 1}. ${r.action} — ${r.urgency} — Source: ${r.source}\n`;
    });
  }
  text += `\nNext Assessment: ${brief.next_assessment}\n`;
  text += `\n${brief.classification || 'UNCLASSIFIED // FOR OFFICIAL USE ONLY'}`;
  return text;
}
