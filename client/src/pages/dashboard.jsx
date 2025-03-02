import React, { useEffect, useRef, useState, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area , Legend } from 'recharts';
import { Camera, TrendingUp, TrendingDown, DollarSign, Send, AlertTriangle, Activity, PieChart, Globe, Search } from 'lucide-react';
import axios from 'axios';

import MarketHeader from '../components/header';
import { ThemeContext } from '../themeContext';
import Footer from '../components/footer';
import MarketSentimentSurvey from '../components/marketSurvey';
import MarketDashboard from '../components/market';
import MarketMovers from '../components/marketMovers';
import RecentAISessionsComponent from '../components/Askai';
import UploadPdf from '../components/uploadFile';
import ChartAnalysisButton from '../components/ChartAnalysisButton';

const Dashboard = () => {
  // State declarations
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [symbol, setSymbol] = useState('AAPL');
  const [displayDays, setDisplayDays] = useState(30);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [timeRange, setTimeRange] = useState('ALL');
  const [animatedNumbers, setAnimatedNumbers] = useState({
    marketCap: 0,
    sentiment: 0,
    prediction: 0,
    signals: 0
  });
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false); // State to toggle prediction visibility
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);

  // Add new state for tracking last fetch time
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const [forecastDays, setForecastDays] = useState(30);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  // Add these new states for comprehensive data handling
  const [predictionData, setPredictionData] = useState({
    confidence_score: null,
    individual_predictions: {},
    lower_bound: null,
    prediction: null,
    upper_bound: null,
  });
  
  const [newsData, setNewsData] = useState([]);
  const [recommendationData, setRecommendationData] = useState({
    daily_actions: [],
    key_factors: [],
    summary: {
      confidence_score: null,
      current_price: null,
      recommendation: null,
      risk_level: null,
      target_price: null,
      upside_potential: null,
    },
  });

  const transformData = (historicalData, forecastData) => {
    const historical = [];
    const historicalKey = `('Close', '${symbol}')`;

    if (historicalData && historicalData.historical_data && historicalData.historical_data[historicalKey]) {
      const dates = Object.keys(historicalData.historical_data[historicalKey]);

      dates.forEach(date => {
        const historicalEntry = {
          ds: date.split('T')[0],
          y: historicalData.historical_data[historicalKey][date],
          bb_lower: historicalData.historical_data[`('BB Lower', '${symbol}')`]?.[date],
          bb_upper: historicalData.historical_data[`('BB Upper', '${symbol}')`]?.[date],
          sma_50: historicalData.historical_data[`('50 Day SMA', '${symbol}')`]?.[date],
          sma_200: historicalData.historical_data[`('200 Day SMA', '${symbol}')`]?.[date],
          type: 'historical',
        };

        historical.push(historicalEntry);
      });
    }

    const forecast = forecastData?.forecast || [];
    const combined = [
      ...historical,
      ...forecast.map(item => ({
        ds: item.ds.split('T')[0],
        yhat: item.yhat,
        yhat_lower: item.yhat_lower,
        yhat_upper: item.yhat_upper,
        type: 'forecast',
      })),
    ];

    combined.sort((a, b) => new Date(a.ds) - new Date(b.ds));
    return { combined, historical, forecast };
  };

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const [historicalResponse, forecastResponse, predictionResponse, newsResponse, recommendationResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/stock_data?symbol=${symbol}&display_days=600`),
          axios.get(`http://localhost:5000/api/forecast?symbol=${symbol}&display_days=600&forecast_days=${forecastDays}`),
          axios.post(`http://localhost:5000/api/predictions`, { symbol }),
          axios.get(`http://localhost:5000/api/news?symbol=${symbol}`),
          axios.get(`http://localhost:5000/api/recommendation?symbol=${symbol}&display_days=600`),
        ]);

        if (!historicalResponse.data || !forecastResponse.data) {
          throw new Error('No data found for the given symbol.');
        }

        const { combined, historical, forecast } = transformData(historicalResponse.data, forecastResponse.data);
        setCombinedData(combined);
        setHistoricalData(historical);
        setForecastData(forecast);
        setPredictionData(predictionResponse.data);
        setNewsData(newsResponse.data || []);
        setRecommendationData(recommendationResponse.data);
      } catch (error) {
        console.error('Error fetching combined data:', error);
      }
    };

    fetchCombinedData();
  }, [symbol, forecastDays]);

  const fetchStockData = async () => {
    const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const now = new Date().getTime();

    // Check if we should fetch new data
    if (lastFetchTime && (now - lastFetchTime) < TWO_HOURS) {
      console.log('Using cached data, next fetch in:', Math.round((TWO_HOURS - (now - lastFetchTime)) / 1000 / 60), 'minutes');
      return;
    }

    const API_KEY = 'S07OFQBXR1R0R7FB';
    const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];

    try {
      // Fetch one symbol at a time to avoid rate limits
      const newData = [];
      for (const symbol of SYMBOLS) {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        );
        
        if (response.data['Time Series (Daily)']) {
          const symbolData = Object.keys(response.data['Time Series (Daily)']).map(date => ({
            date,
            [symbol]: parseFloat(response.data['Time Series (Daily)'][date]['4. close'])
          }));
          newData.push(symbolData);
        }

        // Wait 1 minute between API calls to avoid hitting rate limits
        if (symbol !== SYMBOLS[SYMBOLS.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }

      // Combine data similar to before
      const combinedData = {};
      newData.forEach(stock => {
        stock.forEach(day => {
          if (!combinedData[day.date]) {
            combinedData[day.date] = { date: day.date };
          }
          combinedData[day.date] = { ...combinedData[day.date], ...day };
        });
      });

      const sortedData = Object.values(combinedData)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setStockData(sortedData.slice(-30));
      setLastFetchTime(now);

      // Store in localStorage for persistence
      localStorage.setItem('stockData', JSON.stringify(sortedData.slice(-30)));
      localStorage.setItem('lastFetchTime', now.toString());

    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Use cached data if available
      const cachedData = localStorage.getItem('stockData');
      if (cachedData) {
        setStockData(JSON.parse(cachedData));
      }
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:6001/api/stock-market-data');
      setTopGainers(response.data.top_gainers || []);
      setTopLosers(response.data.top_losers || []);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  useEffect(() => {
    // Load cached data first
    const cachedData = localStorage.getItem('stockData');
    const cachedTime = localStorage.getItem('lastFetchTime');
    
    if (cachedData && cachedTime) {
      setStockData(JSON.parse(cachedData));
      setLastFetchTime(parseInt(cachedTime));
    }

    // Initial fetch
    fetchStockData();

    // Set up interval for every 2 hours
    const interval = setInterval(fetchStockData, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMarketData();
    // Set up interval to fetch every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate counters
  useEffect(() => {
    gsap.to(animatedNumbers, {
      marketCap: 98.7,
      sentiment: 76.3,
      prediction: 89.2,
      signals: 42,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedNumbers({
          marketCap: parseFloat(animatedNumbers.marketCap.toFixed(1)),
          sentiment: parseFloat(animatedNumbers.sentiment.toFixed(1)),
          prediction: parseFloat(animatedNumbers.prediction.toFixed(1)),
          signals: Math.round(animatedNumbers.signals)
        });
      }
    });
  }, []);

  // Add these new functions after your existing useEffect hooks
  const filterStockData = (range) => {
    const now = new Date();
    switch (range) {
      case '1D':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setDate(now.getDate() - 1)));
      case '1W':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setDate(now.getDate() - 7)));
      case '1M':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 1)));
      case '1Y':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setFullYear(now.getFullYear() - 1)));
      case 'ALL':
      default:
        return stockData;
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Handle impact level color
  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  // Handle sentiment color
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  // Add new helper functions
  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
      setCurrentPrice(response.data['Global Quote']);
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const fetchNewsHeadlines = async () => {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&symbol=${symbol}&apikey=${API_KEY}`);
      setNewsHeadlines(response.data.feed);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleForecast = async () => {
    // Implement forecast logic
  };

  const handleTechnicalIndicators = async () => {
    // Implement technical indicators logic
  };

  const handleModelPredictions = async () => {
    // Implement model predictions
  };

  const handleRecommendation = async () => {
    // Implement recommendation logic
  };

  const handleTradeSimulation = async () => {
    // Implement trade simulation
  };

  // Add handlers object to organize all handler functions
  const handlers = {
    symbolChange: (e) => {
      setSymbol(e.target.value);
    },

    timeRangeChange: (range) => {
      setTimeRange(range);
    },

    displayDaysChange: (days) => {
      setDisplayDays(days);
    },

    fetchCurrentPrice: async () => {
      try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
        setCurrentPrice(response.data['Global Quote']);
      } catch (error) {
        console.error('Error fetching current price:', error);
      }
    },

    fetchNewsHeadlines: async () => {
      try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&symbol=${symbol}&apikey=${API_KEY}`);
        setNewsHeadlines(response.data.feed);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    },

    forecast: async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/forecast?symbol=${symbol}&display_days=600&forecast_days=${forecastDays}`);
        setForecast(response.data);
      } catch (error) {
        console.error('Error generating forecast:', error);
      }
    },

    

    modelPredictions: async () => {
      try {
        const response = await axios.post(`http://localhost:5000/api/predictions`, { symbol });
        setPredictionData(response.data);
      } catch (error) {
        console.error('Error getting model predictions:', error);
      }
    },

    recommendation: async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/recommendation?symbol=${symbol}&display_days=600`);
        setRecommendationData(response.data);
      } catch (error) {
        console.error('Error getting recommendations:', error);
      }
    },

    tradeSimulation: async () => {
      try {
        const response = await axios.post(`http://localhost:5000/api/simulate_trade`, {
          symbol,
          type: 'buy', // or 'sell'
          quantity: 100, // example quantity
          price: currentPrice
        });
        // Handle simulation response
        console.log('Trade simulation result:', response.data);
      } catch (error) {
        console.error('Error in trade simulation:', error);
      }
    },

    refreshData: async () => {
      await Promise.all([
        handlers.fetchCurrentPrice(),
        handlers.fetchNewsHeadlines(),
        handlers.forecast(),
        handlers.technicalIndicators(),
        handlers.modelPredictions(),
        handlers.recommendation()
      ]);
    }
  };

  // Update useEffect to use handlers
  useEffect(() => {
    handlers.refreshData();
    const interval = setInterval(handlers.refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [symbol]);

  const dashboardDescriptions = {
    marketPerformance: "Real-time market analysis with AI-driven insights on current trends and potential market moves.",
    globe: "Global market activity visualization showing real-time trading flows and market correlations.",
    analytics: "Advanced analytics hub displaying AI-processed market data and predictive indicators.",
    marketCap: "Market capitalization analysis with sector rotation and institutional money flow indicators.",
    sentiment: "Real-time sentiment analysis from social media, news, and market indicators.",
    signals: "AI-generated trading signals based on multiple technical and fundamental factors."
  };


const MarketMoversSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    {/* Top Gainers */}
    <div className={`p-6 rounded-xl ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="text-green-500 mr-2">▲</span>
        Top Gainers
      </h3>
      <div className="space-y-4">
        {topGainers.slice(0, 5).map((stock, index) => (
          <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                `bg-${['blue', 'purple', 'green', 'yellow', 'pink'][index % 5]}-100 
                 text-${['blue', 'purple', 'green', 'yellow', 'pink'][index % 5]}-700`
              }`}>
                {stock.Ticker[0]}
              </div>
              <div className="ml-3">
                <div className="font-medium">{stock.Ticker}</div>
                <div className="text-sm text-gray-500">NSE</div>
              </div>
            </div>
            <div className="text-green-500 font-semibold">
              +{parseFloat(stock['Change (%)']).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Top Losers */}
    <div className={`p-6 rounded-xl ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="text-red-500 mr-2">▼</span>
        Top Losers
      </h3>
      <div className="space-y-4">
        {topLosers.slice(0, 5).map((stock, index) => (
          <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                `bg-${['red', 'orange', 'rose', 'amber', 'pink'][index % 5]}-100 
                 text-${['red', 'orange', 'rose', 'amber', 'pink'][index % 5]}-700`
              }`}>
                {stock.Ticker[0]}
              </div>
              <div className="ml-3">
                <div className="font-medium">{stock.Ticker}</div>
                <div className="text-sm text-gray-500">NSE</div>
              </div>
            </div>
            <div className="text-red-500 font-semibold">
              {parseFloat(stock['Change (%)']).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


  return (
    <div className={`min-h-screen ${theme === 'dark' 
      ? 'bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white' 
      : 'bg-gradient-to-b from-blue-50 via-blue-100 to-white text-gray-900'}`}>
      <MarketHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Combined Chart */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
          <div className="relative">
            <h3 className="text-lg font-bold mb-4 text-blue-300">Market Overview</h3>
            <ChartAnalysisButton 
              data={combinedData}
              chartName={`${symbol} Market Overview`}
              theme={theme}
              
            />
            <div className="flex flex-col  md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {symbol} Stock Analysis & Forecast
              </h2>
              <div className="mt-4 md:mt-0">
                <select 
                  id="symbol" 
                  value={symbol} 
                  onChange={handlers.symbolChange}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mt-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TSLA">TSLA</option>
                  <option value="AAPL">AAPL</option>
                  <option value="MSFT">MSFT</option>
                  <option value="AMZN">AMZN</option>
                  <option value="GOOGL">GOOGL</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-lg font-bold mb-6 text-blue-300">Chart Controls</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer mr-3 transition-colors duration-300 ${showSMA20 ? 'bg-yellow-400' : 'bg-gray-600'}`}
                    onClick={() => setShowSMA20(!showSMA20)}
                  >
                    {showSMA20 && <span className="text-gray-900 text-sm">✓</span>}
                  </div>
                  <span>Show 20-Day SMA</span>
                </div>
                
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer mr-3 transition-colors duration-300 ${showSMA50 ? 'bg-green-500' : 'bg-gray-600'}`}
                    onClick={() => setShowSMA50(!showSMA50)}
                  >
                    {showSMA50 && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span>Show 50-Day SMA</span>
                </div>
                
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer mr-3 transition-colors duration-300 ${showBB ? 'bg-purple-500' : 'bg-gray-600'}`}
                    onClick={() => setShowBB(!showBB)}
                  >
                    {showBB && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span>Show Bollinger Bands</span>
                </div>
                
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer mr-3 transition-colors duration-300 ${showIndicators ? 'bg-red-500' : 'bg-gray-600'}`}
                    onClick={() => setShowIndicators(!showIndicators)}
                  >
                    {showIndicators && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span>Show RSI/MACD</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <label htmlFor="forecastDays" className="mr-4 mb-2 sm:mb-0">Forecast Horizon (Days):</label>
                <div className="w-full sm:w-64 flex items-center">
                  <input 
                    type="range" 
                    id="forecastDays" 
                    value={forecastDays} 
                    onChange={(e) => setForecastDays(Number(e.target.value))} 
                    min="7" 
                    max="365" 
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-4 w-10 text-center">{forecastDays}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-lg font-bold mb-4 text-blue-300">Combined Stock Data and Forecast</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={combinedData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4dabf7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4dabf7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffa600" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffa600" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="ds" 
                    stroke="#999"
                    tick={{fill: '#999'}}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }}
                  />
                  <YAxis stroke="#999" tick={{fill: '#999'}} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 15, 30, 0.9)',
                      borderColor: '#2c3e50',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                    }}
                    formatter={(value) => [value ? `$${value.toFixed(2)}` : 'N/A']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    wrapperStyle={{
                      paddingBottom: '10px',
                    }}
                  />
                  
                  {/* Historical Close Price */}
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#4dabf7"
                    strokeWidth={3}
                    name="Close Price"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    connectNulls
                  />
                  
                  {/* Technical Indicators */}
                  {showBB && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="bb_lower"
                        stroke="#ba55d3"
                        strokeWidth={2}
                        name="BB Lower"
                        dot={false}
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="bb_upper"
                        stroke="#ba55d3"
                        strokeWidth={2}
                        name="BB Upper"
                        dot={false}
                        strokeDasharray="5 5"
                      />
                    </>
                  )}
                  
                  {showSMA50 && (
                    <Line
                      type="monotone"
                      dataKey="sma_50"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="50 Day SMA"
                      dot={false}
                    />
                  )}
                  
                  {showSMA20 && (
                    <Line
                      type="monotone"
                      dataKey="sma_200"
                      stroke="#eab308"
                      strokeWidth={2}
                      name="20 Day SMA"
                      dot={false}
                    />
                  )}
                  
                  {/* Forecast */}
                  <Line
                    type="monotone"
                    dataKey="yhat"
                    stroke="#ffa600"
                    strokeWidth={3}
                    name="Forecast"
                    dot={false}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="yhat_lower"
                    stroke="#ffa600"
                    strokeDasharray="5 5"
                    name="Lower Bound"
                    dot={false}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="yhat_upper"
                    stroke="#ffa600"
                    strokeDasharray="5 5"
                    name="Upper Bound"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stats and Globe Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Market Intelligence Card */}
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300">Market Intelligence</h3>
                
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    {animatedNumbers.marketCap}%
                  </p>
                  <p className="text-green-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +2.4% from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="AAPL" stroke="#4dabf7" fill="#4dabf7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sentiment Score Card */}
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Sentiment Score</h3>
                <Activity size={20} className="text-purple-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                    {animatedNumbers.sentiment}%
                  </p>
                  <p className="text-red-400 flex items-center mt-2">
                    <TrendingDown size={16} className="mr-1" /> -1.2% from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="MSFT" stroke="#da77f2" fill="#da77f2" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Prediction Accuracy Card */}
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Prediction Accuracy</h3>
                <PieChart size={20} className="text-green-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">
                    {animatedNumbers.prediction}%
                  </p>
                  <p className="text-green-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +3.7% from last week
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="GOOGL" stroke="#69db7c" fill="#69db7c" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Trading Signals Card */}
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Trading Signals</h3>
                <Send size={20} className="text-yellow-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-300">
                    {animatedNumbers.signals}
                  </p>
                  <p className="text-yellow-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +8 from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="AMZN" stroke="#ffd43b" fill="#ffd43b" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Analytics Sphere */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart */}
          <div className={`lg:col-span-3 mb-4 ${theme === 'dark' 
            ? 'bg-gray-900 bg-opacity-50 border-blue-800' 
            : 'bg-white bg-opacity-70 border-blue-200'} 
            backdrop-blur-md p-6 rounded-xl border`}>
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Market Performance</h3>
                 <ChartAnalysisButton 
                  data={filterStockData(timeRange)}
                  chartName="Market Performance Overview"
                  theme={theme}
                />
                <div className="flex items-center gap-4">
                  
                  <div className="flex space-x-2">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map((range) => (
                      <button 
                        key={range}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          timeRange === range 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                        onClick={() => handlers.timeRangeChange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filterStockData(timeRange)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={theme === 'dark' ? '#999' : '#4b5563'} />
                    <YAxis stroke={theme === 'dark' ? '#999' : '#4b5563'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(10, 15, 30, 0.8)' : 'rgba(255, 255, 255, 0.95)', 
                        borderColor: theme === 'dark' ? '#2c3e50' : '#e5e7eb',
                        color: theme === 'dark' ? '#fff' : '#111827'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="AAPL" 
                      stroke="#4dabf7" 
                      strokeWidth={3} 
                      dot={{ r: 6, strokeWidth: 2 }} 
                      activeDot={{ r: 8, strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="MSFT" 
                      stroke="#da77f2" 
                      strokeWidth={3} 
                      dot={{ r: 6, strokeWidth: 2 }} 
                      activeDot={{ r: 8, strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="GOOGL" 
                      stroke="#69db7c" 
                      strokeWidth={3} 
                      dot={{ r: 6, strokeWidth: 2 }} 
                      activeDot={{ r: 8, strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="AMZN" 
                      stroke="#ffd43b" 
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2 }} 
                      activeDot={{ r: 8, strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Market Components */}
        <UploadPdf />
        <MarketSentimentSurvey />
        {/* <MarketDashboard /> */}
        <MarketMoversSection />
        <RecentAISessionsComponent />
      </main>

      <Footer />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

export default Dashboard;