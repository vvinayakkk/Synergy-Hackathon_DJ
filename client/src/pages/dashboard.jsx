// App.js (React Frontend)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [symbol, setSymbol] = useState('AAPL');
  const [displayDays, setDisplayDays] = useState(600);
  const [stockData, setStockData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [technicalIndicators, setTechnicalIndicators] = useState([]);
  const [modelPredictions, setModelPredictions] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    fetchStockData();
    fetchCurrentPrice();
    fetchNewsHeadlines();
  }, [symbol, displayDays]);

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`/api/fetch_stock_data?symbol=${symbol}&display_days=${displayDays}`);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await axios.get(`/api/get_current_price?symbol=${symbol}`);
      setCurrentPrice(response.data);
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const fetchNewsHeadlines = async () => {
    try {
      const response = await axios.get(`/api/get_news_headlines?symbol=${symbol}`);
      setNewsHeadlines(response.data);
    } catch (error) {
      console.error('Error fetching news headlines:', error);
    }
  };

  const handleForecast = async () => {
    try {
      const response = await axios.post('/api/forecast_with_prophet', {
        df: stockData,
        forecast_days: 30
      });
      setForecast(response.data);
    } catch (error) {
      console.error('Error forecasting with prophet:', error);
    }
  };

  const handleTechnicalIndicators = async () => {
    try {
      const response = await axios.post('/api/calculate_technical_indicators', {
        df: stockData
      });
      setTechnicalIndicators(response.data);
    } catch (error) {
      console.error('Error calculating technical indicators:', error);
    }
  };

  const handleModelPredictions = async () => {
    try {
      const response = await axios.post('/api/predict_with_all_models', {
        symbol: symbol,
        weights: WEIGHT_CONFIGURATIONS['Default']
      });
      setModelPredictions(response.data);
    } catch (error) {
      console.error('Error predicting with all models:', error);
    }
  };

  const handleRecommendation = async () => {
    try {
      const response = await axios.post('/api/generate_recommendation', {
        symbol: symbol,
        historical_data: stockData,
        prophet_forecast: forecast,
        multi_model_results: modelPredictions,
        news_sentiment: newsHeadlines.map(headline => analyzeSentiment(headline.title)),
        technical_analysis: technicalIndicators
      });
      setRecommendation(response.data);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    }
  };

  const handleTradeSimulation = async () => {
    try {
      const response = await axios.post('/api/simulate_trade', {
        symbol: symbol,
        historical_data: stockData,
        prophet_forecast: forecast,
        multi_model_results: modelPredictions,
        news_sentiment: newsHeadlines.map(headline => analyzeSentiment(headline.title)),
        technical_analysis: technicalIndicators
      });
      setTrade(response.data);
    } catch (error) {
      console.error('Error simulating trade:', error);
    }
  };

  const analyzeSentiment = (text) => {
    try {
      const response = axios.post('/api/analyze_sentiment', {
        text: text
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Algorithm Stock Predictor</h1>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter Stock Symbol"
        />
        <input
          type="number"
          value={displayDays}
          onChange={(e) => setDisplayDays(e.target.value)}
          placeholder="Display Days"
        />
        <button onClick={fetchStockData}>Fetch Stock Data</button>
        <button onClick={fetchCurrentPrice}>Fetch Current Price</button>
        <button onClick={fetchNewsHeadlines}>Fetch News Headlines</button>
        <button onClick={handleForecast}>Forecast with Prophet</button>
        <button onClick={handleTechnicalIndicators}>Calculate Technical Indicators</button>
        <button onClick={handleModelPredictions}>Predict with All Models</button>
        <button onClick={handleRecommendation}>Generate Recommendation</button>
        <button onClick={handleTradeSimulation}>Simulate Trade</button>

        <div>
          <h2>Stock Data</h2>
          <pre>{JSON.stringify(stockData, null, 2)}</pre>
        </div>

        <div>
          <h2>Current Price</h2>
          <pre>{JSON.stringify(currentPrice, null, 2)}</pre>
        </div>

        <div>
          <h2>News Headlines</h2>
          <pre>{JSON.stringify(newsHeadlines, null, 2)}</pre>
        </div>

        <div>
          <h2>Forecast</h2>
          <pre>{JSON.stringify(forecast, null, 2)}</pre>
        </div>

        <div>
          <h2>Technical Indicators</h2>
          <pre>{JSON.stringify(technicalIndicators, null, 2)}</pre>
        </div>

        <div>
          <h2>Model Predictions</h2>
          <pre>{JSON.stringify(modelPredictions, null, 2)}</pre>
        </div>

        <div>
          <h2>Recommendation</h2>
          <pre>{JSON.stringify(recommendation, null, 2)}</pre>
        </div>

        <div>
          <h2>Trade Simulation</h2>
          <pre>{JSON.stringify(trade, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;