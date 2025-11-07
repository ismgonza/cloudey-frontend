import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CostTrendCard({ data }) {
  if (!data) return null;

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return TrendingUp;
    if (trend === 'decreasing') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (trend) => {
    if (trend === 'increasing') return 'text-red-600';
    if (trend === 'decreasing') return 'text-green-600';
    return 'text-gray-600';
  };

  const getTrendBgColor = (trend) => {
    if (trend === 'increasing') return 'bg-red-50';
    if (trend === 'decreasing') return 'bg-green-50';
    return 'bg-gray-50';
  };

  const CompleteTrendIcon = getTrendIcon(data.complete_months_trend);
  const MTDTrendIcon = getTrendIcon(data.mtd_trend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
          Cost Trend
        </h2>
      </div>

      {/* Section 1: Complete Months Comparison */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Last Three Complete Months</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {data.complete_months?.map((month, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                index === 2 ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <p className="text-xs font-medium text-gray-600 mb-1">{month.name}</p>
              <p className={`text-lg font-bold ${
                index === 2 ? 'text-blue-900' : 'text-gray-900'
              }`}>
                ${month.total?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className={`p-3 ${getTrendBgColor(data.complete_months_trend)} rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CompleteTrendIcon className={`w-5 h-5 ${getTrendColor(data.complete_months_trend)}`} />
              <span className={`text-sm font-medium ${getTrendColor(data.complete_months_trend)}`}>
                {data.complete_months_trend?.charAt(0).toUpperCase() + data.complete_months_trend?.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${getTrendColor(data.complete_months_trend)}`}>
                {data.complete_months_change_pct > 0 ? '+' : ''}
                {data.complete_months_change_pct}%
              </p>
              <p className="text-xs text-gray-600">vs 2-month avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Month-to-Date Comparison */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Month-to-Date (Day {data.current_day})</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">{data.current_month_name} (MTD)</p>
            <p className="text-xl font-bold text-purple-900">
              ${data.current_mtd?.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">Same Period Last Month</p>
            <p className="text-xl font-bold text-gray-900">
              ${data.same_period_last_month?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className={`p-3 ${getTrendBgColor(data.mtd_trend)} rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MTDTrendIcon className={`w-5 h-5 ${getTrendColor(data.mtd_trend)}`} />
              <span className={`text-sm font-medium ${getTrendColor(data.mtd_trend)}`}>
                {data.mtd_trend?.charAt(0).toUpperCase() + data.mtd_trend?.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold ${getTrendColor(data.mtd_trend)}`}>
                {data.mtd_change_pct > 0 ? '+' : ''}
                {data.mtd_change_pct}%
              </p>
              <p className="text-xs text-gray-600">vs same period</p>
            </div>
          </div>
        </div>

        {/* Trend Message */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-700">
            {data.mtd_trend === 'increasing' && (
              <>📈 Spending is <strong>up</strong> compared to the same period last month.</>
            )}
            {data.mtd_trend === 'decreasing' && (
              <>📉 Great! Spending is <strong>down</strong> compared to the same period last month.</>
            )}
            {data.mtd_trend === 'stable' && (
              <>📊 Spending is <strong>consistent</strong> with the same period last month.</>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

