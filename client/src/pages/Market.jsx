import React, { useState, useContext } from 'react';
import MarketHeader from '../components/header';
import Footer from '../components/footer';
import { ThemeContext } from '../themeContext';
import NiftyChart from '../components/NiftyChart';

const MarketDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [capFilter, setCapFilter] = useState('Large Cap');
  const [timeframe, setTimeframe] = useState('Daily');
  const [month, setMonth] = useState('March 2025');

  // Mock data based on the screenshots
  const niftyData = {
    value: 22124.70,
    change: -420.35,
    percentage: -1.86,
    low52W: 21137.20,
    high52W: 26277.35,
    downside: -4.67,
    upside: 18.77,
  };

  const sensexData = {
    value: 73198.10,
    change: -1.90,
  };

  const marketStats = {
    stockTraded: 4450,
    unchanged: 101,
    advances: 814,
    declines: 3535,
  };

  const advanceRatio = {
    largeCap: 7,
    midCap: 14,
    smallCap: 17,
    microCap: 20,
  };

  const topGainers = [
    { name: 'HDFCBANK', fullName: 'HDFC Bank Ltd', price: 1731.10, change: 1.86, logo: 'H' },
    { name: 'SHRIRAMFIN', fullName: 'Shriram Finance Ltd', price: 617.55, change: 1.74, logo: 'S' },
    { name: 'COALINDIA', fullName: 'Coal India Ltd', price: 369.10, change: 1.44, logo: 'C' },
    { name: 'INDIGO', fullName: 'Interglobe Aviation Ltd', price: 4480.00, change: 0.85, logo: 'I' },
    { name: 'LUPIN', fullName: 'Lupin Ltd', price: 1906.20, change: 0.78, logo: 'L' },
  ];

  const topLosers = [
    { name: 'IRFC', fullName: 'Indian Railway Finance...', price: 112.40, change: -6.64, logo: 'I' },
    { name: 'JIOFIN', fullName: 'Jio Financial Service...', price: 207.70, change: -6.29, logo: 'J' },
    { name: 'TECHM', fullName: 'Tech Mahindra Ltd', price: 1488.90, change: -6.19, logo: 'T' },
    { name: 'WIPRO', fullName: 'Wipro Ltd', price: 277.65, change: -5.77, logo: 'W' },
    { name: 'LODHA', fullName: 'Macrotech Developers...', price: 1131.95, change: -5.40, logo: 'L' },
  ];

  const fiiDiiData = [
    { date: 'Feb 28, 2025', fiiBuy: 39239.44, fiiSell: 50878.46, fiiNet: -11639.02, diiBuy: 28065.55, diiSell: 15756.92, diiNet: 12308.63 },
    { date: 'Feb 27, 2025', fiiBuy: 19055.23, fiiSell: 19611.79, fiiNet: -556.56, diiBuy: 13530.17, diiSell: 11803.06, diiNet: 1727.11 },
    { date: 'Feb 25, 2025', fiiBuy: 12500.37, fiiSell: 16029.47, fiiNet: -3529.10, diiBuy: 11278.09, diiSell: 8247.31, diiNet: 3030.78 },
    { date: 'Feb 24, 2025', fiiBuy: 7905.53, fiiSell: 14192.23, fiiNet: -6286.70, diiBuy: 12552.14, diiSell: 7366.49, diiNet: 5185.65 },
    { date: 'Feb 21, 2025', fiiBuy: 10144.33, fiiSell: 13593.48, fiiNet: -3449.15, diiBuy: 12889.44, diiSell: 10004.83, diiNet: 2884.61 },
    { date: 'Feb 20, 2025', fiiBuy: 11131.94, fiiSell: 14443.49, fiiNet: -3311.55, diiBuy: 13180.35, diiSell: 9272.71, diiNet: 3907.64 },
    { date: 'Feb 19, 2025', fiiBuy: 11570.57, fiiSell: 13451.87, fiiNet: -1881.30, diiBuy: 11192.98, diiSell: 9235.24, diiNet: 1957.74 },
    { date: 'Feb 18, 2025', fiiBuy: 14537.68, fiiSell: 9751.12, fiiNet: 4786.56, diiBuy: 12792.87, diiSell: 9720.68, diiNet: 3072.19 },
    { date: 'Feb 17, 2025', fiiBuy: 6826.98, fiiSell: 10764.81, fiiNet: -3937.83, diiBuy: 12504.11, diiSell: 7744.34, diiNet: 4759.77 },
    { date: 'Feb 14, 2025', fiiBuy: 9064.18, fiiSell: 13358.87, fiiNet: -4294.69, diiBuy: 12826.66, diiSell: 8462.79, diiNet: 4363.87 },
  ];

  const fiiDiiSummary = {
    fiiNet: -60177.07,
    diiNet: 67085.41,
  };

  // Tabs component
  const Tabs = ({ tabs, activeIndex, onChange }) => (
    <div className="flex space-x-4 mb-4">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-lg transition-colors ${activeIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 dark:bg-gray-800 dark:text-gray-200'}`}
          onClick={() => onChange(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  // CapFilter component
  const CapFilter = ({ options, active, onChange }) => (
    <div className="flex overflow-hidden rounded-lg bg-gray-800 dark:bg-gray-900">
      {options.map((option) => (
        <button
          key={option}
          className={`px-4 py-2 text-sm ${active === option ? 'bg-gray-700 text-white dark:bg-gray-800' : 'bg-gray-800 text-gray-300 dark:bg-gray-900 dark:text-gray-400'}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  // TimeframeSelector component
  const TimeframeSelector = ({ options, active, onChange }) => (
    <div className="flex overflow-hidden rounded-lg bg-gray-800 dark:bg-gray-900">
      {options.map((option) => (
        <button
          key={option}
          className={`px-6 py-2 text-sm ${active === option ? 'bg-gray-700 text-white dark:bg-gray-800' : 'bg-gray-800 text-gray-300 dark:bg-gray-900 dark:text-gray-400'}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  // MonthSelector component
  const MonthSelector = ({ active, onChange }) => (
    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-900 text-white">
      <span>{active}</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  // StockCard component with isGainer prop
  const StockCard = ({ stock, isGainer }) => (
    <div className={`rounded-xl p-5 transition-all duration-200 ${
      theme === 'dark'
        ? 'bg-gray-800 hover:bg-gray-750'
        : 'bg-white border border-gray-200 hover:border-blue-300'
    }`}>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
          isGainer ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>
          {stock.logo}
        </div>
        <div>
          <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stock.name}
          </div>
          <div className="text-sm text-gray-400">{stock.fullName}</div>
        </div>
      </div>
      <div className="flex flex-col items-end mt-2">
        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {stock.price}
        </div>
        <div className={`text-sm ${isGainer ? 'text-green-500' : 'text-red-500'}`}>
          {isGainer ? '▲' : '▼'} {Math.abs(stock.change)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <MarketHeader />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NiftyChart/>
        {/* NIFTY 50 Section */}
        <div className="mb-12">
          <div className="text-gray-400 mb-3">NIFTY 50</div>
          <div className="flex items-baseline space-x-4">
            <h1 className="text-5xl font-bold">{niftyData.value.toLocaleString()}</h1>
            <span className={`text-xl ${niftyData.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ▼ {niftyData.change} ({niftyData.percentage}%)
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
                <span className="text-red-500">▼{niftyData.downside}% downside</span>
                <span className="text-green-500 flex items-center">upside {niftyData.upside}% ▲</span>
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
        <div className="mb-12 space-y-8">
          {/* Top Gainers */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Top Gainers</h2>
              <CapFilter 
                options={['Large Cap', 'Mid Cap', 'Small Cap']} 
                active={capFilter} 
                onChange={setCapFilter} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topGainers.map((stock, index) => (
                <StockCard key={index} stock={stock} isGainer={true} />
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Top Losers</h2>
              <CapFilter 
                options={['Large Cap', 'Mid Cap', 'Small Cap']} 
                active={capFilter} 
                onChange={setCapFilter} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topLosers.map((stock, index) => (
                <StockCard key={index} stock={stock} isGainer={false} />
              ))}
            </div>
          </div>
        </div>

        {/* Overall Market */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Overall Market</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Market Stats Cards */}
                {['NIFTY', 'SENSEX', 'Stock Traded', 'Unchanged', 'Advances', 'Declines'].map((stat) => (
                  <div key={stat} className={`rounded-xl p-5 ${
                    theme === 'dark'
                      ? 'bg-gray-800'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-gray-400 mb-1">{stat}</div>
                    <div className="font-bold text-lg">{niftyData.value.toLocaleString()}</div>
                    <div className="text-red-500 text-sm">▼ {niftyData.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advance Ratio */}
            <div>
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-bold mr-3">Advance Ratio</h3>
                <svg className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Large Cap */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-2">
                    <div className="absolute inset-0 rounded-full bg-gray-800 dark:bg-gray-950"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl text-red-500">{advanceRatio.largeCap}%</span>
                    </div>
                    <svg className="absolute inset-0" width="112" height="112" viewBox="0 0 112 112">
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={`${advanceRatio.largeCap * 3.39} 339`} 
                        strokeDashoffset="84.75" 
                        className="text-red-500"
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">Large Cap</div>
                  <div className="text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                    </svg>
                  </div>
                </div>

                {/* Mid Cap */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-2">
                    <div className="absolute inset-0 rounded-full bg-gray-800 dark:bg-gray-950"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl text-red-500">{advanceRatio.midCap}%</span>
                    </div>
                    <svg className="absolute inset-0" width="112" height="112" viewBox="0 0 112 112">
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={`${advanceRatio.midCap * 3.39} 339`} 
                        strokeDashoffset="84.75" 
                        className="text-red-500"
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">Mid Cap</div>
                  <div className="text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                    </svg>
                  </div>
                </div>

                {/* Small Cap */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-2">
                    <div className="absolute inset-0 rounded-full bg-gray-800 dark:bg-gray-950"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl text-red-500">{advanceRatio.smallCap}%</span>
                    </div>
                    <svg className="absolute inset-0" width="112" height="112" viewBox="0 0 112 112">
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={`${advanceRatio.smallCap * 3.39} 339`} 
                        strokeDashoffset="84.75" 
                        className="text-red-500"
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">Small Cap</div>
                  <div className="text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                    </svg>
                  </div>
                </div>

                {/* Micro Cap */}
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-2">
                    <div className="absolute inset-0 rounded-full bg-gray-800 dark:bg-gray-950"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl text-red-500">{advanceRatio.microCap}%</span>
                    </div>
                    <svg className="absolute inset-0" width="112" height="112" viewBox="0 0 112 112">
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={`${advanceRatio.microCap * 3.39} 339`} 
                        strokeDashoffset="84.75" 
                        className="text-red-500"
                        transform="rotate(-90 56 56)"
                      />
                    </svg>
                  </div>
                  <div className="text-sm">Micro Cap</div>
                  <div className="text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                    </svg>
                  </div>
                </div>
              </div>
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
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-500">FII/DII Activity Chart Here</div>
            </div>
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

        {/* Most Traded & Active Stocks */}
        <div className="grid grid-cols-1 gap-12 mb-12">
          {/* Most Traded Stocks */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Most Traded Stocks (Volume)</h2>
              <CapFilter 
                options={['Large Cap', 'Mid Cap', 'Small Cap']} 
                active={capFilter} 
                onChange={setCapFilter} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`rounded-xl p-5 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-blue-100 text-blue-700">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <div className="font-bold text-white">STOCK{i}</div>
                      <div className="text-sm text-gray-400">Company {i} Ltd</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-white">{(1000 + i * 100).toFixed(2)}</div>
                    <div className="text-sm text-blue-500">
                      {(10 + i).toFixed(1)}M Vol
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Active Stocks */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Most Active Stocks (Value)</h2>
              <CapFilter 
                options={['Large Cap', 'Mid Cap', 'Small Cap']} 
                active={capFilter} 
                onChange={setCapFilter} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`rounded-xl p-5 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-700">
                      {String.fromCharCode(70 + i)}
                    </div>
                    <div>
                      <div className="font-bold text-white">ACTIVE{i}</div>
                      <div className="text-sm text-gray-400">Active Co. {i} Ltd</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-white">{(2000 + i * 200).toFixed(2)}</div>
                    <div className="text-sm text-purple-500">
                      ₹{(500 + i * 100).toFixed(1)}Cr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Performance */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Sector Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'IT', change: -3.2 },
              { name: 'Banking', change: -1.5 },
              { name: 'Auto', change: -2.7 },
              { name: 'Pharma', change: 0.8 },
              { name: 'FMCG', change: -0.5 },
              { name: 'Energy', change: -2.1 }
            ].map((sector, index) => (
              <div key={index} className={`rounded-xl p-5 transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-750'
                  : 'bg-white border border-gray-200 hover:border-blue-300'
              }`}>
                <div className="font-medium">{sector.name}</div>
                <div className={`${sector.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {sector.change >= 0 ? '▲' : '▼'} {Math.abs(sector.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market News */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Market News</h2>
          <div className="space-y-6">
            {[
              { title: 'RBI keeps repo rate unchanged at 6.5%', time: '2 hours ago', source: 'Economic Times' },
              { title: 'Sensex falls 420 points amid global market selloff', time: '3 hours ago', source: 'Mint' },
              { title: 'IT stocks under pressure as rupee strengthens', time: '5 hours ago', source: 'Business Standard' },
              { title: 'FIIs remain net sellers for the 10th consecutive session', time: '6 hours ago', source: 'Financial Express' }
            ].map((news, index) => (
              <div key={index} className={`rounded-xl p-5 transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-750'
                  : 'bg-white border border-gray-200 hover:border-blue-300'
              }`}>
                <div className="font-bold mb-2">{news.title}</div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{news.time}</span>
                  <span>{news.source}</span>
                </div>
              </div>
            ))}
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