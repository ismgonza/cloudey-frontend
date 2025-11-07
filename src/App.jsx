import { useState } from 'react';
import { Cloud, Settings, Plus, LayoutDashboard, MessageSquare, DollarSign, Lightbulb } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CostsDetail from './pages/CostsDetail';
import Recommendations from './pages/Recommendations';
import ChatInterface from './components/ChatInterface';
import OCIConfigModal from './components/OCIConfigModal';
import ConversationHistory from './components/ConversationHistory';

function App() {
  const [sessionId, setSessionId] = useState(`session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'costs', 'recommendations', or 'chat'
  const [initialChatMessage, setInitialChatMessage] = useState(null);
  const userId = 1; // TODO: Get from auth in production

  const handleNewChat = () => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    setCurrentView('chat');
  };

  const handleSelectSession = async (selectedSessionId) => {
    setSessionId(selectedSessionId);
    setCurrentView('chat');
  };

  const handleNavigateToChat = (message = null) => {
    if (message) {
      setInitialChatMessage(message);
      setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(7)}`); // New session for quick action
    }
    setCurrentView('chat');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleNavigateToCosts = () => {
    setCurrentView('costs');
  };

  const handleNavigateToRecommendations = () => {
    setCurrentView('recommendations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
      <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Cloudey
                </h1>
                <p className="text-xs text-gray-500">Cloud Cost Intelligence</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleNavigateToDashboard}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                    currentView === 'dashboard'
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
                <button
                  onClick={handleNavigateToCosts}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                    currentView === 'costs'
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Costs</span>
                </button>
                <button
                  onClick={handleNavigateToRecommendations}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                    currentView === 'recommendations'
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Insights</span>
                </button>
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition ${
                    currentView === 'chat'
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
      </div>

              <button
                onClick={handleNewChat}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Chat</span>
              </button>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">OCI Config</span>
        </button>
            </div>
          </div>
      </div>
      </header>

      {/* Main Content */}
      {currentView === 'dashboard' && (
        <Dashboard 
          userId={userId} 
          onNavigateToChat={handleNavigateToChat}
          onNavigateToCosts={handleNavigateToCosts}
        />
      )}

      {currentView === 'costs' && (
        <CostsDetail />
      )}

      {currentView === 'recommendations' && (
        <main className="container mx-auto px-4 py-8">
          <Recommendations 
            userId={userId}
            onNavigateToChat={handleNavigateToChat}
          />
        </main>
      )}

      {currentView === 'chat' && (
        <>
          <main className="container mx-auto px-4 py-8 h-[calc(100vh-88px)]">
            <ChatInterface 
              userId={userId} 
              sessionId={sessionId}
              initialMessage={initialChatMessage}
              onMessageSent={() => setInitialChatMessage(null)}
            />
          </main>

          {/* Conversation History Sidebar */}
          <ConversationHistory
            userId={userId}
            currentSessionId={sessionId}
            onSelectSession={handleSelectSession}
          />
        </>
      )}

      {/* OCI Config Modal */}
      <OCIConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSuccess={() => {
          // Could show a success notification here
        }}
      />
    </div>
  );
}

export default App;
