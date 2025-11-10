import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Lightbulb,
  DollarSign,
  RefreshCw,
  Zap,
  FileText
} from 'lucide-react';
import ResourceDetailsModal from '../components/ResourceDetailsModal';

// Enhanced markdown renderer with table support
function renderMarkdown(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is a table
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().includes('|---')) {
      // Found a table! Parse it
      const tableLines = [line];
      i++; // Skip header
      tableLines.push(lines[i]); // Add separator
      i++; // Move to data rows
      
      // Collect all table rows
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      // Parse table
      const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
      const rows = tableLines.slice(2).map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );
      
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="min-w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-gray-300 px-2 py-1">
                      {parseBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    
    // Regular line processing
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const isNumbered = /^\d+\./.test(line.trim());
    
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else if (isBullet || isNumbered) {
      elements.push(
        <div key={i} className="pl-4">
          {parseBold(line)}
        </div>
      );
    } else {
      elements.push(
        <div key={i}>
          {parseBold(line)}
        </div>
      );
    }
    
    i++;
  }
  
  return <div className="space-y-1">{elements}</div>;
}

// Helper function to parse bold text
function parseBold(text) {
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={`bold-${match.index}`} className="font-bold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

export default function Recommendations({ userId, onNavigateToChat }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsMessage, setMetricsMessage] = useState(null);
  
  // Modal state
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadingMessages = [
    "Analyzing your cost patterns...",
    "Detecting optimization opportunities...",
    "Calculating potential savings...",
    "Reviewing resource utilization...",
    "Identifying cost anomalies...",
    "Scanning for quick wins...",
    "Crunching the numbers...",
    "Finding hidden savings...",
    "Optimizing your cloud spend...",
    "Generating smart recommendations...",
    "Analyzing service costs...",
    "Checking for waste...",
    "Evaluating reserved capacity...",
    "Reviewing storage tiers...",
    "Examining compute costs...",
    "Detecting cost spikes...",
    "Finding underutilized resources...",
    "Comparing cost trends...",
    "Calculating savings potential...",
    "Preparing your insights..."
  ];

  useEffect(() => {
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    setLoadingMessage(randomMessage);
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/recommendations/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleRefreshMetrics = async () => {
    setMetricsLoading(true);
    setMetricsMessage(null);
    
    try {
      const response = await fetch(`http://localhost:8000/metrics/sync/${userId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh metrics');
      }
      
      const result = await response.json();
      
      setMetricsMessage({
        type: 'success',
        text: `✅ Synced ${result.stats.total_metrics_saved} metrics from OCI`
      });
      
      // Refresh recommendations after metrics sync
      setTimeout(() => {
        fetchRecommendations();
      }, 1000);
      
    } catch (err) {
      setMetricsMessage({
        type: 'error',
        text: `❌ ${err.message}`
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleAskAI = (question) => {
    onNavigateToChat(question);
  };

  const openDetailsModal = (recommendation) => {
    if (!recommendation.details || !recommendation.details.data) return;
    
    setModalData(recommendation.details.data);
    setModalTitle(`${recommendation.title} - Full Report (${recommendation.details.total_count} total)`);
    setModalType(recommendation.type);
    setIsModalOpen(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
          <div>
            <h3 className="font-semibold text-yellow-800">No Data Available</h3>
            <p className="text-yellow-600">
              {data?.error || 'Please visit the Detailed Costs page to populate the cache first.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { insights, recommendations, quick_wins, summary, total_potential_savings, ai_analysis } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
            <p className="text-gray-600">
              {summary?.is_ai_powered ? (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Powered by real AI analysis + cached data & metrics
                </span>
              ) : (
                'Powered by cached data & real-time utilization metrics'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshMetrics}
              disabled={metricsLoading}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
              {metricsLoading ? 'Syncing...' : 'Refresh Metrics'}
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-white border-2 border-cyan-300 text-cyan-700 rounded-lg hover:bg-cyan-50 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Sync Message */}
      {metricsMessage && (
        <div className={`p-4 rounded-lg ${metricsMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {metricsMessage.text}
        </div>
      )}

      {/* Savings Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-800">
              ${total_potential_savings?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}/month
            </h2>
            <p className="text-green-600">Potential Savings Identified</p>
          </div>
          <DollarSign className="w-16 h-16 text-green-500 opacity-20" />
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="font-semibold">{summary?.total_insights || 0}</span> Insights
          </div>
          <div>
            <span className="font-semibold">{summary?.total_recommendations || 0}</span> Recommendations
          </div>
          <div>
            <span className="font-semibold">{summary?.total_quick_wins || 0}</span> Quick Wins
          </div>
        </div>
      </div>

      {/* AI Analysis Section - THE REAL AI! */}
      {ai_analysis && ai_analysis.narrative && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-900 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              AI Analysis
            </h2>
            <span className="text-xs bg-cyan-200 text-cyan-800 px-3 py-1 rounded-full font-semibold">
              Powered by LLM
            </span>
          </div>


          {/* AI Narrative */}
          <div className="bg-white rounded-lg p-5 text-gray-800 space-y-3">
            {ai_analysis.narrative.split('\n\n').map((paragraph, idx) => {
              // Check if it's a heading (starts with **word:**)
              const headingMatch = paragraph.match(/^\*\*([^*]+):\*\*/);
              if (headingMatch) {
                const heading = headingMatch[1];
                const content = paragraph.substring(headingMatch[0].length).trim();
                return (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold text-cyan-900">{heading}</h3>
                    <div className="text-gray-700 leading-relaxed">
                      {renderMarkdown(content)}
                    </div>
                  </div>
                );
              }
              // Regular paragraph or list
              return (
                <div key={idx} className="text-gray-700 leading-relaxed">
                  {renderMarkdown(paragraph)}
                </div>
              );
            })}
          </div>

          {/* Reasoning Steps - Always open */}
          {ai_analysis.reasoning_steps && ai_analysis.reasoning_steps.length > 0 && (
            <details className="mt-4 bg-white/50 rounded-lg p-3" open>
              <summary className="cursor-pointer text-sm font-semibold text-cyan-800 hover:text-cyan-900">
                💡 AI Reasoning Steps
              </summary>
              <ul className="mt-3 space-y-1 text-sm text-gray-700 list-disc list-inside">
                {ai_analysis.reasoning_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Continue in Chat Button */}
          {onNavigateToChat && (
            <div className="mt-4 pt-4 border-t border-cyan-200">
              <button
                onClick={() => {
                  // Build context message with AI analysis
                  const contextMessage = `I'm reviewing the AI cost analysis for my infrastructure. Here's what the AI found:\n\n${ai_analysis.narrative}\n\nI'd like to discuss these findings and ask some questions.`;
                  onNavigateToChat(contextMessage);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition shadow-md hover:shadow-lg"
              >
                💬 Continue this analysis in chat
              </button>
            </div>
          )}
        </div>
      )}

      {/* Insights section removed - Now using AI Narrative only */}

        {/* Recommendations - Grid Layout */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
            Optimization Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              // Parse action text to extract clean content
              const actionLines = rec.action.split('\n').filter(line => line.trim());
              const titleLine = actionLines[0]?.replace(/\*\*/g, '').replace(/~/g, '').trim(); // Remove all ** and ~ markdown
              const descriptionLine = actionLines[1]?.replace(/\*\*/g, '').trim() || rec.description;
              
              // Find "Recommended Actions:" section
              const actionsStartIndex = actionLines.findIndex(line => line.includes('**Recommended Actions:**'));
              const actionsEndIndex = actionLines.findIndex(line => line.includes('**Estimated Savings:**') || line.includes('**Potential Savings:**'));
              
              let actionItems = [];
              if (actionsStartIndex !== -1) {
                const endIndex = actionsEndIndex !== -1 ? actionsEndIndex : actionLines.length;
                actionItems = actionLines
                  .slice(actionsStartIndex + 1, endIndex)
                  .filter(line => line.startsWith('•'))
                  .slice(0, 3); // Show only first 3 action items
              }
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-5 ${getSeverityColor(rec.severity)} hover:shadow-md transition-shadow`}
                >
                  {/* Header with savings badge */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-semibold text-base leading-tight flex-1">
                      {titleLine}
                    </h3>
                    {rec.potential_savings && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                        Save ~${Math.round(rec.potential_savings).toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3">
                    {descriptionLine}
                  </p>
                  
                  {/* Action items */}
                  {actionItems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Recommended Actions:</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-200">
                    {onNavigateToChat && (
                      <button
                        onClick={() => onNavigateToChat(`How can I implement this recommendation: ${rec.title}?`)}
                        className="text-xs text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
                      >
                        💬 Ask AI how to implement this
                      </button>
                    )}
                    {rec.details && rec.details.data && rec.details.data.length > 0 && (
                      <button
                        onClick={() => openDetailsModal(rec)}
                        className="text-xs text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Full Report ({rec.details.total_count})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Quick Wins - Grid Layout */}
        {quick_wins && quick_wins.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-orange-500" />
            Quick Wins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quick_wins.map((win, index) => {
              // Parse action text to extract clean content
              const actionLines = win.action.split('\n').filter(line => line.trim());
              const titleLine = actionLines[0]?.replace(/\*\*/g, '').replace(/~/g, '').trim(); // Remove all ** and ~ markdown
              const descriptionLine = actionLines.find(line => !line.includes('**') && line.length > 10)?.replace(/\*\*/g, '').trim() || win.description;
              
              // Find action items
              const actionsStartIndex = actionLines.findIndex(line => line.includes('**⚡ Action:**') || line.includes('Action:'));
              let actionItems = [];
              if (actionsStartIndex !== -1) {
                actionItems = actionLines
                  .slice(actionsStartIndex + 1)
                  .filter(line => line.startsWith('•'))
                  .slice(0, 3);
              }
              
              return (
                <div
                  key={index}
                  className="border border-orange-200 rounded-lg p-5 bg-orange-50 hover:shadow-md transition-shadow"
                >
                  {/* Header with savings badge */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-semibold text-base text-orange-900 leading-tight flex-1">
                      {titleLine || win.title}
                    </h3>
                    {win.potential_savings && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold whitespace-nowrap">
                        Save ~${Math.round(win.potential_savings).toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-orange-800 mb-3">
                    {descriptionLine}
                  </p>
                  
                  {/* Action items */}
                  {actionItems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-orange-700 mb-1">Quick Actions:</p>
                      <ul className="text-xs text-orange-800 space-y-1">
                        {actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-orange-200">
                    {onNavigateToChat && (
                      <button
                        onClick={() => onNavigateToChat(`How can I implement this quick win: ${win.title}?`)}
                        className="text-xs text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
                      >
                        💬 Ask AI how to implement this
                      </button>
                    )}
                    {win.details && win.details.data && win.details.data.length > 0 && (
                      <button
                        onClick={() => openDetailsModal(win)}
                        className="text-xs text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Full Report ({win.details.total_count})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Resource Details Modal */}
        <ResourceDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={modalData}
          title={modalTitle}
          type={modalType}
        />
      </div>
    </div>
  );
}

