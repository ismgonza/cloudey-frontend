import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, X, Menu, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';

export default function ConversationHistory({ userId, currentSessionId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadSessions = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/sessions/${userId}`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, userId]);

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    setIsOpen(false);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevent selecting the session
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    setDeletingId(sessionId);
    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      
      // Refresh the sessions list
      await loadSessions();
      
      // If we deleted the current session, trigger a new chat
      if (sessionId === currentSessionId) {
        onSelectSession(`session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Toggle Button - Positioned relative to main header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-6 top-28 z-40 p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary-300"
        title="Conversation History"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`relative group rounded-lg transition-all duration-200 ${
                        session.id === currentSessionId
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSession(session.id)}
                        className="w-full text-left p-3 pr-10"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-medium line-clamp-2 ${
                            session.id === currentSessionId
                              ? 'text-primary-700'
                              : 'text-gray-900'
                          }`}>
                            {session.title || 'New Conversation'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(session.updated_at)}</span>
                        </div>
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        disabled={deletingId === session.id}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
                        title="Delete conversation"
                      >
                        {deletingId === session.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

