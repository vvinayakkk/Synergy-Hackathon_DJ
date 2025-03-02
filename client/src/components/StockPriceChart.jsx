import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockPriceChart = ({ data, theme, isPriceDown }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
        />
        <XAxis 
          dataKey="month" 
          stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
        />
        <YAxis 
          stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          domain={['dataMin - 100', 'dataMax + 100']}
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
          stroke={isPriceDown ? '#ef4444' : '#22c55e'}
          strokeWidth={2}
          dot={{ 
            r: 4, 
            strokeWidth: 2,
            stroke: isPriceDown ? '#ef4444' : '#22c55e',
            fill: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
          activeDot={{ 
            r: 8,
            stroke: isPriceDown ? '#ef4444' : '#22c55e',
            strokeWidth: 2,
            fill: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockPriceChart;
