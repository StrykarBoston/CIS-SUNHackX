import { AnimatedNumber, PriorityBadge, EmptyState } from '../components/UIComponents';

export default function HumanitarianImpact({ agentOutputs, setActivePage }) {
  const a3 = agentOutputs.agent3;
  const civilianImpact = a3?.overall_civilian_impact;

  if (!a3 || !civilianImpact) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb] mb-6">CIVILIAN IMPACT ASSESSMENT</h2>
        <EmptyState
          icon="👥"
          title="No Civilian Impact Data"
          message="Generate a brief to see civilian impact projections modeled by the Scenario Simulator."
          action="Go to Dashboard"
          onAction={() => setActivePage('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb]">CIVILIAN IMPACT ASSESSMENT</h2>
        <p className="text-xs text-[#6b7280] mt-1">
          Modeled by Agent 3 — Scenario Simulator (UNHCR/IDMC methodologies)
        </p>
      </div>

      {/* Top metric tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`intel-card flex flex-col items-center text-center py-8 ${civilianImpact.total_idp_estimate > 100000 ? 'border-[#ef444440]' : ''}`}>
          <span className="text-3xl mb-3">👥</span>
          <p className="text-3xl font-black text-[#ef4444] mb-1">
            <AnimatedNumber value={civilianImpact.total_idp_estimate} />
          </p>
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">Estimated IDPs</p>
        </div>
        <div className="intel-card flex flex-col items-center text-center py-8 border-[#ef444440]">
          <span className="text-3xl mb-3">⚠️</span>
          <p className="text-3xl font-black text-[#ef4444] mb-1">
            <AnimatedNumber value={civilianImpact.total_casualty_estimate} />
          </p>
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">Casualty Estimate</p>
        </div>
        <div className={`intel-card flex flex-col items-center text-center py-8 ${civilianImpact.overall_infrastructure_damage_percent > 50 ? 'border-[#f59e0b40]' : ''}`}>
          <span className="text-3xl mb-3">🏗️</span>
          <p className="text-3xl font-black text-[#f59e0b] mb-1">
            <AnimatedNumber value={civilianImpact.overall_infrastructure_damage_percent} suffix="%" />
          </p>
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">Infrastructure Damage</p>
        </div>
        <div className={`intel-card flex flex-col items-center text-center py-8 ${civilianImpact.response_window_days < 14 ? 'border-[#ef444440]' : ''}`}>
          <span className="text-3xl mb-3">⏱️</span>
          <p className="text-3xl font-black text-gray-900 dark:text-[#f9fafb] mb-1">
            <AnimatedNumber value={civilianImpact.response_window_days} suffix=" days" />
          </p>
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">Response Window</p>
        </div>
      </div>

      {/* Scenario impact comparison table (from each scenario's civilian_impact) */}
      {a3.scenarios && a3.scenarios.length > 0 && (
        <div className="intel-card">
          <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
            Scenario-by-Scenario Civilian Impact Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#1f2937] text-[#6b7280] text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-3">Scenario</th>
                  <th className="text-left py-3 px-3">Type</th>
                  <th className="text-left py-3 px-3">IDP Estimate</th>
                  <th className="text-left py-3 px-3">Casualties</th>
                  <th className="text-left py-3 px-3">Food Insecurity</th>
                  <th className="text-left py-3 px-3">Healthcare</th>
                </tr>
              </thead>
              <tbody>
                {a3.scenarios.map((sc, i) => {
                  const impact = sc.civilian_impact || {};
                  return (
                    <tr key={i} className={`border-b border-gray-200 dark:border-[#1f293750] ${i % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-gray-50 dark:bg-[#0d1220]'}`}>
                      <td className="py-3 px-3 font-mono text-gray-600 dark:text-[#9ca3af]">
                        #{sc.id} — {sc.title}
                        {sc.id === a3.recommended_scenario_id && (
                          <span className="ml-2 badge bg-[#10b98120] text-[#10b981] border border-[#10b98140] text-[9px]">★ REC</span>
                        )}
                      </td>
                      <td className="py-3 px-3"><PriorityBadge level={sc.type} /></td>
                      <td className="py-3 px-3 text-gray-900 dark:text-[#f9fafb] font-semibold">{(impact.idp_estimate || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#ef4444] font-semibold">{(impact.casualty_estimate || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#f59e0b] font-semibold">{impact.food_insecurity_percent || 0}%</td>
                      <td className="py-3 px-3"><PriorityBadge level={impact.healthcare_disruption} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Urgent needs & affected regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent Needs */}
        {civilianImpact.urgent_needs && (
          <div className="intel-card">
            <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
              Urgent Needs
            </h3>
            <div className="flex flex-wrap gap-2">
              {civilianImpact.urgent_needs.map((need, i) => {
                const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
                const c = colors[i % colors.length];
                return (
                  <span
                    key={i}
                    className="badge text-xs px-4 py-1.5"
                    style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}
                  >
                    {need}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Most affected regions */}
        {civilianImpact.most_affected_regions && (
          <div className="intel-card">
            <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
              Most Affected Regions
            </h3>
            <ul className="space-y-2">
              {civilianImpact.most_affected_regions.map((region, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-800 dark:text-[#d1d5db]">
                  <span className="text-[#ef4444]">📍</span>
                  {region}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
