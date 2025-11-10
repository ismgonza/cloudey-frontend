import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Plus } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cloudey AI Assistant</h2>
              <p className="text-sm text-primary-100">Ask me about your cloud costs</p>
            </div>
          </div>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/30"
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
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
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
              <Bot className="w-16 h-16 mx-auto text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to Cloudey!
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask me anything about your cloud costs. Try asking:
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• "List my compartments"</p>
                <p>• "What are my costs for last month?"</p>
                <p>• "Show me costs for the dev compartment"</p>
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
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                    : message.role === 'error'
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : message.role === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-gray-100 flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
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
      <div className="border-t border-gray-200 p-4">
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none overflow-y-auto max-h-32"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
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

