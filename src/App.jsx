import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AlertCenter from './pages/AlertCenter';
import OsintExplorer from './pages/OsintExplorer';
import SimulationLab from './pages/SimulationLab';
import HumanitarianImpact from './pages/HumanitarianImpact';
import IntelligenceBrief from './pages/IntelligenceBrief';
import SentimentEngine from './pages/SentimentEngine';
import Settings from './pages/Settings';

const INITIAL_AGENT_STATUSES = [
  { id: 1, name: 'OSINT Collector', status: 'waiting', seconds: 0 },
  { id: 2, name: 'Conflict Detector', status: 'waiting', seconds: 0 },
  { id: 3, name: 'Scenario Simulator', status: 'waiting', seconds: 0 },
  { id: 4, name: 'Intelligence Brief Writer', status: 'waiting', seconds: 0 },
  { id: 5, name: 'Commander Brief', status: 'waiting', seconds: 0 },
];

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState(INITIAL_AGENT_STATUSES);
  const [agentOutputs, setAgentOutputs] = useState({
    agent1: null, agent2: null, agent3: null, agent4: null, agent5: null,
    sentiment_analysis: null,
  });
  const [currentBrief, setCurrentBrief] = useState(null);
  const [briefHistory, setBriefHistory] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef(null);

  const updateAgentStatus = useCallback((id, status, seconds = 0) => {
    setAgentStatuses(prev =>
      prev.map(a => (a.id === id ? { ...a, status, seconds } : a))
    );
  }, []);

  const generateBrief = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentBrief(null);
    setTotalSeconds(null);
    setElapsedSeconds(0);
    setAgentStatuses(INITIAL_AGENT_STATUSES);
    setAgentOutputs({ agent1: null, agent2: null, agent3: null, agent4: null, agent5: null, sentiment_analysis: null });

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const outputs = {};

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8000';
      const ws = new WebSocket(`${backendUrl}/api/pipeline/stream`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ topic: userInput }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          // Handle sentiment_complete event (agent_id = 0)
          if (data.status === 'sentiment_complete' && data.result) {
            setAgentOutputs(prev => ({ ...prev, sentiment_analysis: data.result }));
            outputs['sentiment_analysis'] = data.result;
          } else {
            updateAgentStatus(data.agent_id, data.status, data.elapsed);
            if (data.result) {
              setAgentOutputs(prev => ({ ...prev, [`agent${data.agent_id}`]: data.result }));
              outputs[`agent${data.agent_id}`] = data.result;
            }
          }
        } 
        else if (data.type === 'complete') {
          const total = Math.floor((Date.now() - startTime) / 1000);
          const fullBrief = {
            ...outputs,
            ...data.brief,
            topic: userInput,
            totalSeconds: total,
            generatedAt: new Date().toISOString(),
          };

          setCurrentBrief(fullBrief);
          setBriefHistory(prev => [fullBrief, ...prev.slice(0, 19)]);
          setTotalSeconds(total);
          clearInterval(timerRef.current);
          setIsLoading(false);
          ws.close();
        }
        else if (data.type === 'error') {
          setError(data.message);
          clearInterval(timerRef.current);
          setIsLoading(false);
          ws.close();
        }
      };
      
      ws.onerror = () => {
        setError("WebSocket connection failed. Ensure the backend server is running.");
        clearInterval(timerRef.current);
        setIsLoading(false);
      };
      
    } catch (err) {
      console.error('Agent pipeline error:', err);
      setError(err.message);
      clearInterval(timerRef.current);
      setIsLoading(false);
    }
  }, [userInput, isLoading, updateAgentStatus]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const viewBrief = useCallback((brief) => {
    setCurrentBrief(brief);
    setAgentOutputs({
      agent1: brief.agent1,
      agent2: brief.agent2,
      agent3: brief.agent3,
      agent4: brief.agent4,
      agent5: brief.agent5,
      sentiment_analysis: brief.sentiment_analysis,
    });
    setActivePage('brief');
  }, []);

  const pageProps = {
    currentBrief,
    agentOutputs,
    userInput,
    setUserInput,
    isLoading,
    agentStatuses,
    elapsedSeconds,
    totalSeconds,
    generateBrief,
    error,
    briefHistory,
    setBriefHistory,
    viewBrief,
    setActivePage,
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard {...pageProps} />;
      case 'alerts': return <AlertCenter {...pageProps} />;
      case 'osint': return <OsintExplorer {...pageProps} />;
      case 'simulation': return <SimulationLab {...pageProps} />;
      case 'humanitarian': return <HumanitarianImpact {...pageProps} />;
      case 'brief': return <IntelligenceBrief {...pageProps} />;
      case 'sentiment': return <SentimentEngine currentBrief={currentBrief} agentOutputs={agentOutputs} setActivePage={setActivePage} />;
      case 'settings': return <Settings />;
      default: return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
