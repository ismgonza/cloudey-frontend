import { MessageSquare, Lightbulb, GitCompare, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickActionsCard({ onNavigateToChat, onNavigateToCosts }) {
  const actions = [
    {
      icon: MessageSquare,
      title: 'Ask AI',
      description: 'Get insights about your costs',
      color: 'from-blue-500 to-blue-600',
      action: () => onNavigateToChat && onNavigateToChat()
    },
    {
      icon: TrendingUp,
      title: 'Detailed Costs',
      description: 'View 3-month cost breakdown',
      color: 'from-indigo-500 to-indigo-600',
      action: () => onNavigateToCosts && onNavigateToCosts()
    },
    {
      icon: Lightbulb,
      title: 'Get Recommendations',
      description: 'View optimization opportunities',
      color: 'from-yellow-500 to-yellow-600',
      action: () => onNavigateToChat && onNavigateToChat('Give me cost optimization recommendations')
    },
    {
      icon: GitCompare,
      title: 'Compare Clouds',
      description: 'OCI vs AWS pricing',
      color: 'from-purple-500 to-purple-600',
      action: () => onNavigateToChat && onNavigateToChat('Compare OCI and AWS pricing')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="p-4 rounded-lg bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-all group"
              style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
            >
              <div className={`bg-gradient-to-br ${action.color} p-6 rounded-lg text-white shadow-lg hover:shadow-xl transition-all`}>
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-sm mb-1">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

