import { useState, useEffect } from 'react';
import { RefreshCw, Database } from 'lucide-react';
import CostOverviewCard from '../components/dashboard/CostOverviewCard';
import OptimizationSummaryCard from '../components/dashboard/OptimizationSummaryCard';
import CostAlertsCard from '../components/dashboard/CostAlertsCard';
import ResourceInventoryCard from '../components/dashboard/ResourceInventoryCard';
import CostTrendCard from '../components/dashboard/CostTrendCard';

// Random loading messages
const LOADING_MESSAGES = [
  "Loading your cloud insights...",
  "Fetching cost overview...",
  "Preparing your dashboard...",
  "Analyzing resource usage...",
  "Gathering optimization tips...",
  "Compiling cost trends...",
  "Building your dashboard...",
  "Calculating savings opportunities...",
  "Organizing your cloud data...",
  "Retrieving compartment data...",
  "Processing cost metrics...",
  "Scanning for optimizations...",
  "Preparing recommendations...",
  "Collecting resource inventory...",
  "Analyzing spending patterns...",
  "Generating cost insights...",
  "Reviewing cloud expenses...",
  "Assembling your overview...",
  "Evaluating cost efficiency...",
  "Discovering trends..."
];

export default function Dashboard({ userId = 1, onNavigateToChat, onNavigateToCosts }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [syncStats, setSyncStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Set random loading message on mount
  useEffect(() => {
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setLoadingMessage(randomMessage);
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setRefreshing(true);
      const url = `http://localhost:8000/dashboard/${userId}${forceRefresh ? '?force_refresh=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSyncStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/resources/stats/${userId}`);
      if (response.ok) {
        const stats = await response.json();
        setSyncStats(stats);
      }
    } catch (err) {
      console.error('Error fetching sync stats:', err);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`http://localhost:8000/resources/sync/${userId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync resources');
      }
      
      const result = await response.json();
      console.log('Sync complete:', result);
      
      // Refresh sync stats and dashboard after successful sync
      await fetchSyncStats();
      await fetchDashboardData(true);
    } catch (err) {
      console.error('Error syncing resources:', err);
      setError(`Failed to sync resources: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSyncStats();
  }, [userId]);

  const handleRefresh = () => {
    // Force refresh bypasses cache
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cloud Cost Dashboard
            </h1>
            <p className="text-gray-600">
              {dashboardData?.cost_overview?.period?.label || 'Current Month'} Overview
            </p>
            {syncStats && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Database className="w-4 h-4" />
                <span>{syncStats.active_resources || 0} active resources</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              title="Sync resources from OCI"
            >
              <Database className={`w-5 h-5 ${syncing ? 'animate-pulse' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Resources'}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Cost Overview and Cost Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostOverviewCard data={dashboardData?.cost_overview} />
          <CostTrendCard data={dashboardData?.cost_trend} />
        </div>

        {/* Row 2: Resource Inventory and Optimization Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceInventoryCard data={dashboardData?.resource_inventory} />
          <OptimizationSummaryCard data={dashboardData?.optimization_summary} />
        </div>

        {/* Row 3: Cost Alerts - Removed (now in Optimization Summary) */}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-6 text-center text-sm text-gray-500">
        Last updated: {dashboardData?.metadata?.generated_at ? 
          new Date(dashboardData.metadata.generated_at).toLocaleString() : 
          'N/A'
        }
      </div>
    </div>
  );
}

