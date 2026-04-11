import { useState, useEffect } from 'react';
import { ThreatGauge, AnimatedNumber, PriorityBadge, ConfidenceBar, EmptyState } from '../components/UIComponents';

export default function SentimentEngine({ currentBrief, agentOutputs, setActivePage }) {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [history, setHistory] = useState([]);

  const sentimentColors = {
    VERY_NEGATIVE: '#ef4444',
    NEGATIVE: '#f97316',
    NEUTRAL: '#6b7280',
    POSITIVE: '#22c55e',
    VERY_POSITIVE: '#10b981'
  };

  const sentimentLabels = {
    VERY_NEGATIVE: 'Very Negative',
    NEGATIVE: 'Negative',
    NEUTRAL: 'Neutral',
    POSITIVE: 'Positive',
    VERY_POSITIVE: 'Very Positive'
  };

  // Fetch sentiment analysis for current OSINT data
  const fetchSentimentAnalysis = async () => {
    setLoading(true);
    try {
      // Use current agent data if available
      if (agentOutputs && agentOutputs.sentiment_analysis) {
        const sentimentResult = agentOutputs.sentiment_analysis;
        setSentimentData(sentimentResult);
        setHistory(prev => [sentimentResult, ...prev.slice(0, 9)]);
        return;
      }
      
      // If no agent data, fetch from backend
      const response = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: selectedTopic || currentBrief?.topic || 'global',
          osint_data: agentOutputs 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSentimentData(result.data);
          setHistory(prev => [result.data, ...prev.slice(0, 9)]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sentiment analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load real agent sentiment data when available
  useEffect(() => {
    console.log('SentimentEngine - agentOutputs:', agentOutputs);
    console.log('SentimentEngine - sentiment_analysis:', agentOutputs?.sentiment_analysis);
    
    if (agentOutputs && agentOutputs.sentiment_analysis) {
      console.log('Setting sentiment data:', agentOutputs.sentiment_analysis);
      setSentimentData(agentOutputs.sentiment_analysis);
      setHistory(prev => [agentOutputs.sentiment_analysis, ...prev.slice(0, 9)]);
    } else {
      console.log('No sentiment analysis data available');
    }
  }, [agentOutputs]);

  // Update selected topic from current brief
  useEffect(() => {
    if (currentBrief && currentBrief.topic) {
      setSelectedTopic(currentBrief.topic);
    }
  }, [currentBrief]);

  const getSentimentColor = (sentiment) => sentimentColors[sentiment] || '#6b7280';
  const getScoreForGauge = (score) => Math.abs(score) * 10; // Convert -1 to 1 scale to 0-10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f9fafb]">Sentiment Analysis Engine</h1>
          <p className="text-sm text-gray-600 dark:text-[#9ca3af] mt-1">
            {selectedTopic ? `Analysis for: ${selectedTopic}` : 'Real-time sentiment analysis of OSINT data using lightweight NLP models'}
          </p>
          {sentimentData && (
            <p className="text-xs text-gray-500 dark:text-[#6b7280] mt-1">
              Last updated: {new Date(sentimentData.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              realTimeMode 
                ? 'bg-[#ef4444] text-white' 
                : 'bg-gray-200 dark:bg-[#1f2937] text-gray-700 dark:text-[#9ca3af]'
            }`}
          >
            {realTimeMode ? 'Live Monitoring' : 'Manual Mode'}
          </button>
          <button
            onClick={fetchSentimentAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-[#ef4444] text-white rounded-lg font-medium text-sm
                     hover:bg-[#dc2626] transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>
      </div>

      {/* Main Sentiment Overview */}
      {sentimentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Score Gauge */}
          <div className="bg-white dark:bg-[#0a0f1e] rounded-xl p-6 border border-gray-200 dark:border-[#1f2937]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-4">Overall Sentiment</h3>
            <div className="flex flex-col items-center">
              <ThreatGauge score={getScoreForGauge(sentimentData.overall_score)} size={180} />
              <div className="mt-4 text-center">
                <PriorityBadge level={sentimentData.overall_sentiment} />
                <p className="text-sm text-gray-600 dark:text-[#9ca3af] mt-2">
                  Score: {sentimentData.overall_score.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Metrics */}
          <div className="bg-white dark:bg-[#0a0f1e] rounded-xl p-6 border border-gray-200 dark:border-[#1f2937]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-4">Analysis Confidence</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-[#9ca3af]">Overall Confidence</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-[#f9fafb]">
                    {Math.round(sentimentData.confidence * 100)}%
                  </span>
                </div>
                <ConfidenceBar value={sentimentData.confidence} color={getSentimentColor(sentimentData.overall_sentiment)} />
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-[#1f2937]">
                <h4 className="text-sm font-medium text-gray-900 dark:text-[#f9fafb] mb-3">Source Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(sentimentData.source_analysis).map(([key, analysis]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-[#9ca3af]">{analysis.source}</span>
                      <PriorityBadge level={analysis.sentiment} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white dark:bg-[#0a0f1e] rounded-xl p-6 border border-gray-200 dark:border-[#1f2937]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-4">Key Insights</h3>
            <div className="space-y-3">
              {sentimentData.key_insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#ef4444] mt-1">{'\u2022'}</span>
                  <p className="text-sm text-gray-700 dark:text-[#d1d5db]">{insight}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1f2937]">
              <h4 className="text-sm font-medium text-gray-900 dark:text-[#f9fafb] mb-2">Recommendations</h4>
              <div className="space-y-2">
                {sentimentData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-[#3b82f6] mt-1">{'\u2192'}</span>
                    <p className="text-xs text-gray-600 dark:text-[#9ca3af]">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Source Analysis */}
      {sentimentData && (
        <div className="bg-white dark:bg-[#0a0f1e] rounded-xl p-6 border border-gray-200 dark:border-[#1f2937]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-4">Source-Level Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(sentimentData.source_analysis).map(([key, analysis]) => (
              <div key={key} className="border border-gray-200 dark:border-[#1f2937] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-[#f9fafb]">{analysis.source}</span>
                  <PriorityBadge level={analysis.sentiment} />
                </div>
                <p className="text-xs text-gray-600 dark:text-[#9ca3af] mb-3 line-clamp-3">{analysis.text}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-[#6b7280]">Confidence</span>
                    <span className="text-xs font-mono">{Math.round(analysis.confidence * 100)}%</span>
                  </div>
                  <ConfidenceBar value={analysis.confidence} color={getSentimentColor(analysis.sentiment)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment History */}
      {history.length > 1 && (
        <div className="bg-white dark:bg-[#0a0f1e] rounded-xl p-6 border border-gray-200 dark:border-[#1f2937]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f9fafb] mb-4">Sentiment History</h3>
          <div className="space-y-3">
            {history.slice(1).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-[#1f2937] rounded-lg">
                <div className="flex items-center gap-3">
                  <PriorityBadge level={item.overall_sentiment} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f9fafb]">{item.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-[#6b7280]">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-gray-900 dark:text-[#f9fafb]">
                    {item.overall_score.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#6b7280]">
                    {Math.round(item.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!sentimentData && !loading && (
        <EmptyState
          icon="'\ud83d\udcca'"
          title="No Sentiment Data Available"
          message={agentOutputs && !agentOutputs.sentiment_analysis 
            ? "Generate a brief from Dashboard first to analyze sentiment from OSINT data."
            : "Run an analysis to see sentiment insights from your OSINT data sources."
          }
          action={agentOutputs && !agentOutputs.sentiment_analysis ? "Go to Dashboard" : "Run Analysis"}
          onAction={() => {
            if (agentOutputs && !agentOutputs.sentiment_analysis) {
              setActivePage('dashboard');
            } else {
              fetchSentimentAnalysis();
            }
          }}
        />
      )}
    </div>
  );
}
