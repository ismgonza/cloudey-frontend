import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import CompartmentCostsTable from '../components/costs/CompartmentCostsTable';
import ServicesSummaryTable from '../components/costs/ServicesSummaryTable';
import TopCostDriversTable from '../components/costs/TopCostDriversTable';

const API_BASE_URL = 'http://localhost:8000';

// Random loading messages
const LOADING_MESSAGES = [
  "Crunching the numbers...",
  "Analyzing your cloud spending...",
  "Fetching cost data from the cloud...",
  "Calculating compartment expenses...",
  "Gathering service breakdowns...",
  "Organizing your cost insights...",
  "Preparing your financial overview...",
  "Scanning through OCI resources...",
  "Compiling cost trends...",
  "Aggregating billing data...",
  "Discovering cost patterns...",
  "Building your cost report...",
  "Optimizing data presentation...",
  "Collecting resource metrics...",
  "Processing usage statistics...",
  "Analyzing spending trends...",
  "Calculating cost savings...",
  "Reviewing compartment allocations...",
  "Examining service costs...",
  "Generating detailed insights..."
];

function CostsDetail() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  // TODO: Get user_id from auth/context (hardcoded for now)
  const userId = 1;

  // Set random loading message on mount
  useEffect(() => {
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setLoadingMessage(randomMessage);
  }, []);

  const fetchDetailedCosts = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = `${API_BASE_URL}/costs/detailed/${userId}${forceRefresh ? '?force_refresh=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch detailed costs');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching detailed costs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetailedCosts();
  }, []);

  const handleRefresh = () => {
    fetchDetailedCosts(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchDetailedCosts()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detailed Cost Analysis</h1>
              <p className="text-sm text-gray-600 mt-1">
                Last 3 months: {data?.metadata?.month_names?.join(' • ')}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                refreshing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Totals Summary */}
          {data?.totals && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {data.totals.months.map((amount, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">{data.metadata.month_names[idx]}</p>
                  <p className="text-lg font-semibold text-gray-900">${amount.toLocaleString()}</p>
                </div>
              ))}
              <div className={`rounded-lg p-3 ${
                data.totals.color === 'green' ? 'bg-green-50' :
                data.totals.color === 'red' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <p className="text-xs text-gray-600">Trend</p>
                <p className={`text-lg font-semibold ${
                  data.totals.color === 'green' ? 'text-green-600' :
                  data.totals.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.totals.change_pct > 0 ? '+' : ''}{data.totals.change_pct}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Compartments with Expandable Services */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              💼 Cost by Compartment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click any row to expand services breakdown
            </p>
          </div>
          <div className="p-6">
            <CompartmentCostsTable
              data={data?.compartments || []}
              monthNames={data?.metadata?.month_names || []}
              totals={data?.totals}
            />
          </div>
        </div>

        {/* Section 2: Services Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              🔧 Cost by Service (All Compartments)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Aggregated service costs across all compartments
            </p>
          </div>
          <div className="p-6">
            <ServicesSummaryTable
              data={data?.services_summary || []}
              monthNames={data?.metadata?.month_names || []}
            />
          </div>
        </div>

        {/* Section 3: Top Cost Drivers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              🔥 Top 10 Most Expensive Resources
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Highest cost resources in {data?.metadata?.month_names?.[2] || 'latest month'}
            </p>
          </div>
          <div className="p-6">
            <TopCostDriversTable data={data?.top_cost_drivers || []} />
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-6 text-center text-sm text-gray-500">
          Last updated: {data?.metadata?.generated_at ? 
            new Date(data.metadata.generated_at).toLocaleString() : 
            'N/A'
          }
        </div>
      </div>
    </div>
  );
}

export default CostsDetail;

