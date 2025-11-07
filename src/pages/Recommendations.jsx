import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Lightbulb,
  DollarSign,
  RefreshCw,
  Zap
} from 'lucide-react';

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

  const { insights, recommendations, quick_wins, summary, total_potential_savings } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600 mt-1">Powered by cached data & real-time utilization metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshMetrics}
            disabled={metricsLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            {metricsLoading ? 'Syncing...' : 'Refresh Metrics'}
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
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
              ${total_potential_savings?.toLocaleString() || 0}/month
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

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
            Cost Insights
          </h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}
              >
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm mb-2">{insight.description}</p>
                {insight.action && (
                  <div className="text-sm font-medium">
                    💡 Action: {renderMarkdown(insight.action)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
            Optimization Recommendations
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSeverityColor(rec.severity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{rec.title}</h3>
                  {rec.potential_savings && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Save ~${rec.potential_savings.toLocaleString()}/mo
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2">{rec.description}</p>
                <div className="text-sm font-medium mb-2">
                  🎯 Action: {renderMarkdown(rec.action)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {quick_wins && quick_wins.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-orange-500" />
            Quick Wins
          </h2>
          <div className="space-y-4">
            {quick_wins.map((win, index) => (
              <div
                key={index}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-orange-900">{win.title}</h3>
                  {win.potential_savings && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                      Save ~${win.potential_savings.toLocaleString()}/mo
                    </span>
                  )}
                </div>
                <p className="text-sm text-orange-800 mb-2">{win.description}</p>
                <div className="text-sm font-medium text-orange-900">
                  ⚡ Action: {renderMarkdown(win.action)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask AI Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ask AI for More Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleAskAI("Why did my costs change this month?")}
            className="px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
          >
            <span className="font-medium text-blue-900">Why did costs change?</span>
          </button>
          <button
            onClick={() => handleAskAI("What are my top 10 most expensive resources?")}
            className="px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
          >
            <span className="font-medium text-blue-900">Top expensive resources</span>
          </button>
          <button
            onClick={() => handleAskAI("Compare my costs over the last 3 months")}
            className="px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
          >
            <span className="font-medium text-blue-900">Compare 3-month trend</span>
          </button>
          <button
            onClick={() => handleAskAI("What optimization opportunities exist?")}
            className="px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
          >
            <span className="font-medium text-blue-900">Find optimizations</span>
          </button>
        </div>
      </div>
    </div>
  );
}

