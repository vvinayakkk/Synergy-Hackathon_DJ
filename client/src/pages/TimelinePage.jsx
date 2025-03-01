import React, { useState, useContext, useEffect } from 'react';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';

const TimelinePage = () => {
  const { theme } = useContext(ThemeContext);
  const [activeCapTab, setActiveCapTab] = useState('Large Cap');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic data
  const [newsArticles, setNewsArticles] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['Top Stories', 'My Watchlist']);
  const [timeRange, setTimeRange] = useState('today');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch data function
  const fetchTimelineData = async () => {
    setIsLoading(true);
    try {
      // In future, replace these with actual API calls
      // const response = await fetch('your-api-endpoint');
      // const data = await response.json();
      
      // For now, using mock data
      const mockData = {
        news: [
          {
            source: 'Business Standard',
            logo: 'BS',
            time: '44 mins ago',
            title: 'India, EU discuss efforts to accelerate balanced, mutually beneficial FTA',
            content: 'With India and the EU setting the year-end deadline to conclude a free trade agreement, teams from both sides held ...'
          },
          {
            source: 'Zee Business',
            logo: 'ZB',
            time: '52 mins ago',
            title: 'Union Minister Piyush Goyal highlights role of domestic investors in stabilising markets at AMFI Mutual Fund Summit',
            content: 'The minister praised the growing enthusiasm of domestic investors, who have been investing heavily in the markets.'
          },
          {
            source: 'Mint',
            logo: 'M',
            time: '1 hour ago',
            title: 'Hyundai Motor India receives GST notices worth nearly ₹17.5 crore; stock down 7% in five sessions',
            content: ''
          },
          {
            source: 'Business Line',
            logo: 'BL',
            time: '23 hours ago',
            title: `Market volatility likely to dictate new SEBI chief's priorities`,
            content: 'Tuhin Kanta Pandey takes over SEBI amid market slump, facing challenges of restoring investor trust and regulatory balance.'
          },
          {
            source: 'Business Line',
            logo: 'BL',
            time: '23 hours ago',
            title: 'India fixes wheat procurement target at 31 million tonnes',
            content: 'Centre sets target to buy 31 mt of wheat, 7 mt of rice, and 1.6 mt of Shree Anna; urges States to maximize procurement.'
          }
        ],
        gainers: [
          { name: 'HDFC Bank Ltd', ticker: 'HDFCBANK', price: 1731.10, change: 1.86 },
          { name: 'Shriram Finance Ltd', ticker: 'SHRIRAMFIN', price: 617.55, change: 1.74 },
          { name: 'Coal India Ltd', ticker: 'COALINDIA', price: 369.10, change: 1.44 },
          { name: 'Interglobe Aviation Ltd', ticker: 'INDIGO', price: 4480.00, change: 0.85 },
          { name: 'Lupin Ltd', ticker: 'LUPIN', price: 1906.20, change: 0.78 }
        ],
        losers: [
          { name: 'Indian Railway Finan...', ticker: 'IRFC', price: 112.40, change: -6.64 },
          { name: 'Jio Financial Servic...', ticker: 'JIOFIN', price: 207.70, change: -6.29 },
          { name: 'Tech Mahindra Ltd', ticker: 'TECHM', price: 1488.90, change: -6.19 },
          { name: 'Wipro Ltd', ticker: 'WIPRO', price: 277.65, change: -5.77 },
          { name: 'Macrotech Developers Ltd', ticker: 'LODHA', price: 1131.95, change: -5.40 }
        ]
      };

      setNewsArticles(mockData.news);
      setTopGainers(mockData.gainers);
      setTopLosers(mockData.losers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch timeline data');
      console.error('Error fetching timeline data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Category change handler
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      }
      return [...prev, category];
    });
    // In future: Trigger API call with new categories
  };

  // Time range change handler
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // In future: Trigger API call with new time range
  };

  // Sort change handler
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    // In future: Trigger API call with new sort type
  };

  // Initial data fetch
  useEffect(() => {
    fetchTimelineData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    // In future: Add proper dependencies and API call
    // fetchTimelineData();
  }, [selectedCategories, timeRange, sortBy, activeCapTab]);

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <MarketHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
          }`}>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchTimelineData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />
      
      <div className="flex p-4 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/4 pr-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Timeline</h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Timeline: Latest Financial & Stock Market News at Your Fingertips
            </p>
          </div>

          {/* Category Section */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="font-semibold">Category</h2>
              <svg className={`ml-2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="space-y-2">
              {['Top Stories', 'My Watchlist', 'My Portfolio'].map((category, index) => (
                <div key={category} className={`flex items-center p-2 rounded ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
                }`}>
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    defaultChecked={selectedCategories.includes(category)} 
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span>{category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration and Sort sections with similar theme updates */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="font-semibold">Duration</h2>
              <svg className={`ml-2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center p-2 rounded ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <input 
                  type="radio" 
                  name="duration" 
                  className="mr-2" 
                  checked={timeRange === 'today'} 
                  onChange={() => handleTimeRangeChange('today')}
                />
                <span>Today</span>
              </div>
              <div className={`flex items-center p-2 rounded justify-between ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div>
                  <input 
                    type="radio" 
                    name="duration" 
                    className="mr-2" 
                    checked={timeRange === 'last7days'} 
                    onChange={() => handleTimeRangeChange('last7days')}
                  />
                  <span>Last 7 days</span>
                </div>
                <span className="bg-blue-800 text-xs px-2 py-1 rounded">Pro</span>
              </div>
              <div className={`flex items-center p-2 rounded justify-between ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div>
                  <input 
                    type="radio" 
                    name="duration" 
                    className="mr-2" 
                    checked={timeRange === 'last30days'} 
                    onChange={() => handleTimeRangeChange('last30days')}
                  />
                  <span>Last 30 days</span>
                </div>
                <span className="bg-blue-800 text-xs px-2 py-1 rounded">Pro</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <h2 className="font-semibold">Sort by</h2>
              <svg className={`ml-2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7M3 15l9 7 9-7" />
              </svg>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center p-2 rounded justify-between ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div>
                  <input 
                    type="radio" 
                    name="sort" 
                    className="mr-2" 
                    checked={sortBy === 'relevance'} 
                    onChange={() => handleSortChange('relevance')}
                  />
                  <span>Relevance</span>
                </div>
                <span className="bg-blue-800 text-xs px-2 py-1 rounded">Pro</span>
              </div>
              <div className={`flex items-center p-2 rounded ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <input 
                  type="radio" 
                  name="sort" 
                  className="mr-2" 
                  checked={sortBy === 'newest'} 
                  onChange={() => handleSortChange('newest')}
                />
                <span>Newest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-3/4 pl-4 flex flex-col h-full">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search over 1 million news articles"
                className={`w-full p-2 pl-10 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-300'
                } border`}
              />
              <svg className={`absolute left-3 top-2.5 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Cap Tabs */}
          <div className="mb-4">
            <div className="flex space-x-2">
              {['Large Cap', 'Mid Cap', 'Small Cap'].map(cap => (
                <button
                  key={cap}
                  onClick={() => setActiveCapTab(cap)}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeCapTab === cap 
                      ? theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-blue-100 text-blue-800'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable News Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* News Feed - Scrollable */}
              <div className="col-span-7 overflow-y-auto pr-4 custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="loader"></div>
                  </div>
                ) : (
                  newsArticles.map((article, index) => (
                    <div key={index} className={`mb-4 rounded p-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-800' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2 text-white">
                          {article.logo}
                        </div>
                        <span className="text-sm">{article.source}</span>
                        <span className={`text-sm ml-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>• {article.time}</span>
                      </div>
                      <h3 className="font-bold mb-2">{article.title}</h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{article.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Top Gainers/Losers - Scrollable */}
              <div className="col-span-5 overflow-y-auto custom-scrollbar">
                {/* Top Gainers */}
                <div className={`mb-6 rounded p-4 ${
                  theme === 'dark' 
                    ? 'bg-gray-800' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <h2 className="text-xl font-bold mb-4">Top Gainers</h2>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="loader"></div>
                    </div>
                  ) : (
                    topGainers.map((stock, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{stock.name}</div>
                            <div className="text-sm text-gray-400">{stock.ticker}</div>
                          </div>
                          <div className="text-right">
                            <div>{stock.price.toLocaleString()}</div>
                            <div className="text-green-500 flex items-center">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 15l7-7 7 7" />
                              </svg>
                              {stock.change}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Top Losers */}
                <div className={`rounded p-4 ${
                  theme === 'dark' 
                    ? 'bg-gray-800' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <h2 className="text-xl font-bold mb-4">Top Losers</h2>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="loader"></div>
                    </div>
                  ) : (
                    topLosers.map((stock, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{stock.name}</div>
                            <div className="text-sm text-gray-400">{stock.ticker}</div>
                          </div>
                          <div className="text-right">
                            <div>{stock.price.toLocaleString()}</div>
                            <div className="text-red-500 flex items-center">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 9l-7 7-7-7" />
                              </svg>
                              {Math.abs(stock.change)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)'};
        }
      `}</style>
    </div>
  );
};

export default TimelinePage;