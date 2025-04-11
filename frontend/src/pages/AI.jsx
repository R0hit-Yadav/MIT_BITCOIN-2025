import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './AI.css';

function AI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Send initial AI greeting when component mounts
    setMessages([{ text: "How can I Help You About Crypto?", user: false }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput('');

      try {
        setLoading(true);
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCF-WWD3d2tx_lcKPk0b3Qo2rvir6Qox2M',
          {
            "contents": [
              {
                "parts": [
                  {
                    "text": input
                  }
                ]
              }
            ]
          }
        );
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      }
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-background">
        <video autoPlay loop muted playsInline>
          <source src="/static/images/mitors.mp4" type="video/mp4" />
        </video>
      </div>
      
      <div className="ai-content">
        <div className="ai-header">
          
          <h1>VaultX AI <FaRobot className="ai-icon" /></h1>
          <span className="ai-subtitle">Your Intelligent Crypto Companion</span>
        </div>

        <div className="messages-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.user ? 'message-user' : 'message-bot'}`}>
                <div className="message-avatar">
                  {msg.user ? <FaUser /> : <FaRobot />}
                </div>
                <div className={`message-content ${msg.user ? 'user' : 'bot'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message message-bot">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content bot">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="Ask me anything about Crypto..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="send-button" 
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AI;