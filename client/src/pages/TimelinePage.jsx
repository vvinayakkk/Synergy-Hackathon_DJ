import React, { useState, useContext, useEffect } from 'react';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';
import axios from 'axios';

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

  // Alpha Vantage API Key
  // const API_KEY = 'OBNN8M6HAY6LT88A'; // Replace with your API key
  // const MARKET_AUX_API_KEY = 'ZVsaCs6WkeQeMmscIZUcZohbTS9MZbLlgLcrJMo5';

  const NEWS_API_KEY = '0de37ca8af9748898518daf699189abf'
  // Fetch news articles from Alpha Vantage
  // const fetchNewsArticles = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${API_KEY}`
  //     );
  //     const data = await response.json();
  //     if (data.feed) {
  //       const articles = data.feed.map(article => ({
  //         source: article.source,
  //         logo: article.source.charAt(0), // Use first letter as logo
  //         time: new Date(article.time_published).toLocaleTimeString(),
  //         title: article.title,
  //         content: article.summary,
  //       }));
  //       setNewsArticles(articles);
  //     } else {
  //       throw new Error('No news articles found');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching news articles:', err);
  //     setError('Failed to fetch news articles');
  //   }
  // };
  // Fetch news articles using News API
const fetchNewsArticles = async () => {
  try {
      const response = await fetch(
          `https://newsapi.org/v2/everything?q=stock%20market&apiKey=${NEWS_API_KEY}&pageSize=10`
      );
      const data = await response.json();
      if (data.articles) {
          const articles = data.articles.map(article => ({
              source: article.source.name,
              logo: article.source.name.charAt(0),
              time: new Date(article.publishedAt).toLocaleTimeString(),
              title: article.title,
              content: article.description || article.content,
          }));
          setNewsArticles(articles);
      } else {
          throw new Error('No news articles found');
      }
  } catch (err) {
      console.error('Error fetching news articles:', err);
      setError('Failed to fetch news articles');
  }
};

// Fetch stock market data from the backend
const fetchStockMarketData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:6001/api/stock-market-data');
    const data = response.data; // Axios stores the response data in `data` property
    console.log('API Response:', response.data);
    setTopGainers(data.top_gainers);
    setTopLosers(data.top_losers);
  } catch (err) {
    console.error('Error fetching stock market data:', err);
  }
};

// Fetch all data
const fetchTimelineData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    await Promise.all([fetchNewsArticles(), fetchStockMarketData()]);
  } catch (err) {
    setError('Failed to fetch timeline data');
    console.error('Error fetching timeline data:', err);
  } finally {
    setIsLoading(false);
  }
};

// Call fetchTimelineData in useEffect
useEffect(() => {
  fetchTimelineData();
}, []);

// Fetch top gainers and losers (requires a financial API)
// const fetchTopGainersLosers = async () => {
//   try {
//       const response = await fetch(
//           `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`
//       );
//       const data = await response.json();
//       if (data.top_gainers && data.top_losers) {
//           setTopGainers(data.top_gainers);
//           setTopLosers(data.top_losers);
//       } else {
//           throw new Error('No gainers or losers data found');
//       }
//   } catch (err) {
//       console.error('Error fetching top gainers/losers:', err);
//   }
// };

  // Fetch top gainers and losers from Alpha Vantage
  // const fetchTopGainersLosers = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
  //     );
  //     const data = await response.json();
  //     if (data.top_gainers && data.top_losers) {
  //       setTopGainers(data.top_gainers);
  //       setTopLosers(data.top_losers);
  //     } else {
  //       throw new Error('No gainers or losers data found');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching top gainers/losers:', err);
  //   }
  // };
//   const fetchTopGainersLosers = async () => {
//     try {
//         const response = await fetch(
//             `https://api.marketaux.com/v1/entity/list?api_token=${MARKET_AUX_API_KEY}`
//         );
//         const data = await response.json();
//         if (data.data) {
//             // Assuming the data contains market entities with price change information
//             const entities = data.data;

//             // Sort entities by price change to determine gainers and losers
//             const sortedEntities = entities.sort((a, b) => b.price_change - a.price_change);

//             const topGainers = sortedEntities.slice(0, 5); // Top 5 gainers
//             const topLosers = sortedEntities.slice(-5); // Top 5 losers

//             setTopGainers(topGainers);
//             setTopLosers(topLosers);
//         } else {
//             throw new Error('No gainers or losers data found');
//         }
//     } catch (err) {
//         console.error('Error fetching top gainers/losers:', err);
//     }
// };

//   // Fetch all data
//   const fetchTimelineData = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await Promise.all([fetchNewsArticles(), fetchTopGainersLosers()]);
//     } catch (err) {
//       setError('Failed to fetch timeline data');
//       console.error('Error fetching timeline data:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

  // Category change handler
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      }
      return [...prev, category];
    });
  };

  // Time range change handler
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Sort change handler
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  // Initial data fetch
  useEffect(() => {
    fetchTimelineData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchTimelineData();
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
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />
      
      <div className="flex-1 container mx-auto px-4 py-6 flex">
        {/* Left Sidebar */}
        <div className="w-1/4 pr-6 flex-shrink-0 overflow-y-auto">
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
        <div className="w-3/4 flex flex-col h-[calc(100vh-120px)]">
          {/* Fixed Search and Tabs */}
          <div className="sticky top-0 z-10 bg-inherit pb-4">
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
          </div>

          {/* Content Grid */}
          <div className="flex gap-6 flex-1 min-h-0">
            {/* News Feed */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newsArticles.map((article, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.01] ${
                          theme === 'dark' 
                            ? 'bg-gray-800 hover:bg-gray-750' 
                            : 'bg-white hover:shadow-lg border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                            {article.logo}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">{article.source}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {article.time}
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold mb-2 line-clamp-2">{article.title}</h3>
                        <p className={`text-sm line-clamp-3 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{article.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Gainers/Losers Column */}
            <div className="w-[400px] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {/* Top Gainers */}
                <div className={`rounded-lg p-6 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border`}>
                  <h2 className="text-xl font-bold mb-4">Top Gainers</h2>
                  <div className="space-y-3">
                    {topGainers.map((stock, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-750 hover:bg-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{stock.Ticker}</div>
                            <div className="text-sm text-gray-500">NSE</div>
                          </div>
                          <div className="text-green-500 font-semibold">
                            +{parseFloat(stock['Change (%)']).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div className={`rounded-lg p-6 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border`}>
                  <h2 className="text-xl font-bold mb-4">Top Losers</h2>
                  <div className="space-y-3">
                    {topLosers.map((stock, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-750 hover:bg-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{stock.Ticker}</div>
                            <div className="text-sm text-gray-500">NSE</div>
                          </div>
                          <div className="text-red-500 font-semibold">
                            {parseFloat(stock['Change (%)']).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.5)'};
        }
      `}</style>
    </div>
  );
};

export default TimelinePage;