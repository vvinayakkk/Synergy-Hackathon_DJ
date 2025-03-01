import React, { useState } from 'react';

const MarketMovers = () => {
  const [activeGainerFilter, setActiveGainerFilter] = useState('Large Cap');
  const [activeLoserFilter, setActiveLoserFilter] = useState('Large Cap');

  // Market data organized by cap size
  const marketData = {
    gainers: {
      'Large Cap': [
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1731.10, change: 1.86, logo: '/api/placeholder/48/48' },
        { symbol: 'SHRRAMFIN', name: 'Shriram Finance Ltd', price: 617.55, change: 1.74, logo: '/api/placeholder/48/48' },
        { symbol: 'COALINDIA', name: 'Coal India Ltd', price: 369.10, change: 1.44, logo: '/api/placeholder/48/48' },
        { symbol: 'INDIGO', name: 'Interglobe Aviation Ltd', price: 4480.00, change: 0.85, logo: '/api/placeholder/48/48' }
      ],
      'Mid Cap': [
        { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', price: 152.50, change: 2.75, logo: '/api/placeholder/48/48' },
        { symbol: 'IDFC', name: 'IDFC Ltd', price: 118.20, change: 2.42, logo: '/api/placeholder/48/48' },
        { symbol: 'BANKBARODA', name: 'Bank of Baroda', price: 252.30, change: 2.10, logo: '/api/placeholder/48/48' },
        { symbol: 'CANBK', name: 'Canara Bank', price: 437.25, change: 1.95, logo: '/api/placeholder/48/48' }
      ],
      'Small Cap': [
        { symbol: 'KPITTECH', name: 'KPIT Technologies Ltd', price: 1425.80, change: 4.65, logo: '/api/placeholder/48/48' },
        { symbol: 'IRCTC', name: 'Indian Railway Catering', price: 896.30, change: 3.85, logo: '/api/placeholder/48/48' },
        { symbol: 'NATIONALUM', name: 'National Aluminium', price: 172.45, change: 3.20, logo: '/api/placeholder/48/48' },
        { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd', price: 345.60, change: 2.75, logo: '/api/placeholder/48/48' }
      ]
    },
    losers: {
      'Large Cap': [
        { symbol: 'IRFC', name: 'Indian Railway Finance', price: 112.40, change: -6.64, logo: '/api/placeholder/48/48' },
        { symbol: 'JIOFIN', name: 'Jio Financial Services', price: 207.70, change: -6.29, logo: '/api/placeholder/48/48' },
        { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: 1488.90, change: -6.19, logo: '/api/placeholder/48/48' },
        { symbol: 'WIPRO', name: 'Wipro Ltd', price: 277.65, change: -5.77, logo: '/api/placeholder/48/48' }
      ],
      'Mid Cap': [
        { symbol: 'LICHSGFIN', name: 'LIC Housing Finance', price: 624.30, change: -7.20, logo: '/api/placeholder/48/48' },
        { symbol: 'MPHASIS', name: 'Mphasis Ltd', price: 2418.75, change: -6.85, logo: '/api/placeholder/48/48' },
        { symbol: 'ZYDUSLIFE', name: 'Zydus Lifesciences', price: 764.50, change: -6.40, logo: '/api/placeholder/48/48' },
        { symbol: 'LTTS', name: 'L&T Technology Services', price: 4862.10, change: -5.90, logo: '/api/placeholder/48/48' }
      ],
      'Small Cap': [
        { symbol: 'INFIBEAM', name: 'Infibeam Avenues Ltd', price: 21.75, change: -9.90, logo: '/api/placeholder/48/48' },
        { symbol: 'SCHNEIDER', name: 'Schneider Electric', price: 456.20, change: -8.65, logo: '/api/placeholder/48/48' },
        { symbol: 'TATACHEM', name: 'Tata Chemicals Ltd', price: 986.35, change: -7.80, logo: '/api/placeholder/48/48' },
        { symbol: 'SUZLON', name: 'Suzlon Energy Ltd', price: 38.95, change: -7.45, logo: '/api/placeholder/48/48' }
      ]
    }
  };

  // Filter buttons component
  const FilterButtons = ({ activeFilter, setActiveFilter, section }) => (
    <div className="flex">
      {['Large Cap', 'Mid Cap', 'Small Cap'].map((filter) => (
        <button
          key={filter}
          className={`px-4 py-2 ${
            activeFilter === filter
              ? 'bg-gray-800 text-white'
              : 'bg-gray-700 text-gray-300'
          } transition-colors duration-200 border-r border-gray-600 last:border-r-0`}
          onClick={() => setActiveFilter(filter)}
          aria-label={`Show ${filter} ${section}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );

  // Stock card component
  const StockCard = ({ stock }) => (
    <div className="bg-gray-900 rounded-lg p-4 flex flex-col">
      <div className="flex items-start mb-2">
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            <img 
              src={stock.logo} 
              alt={stock.symbol} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-white font-bold">{stock.symbol}</h3>
          <p className="text-gray-400 text-sm">{stock.name}</p>
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-block ${stock.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.change > 0 ? '↗' : '↘'}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-lg font-bold text-white">{stock.price.toFixed(2)}</span>
        <span className={`${stock.change > 0 ? 'text-green-400' : 'text-red-400'} font-semibold`}>
          {stock.change > 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
        </span>
        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full mt-8 bg-black text-white rounded-lg border border-blue-800 bg-opacity-50 backdrop-blur-md">
      {/* Top Gainers Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-2xl font-bold">Top Gainers</h2>
          <div className="rounded-lg overflow-hidden">
            <FilterButtons 
              activeFilter={activeGainerFilter} 
              setActiveFilter={setActiveGainerFilter}
              section="gainers"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
          {marketData.gainers[activeGainerFilter].map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>

      {/* Top Losers Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-2xl font-bold">Top Losers</h2>
          <div className="rounded-lg overflow-hidden">
            <FilterButtons 
              activeFilter={activeLoserFilter} 
              setActiveFilter={setActiveLoserFilter}
              section="losers"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
          {marketData.losers[activeLoserFilter].map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;