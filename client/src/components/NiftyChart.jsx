import React, { useContext, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../themeContext';

const NiftyChart = () => {
  const { theme } = useContext(ThemeContext);

  const [data] = useState([
    { date: 'Mar \'24', value: 22000 },
    { date: '', value: 21500 },
    { date: '', value: 22100 },
    { date: '', value: 21800 },
    { date: '', value: 21900 },
    { date: 'Apr \'24', value: 22500 },
    { date: '', value: 22200 },
    { date: '', value: 22800 },
    { date: '', value: 22300 },
    { date: 'May \'24', value: 22800 },
    { date: '', value: 23200 },
    { date: '', value: 23500 },
    { date: '', value: 23800 },
    { date: 'Jun \'24', value: 23500 },
    { date: '', value: 23900 },
    { date: '', value: 24200 },
    { date: '', value: 24500 },
    { date: 'Jul \'24', value: 24800 },
    { date: '', value: 24600 },
    { date: '', value: 25000 },
    { date: '', value: 25400 },
    { date: 'Aug \'24', value: 25300 },
    { date: '', value: 25600 },
    { date: '', value: 25900 },
    { date: '', value: 26000 },
    { date: 'Sep \'24', value: 25800 },
    { date: '', value: 25600 },
    { date: '', value: 25400 },
    { date: '', value: 25200 },
    { date: 'Oct \'24', value: 24800 },
    { date: '', value: 24400 },
    { date: '', value: 24100 },
    { date: '', value: 24300 },
    { date: 'Nov \'24', value: 24500 },
    { date: '', value: 24000 },
    { date: '', value: 23700 },
    { date: '', value: 23400 },
    { date: 'Dec \'24', value: 23200 },
    { date: '', value: 23000 },
    { date: '', value: 22800 },
    { date: '', value: 22500 },
    { date: 'Jan \'25', value: 22300 },
    { date: '', value: 22000 },
    { date: '', value: 22200 },
    { date: '', value: 22124.70 },
  ]);

  const [timeframes] = useState([
    { label: '1M', active: false },
    { label: '3M', active: false },
    { label: '1Y', active: true },
    { label: '3Y', active: false },
    { label: '5Y', active: false },
    { label: '10Y', active: false },
  ]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded shadow-lg border border-gray-700 text-white">
          <p>{`NIFTY 50: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  // Get min and max values for Y-axis domain with some padding
  const minValue = Math.min(...data.map(item => item.value)) * 0.95;
  const maxValue = Math.max(...data.map(item => item.value)) * 1.05;

  return (
    <div className={`p-6 rounded-xl ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } border`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>NIFTY 50</h2>
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                period === '1D'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
            />
            <XAxis 
              dataKey="date" 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            />
            <YAxis 
              domain={[minValue, maxValue]} 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                color: theme === 'dark' ? '#ffffff' : '#111827'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={theme === 'dark' ? '#60a5fa' : '#2563eb'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NiftyChart;