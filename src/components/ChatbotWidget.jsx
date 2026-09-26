import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Trash2, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { ADMIN_PATH } from '../config/adminPath';
import './ChatbotWidget.css';

const INITIAL_WELCOME_MSG = {
  id: 'welcome-1',
  role: 'model',
  content: "Hello! 👋 I'm your official AI Shopping Assistant. How can I help you find laptops, CCTV cameras, solar inverters, or check store policies today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_PILLS = [
  "💻 What laptops are available?",
  "🎥 Show security cameras",
  "⚡ Solar inverters & specs",
  "🚚 What is the shipping fee?",
  "🔄 How does 7-day return work?",
];

export default function ChatbotWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME_MSG]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Draggable position state
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('chatbot_widget_pos');
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dragStartRef = useRef(null);
  const hasDraggedRef = useRef(false);

  // Clear any old stale chat history from sessionStorage on mount
  useEffect(() => {
    try {
      sessionStorage.removeItem('storefront_chat_history');
    } catch {
      // Ignore
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Maintain seamless cursor focus on input box after sending or AI reply
  useEffect(() => {
    if (isOpen && !isLoading) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading]);

  // Pointer drag handlers for floating icon
  const handlePointerDown = (e) => {
    // Only primary button drag
    if (e.button !== undefined && e.button !== 0) return;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if setPointerCapture unsupported
    }
  };

  const handlePointerMove = (e) => {
    if (!dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    if (Math.hypot(deltaX, deltaY) > 5) {
      hasDraggedRef.current = true;
    }
    const newPos = {
      x: dragStartRef.current.origX + deltaX,
      y: dragStartRef.current.origY + deltaY,
    };
    setPosition(newPos);
  };

  const handlePointerUp = (e) => {
    if (!dragStartRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    dragStartRef.current = null;
    try {
      localStorage.setItem('chatbot_widget_pos', JSON.stringify(position));
    } catch {
      // Ignore
    }
  };

  // Hide widget completely on admin panel routes
  const isAdminRoute = location.pathname.startsWith(ADMIN_PATH);

  if (isAdminRoute) return null;

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setErrorMsg(null);

    // Prepare history payload (excluding welcome msg & system fallback errors)
    const historyPayload = messages
      .filter(
        (m) =>
          m.id !== 'welcome-1' &&
          m.role &&
          m.content &&
          !m.content.includes('trouble getting details') &&
          !m.content.includes('temporarily unavailable') &&
          !m.content.includes('routine maintenance')
      )
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post(ENDPOINTS.CHAT.SEND, {
        message: text,
        history: historyPayload,
      });

      const aiReplyText =
        res?.reply ||
        res?.data?.reply ||
        "Hello! Welcome to IT Solutions Pakistan! How can I help you find laptops, CCTV cameras, or store details today?";

      const modelMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err?.message ||
        "Our assistant is currently experiencing high demand. Please ask your question again or call our support line at +92 300 4265499!";
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MSG]);
    sessionStorage.removeItem('storefront_chat_history');
    setErrorMsg(null);
  };

  // Helper to render text with clickable internal React Router links for /product/slug or /category/slug
  const renderFormattedContent = (content) => {
    const parts = content.split(/(\/(?:product|category)\/[a-zA-Z0-9_-]+)/g);
    return parts.map((part, idx) => {
      if (/^\/(?:product|category)\/[a-zA-Z0-9_-]+$/.test(part)) {
        return (
          <Link key={idx} to={part} onClick={() => setIsOpen(false)} className="underline text-blue-600 font-medium hover:text-blue-800">
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const containerStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
    transition: dragStartRef.current ? 'none' : 'transform 0.1s ease-out',
  };

  return (
    <div className="chatbot-container" style={containerStyle}>
      {/* Floating Toggle Button (Draggable) */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (hasDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            hasDraggedRef.current = false;
            return;
          }
          setIsOpen(!isOpen);
        }}
        className="chatbot-trigger"
        aria-label="Toggle AI Shopping Assistant"
        title="Chat with AI Assistant (Drag to move)"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        {!isOpen && <span className="chatbot-trigger-badge" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={22} />
              </div>
              <div>
                <div className="chatbot-title flex items-center gap-1.5">
                  AI Assistant <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="chatbot-status">
                  <span className="chatbot-online-dot" /> Store Shopping Guide
                </div>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                onClick={handleClearChat}
                className="chatbot-action-btn"
                title="Clear Conversation"
                aria-label="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-action-btn"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg ${msg.role}`}>
                <div className="chatbot-bubble">
                  {renderFormattedContent(msg.content)}
                  <div className="chatbot-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Quick Suggestion Pills on initial load */}
            {messages.length === 1 && !isLoading && (
              <div className="chatbot-suggestions">
                {QUICK_PILLS.map((pill, i) => (
                  <button key={i} onClick={() => handleSendMessage(pill)} className="chatbot-pill">
                    {pill}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Animation */}
            {isLoading && (
              <div className="chatbot-msg model">
                <div className="chatbot-typing">
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {errorMsg && <div className="chatbot-error-banner">{errorMsg}</div>}

          {/* Footer Input Form */}
          <div className="chatbot-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="chatbot-input-form"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about products, specs, shipping..."
                className="chatbot-input"
                maxLength={500}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="chatbot-send-btn"
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
