import React from 'react';
// Import SVG assets from your assets folder
import s from '../assets/dash.svg'
import s2 from '../assets/s.svg'
import { useNavigate } from 'react-router-dom';

const RecentAISessionsComponent = () => {
  // State to track if there are active sessions (for demo purposes)
  const hasActiveSessions = false;
  const navigate = useNavigate();
  
  // Sample AI session data
  const sampleSession = {
    question: "How has Kotak Mahindra Bank's asset quality evolved over the last 5 quarters?",
    answers: [
      {
        topic: "GNPA Trend:",
        content: "There was a significant reduction in GNPA from 6,469 crores in June 2023 to ₹5,275 crores in March 2024. This indicates an improvement in asset quality over the last three quarters."
      },
      {
        topic: "NNPA Trend:",
        content: "Similarly, NNPA decreased from 1,736 crores in"
      }
    ],
    recentQuestion: "Why is Tata Motors down 30% from ATH?"
  };

  return (
    <div className="w-full mt-8 bg-gray-900 text-white rounded-lg border border-gray-800 bg-opacity-90 p-6">
      <div className="flex flex-col lg:flex-row">
        {/* Left Section - Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <h2 className="text-3xl font-bold mb-8 self-start">Recent Ask AI Sessions</h2>
          
          {/* Background stars/sparkles */}
          <div className="absolute top-10 left-1/4">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
          <div className="absolute top-20 left-1/3">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
          <div className="absolute top-40 left-1/4">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
          <div className="absolute top-30 right-1/4">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
          <div className="absolute top-20 right-1/3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
          
          {/* Centered content */}
          <div className="flex flex-col items-center">
            {/* Box SVG */}
            <img src={s} alt="AI Box" className="w-64 h-64 mb-6" />
            
            <p className="text-xl mb-6">You have no active Ask AI sessions.</p>
            
            <button onClick={() => navigate('/ai')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg w-full max-w-md transition-colors duration-200">
              Ask AI
            </button>
          </div>
        </div>
        
        {/* Right Section - Sample Sessions */}
        <div className="w-full lg:w-96 mt-8 lg:mt-0 lg:ml-8 relative">
          {/* Stars decoration */}
          
          <img src={s2} alt="AI Box" className="w-96 h-96 mb-6" />
        </div>
      </div>
    </div>
  );
};

export default RecentAISessionsComponent;