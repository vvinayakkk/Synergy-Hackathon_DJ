import React, { useState } from 'react';
import axios from 'axios';

const AIChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample popular questions from the image
  const popularQuestions = [
    "What are the key changes proposed in the New Income Tax Bill 2025?",
    "Are there any changes in Short-Term and Long-Term Capital Gains taxation?",
    "How is the Financial Year defined under the new Act?",
    "How many new Chapters and Schedules are proposed in the bill?",
    "Will the bill introduce new tax slabs or modify existing ones?",
    "When will the New Income Tax Bill be implemented?"
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message immediately
      const userMessage = { role: 'user', content: inputValue };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      // Send request to backend
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        message: userMessage.content
      });

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response || 'Sorry, I could not process your request.'
      }]);

    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Failed to get response from AI. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    setInputValue(question);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`flex flex-col bg-gray-900 border-r border-gray-700 transition-all ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 flex justify-between items-center">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? '»' : '«'}
          </button>
          {!isCollapsed && (
            <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              <span>+</span>
              <span>New Chat</span>
            </button>
          )}
        </div>
        
        {/* Here you would map through previous chats */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat history would go here */}
        </div>
        
        {!isCollapsed && (
          <div className="p-4 mt-auto">
            <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md w-full justify-center hover:bg-blue-700">
              <span>↑</span>
              <span>Upgrade at ₹0</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <img 
                  src="/placeholder-image.png" 
                  alt="Budget 2025" 
                  className="max-w-md opacity-70"
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <div className="text-3xl font-bold text-white">Budget 2025</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3/4 p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-500 bg-opacity-20 text-red-400 p-2 rounded-lg text-sm">
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className={`w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Popular Questions */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        <div className="flex items-center mb-4">
          <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-medium">What people are asking?</h3>
        </div>
        <div className="space-y-4">
          {popularQuestions.map((question, index) => (
            <div 
              key={index} 
              className="bg-gray-800 p-3 rounded-md cursor-pointer hover:bg-gray-700"
              onClick={() => handleQuestionClick(question)}
            >
              {question}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;