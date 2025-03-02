import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarketDashboard = () => {
  const [marketData, setMarketData] = useState({
    nifty: { value: 0, change: 0 },
    sensex: { value: 0, change: 0 },
    stocksTraded: 0,
    unchanged: 0,
    advances: 0,
    declines: 0,
    marketBreadth: [
      { type: 'Large Cap', value: 0, color: 'red' },
      { type: 'Mid Cap', value: 0, color: 'red' },
      { type: 'Small Cap', value: 0, color: 'blue' },
      { type: 'Micro Cap', value: 0, color: 'blue' },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = 'S07OFQBXR1R0R7FB';

  const CACHE_KEY = 'marketDataCache';
  const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  const getCachedData = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedData = (data) => {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
          setMarketData(cachedData);
          setLoading(false);
          return;
        }

        // Fetch new data if cache is expired or doesn't exist
        const niftyResponse = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NIFTY&interval=5min&apikey=${API_KEY}`
        );
        const niftyData = niftyResponse.data['Time Series (5min)'];
        const niftyLatest = Object.values(niftyData)[0];
        const niftyPrevious = Object.values(niftyData)[1];
        const niftyValue = parseFloat(niftyLatest['4. close']);
        const niftyChange = ((niftyValue - parseFloat(niftyPrevious['4. close'])) / parseFloat(niftyPrevious['4. close'])) * 100;

        const sensexResponse = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SENSEX&interval=5min&apikey=${API_KEY}`
        );
        const sensexData = sensexResponse.data['Time Series (5min)'];
        const sensexLatest = Object.values(sensexData)[0];
        const sensexPrevious = Object.values(sensexData)[1];
        const sensexValue = parseFloat(sensexLatest['4. close']);
        const sensexChange = ((sensexValue - parseFloat(sensexPrevious['4. close'])) / parseFloat(sensexPrevious['4. close'])) * 100;

        const stocksTraded = Math.floor(Math.random() * 5000) + 1000;
        const advances = Math.floor(Math.random() * 1000) + 500;
        const declines = Math.floor(Math.random() * 1000) + 500;
        const unchanged = stocksTraded - advances - declines;

        const marketBreadth = [
          { type: 'Large Cap', value: Math.floor(Math.random() * 30), color: 'red' },
          { type: 'Mid Cap', value: Math.floor(Math.random() * 30), color: 'red' },
          { type: 'Small Cap', value: Math.floor(Math.random() * 30), color: 'blue' },
          { type: 'Micro Cap', value: Math.floor(Math.random() * 30), color: 'blue' },
        ];

        const newMarketData = {
          nifty: { value: niftyValue, change: niftyChange },
          sensex: { value: sensexValue, change: sensexChange },
          stocksTraded,
          unchanged,
          advances,
          declines,
          marketBreadth,
        };

        setMarketData(newMarketData);
        setCachedData(newMarketData);
        setLoading(false);
      } catch (err) {
        const cachedData = getCachedData();
        if (cachedData) {
          setMarketData(cachedData);
          setError('Using cached data - Unable to fetch latest market data');
        } else {
          setError('Failed to fetch market data');
        }
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-black text-white p-6 rounded-lg border border-blue-800 bg-opacity-50 backdrop-blur-md">
        <div className="flex justify-center items-center h-32">
          <p className="text-lg">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-black text-white p-6 rounded-lg border border-blue-800 bg-opacity-50 backdrop-blur-md">
        <div className="flex justify-center items-center h-32">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white p-6 rounded-lg border border-blue-800 bg-opacity-50 backdrop-blur-md">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-6">Overall Market</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">NIFTY</p>
              <div className="flex items-center">
                <p className="text-xl font-bold">{marketData.nifty.value}</p>
                <span className={`ml-2 flex items-center ${marketData.nifty.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {marketData.nifty.change < 0 ? '▼' : '▲'} {Math.abs(marketData.nifty.change)}%
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 mb-2">SENSEX</p>
              <div className="flex items-center">
                <p className="text-xl font-bold">{marketData.sensex.value}</p>
                <span className={`ml-2 flex items-center ${marketData.sensex.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {marketData.sensex.change < 0 ? '▼' : '▲'} {Math.abs(marketData.sensex.change)}%
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-gray-400 mb-2">Stock Traded</p>
                <p className="text-xl font-bold">{marketData.stocksTraded}</p>
              </div>
              <div className="text-blue-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3h5v5"></path><path d="M4 20L21 3"></path>
                </svg>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-gray-400 mb-2">Unchanged</p>
                <p className="text-xl font-bold">{marketData.unchanged}</p>
              </div>
              <div className="text-gray-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-gray-400 mb-2">Advances</p>
                <p className="text-xl font-bold">{marketData.advances}</p>
              </div>
              <div className="text-green-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6l-6 6"></path>
                </svg>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-gray-400 mb-2">Declines</p>
                <p className="text-xl font-bold">{marketData.declines}</p>
              </div>
              <div className="text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6l6-6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-96 flex flex-col">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold">Advance Ratio</h2>
            <svg className="ml-2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          
          <div className="flex-1 overflow-x-auto scrollbar-hide mt-10">
            <div className="flex gap-4 pb-2 ">
              {marketData.marketBreadth.map((cap, index) => (
                <div key={index} className="flex-shrink-0 w-56">
                  <div className="bg-gray-900 rounded-lg p-4 flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                        
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke={cap.color === 'red' ? '#ef4444' : '#3b82f6'} 
                          strokeWidth="8" 
                          strokeDasharray={`${cap.value * 2.83} 283`}
                          transform="rotate(-90 50 50)"
                        />
                        
                        <text 
                          x="50" 
                          y="55" 
                          fontFamily="sans-serif" 
                          fontSize="22" 
                          fontWeight="bold" 
                          fill={cap.color === 'red' ? '#ef4444' : '#3b82f6'} 
                          textAnchor="middle"
                        >
                          {cap.value}%
                        </text>
                      </svg>
                    </div>
                    <p className="text-center">{cap.type}</p>
                    <div className="flex justify-center mt-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;
document.head.appendChild(style);

export default MarketDashboard;