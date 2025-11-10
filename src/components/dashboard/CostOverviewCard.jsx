import { DollarSign, TrendingUp, Layers, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CostOverviewCard({ data }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-cyan-600" />
          Cost Overview
        </h2>
        <span className="text-sm text-gray-500">{data.period?.label}</span>
      </div>

      {/* Total Cost */}
      <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
        <p className="text-sm font-medium text-gray-600 mb-1">Total Spend</p>
        <p className="text-4xl font-bold text-cyan-900">
          ${data.total_cost?.toLocaleString()}
          <span className="text-lg ml-2 text-cyan-700">{data.currency}</span>
        </p>
      </div>

      {/* Top 3 Compartments */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Top Compartments
        </h3>
        <div className="space-y-2">
          {data.top_compartments?.map((comp, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center">
                <span className="text-xs font-bold text-gray-400 mr-2">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-700">{comp.name}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">${comp.cost.toLocaleString()}</span>
            </div>
          ))}
          {(!data.top_compartments || data.top_compartments.length === 0) && (
            <p className="text-sm text-gray-500 italic">No compartment data available</p>
          )}
        </div>
      </div>

      {/* Top 3 Services */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Server className="w-4 h-4 mr-2" />
          Top Services
        </h3>
        <div className="space-y-2">
          {data.top_services?.map((svc, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center flex-1">
                <span className="text-xs font-bold text-gray-400 mr-2">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-700 truncate">{svc.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">{svc.percentage}%</span>
                <span className="text-sm font-bold text-gray-900">${svc.cost.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {(!data.top_services || data.top_services.length === 0) && (
            <p className="text-sm text-gray-500 italic">No service data available</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

