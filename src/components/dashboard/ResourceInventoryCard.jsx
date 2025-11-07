import { Server, HardDrive, Layers, PlayCircle, PauseCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResourceInventoryCard({ data }) {
  if (!data) return null;

  const resources = [
    {
      icon: PlayCircle,
      label: 'Running Instances',
      value: data.running_instances,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: PauseCircle,
      label: 'Stopped Instances',
      value: data.stopped_instances,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: HardDrive,
      label: 'Block Volumes',
      value: data.block_volumes,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Layers,
      label: 'Compartments',
      value: data.compartments,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const healthScore = data.stopped_instances === 0 ? 100 : 
    Math.round((data.running_instances / data.total_instances) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Server className="w-6 h-6 mr-2 text-primary-600" />
          Resource Inventory
        </h2>
        {data.stopped_instances > 0 && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
            ⚠️ {data.stopped_instances} stopped
          </span>
        )}
      </div>

      {/* Health Score */}
      <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Resource Health</p>
            <p className="text-3xl font-bold text-primary-900">{healthScore}%</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(healthScore / 100) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-2 gap-3">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 ${resource.bgColor} rounded-lg hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={`w-5 h-5 ${resource.color}`} />
                <span className="text-xs font-medium text-gray-600">{resource.label}</span>
              </div>
              <p className={`text-2xl font-bold ${resource.color}`}>
                {resource.value?.toLocaleString() || 0}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

