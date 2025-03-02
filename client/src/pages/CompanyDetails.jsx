import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Bell, 
  Eye, 
  BarChart2, 
  TrendingUp, 
  Users, 
  BarChart, 
  PieChart,
  Zap
} from 'lucide-react';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';
import StockPriceChart from '../components/StockPriceChart';

// Mock data for the company details
const companyData = {
  TATAMOTORS: {
    name: 'Tata Motors Ltd',
    shortName: 'TATAMOTORS',
    logo: 'https://via.placeholder.com/48',
    price: 620.55,
    change: -27.65,
    changePercent: -4.27,
    marketCap: '2,28,436 Cr',
    pe: 7.18,
    investmentChecklist: {
      performance: { label: 'STEADY PERFORMER', status: 'neutral' },
      valuation: { label: 'UNDERVALUED', status: 'positive' },
      growth: { label: 'STABLE', status: 'neutral' },
      profitability: { label: 'MODERATE MARGIN', status: 'neutral' },
      technicals: { label: 'BEARISH', status: 'negative' },
      risk: { label: 'MODERATE RISK', status: 'neutral' }
    },
    overview: {
      description: "Tata Motors Limited, established in 1945, is a leading global automobile manufacturer that has evolved from locomotives to a comprehensive automotive portfolio, including luxury vehicles like Jaguar Land Rover, a variety of passenger and commercial vehicles, and electric mobility options. With significant manufacturing and R&D presence in India and abroad, Tata Motors produces a diverse range of vehicles including the Nexon SUV, Ace mini-truck, and heavy trucks like Tata Prima. Their focus areas include automotive, engine production, and electric mobility, with notable advancements in design and technology through partnerships and acquisitions. Financially, Tata Motors has witnessed fluctuating performance while expanding its market presence through strategic initiatives.",
      sector: "Automobile",
      industry: "Automobiles - LCVs/HCVs",
      marketCap: "2,28,436 Cr",
      volatility: "High Risk",
      peRatio: 7.2,
      industryPE: 8.8,
      pegRatio: 0.1,
      pbRatio: 2.3,
      high52W: "1,179.05",
      low52W: "618.45",
      metrics: {
        salesCAGR: {
          "1Y": 26.58,
          "3Y": 20.58,
          "5Y": 7.72,
          "10Y": 5.68
        },
        profitCAGR: {
          "1Y": 1082.46,
          "3Y": null,
          "5Y": null,
          "10Y": 9.49
        },
        roe: {
          "TTM": 32.99,
          "3Y": 11.50,
          "5Y": -1.00,
          "10Y": 1.90
        },
        roce: {
          "TTM": 18.02,
          "3Y": 9.65,
          "5Y": 5.21,
          "10Y": 5.63
        }
      },
      returnsData: {
        "1L": 4.81,
        "5Y": "Turned 1 L into 4.81 L in last 5 Years"
      }
    }
  }
};

// Mock chart data
const chartData = [
  { month: 'Mar 2023', value: 800, volume: 1200000 },
  { month: 'Apr 2023', value: 750, volume: 980000 },
  { month: 'May 2023', value: 820, volume: 1100000 },
  { month: 'Jun 2023', value: 950, volume: 1500000 },
  { month: 'Jul 2023', value: 1100, volume: 2000000 },
  { month: 'Aug 2023', value: 900, volume: 1600000 },
  { month: 'Sep 2023', value: 850, volume: 1400000 },
  { month: 'Oct 2023', value: 780, volume: 1100000 },
  { month: 'Nov 2023', value: 720, volume: 900000 },
  { month: 'Dec 2023', value: 680, volume: 850000 },
  { month: 'Jan 2024', value: 650, volume: 800000 },
  { month: 'Feb 2024', value: 620, volume: 750000 },
];

const CompanyDetail = () => {
  const { theme } = useContext(ThemeContext);
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const data = companyData[companyId.toUpperCase()];
    setCompany(data);
  }, [companyId]);
  
  if (!company) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }
  
  // Determine if price change is positive or negative
  const isPriceDown = company.change < 0;
  const priceChangeColor = isPriceDown ? 'text-red-500' : 'text-green-500';
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Stock ticker tape */}
      <MarketHeader/>
      
      {/* Company header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 mr-4 flex items-center justify-center overflow-hidden">
              <img src={company.logo} alt={company.name} className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.shortName}</h1>
              <p className="text-sm text-gray-400">{company.name}</p>
            </div>
          </div>
          
          <div className="ml-auto flex space-x-3">
            <button className={`flex items-center px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
            }`}>
              <Eye className="h-4 w-4 mr-2" />
              Watchlist
            </button>
            <button className={`flex items-center px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
            }`}>
              <Bell className="h-4 w-4 mr-2" />
              Alert
            </button>
          </div>
        </div>
        
        {/* Stock price & info */}
        <div className="flex items-start mb-8">
          <div className="mr-8">
            <div className="flex items-center">
              <h2 className="text-4xl font-bold">₹{company.price}</h2>
              <div className={`ml-3 ${priceChangeColor}`}>
                <span className="text-xl">▼ {Math.abs(company.change).toFixed(2)} ({Math.abs(company.changePercent).toFixed(2)}%)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-16 mt-6">
              <div>
                <p className="text-sm text-gray-400">Market Cap</p>
                <p className="text-lg">₹ {company.marketCap}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">P/E</p>
                <p className="text-lg">{company.pe}</p>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm">{company.overview.returnsData["5Y"]}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Investment Checklist */}
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 flex justify-between">
            Investment Checklist
            <a href="#" className="text-blue-500 text-sm">How to read checklist?</a>
          </h3>
          
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(company.investmentChecklist).map(([key, { label, status }]) => (
              <div key={key} className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <p className="text-sm text-gray-400 capitalize">{key}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-medium">{label}</p>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    status === 'positive' ? 'text-green-500' : 
                    status === 'negative' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {status === 'positive' ? '✓' : status === 'negative' ? '✗' : '−'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stock Chart */}
        <div className={`mb-8 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
              {['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX'].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 rounded-full text-sm ${
                    period === '1Y'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <button className={`px-3 py-1 rounded-lg text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                Indicators
              </button>
              <button className={`px-3 py-1 rounded-lg text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                Compare
              </button>
            </div>
          </div>
          
          <StockPriceChart 
            data={chartData} 
            theme={theme} 
            isPriceDown={company.change < 0} 
          />
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            {['overview', 'technicals', 'forecast', 'peers', 'financials', 'shareholdings', 'projection', 'ai corner', 'news'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                    : 'text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Overview Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 mb-8">{company.overview.description}</p>
            
            <div className="mb-4 flex items-center">
              <a href="#" className="text-blue-500 flex items-center text-sm">
                <span>Edit Fields</span>
              </a>
            </div>
            
            <div className="grid grid-cols-5 gap-8 mb-8">
              <div>
                <p className="text-gray-400 mb-1">Sector</p>
                <p className="font-medium">{company.overview.sector}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Industry</p>
                <p className="font-medium">{company.overview.industry}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Market Cap</p>
                <p className="font-medium">{company.overview.marketCap}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Volatility</p>
                <p className="font-medium">{company.overview.volatility}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">P/E Ratio</p>
                <p className="font-medium">{company.overview.peRatio}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-8 mb-12">
              <div>
                <p className="text-gray-400 mb-1">Industry P/E</p>
                <p className="font-medium">{company.overview.industryPE}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">PEG Ratio</p>
                <p className="font-medium">{company.overview.pegRatio}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">P/B Ratio</p>
                <p className="font-medium">{company.overview.pbRatio}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">52W High</p>
                <p className="font-medium">{company.overview.high52W}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">52W Low</p>
                <p className="font-medium">{company.overview.low52W}</p>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { title: 'Sales CAGR', data: company.overview.metrics.salesCAGR },
                { title: 'Profit CAGR', data: company.overview.metrics.profitCAGR },
                { title: 'ROE', data: company.overview.metrics.roe },
                { title: 'ROCE', data: company.overview.metrics.roce }
              ].map((metric, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <h3 className="font-medium mb-4">{metric.title}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(metric.data).map(([period, value]) => (
                      <div key={period}>
                        <p className="text-xs text-gray-400">{period}</p>
                        <p className="font-medium">
                          {value === null ? '−' : `${value}%`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default CompanyDetail;