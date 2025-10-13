import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FiSend, FiSun, FiMoon, FiTrash2 } from 'react-icons/fi';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      text: "Hello! I'm your mental health support bot. Remember, I'm not a therapist—always seek professional help for serious concerns. What's on your mind?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
    }
  }, [input]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    const currentSessionId = sessionId || uuidv4();
    const originalInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/chat', {
        message: originalInput,
        sessionId: currentSessionId,
      });

      const botMessage = {
        id: uuidv4(),
        text: res.data.reply,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      if (!sessionId) setSessionId(currentSessionId);
    } catch (error) {
      let errorText = 'Sorry, I couldn\'t respond right now. Please check your connection and try again.';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) errorText = 'Invalid message. Please try again.';
        else if (status === 401) errorText = 'API setup issue—check backend keys.';
        else if (status === 429) errorText = 'Rate limit hit. Take a breather and try again soon.';
        else if (status === 500) errorText = 'Backend hiccup. Refresh and retry.';
      }

      const errorMessage = {
        id: uuidv4(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setSessionId('');
    setInput('');
  };

  // Theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">MH</div>
            <div className="brand-text">
              <h2>Mental Health Chat</h2>
              <p>Supportive • Private • Local</p>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn ghost" onClick={clearChat} title="Clear chat">
              <FiTrash2 /> <span>Clear</span>
            </button>
            <button className="btn ghost" onClick={toggleTheme} title="Toggle theme">
              {darkMode ? <FiSun /> : <FiMoon />} <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="about">
            <strong>Tips</strong>
            <ul>
              <li>Be open — the bot listens.</li>
              <li>Short messages work best.</li>
              <li>Not a substitute for therapy.</li>
            </ul>
          </div>
        </aside>

        <main className="main">
          <header className="header">
            <h1>Talk to someone who listens</h1>
            <p className="sub">Private & local (runs on your machine)</p>
          </header>

          <section className="chat-container">
            <div className="messages" aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender}`}>
                  <div className="avatar">{msg.sender === 'bot' ? 'B' : 'U'}</div>
                  <div className="message-bubble">
                    <div className="message-text">{msg.text}</div>
                    <div className="meta">
                      <span className="timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-row bot typing-row">
                  <div className="avatar">B</div>
                  <div className="message-bubble typing">
                    <div className="dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="How are you feeling? Ask, share, or say anything..."
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-btn"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                title="Send"
              >
                <FiSend />
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
