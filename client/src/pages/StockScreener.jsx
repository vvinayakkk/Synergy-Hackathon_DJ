import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../themeContext';
import MarketHeader from '../components/header';
import Footer from '../components/footer';

const StockScreener = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleStartScreening = () => {
    navigate('/screener/new-screen');
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4">Stock Screener</h1>
          <p className={`text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>All the tools you need to make wise & effective investment decisions</p>
        </div>

        <div className="flex justify-center mb-16">
          <button 
            onClick={handleStartScreening}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Start Screening
          </button>
        </div>

        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-lg p-8 max-w-3xl mx-auto mb-16 border`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-1">Create your first screen</h2>
            <p className="text-gray-400">Choose from 100+ filters to discover more than 5000 stocks</p>
          </div>
          <div className="flex justify-end">
            <button className="border border-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create new screen
            </button>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className={`border border-dashed ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          } rounded-full p-8 flex justify-center items-center`}>
            <div className={`${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } rounded-lg p-6 max-w-3xl w-full border`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl">My Screen</h3>
                <div className="flex space-x-2">
                  <button className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    Filters
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 h-8 rounded"></div>
                <div className="bg-gray-700 h-8 rounded"></div>
                <div className="bg-gray-700 h-8 rounded"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 h-8 rounded"></div>
                <div className="bg-gray-700 h-8 rounded"></div>
              </div>
              
              <div className="flex justify-between space-x-4 mb-4">
                <button className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded flex items-center justify-between w-1/3">
                  <span>Debt Ratio</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-between w-1/3">
                  <span>PE ratio</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-between w-1/3">
                  <span>Market Cap</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <button className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded flex items-center justify-between w-1/3">
                  <span>Sector</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              
            </div>
          </div>
          
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -bottom-24 -right-36">
              <div className="relative">
                <div className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } p-8 rounded-lg shadow-lg w-72 border`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Market Cap</h4>
                    <button className="text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full px-2">
                      <div className="relative h-1 bg-gray-600 rounded-full">
                        <div className="absolute left-0 top-0 h-1 w-1/2 bg-blue-500 rounded-full"></div>
                        <div className="absolute left-0 top-0 h-4 w-4 bg-white rounded-full -mt-1.5 cursor-pointer"></div>
                        <div className="absolute left-1/2 top-0 h-4 w-4 bg-white rounded-full -mt-1.5 cursor-pointer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StockScreener;
