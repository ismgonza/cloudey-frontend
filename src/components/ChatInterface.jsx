import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Loader2, Plus } from 'lucide-react';
import { api } from '../utils/api';
import MarkdownMessage from './MarkdownMessage';

export default function ChatInterface({ userId = 1, sessionId, initialMessage, onMessageSent, onNewChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when sessionId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!sessionId) {
        setMessages([]);
        setIsLoadingHistory(false);
        return;
      }
      
      setIsLoadingHistory(true);
      
      try {
        console.log(`Loading messages for session: ${sessionId}`);
        const response = await fetch(`http://localhost:8000/sessions/${userId}/${sessionId}/messages`);
        
        if (!response.ok) {
          console.error(`Failed to load messages: ${response.status} ${response.statusText}`);
          setMessages([]);
          setIsLoadingHistory(false);
          return;
        }
        
        const data = await response.json();
        console.log(`Loaded ${data.messages?.length || 0} messages`, data.messages);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadMessages();
  }, [sessionId, userId]);

  // Handle initial message from dashboard quick actions
  useEffect(() => {
    if (initialMessage && !isLoading) {
      setInput(initialMessage);
      // Auto-submit after a short delay
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
        if (onMessageSent) {
          onMessageSent();
        }
      }, 100);
    }
  }, [initialMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    // Show progress messages
    setLoadingMessage('Thinking...');
    const progressTimeout = setTimeout(() => {
      setLoadingMessage('Fetching data from cloud provider...');
    }, 1500);
    
    const progressTimeout2 = setTimeout(() => {
      setLoadingMessage('Analyzing your costs...');
    }, 4000);

    try {
      const response = await api.query({
        question: userMessage,
        userId,
        sessionId,
      });

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      clearTimeout(progressTimeout);
      clearTimeout(progressTimeout2);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/cloudey_logo_cloud.png" 
                alt="Cloudey" 
                className="w-10 h-10 drop-shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cloudey AI Assistant</h2>
              <p className="text-sm text-white/90">Ask me about your cloud costs</p>
            </div>
          </div>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/40 backdrop-blur-sm"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mb-6">
                <img 
                  src="/cloudey_logo_cloud.png" 
                  alt="Cloudey" 
                  className="w-24 h-24 mx-auto drop-shadow-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Welcome to Cloudey!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Ask me anything about your cloud costs. Try asking:
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="inline-block px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors cursor-default">
                  💬 "List my compartments"
                </div>
                <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-default block">
                  📊 "What are my costs for last month?"
                </div>
                <div className="inline-block px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors cursor-default block">
                  🔍 "Show me costs for the dev compartment"
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                    : message.role === 'error'
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <img 
                      src="/cloudey_logo_cloud.png" 
                      alt="Cloudey" 
                      className="w-6 h-6"
                    />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                    : message.role === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}>
                  {message.role === 'user' || message.role === 'error' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm">
                      <MarkdownMessage content={message.content} isUser={false} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex space-x-3 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <img 
                    src="/cloudey_logo_cloud.png" 
                    alt="Cloudey" 
                    className="w-6 h-6"
                  />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-200 flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                  <span className="text-sm text-gray-600">{loadingMessage}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Submit on Enter (without Shift), allow Shift+Enter for new line
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about your cloud costs... (Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none overflow-y-auto max-h-32 bg-white"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}

