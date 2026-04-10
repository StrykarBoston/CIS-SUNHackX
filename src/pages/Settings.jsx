export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-[#f9fafb]">SYSTEM CONFIGURATION</h2>

      {/* API Status */}
      <div className="intel-card">
        <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
          API Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1f293740]">
            <span className="text-sm text-gray-800 dark:text-[#d1d5db]">AI Provider</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
              </span>
              <span className="text-xs text-[#10b981] font-semibold">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1f293740]">
            <span className="text-sm text-gray-800 dark:text-[#d1d5db]">Model in Use</span>
            <span className="text-xs text-gray-600 dark:text-[#9ca3af] font-mono bg-gray-100 dark:bg-[#1f2937] px-3 py-1 rounded">
              llama-3.3-70b-versatile (Groq)
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1f293740]">
            <span className="text-sm text-gray-800 dark:text-[#d1d5db]">Max Tokens per Agent</span>
            <span className="text-xs text-gray-600 dark:text-[#9ca3af] font-mono">1,500</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1f293740]">
            <span className="text-sm text-gray-800 dark:text-[#d1d5db]">API Format</span>
            <span className="text-xs text-gray-600 dark:text-[#9ca3af] font-mono">OpenAI Compatible</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-800 dark:text-[#d1d5db]">Orchestrator</span>
            <span className="text-xs text-gray-600 dark:text-[#9ca3af] font-mono bg-gray-100 dark:bg-[#1f2937] px-3 py-1 rounded">CrewAI</span>
          </div>
        </div>
      </div>

      {/* Architecture — matches the diagram exactly */}
      <div className="intel-card">
        <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
          Multi-Agent Architecture
        </h3>
        <div className="space-y-4 text-sm text-gray-600 dark:text-[#9ca3af] leading-relaxed">
          <p>
            The system uses a <span className="text-gray-900 dark:text-[#f9fafb] font-semibold">CrewAI-orchestrated 5-agent 
            sequential pipeline</span> powered by Ollama (local LLM) to analyze conflict zones and produce 
            commander-grade intelligence briefs in <span className="text-[#10b981] font-semibold">under 5 minutes</span>.
          </p>
        </div>
        
        {/* Pipeline visualization matching the architecture diagram */}
        <div className="mt-6 space-y-3">
          {/* Data Sources */}
          <div className="p-3 rounded-lg bg-[#1f293740] border border-gray-300 dark:border-[#374151] text-center">
            <p className="text-xs font-bold text-gray-900 dark:text-[#f9fafb] uppercase tracking-wider mb-2">Data Sources (OSINT)</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['News APIs', 'Social media', 'RSS/Feeds', 'Wikipedia', 'Web search'].map(src => (
                <span key={src} className="text-[10px] text-gray-600 dark:text-[#9ca3af] bg-gray-50 dark:bg-[#0a0f1e] px-2 py-1 rounded">{src}</span>
              ))}
            </div>
          </div>

          <div className="text-center text-gray-400 dark:text-[#4b5563]">↓</div>

          {/* Agent Pipeline */}
          {[
            { num: 1, name: 'OSINT Collector', desc: 'Ingests & filters data · LangChain tools · web_search · Ollama LLM', color: '#3b82f6' },
            { num: 2, name: 'Conflict Detector', desc: 'Detects escalation signals · sentiment analysis · event scoring', color: '#22c55e' },
            { num: 3, name: 'Scenario Simulator', desc: 'Generates response options · projects outcomes · models civilian impact', color: '#f59e0b' },
            { num: 4, name: 'Intelligence Brief Writer', desc: 'Compiles commander-grade brief · traceable citations · <5 min delivery', color: '#6b7280' },
          ].map((agent, i) => (
            <div key={i}>
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  background: `${agent.color}10`,
                  border: `1px solid ${agent.color}40`,
                }}
              >
                <p className="text-sm font-bold" style={{ color: agent.color }}>
                  Agent {agent.num} — {agent.name}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-[#9ca3af] mt-1">{agent.desc}</p>
              </div>
              <div className="text-center text-gray-400 dark:text-[#4b5563]">↓</div>
            </div>
          ))}

          {/* Output */}
          <div className="p-4 rounded-lg text-center bg-[#991b1b15] border border-[#991b1b50]">
            <p className="text-sm font-bold text-[#991b1b]" style={{ color: '#dc2626' }}>
              Output — Commander Brief
            </p>
            <p className="text-[11px] text-gray-600 dark:text-[#9ca3af] mt-1">
              Threat level · scenarios · civilian impact · source-traced recommendations
            </p>
          </div>

          <div className="text-center">
            <span className="inline-block bg-[#991b1b] text-white text-[10px] font-bold px-3 py-1 rounded mt-1">
              Target: under 5 minutes
            </span>
          </div>
        </div>

        {/* Side labels */}
        <div className="mt-4 flex justify-between text-[10px] text-gray-400 dark:text-[#4b5563]">
          <span className="bg-gray-100 dark:bg-[#1f2937] px-2 py-1 rounded border border-gray-300 dark:border-[#374151]">CrewAI orchestrator</span>
          <span className="bg-gray-100 dark:bg-[#1f2937] px-2 py-1 rounded border border-gray-300 dark:border-[#374151]">Ollama (local LLM)</span>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-[#0a0f1e] rounded-lg border border-gray-200 dark:border-[#1f293750]">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {['React', 'Vite', 'Tailwind CSS', 'Claude API', 'CrewAI', 'LangChain', 'JavaScript'].map(tech => (
              <span key={tech} className="badge bg-gray-100 dark:bg-[#1f2937] text-gray-600 dark:text-[#9ca3af] border border-gray-300 dark:border-[#374151]">{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="intel-card">
        <h3 className="text-xs font-bold text-gray-600 dark:text-[#9ca3af] uppercase tracking-wider mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[#6b7280]">Version</p>
            <p className="text-gray-900 dark:text-[#f9fafb] font-mono">2.0.0</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Classification</p>
            <p className="text-[#f59e0b] font-semibold">UNCLASSIFIED</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Pipeline Agents</p>
            <p className="text-gray-900 dark:text-[#f9fafb] font-mono">5 (4 processing + 1 output)</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Brief History Limit</p>
            <p className="text-gray-900 dark:text-[#f9fafb] font-mono">20</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Target Delivery</p>
            <p className="text-[#10b981] font-bold">Under 5 minutes</p>
          </div>
          <div>
            <p className="text-[#6b7280]">Orchestration</p>
            <p className="text-gray-900 dark:text-[#f9fafb] font-mono">CrewAI Sequential</p>
          </div>
        </div>
      </div>
    </div>
  );
}
