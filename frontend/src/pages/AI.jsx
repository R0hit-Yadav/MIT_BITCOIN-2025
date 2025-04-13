import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaStop } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './AI.css';

function AI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await axios.post('/api/speech-to-text', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setInput(response.data.text);
        } catch (error) {
          console.error('Error converting speech to text:', error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

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
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </button>
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