import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeContext } from '../themeContext';

const FiiDiiChart = ({ data }) => {
  const { theme } = useContext(ThemeContext);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 rounded shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {`Date: ${payload[0].payload.date}`}
          </p>
          <p className="text-green-500">{`FII Net: ${payload[0].payload.fiiNet.toLocaleString()}`}</p>
          <p className="text-blue-500">{`DII Net: ${payload[0].payload.diiNet.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
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
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="fiiNet"
            stroke="#ef4444" // Red for FII
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="diiNet"
            stroke="#3b82f6" // Blue for DII
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FiiDiiChart;