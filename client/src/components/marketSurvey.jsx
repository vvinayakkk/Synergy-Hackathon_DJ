import React, { useState } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../themeContext';
import s from '../assets/dash.svg'

const MarketSentimentSurvey = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className={`${theme === 'dark' 
      ? 'bg-gray-900 bg-opacity-50 border-blue-800' 
      : 'bg-white bg-opacity-70 border-blue-200'} 
      backdrop-blur-md rounded-xl border p-6 mb-6`}>
      
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-3/5">
          <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            What's your view on the market currently?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer w-full">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="marketSentiment"
                  value="bullish"
                  checked={selectedOption === 'bullish'}
                  onChange={() => handleOptionSelect('bullish')}
                />
                <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg`}>Bullish</span>
                <div className="ml-4 bg-gray-800 h-2 rounded-full flex-grow overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-300 h-full rounded-full"
                    style={{ width: selectedOption === 'bullish' ? '100%' : '0%', transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer w-full">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-red-600"
                  name="marketSentiment"
                  value="bearish"
                  checked={selectedOption === 'bearish'}
                  onChange={() => handleOptionSelect('bearish')}
                />
                <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg`}>Bearish</span>
                <div className="ml-4 bg-gray-800 h-2 rounded-full flex-grow overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-pink-300 h-full rounded-full"
                    style={{ width: selectedOption === 'bearish' ? '100%' : '0%', transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer w-full">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-yellow-600"
                  name="marketSentiment"
                  value="neutral"
                  checked={selectedOption === 'neutral'}
                  onChange={() => handleOptionSelect('neutral')}
                />
                <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg`}>Neutral</span>
                <div className="ml-4 bg-gray-800 h-2 rounded-full flex-grow overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-300 h-full rounded-full"
                    style={{ width: selectedOption === 'neutral' ? '100%' : '0%', transition: 'width 0.5s ease-in-out' }}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-2/5 flex justify-center mt-6 md:mt-0">
          <img src={s} alt="Market Survey" className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentSurvey;