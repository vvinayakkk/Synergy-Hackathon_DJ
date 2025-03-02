import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MarketHeader from '../components/header';
import AnalysisButton from '../components/AnalysisButton';

const GlassCard = ({ children, className = '' }) => (
  <div className={`backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-xl ${className}`}>
    {children}
  </div>
);

const Analysis = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [predictionData, setPredictionData] = useState({
    confidence_score: null,
    individual_predictions: {},
    lower_bound: null,
    prediction: null,
    upper_bound: null,
  });
  const [newsData, setNewsData] = useState([]); // Initialize as an empty array
  const [recommendationData, setRecommendationData] = useState({
    daily_actions: [], // Initialize as an empty array
    key_factors: [], // Initialize as an empty array
    summary: {
      confidence_score: null,
      current_price: null,
      recommendation: null,
      risk_level: null,
      target_price: null,
      upside_potential: null,
    },
  });
  const [symbol, setSymbol] = useState('AAPL');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [forecastDays, setForecastDays] = useState(30);
  const [showPrediction, setShowPrediction] = useState(false); // State to toggle prediction visibility

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
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [historicalResponse, forecastResponse, predictionResponse, newsResponse, recommendationResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/stock_data?symbol=${symbol}&display_days=600`),
          axios.get(`http://localhost:5000/api/forecast?symbol=${symbol}&display_days=600&forecast_days=${forecastDays}`),
          axios.post(`http://localhost:5000/api/predictions`, { symbol }),
          axios.get(`http://localhost:5000/api/news?symbol=${symbol}`),
          axios.get(`http://localhost:5000/api/recommendation?symbol=${symbol}&display_days=600`),
          axios.get(`http://localhost:5000/api/recommendation2?symbol=${symbol}&display_days=600`),

        ]);

        if (!historicalResponse.data || !forecastResponse.data || !predictionResponse.data || !newsResponse.data || !recommendationResponse.data) {
          throw new Error('No data found for the given symbol.');
        }

        const { combined, historical, forecast } = transformData(historicalResponse.data, forecastResponse.data);
        if (combined.length === 0) {
          throw new Error('Failed to process data for the given symbol.');
        }

        setCombinedData(combined);
        setHistoricalData(historical);
        setForecastData(forecast);
        setPredictionData(predictionResponse.data);
        setNewsData(newsResponse.data || []); // Ensure newsData is an array
        setRecommendationData(recommendationResponse.data); // Set recommendation data
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, forecastDays]);

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const togglePrediction = () => {
    setShowPrediction(!showPrediction); // Toggle prediction visibility
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
      <MarketHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
        <MarketHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-red-500 text-center p-8 bg-gray-800 bg-opacity-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <button 
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const historicalSubsets = [
    historicalData.slice(0, historicalData.length / 3),
    historicalData.slice(historicalData.length / 3, (2 * historicalData.length) / 3),
    historicalData.slice((2 * historicalData.length) / 3),
  ];

  const forecastSubsets = [
    forecastData.slice(0, forecastData.length / 3),
    forecastData.slice(forecastData.length / 3, (2 * forecastData.length) / 3),
    forecastData.slice((2 * forecastData.length) / 3),
  ];

  const chartDescriptions = {
    mainChart: "Comprehensive analysis of price movements, trends, and technical indicators with AI-powered pattern recognition.",
    historical1: "Analysis of early period price action showing key support and resistance levels.",
    historical2: "Mid-period analysis highlighting trend changes and momentum shifts.",
    historical3: "Recent period analysis with volume profile and price action patterns.",
    forecast1: "Short-term forecast analysis using machine learning models and market sentiment.",
    forecast2: "Medium-term prediction analysis incorporating technical and fundamental factors.",
    forecast3: "Long-term forecast analysis with macro-economic indicators and market cycles."
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
      <MarketHeader />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {symbol} Stock Analysis
              </h2>
              <p className="text-gray-400">Comprehensive market analysis and predictions</p>
            </div>
            <select 
              value={symbol} 
              onChange={handleSymbolChange}
              className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl 
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="TSLA">TSLA</option>
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
              <option value="AMZN">AMZN</option>
              <option value="GOOGL">GOOGL</option>
            </select>
          </div>
        </GlassCard>

        {/* Chart Controls */}
        <GlassCard className="p-6">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-300">Chart Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '20-Day SMA', state: showSMA20, setter: setShowSMA20, color: 'yellow' },
                { label: '50-Day SMA', state: showSMA50, setter: setShowSMA50, color: 'green' },
                { label: 'Bollinger Bands', state: showBB, setter: setShowBB, color: 'purple' },
                { label: 'RSI/MACD', state: showIndicators, setter: setShowIndicators, color: 'red' }
              ].map(({ label, state, setter, color }) => (
                <button
                  key={label}
                  onClick={() => setter(!state)}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    state 
                      ? `bg-${color}-500/20 border-${color}-500 border-2 text-${color}-400`
                      : 'bg-gray-800/50 border-gray-700 border hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${state ? `bg-${color}-500` : 'bg-gray-600'}`} />
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="text-gray-300 whitespace-nowrap">Forecast Horizon:</label>
              <div className="w-full flex items-center gap-4">
                <input 
                  type="range" 
                  value={forecastDays} 
                  onChange={(e) => setForecastDays(Number(e.target.value))} 
                  min="7" 
                  max="365"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-blue-400 font-mono w-16">{forecastDays}d</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Chart - Add button */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-blue-300">Price Chart</h3>
            <AnalysisButton 
              data={combinedData} 
              graphType="comprehensive price"
            />
          </div>
          <ResponsiveContainer width="100%" height={500}>
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
        </GlassCard>

        {/* Toggle Button for Prediction */}
        <div className="flex justify-center mb-8">
          <button
            onClick={togglePrediction}
            className="group relative px-8 py-3 overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-500 
                     transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 w-3 bg-blue-400 transition-all duration-300 ease-out 
                          group-hover:w-full"></div>
            <span className="relative text-white font-semibold">
              {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
            </span>
          </button>
        </div>

        {/* Prediction Data (Conditional Rendering) */}
        {showPrediction && (
          <GlassCard className="p-6 transform transition-all duration-500">
            <h3 className="text-lg font-bold mb-4 text-blue-300">Prediction Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Prediction</h4>
                <p className="text-sm text-gray-300">${predictionData.prediction?.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Confidence Score</h4>
                <p className="text-sm text-gray-300">{(predictionData.confidence_score * 100).toFixed(2)}%</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Lower Bound</h4>
                <p className="text-sm text-gray-300">${predictionData.lower_bound?.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Upper Bound</h4>
                <p className="text-sm text-gray-300">${predictionData.upper_bound?.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Individual Predictions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(predictionData.individual_predictions).map(([model, value]) => (
                  <div key={model} className="bg-gray-800 p-4 rounded-lg">
                    <h5 className="text-md font-semibold mb-2">{model}</h5>
                    <p className="text-sm text-gray-300">${value?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* News Section */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4 text-blue-300">Latest News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(newsData) && newsData.map((news, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">{news.title}</h4>
                <p className="text-sm text-gray-300 mb-4">{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  Read more
                </a>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recommendation Data */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4 text-blue-300">Recommendation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Recommendation</h4>
              <p className="text-sm text-gray-300">{recommendationData.summary.recommendation}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Confidence</h4>
              <p className="text-sm text-gray-300">{(recommendationData.summary.confidence_score * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Current Price</h4>
              <p className="text-sm text-gray-300">${recommendationData.summary.current_price}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Target Price</h4>
              <p className="text-sm text-gray-300">${recommendationData.summary.target_price}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Upside Potential</h4>
              <p className="text-sm text-gray-300">{recommendationData.summary.upside_potential}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Risk Level</h4>
              <p className="text-sm text-gray-300">{recommendationData.summary.risk_level}</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Key Insights</h4>
            <div className="bg-gray-800 p-4 rounded-lg">
              <ul className="list-disc list-inside">
                {Array.isArray(recommendationData.key_factors) && recommendationData.key_factors.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-300">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Daily Actions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Action</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Entry Price</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Stop Loss</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Target Price</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Time Frame</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-300">Volume Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(recommendationData.daily_actions) && recommendationData.daily_actions.map((action, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-2 text-sm text-gray-300">{action.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.action}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.entry_price}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.stop_loss}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.target_price}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.time_frame}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{action.volume_suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* Historical Charts - Add buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {historicalSubsets.map((subset, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-300">Historical Data {index + 1}</h3>
                <AnalysisButton 
                  data={subset} 
                  graphType={`historical period ${index + 1}`}
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={subset}>
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
                  
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#4dabf7"
                    strokeWidth={2}
                    name="Close Price"
                    dot={false}
                  />
                  
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
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          ))}
        </div>

        {/* Forecast Charts - Add buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecastSubsets.map((subset, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-300">Forecast Data {index + 1}</h3>
                <AnalysisButton 
                  data={subset} 
                  graphType={`forecast period ${index + 1}`}
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={subset}>
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
                  
                  <Line
                    type="monotone"
                    dataKey="yhat"
                    stroke="#ffa600"
                    strokeWidth={2}
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
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Analysis;




