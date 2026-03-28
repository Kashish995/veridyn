import { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import '../styles/chat.css';

const QUICK_PROMPTS = [
  "Help me plan my day",
  "How to stay motivated?",
  "Tips for better focus",
  "Build a study habit",
  "How to improve DSA?",
];

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI productivity coach 🚀 I can help you plan your day, beat procrastination, build habits, and stay consistent. What's on your mind?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { messages: updatedMessages });
      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an issue. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! I'm ready to help. What's on your mind?" }]);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-header">🤖</div>
          <div>
            <div className="chat-header-name">AI Productivity Coach</div>
            <div className="chat-header-status"><span className="status-dot"></span> Online</div>
          </div>
        </div>
        <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">🗑️</button>
      </div>

      <div className="chat-quick-prompts">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button key={i} className="quick-prompt-btn" onClick={() => sendMessage(prompt)} disabled={isLoading}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
            <div className="message-bubble">
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about productivity..."
          rows="1"
          disabled={isLoading}
        />
        <button className="chat-send-btn" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
          {isLoading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;