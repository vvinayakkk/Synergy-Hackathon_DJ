import React, { useRef, useState, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { ThemeContext } from '../themeContext';
import ChartAnalysisButton from './ChartAnalysisButton';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { Activity } from 'lucide-react';

const NiftyChart = () => {
  const { theme } = useContext(ThemeContext);
  const chartRef = useRef(null);
  const [activeTimeframe, setActiveTimeframe] = useState('6M');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Data for different timeframes based on the images provided
  const data = {
    '1D': [
      { time: '9:15 am', value: 22450 },
      { time: '10:00 am', value: 22320 },
      { time: '10:30 am', value: 22270 },
      { time: '11:00 am', value: 22300 },
      { time: '11:30 am', value: 22260 },
      { time: '12:00 pm', value: 22240 },
      { time: '12:30 pm', value: 22220 },
      { time: '1:00 pm', value: 22120 },
      { time: '1:30 pm', value: 22130 },
      { time: '2:00 pm', value: 22150 },
      { time: '2:30 pm', value: 22140 },
      { time: '3:00 pm', value: 22120 },
      { time: '3:30 pm', value: 22126 }
    ],
    '5D': [
      { time: '24 Feb', value: 22600 },
      { time: '25 Feb', value: 22580 },
      { time: '26 Feb', value: 22550 },
      { time: '27 Feb', value: 22540 },
      { time: '27 Feb 10:00', value: 22537.60 },
      { time: '27 Feb 15:00', value: 22520 },
      { time: '28 Feb', value: 22120 },
      { time: '29 Feb', value: 22140 }
    ],
    '1M': [
      { time: '4 Feb', value: 23739.25 },
      { time: '6 Feb', value: 23550 },
      { time: '11 Feb', value: 23050 },
      { time: '14 Feb', value: 22950 },
      { time: '19 Feb', value: 22900 },
      { time: '24 Feb', value: 22500 },
      { time: '28 Feb', value: 22120 }
    ],
    '6M': [
      { time: 'Oct 2024', value: 26000 },
      { time: 'Nov 2024', value: 24000 },
      { time: 'Dec 2024', value: 24500 },
      { time: 'Jan 2025', value: 23500 },
      { time: 'Feb 2025', value: 22120 }
    ],
    'YTD': [
      { time: '1 Jan', value: 24200 },
      { time: '8 Jan', value: 23700 },
      { time: '16 Jan', value: 23200 },
      { time: '24 Jan', value: 22800 },
      { time: '3 Feb', value: 23600 },
      { time: '11 Feb', value: 23000 },
      { time: '19 Feb', value: 22800 },
      { time: '28 Feb', value: 22120 }
    ]
  };

  const addMicroFluctuations = (baseData) => {
    return baseData.map((point, index) => {
      if (index === baseData.length - 1) return point;
      
      const nextPoint = baseData[index + 1];
      const timeDiff = 0.2; // 20% of the way to next point
      const valueDiff = nextPoint.value - point.value;
      
      // Create micro-points between main points
      const microPoint = {
        time: `${point.time}-mid`,
        value: point.value + (valueDiff * timeDiff) + (Math.random() * 20 - 10)
      };
      
      return [point, microPoint];
    }).flat();
  };

  // Custom tooltip to match the one in the images
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-2 rounded shadow-lg text-sm">
          <p className="font-medium">{payload[0].value.toFixed(2)}</p>
          <p className="text-gray-300">{label}</p>
        </div>
      );
    }
    return null;
  };

  // Get previous close value for display (using first data point as current)
  const currentValue = data[activeTimeframe][data[activeTimeframe].length - 1].value;
  const previousClose = 22545.05; // Using the value from Image 1
  
  // Calculate min and max for YAxis domain
  const values = data[activeTimeframe].map(item => item.value);
  const min = Math.min(...values) - 100;
  const max = Math.max(...values) + 100;

  const analyzeChart = async () => {
    setIsAnalyzing(true);
    try {
      // Capture chart as image
      const chartElement = chartRef.current;
      const canvas = await html2canvas(chartElement);
      const imageBase64 = canvas.toDataURL('image/png');

      // Send to backend
      const response = await axios.post('http://127.0.0.1:5001/api/analyze-graph', {
        image: imageBase64,
        timeframe: activeTimeframe
      });

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing chart:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProcessedData = () => {
    const chartData = addMicroFluctuations(data[activeTimeframe]);
    return chartData.map(point => ({
      time: point.time,
      value: point.value,
      trend: point.value > data[activeTimeframe][0].value ? 'up' : 'down',
      change_percent: ((point.value - data[activeTimeframe][0].value) / data[activeTimeframe][0].value * 100).toFixed(2)
    }));
  };

  return (
    <div className={`relative p-4 rounded-lg ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Timeframe selector */}
      <div className={`flex mb-6 space-x-4 border-b pb-2 ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        {['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'].map((timeframe) => (
          <button
            key={timeframe}
            className={`px-2 py-1 text-sm ${
              activeTimeframe === timeframe 
                ? theme === 'dark'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-blue-600 border-b-2 border-blue-600'
                : theme === 'dark'
                  ? 'text-gray-400'
                  : 'text-gray-600'
            }`}
            onClick={() => setActiveTimeframe(timeframe)}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* Current value and previous close */}
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-xl font-semibold mr-2">{currentValue.toFixed(2)}</span>
          <span className="text-sm text-gray-400">15:30</span>
        </div>
        <div className="text-sm text-gray-400">
          Previous close
          <span className="ml-2">{previousClose.toFixed(2)}</span>
        </div>
      </div>

      {/* Chart with ref */}
      <div className="h-64" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={addMicroFluctuations(data[activeTimeframe])} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === 'dark' ? '#3B82F6' : '#60A5FA'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme === 'dark' ? '#3B82F6' : '#60A5FA'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[min, max]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="linear"
              dataKey="value"
              stroke="#F87171"
              strokeWidth={2}
              fill="url(#colorGradient)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            <Line 
              type="linear"
              dataKey="value" 
              stroke="#F87171" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#F87171' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ChartAnalysisButton 
        data={getProcessedData()}
        chartName={`NIFTY ${activeTimeframe}`}
        theme={theme}
      />

      {/* Analysis Popup */}
      {analysis && (
        <div className="absolute right-4 top-16 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Chart Analysis</h3>
            <button
              onClick={() => setAnalysis(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-300">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default NiftyChart;