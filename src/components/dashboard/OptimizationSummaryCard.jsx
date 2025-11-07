import { Lightbulb, TrendingDown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OptimizationSummaryCard({ data }) {
  if (!data) return null;

  const severityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
          Optimization Summary
        </h2>
        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
          {data.total_recommendations || 0} recommendations
        </span>
      </div>

      {/* Potential Savings */}
      <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
          <TrendingDown className="w-4 h-4 mr-1 text-green-600" />
          Potential Annual Savings
        </p>
        <p className="text-3xl font-bold text-green-700">
          ${data.potential_annual_savings?.toLocaleString() || '0'}
          <span className="text-sm ml-2 font-normal text-green-600">/year</span>
        </p>
      </div>

      {/* Severity Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-700">{data.high_severity || 0}</p>
          <p className="text-xs text-red-600 font-medium">High</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-700">{data.medium_severity || 0}</p>
          <p className="text-xs text-yellow-600 font-medium">Medium</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">{data.low_severity || 0}</p>
          <p className="text-xs text-blue-600 font-medium">Low</p>
        </div>
      </div>

      {/* Top Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Recommendations</h3>
        <div className="space-y-2">
          {data.top_recommendations?.map((rec, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-medium text-gray-800 flex-1">{rec.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severityColors[rec.severity]}`}>
                  {rec.severity}
                </span>
              </div>
              <p className="text-xs text-gray-600">Savings: {rec.savings}</p>
            </div>
          ))}
          {(!data.top_recommendations || data.top_recommendations.length === 0) && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">✅ No optimization opportunities found!</p>
              <p className="text-xs text-gray-400 mt-1">Your infrastructure is well-optimized</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

