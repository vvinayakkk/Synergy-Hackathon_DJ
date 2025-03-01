import React, { useState, useContext } from 'react';
import { ThemeContext } from '../themeContext';
import Footer from '../components/footer';
import MarketHeader from '../components/header';
import { downloadCSV, saveToJSON } from '../utils/exportUtils';

const mockData = [
  { id: 1, name: 'Reliance Industries Ltd', logo: 'R', price: '1,199.60', change: '-0.62%', rating: 'Bearish', sector: 'Refineries', industry: 'Refineries' },
  { id: 2, name: 'HDFC Bank Ltd', logo: 'H', price: '1,731.10', change: '+1.86%', rating: 'Bullish', sector: 'Banks', industry: 'Banks - Private Sector' },
  { id: 3, name: 'Tata Consultancy Services', logo: 'T', price: '3,483.90', change: '-3.56%', rating: 'Bearish', sector: 'IT - Software', industry: 'Computers - Software' },
  { id: 4, name: 'Bharti Airtel Ltd', logo: 'B', price: '1,569.60', change: '-4.86%', rating: 'Bearish', sector: 'Telecomm-Service', industry: 'Telecommunications' },
  { id: 5, name: 'ICICI Bank Ltd', logo: 'I', price: '1,201.00', change: '-1.67%', rating: 'Bearish', sector: 'Banks', industry: 'Banks - Private Sector' },
  { id: 6, name: 'Infosys Ltd', logo: 'I', price: '1,688.05', change: '-4.32%', rating: 'Bearish', sector: 'IT - Software', industry: 'Computers - Software' },
  { id: 7, name: 'State Bank of India', logo: 'S', price: '688.25', change: '-2.23%', rating: 'Bearish', sector: 'Banks', industry: 'Banks - Public Sector' },
  { id: 8, name: 'Bajaj Finance Ltd', logo: 'B', price: '8,542.25', change: '-1.76%', rating: 'Bullish', sector: 'Finance', industry: 'Finance - Large' },
  { id: 9, name: 'Hindustan Unilever Ltd', logo: 'H', price: '2,191.80', change: '-2.44%', rating: 'Bearish', sector: 'FMCG', industry: 'Personal Care' },
  { id: 10, name: 'ITC Ltd', logo: 'I', price: '394.70', change: '-1.68%', rating: 'Bearish', sector: 'Tobacco Products', industry: 'Cigarettes' },
  { id: 11, name: 'Life Insurance Corporation', logo: 'L', price: '740.35', change: '-0.10%', rating: 'Bearish', sector: 'Insurance', industry: 'Life Insurance' },
];

const ScreenerResults = () => {
  const { theme } = useContext(ThemeContext);
  const [stocks] = useState(mockData);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleSave = () => {
    saveToJSON(stocks, 'screener_results');
  };

  const handleExportCSV = () => {
    downloadCSV(stocks, 'screener_results');
    setExportDropdownOpen(false);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">New Screen</h1>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Showing 1 - 40 of 4932 results</div>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className={`${
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-800 text-white'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              } border py-2 px-4 rounded flex items-center transition-colors`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save as JSON
            </button>

            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className={`${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-800 text-white'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                } border py-2 px-4 rounded flex items-center transition-colors`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              {exportDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } border`}>
                  <div className="py-1">
                    <button
                      onClick={handleExportCSV}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Export as CSV
                    </button>
                    {/* Add more export options here if needed */}
                  </div>
                </div>
              )}
            </div>

            <button className={`${
              theme === 'dark'
                ? 'border-gray-600 hover:bg-gray-800 text-white'
                : 'border-gray-300 hover:bg-gray-100 text-gray-700'
            } border py-2 px-4 rounded flex items-center transition-colors`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className={`min-w-full ${
            theme === 'dark' 
              ? 'bg-gray-800 text-gray-200' 
              : 'bg-white text-gray-900'
          }`}>
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr className="border-b border-gray-800">
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Company Name
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Price
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Change 1D (%)
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Technical Rating
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Sector
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="flex items-center">
                    Industry
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id} className={`${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                } border-b transition-colors`}>
                  <td className="py-3 px-4">{stock.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        {stock.logo}
                      </div>
                      {stock.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">{stock.price}</td>
                  <td className={`py-3 px-4 ${stock.change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center ${stock.rating === 'Bullish' ? 'text-green-500' : 'text-red-500'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {stock.rating === 'Bullish' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        )}
                      </svg>
                      {stock.rating}
                    </div>
                  </td>
                  <td className="py-3 px-4">{stock.sector}</td>
                  <td className="py-3 px-4">{stock.industry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScreenerResults;