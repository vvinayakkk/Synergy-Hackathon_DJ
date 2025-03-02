import React, { useRef, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { ThemeContext } from '../themeContext';
import ChartAnalysisButton from './ChartAnalysisButton';

const FiiDiiChart = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  const chartRef = useRef(null);

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
    <div className="w-full h-[400px] relative" ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="fiiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="diiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
            opacity={0.5}
          />
          <XAxis 
            dataKey="date" 
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            tickLine={false}
          />
          <YAxis 
            stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="fiiNet"
            stroke="#ef4444"
            fill="url(#fiiGradient)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="diiNet"
            stroke="#3b82f6"
            fill="url(#diiGradient)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="fiiNet"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="diiNet"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <ChartAnalysisButton 
        chartRef={chartRef}
        chartName="FII-DII"
        theme={theme}
      />
    </div>
  );
};

export default FiiDiiChart;