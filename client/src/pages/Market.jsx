import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';
import NiftyChart from '../components/NiftyChart';
import FiiDiiChart from '../components/FiiDiiChart'; // Import the new chart component
import StockCard from '../components/StockCard';  
import MonthSelector from '../components/MonthSelector';
import TimeframeSelector from '../components/TimeFrameSelector';

const MarketDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [timeframe, setTimeframe] = useState('Daily');
  const [month, setMonth] = useState('March 2025');

  // State for API data
  const [niftyData, setNiftyData] = useState({
    value: 0,
    change: 0,
    percentage: 0,
    low52W: 0,
    high52W: 0,
    downside: 0,
    upside: 0,
  });
  const [sensexData, setSensexData] = useState({
    value: 0,
    change: 0,
  });
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [fiiDiiData, setFiiDiiData] = useState([]);
  const [fiiDiiSummary, setFiiDiiSummary] = useState({
    fiiNet: 0,
    diiNet: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add this function after the state declarations and before useEffect
  const mapStockData = (stock) => ({
    name: stock.Ticker.replace('.NS', ''), // Remove .NS suffix
    ticker: stock.Ticker,
    change_percentage: stock['Change (%)'],
    logo: stock.Ticker[0], // Use first letter as logo
    sector: stock.sector || 'N/A', // Add sector if available
    volume: stock.volume || 'N/A', // Add volume if available
  });

  // Fetch all data from the Flask backend
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:6002/api/indian-market-data');
      const data = response.data;

      // Process NIFTY and SENSEX data
      const niftyIndex = data.indices.find((index) => index.Index.includes('NIFTY 50'));
      const sensexIndex = data.indices.find((index) => index.Index.includes('SENSEX'));

      if (niftyIndex) {
        setNiftyData({
          value: 22000, // Replace with actual value from the backend if available
          change: parseFloat(niftyIndex['Change (%)']),
          percentage: parseFloat(niftyIndex['Change (%)']),
          low52W: 21137.20, // Replace with actual 52-week low
          high52W: 26277.35, // Replace with actual 52-week high
          downside: -4.67, // Replace with actual downside calculation
          upside: 18.77, // Replace with actual upside calculation
        });
      }

      if (sensexIndex) {
        setSensexData({
          value: 73000, // Replace with actual value from the backend if available
          change: parseFloat(sensexIndex['Change (%)']),
        });
      }

      // Set top gainers and losers
      setTopGainers(data.top_gainers);
      setTopLosers(data.top_losers);

      // Set FII/DII data
      setFiiDiiData(data.fii_dii_data);

      // Calculate FII/DII summary
      const summary = {
        fiiNet: data.fii_dii_data.reduce((sum, row) => sum + row.fiiNet, 0),
        diiNet: data.fii_dii_data.reduce((sum, row) => sum + row.diiNet, 0),
      };
      setFiiDiiSummary(summary);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []);

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
              onClick={fetchAllData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <MarketHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="loader"></div>
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

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NiftyChart />
        {/* NIFTY 50 Section */}
        <div className="mb-12">
          <div className="text-gray-400 mb-3">NIFTY 50</div>
          <div className="flex items-baseline space-x-4">
            <h1 className="text-5xl font-bold">{niftyData.value.toLocaleString()}</h1>
            <span className={`text-xl ${niftyData.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ▼ {niftyData.change.toFixed(2)} ({niftyData.percentage.toFixed(2)}%)
            </span>
          </div>
          <div className={`mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Market Closed
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 52W Range Card */}
            <div className={`rounded-xl p-6 ${
              theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">52W low</span>
                <span className="text-gray-400">52W high</span>
              </div>
              <div className="flex justify-between mb-3">
                <span>{niftyData.low52W.toLocaleString()}</span>
                <span>{niftyData.high52W.toLocaleString()}</span>
              </div>
              <div className="relative h-2 bg-gray-700 rounded-full mb-3">
                <div 
                  className="absolute h-full w-3 rounded-full bg-blue-500 top-0" 
                  style={{ left: `${(niftyData.value - niftyData.low52W) / (niftyData.high52W - niftyData.low52W) * 100}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-red-500">▼{niftyData.downside.toFixed(2)}% downside</span>
                <span className="text-green-500 flex items-center">upside {niftyData.upside.toFixed(2)}% ▲</span>
              </div>
            </div>

            {/* FII/DII Activity Card */}
            <div className={`rounded-xl p-6 ${
              theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="text-lg font-bold mb-4">FII/DII Activity</div>
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-400">FII Net</div>
                  <div className="text-red-500">-{Math.abs(fiiDiiSummary.fiiNet).toLocaleString()} Cr</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">DII Net</div>
                  <div className="text-green-500">{fiiDiiSummary.diiNet.toLocaleString()} Cr</div>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="h-2 flex-1 bg-red-500 rounded-full"></div>
                <div className="h-2 flex-1 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div className="mb-12 space-y-12">
          {/* Top Gainers */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Top Gainers</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stocks showing positive momentum in today's trading session
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topGainers.map((stock, index) => (
                <div key={index} className={`transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  theme === 'dark' ? 'hover:shadow-blue-900/30' : 'hover:shadow-blue-200'
                }`}>
                  <StockCard 
                    stock={mapStockData(stock)} 
                    isGainer={stock['Change (%)'] > 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Top Losers</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stocks showing downward movement in today's trading session
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topLosers.map((stock, index) => (
                <div key={index} className={`transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  theme === 'dark' ? 'hover:shadow-red-900/30' : 'hover:shadow-red-200'
                }`}>
                  <StockCard 
                    stock={mapStockData(stock)} 
                    isGainer={stock['Change (%)'] > 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FII/DII Activities */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              FII/DII Activities 
              <span className={`text-sm ml-3 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>(in crore)</span>
            </h2>
            <div className="flex items-center space-x-3">
              <MonthSelector active={month} onChange={setMonth} />
              <TimeframeSelector 
                options={['Daily', 'Monthly']} 
                active={timeframe} 
                onChange={setTimeframe} 
              />
            </div>
          </div>

          {/* Chart Area */}
          <div className={`rounded-xl p-6 mb-8 ${
            theme === 'dark'
              ? 'bg-gray-800'
              : 'bg-white border border-gray-200'
          }`}>
            <FiiDiiChart data={fiiDiiData} />
          </div>

          {/* Table */}
          <div className={`rounded-xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-800'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-right">FII Buy</th>
                    <th className="p-4 text-right">FII Sell</th>
                    <th className="p-4 text-right">FII Net</th>
                    <th className="p-4 text-right">DII Buy</th>
                    <th className="p-4 text-right">DII Sell</th>
                    <th className="p-4 text-right">DII Net</th>
                  </tr>
                </thead>
                <tbody>
                  {fiiDiiData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-4">{row.date}</td>
                      <td className="p-4 text-right">{row.fiiBuy.toLocaleString()}</td>
                      <td className="p-4 text-right">{row.fiiSell.toLocaleString()}</td>
                      <td className={`p-4 text-right ${row.fiiNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {row.fiiNet >= 0 ? row.fiiNet.toLocaleString() : `-${Math.abs(row.fiiNet).toLocaleString()}`}
                      </td>
                      <td className="p-4 text-right">{row.diiBuy.toLocaleString()}</td>
                      <td className="p-4 text-right">{row.diiSell.toLocaleString()}</td>
                      <td className={`p-4 text-right ${row.diiNet >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {row.diiNet >= 0 ? row.diiNet.toLocaleString() : `-${Math.abs(row.diiNet).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className={`text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        } space-y-3 py-6`}>
          <p>Data as of {new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="mt-2">Disclaimer: Market data is provided for informational purposes only. Not financial advice.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketDashboard;