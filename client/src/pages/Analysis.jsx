import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MarketHeader from '../components/header';

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
  const [newsData, setNewsData] = useState([]);
  const [recommendationData, setRecommendationData] = useState({
    buy: null,
    confidence: null,
    error: null,
    investment_horizon: null,
    key_insights: [],
    last_updated: null,
    risk_level: null,
    score: null,
  });
  const [symbol, setSymbol] = useState('TSLA');
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
        setNewsData(newsResponse.data);
        setRecommendationData(recommendationResponse.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
        <MarketHeader />
        <div className="container mx-auto px-4 py-6 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-bold">Loading data...</h2>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
      <MarketHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {symbol} Stock Analysis & Forecast
          </h2>
          <div className="mt-4 md:mt-0">
            <select 
              id="symbol" 
              value={symbol} 
              onChange={handleSymbolChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Toggle Button for Prediction */}
        <div className="flex justify-center mb-8">
          <button
            onClick={togglePrediction}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300"
          >
            {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
          </button>
        </div>

        {/* Prediction Data (Conditional Rendering) */}
        {showPrediction && (
          <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
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
          </div>
        )}

        {/* News Section */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-bold mb-4 text-blue-300">Latest News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsData.map((news, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">{news.title}</h4>
                <p className="text-sm text-gray-300 mb-4">{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  Read more
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Data */}
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-lg font-bold mb-4 text-blue-300">Recommendation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Recommendation</h4>
              <p className="text-sm text-gray-300">{recommendationData.buy ? 'Buy' : 'Sell'}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Confidence</h4>
              <p className="text-sm text-gray-300">{recommendationData.confidence}%</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Investment Horizon</h4>
              <p className="text-sm text-gray-300">{recommendationData.investment_horizon}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Risk Level</h4>
              <p className="text-sm text-gray-300">{recommendationData.risk_level}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Score</h4>
              <p className="text-sm text-gray-300">{recommendationData.score}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Last Updated</h4>
              <p className="text-sm text-gray-300">{recommendationData.last_updated}</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Key Insights</h4>
            <div className="bg-gray-800 p-4 rounded-lg">
              <ul className="list-disc list-inside">
                {recommendationData.key_insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-300">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Grid Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {historicalSubsets.map((subset, index) => (
            <div key={index} className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-blue-300">Historical Data {index + 1}</h3>
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
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecastSubsets.map((subset, index) => (
            <div key={index} className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-blue-300">Forecast Data {index + 1}</h3>
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
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Analysis;