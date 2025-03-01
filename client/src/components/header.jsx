import React, { useContext, useEffect, useRef } from 'react';
import { Search, Moon , Sun } from 'lucide-react';
import { ThemeContext } from '../themeContext';

const MarketHeader = () => {
  const tickerRef = useRef(null);
  const { theme , toggleTheme } = useContext(ThemeContext);
  
  useEffect(() => {
    // For continuous scrolling effect
    const scrollTicker = () => {
      if (tickerRef.current) {
        if (tickerRef.current.scrollLeft >= tickerRef.current.scrollWidth / 2) {
          tickerRef.current.scrollLeft = 0;
        } else {
          tickerRef.current.scrollLeft += 1;
        }
      }
    };
    
    // Set up interval for smooth scrolling
    const ticker = setInterval(scrollTicker, 30);
    
    // Clean up interval on component unmount
    return () => clearInterval(ticker);
  }, []);

  // Creating duplicate ticker items to ensure continuous scrolling
  const tickerItems = [
    {symbol: "", price: "394.70", change: "1.68%", down: true},
    {symbol: "TCS", price: "3483.90", change: "3.56%", down: true},
    {symbol: "TITAN", price: "3087.80", change: "4.17%", down: true},
    {symbol: "LT", price: "3164.75", change: "1.40%", down: true},
    {symbol: "HEROMOTOCO", price: "3712.55", change: "1.24%", down: true},
    {symbol: "EICHERMOT", price: "4794.45", change: "2.84%", down: true},
    {symbol: "ONGC", price: "225.30", change: "2.49%", down: true},
    {symbol: "INDUSINDBK", price: "988.95", change: "5.00%", down: true},
    {symbol: "RELIANCE", price: "2894.30", change: "1.75%", down: true},
    {symbol: "INFY", price: "1772.65", change: "2.10%", down: true},
    {symbol: "HDFC", price: "1633.20", change: "0.95%", down: true},
    {symbol: "ICICI", price: "1092.40", change: "1.35%", down: true}
  ];
  
  // Duplicate the array to ensure continuous scrolling
  const allTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full">
      {/* Ticker Tape - Full width and auto-scrolling */}
      <div className="bg-black text-white text-xs py-1 overflow-hidden whitespace-nowrap">
        <div 
          ref={tickerRef}
          className="flex whitespace-nowrap overflow-hidden"
          style={{ width: "200%" }}
        >
          <div className="flex space-x-8 animate-ticker" style={{ minWidth: "100%" }}>
            {allTickerItems.map((item, index) => (
              <span key={index} className="whitespace-nowrap">
                {item.symbol && `${item.symbol} `}{item.price} <span className="text-red-500">▼ {item.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="bg-black flex items-center justify-between px-4 py-3 flex-shrink-0">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 8C21 3 27 3 30.5 8C34 13 34 20 30.5 25C27 30 21 30 17.5 25C14 20 14 13 17.5 8Z" stroke="url(#paint0_linear)" strokeWidth="2"/>
              <path d="M17.5 25C14 20 14 13 17.5 8C21 3 27 3 30.5 8" stroke="#8884FF" strokeWidth="2"/>
              <path d="M5.5 8C9 3 15 3 18.5 8C22 13 22 20 18.5 25C15 30 9 30 5.5 25C2 20 2 13 5.5 8Z" stroke="url(#paint1_linear)" strokeWidth="2"/>
              <path d="M5.5 25C2 20 2 13 5.5 8C9 3 15 3 18.5 8" stroke="#8884FF" strokeWidth="2"/>
              <defs>
                <linearGradient id="paint0_linear" x1="24" y1="3" x2="24" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8884FF"/>
                  <stop offset="1" stopColor="#4D4DFF" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="12" y1="3" x2="12" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8884FF"/>
                  <stop offset="1" stopColor="#4D4DFF" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-white text-lg font-medium ml-2">multibagg.ai</span>
            <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded ml-2">Beta</span>
          </div>
        </div>
        
        {/* Search & Navigation Items */}
        <div className="flex-1 flex items-center justify-center space-x-6">
          <div className="relative flex items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search a company or sector"
                className="w-full bg-gray-800 text-white text-sm rounded-full px-10 py-2 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <span className="absolute right-3 top-2 text-xs text-gray-400">Ctrl⌘</span>
            </div>
          </div>
          
          <span className="text-white">Discovery</span>
          <span className="text-white">Timeline</span>
          <span className="text-white">Market</span>
          <span className="text-white">Screener</span>
          
          <button className="flex items-center bg-gray-800 hover:bg-gray-700 text-white rounded-full px-4 py-2">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.5V21M18 12H21M3 12H6M12 3V7.5M8.4 8.4L5.5 5.5M15.6 8.4L18.5 5.5M16.5 16.5L18.5 18.5M7.5 16.5L5.5 18.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ask AI
          </button>
        </div>
        
        {/* User Section */}
        <div className="flex items-center space-x-4">
          <span className="text-white">Pricing</span>
          <button onClick={toggleTheme} className="text-white">
            {theme === 'light' ? <Sun className='h-5 w-5'/> : <Moon className="h-5 w-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">V</div>
            <span className="text-white">Vinayak</span>
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Main Content Area - Empty to occupy remaining space */}
      <div className="flex-1 bg-gray-900">
        {/* This div will fill the remaining space */}
      </div>
    </div>
  );
};

export default MarketHeader;