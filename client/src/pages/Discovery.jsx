import React, { useContext, useState, useEffect } from 'react';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';

const DiscoveryPage = () => {
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic data
  const [stockTickers, setStockTickers] = useState([]);
  const [sectorCategories, setSectorCategories] = useState([]);
  const [trendingVideo, setTrendingVideo] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const getYoutubeVideoID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  

  // Fetch discovery data
  const fetchDiscoveryData = async () => {
    setIsLoading(true);
    try {
      // In future, replace with actual API calls
      // const response = await fetch('your-api-endpoint');
      // const data = await response.json();
      
      // For now, using mock data
      const mockData = {
        tickers: [
          { name: 'HEROMOTOCO', price: '3712.55', change: '-1.24%', isDown: true },
          { name: 'EICHERMOT', price: '4794.45', change: '-2.84%', isDown: true },
          { name: 'ONGC', price: '225.30', change: '-2.49%', isDown: true },
          { name: 'INDUSINDBK', price: '988.95', change: '-5.48%', isDown: true },
          { name: 'SUNPHARMA', price: '1593.90', change: '-3.26%', isDown: true },
          { name: 'APOLLOHOSP', price: '6052.00', change: '-2.20%', isDown: true },
          { name: 'BPCL', price: '237.35', change: '-3.02%', isDown: true },
        ],
        sectors: [
          {
            id: 1,
            title: 'Blockchain Stocks',
            description: 'Stocks capitalizing on decentralized ledger technology, enabling secure transactions, transparency, and new business models across multiple industries.',
            views: 269,
            trending: true,
            companies: 92,
            recentlyAdded: false,
          },
          {
            id: 2,
            title: 'Data Centers Stocks',
            description: 'Stocks benefiting from rising cloud adoption, delivering secure, scalable infrastructure to store and process massive volumes of data.',
            views: 198,
            trending: true,
            companies: 36,
            recentlyAdded: 1,
          },
          {
            id: 3,
            title: 'AI Stocks',
            description: 'Stocks poised to benefit from artificial intelligence breakthroughs, improving decision-making, automation, and personalized solutions across industries.',
            views: 102,
            trending: true,
            companies: 122,
            recentlyAdded: 1,
          },
          {
            id: 4,
            title: 'Drone Technology Stocks',
            description: 'Stocks advancing drone solutions for logistics, surveillance, agriculture, and other sectors.',
            views: 545,
            trending: true,
            companies: 246,
            recentlyAdded: 5,
          },
          {
            id: 5,
            title: 'Space Technology Stocks',
            description: 'Stocks poised to benefit from expanding satellite communications, space tourism, launch services, and orbital infrastructure.',
            views: 1215,
            trending: true,
            companies: 1514,
            recentlyAdded: 10,
          },
        ],
        video: {
          id: 1,
          title: 'Market Trends',
          url: 'https://youtu.be/ZCFkWDdmXG8?si=xFXWt-mksnwdU_hB'
        }
      };

      setStockTickers(mockData.tickers);
      setSectorCategories(mockData.sectors);
      setTrendingVideo(mockData.video);
      setError(null);
    } catch (err) {
      setError('Failed to fetch discovery data');
      console.error('Error fetching discovery data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sector details
  const fetchSectorDetails = async (sectorId) => {
    try {
      // In future: Add actual API call
      // const response = await fetch(`your-api-endpoint/sectors/${sectorId}`);
      // const data = await response.json();
      setSelectedSector(/* sector data */);
    } catch (err) {
      console.error('Error fetching sector details:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDiscoveryData();
  }, []);

  // Handle sector selection
  const handleSectorClick = (sectorId) => {
    fetchSectorDetails(sectorId);
  };

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
              onClick={fetchDiscoveryData}
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
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />

      {/* Main content */}
      <div className="px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          } mb-4`}>Discovery</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Discover companies before they become the next big thing. Our AI agents analyze large streams of data to curate thematic buckets of companies for you. Please note that AI can make mistakes.
          </p>
        </div>

        {/* Trending section with video */}
        <div className="mb-16 flex">
          <div className="w-7/12 mr-10">
            <div className={`rounded-lg overflow-hidden shadow-lg p-5 mb-2 ${
              theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex space-x-2 text-sm">
                      <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>
                        Trending
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Top stories
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* YouTube Video Integration */}
              <div className="relative" style={{ height: "250px" }}>
                {trendingVideo ? (
                  <iframe 
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoID(trendingVideo.url)}`}
                    title={trendingVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                ) : (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <svg className={`w-10 h-10 mb-2 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Loading video...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-5/12 grid grid-cols-1 gap-4">
            {/* Sector cards */}
            {sectorCategories.slice(0, 2).map((sector) => (
              <div key={sector.id} className={`rounded-lg p-4 ${
                theme === 'dark' 
                  ? 'bg-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center mb-2">
                  <svg className={`w-4 h-4 mr-1 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{sector.views} views</span>
                </div>
                <h3 className="font-bold mb-1">{sector.title}</h3>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{sector.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Symphony */}
        <div className="mb-10">
          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h2 className="text-2xl font-bold mb-1">Sector Symphony</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Spotlights industry-focused themes, grouping companies within key growth sectors and emerging technologies reshaping the global economy.
            </p>
          </div>

          {/* Grid of sector cards */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            {sectorCategories.slice(0, 3).map((sector) => (
              <div key={sector.id} className={`rounded-lg p-5 relative ${
                theme === 'dark' 
                  ? 'bg-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{sector.views} views</span>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{sector.title}</h3>
                <p className={`text-sm min-h-[80px] ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{sector.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoveryPage;