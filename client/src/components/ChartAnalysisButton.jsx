import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import axios from 'axios';

const ChartAnalysisButton = ({ chartRef, chartName, theme }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeChart = async () => {
    setIsAnalyzing(true);
    try {
      const chartElement = chartRef.current;
      const canvas = await html2canvas(chartElement);
      const imageBase64 = canvas.toDataURL('image/png');

      const response = await axios.post('http://127.0.0.1:5001/api/analyze-graph', {
        image: imageBase64,
        chartName
      });

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing chart:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <button
        onClick={analyzeChart}
        disabled={isAnalyzing}
        className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors ${
          theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        <Activity size={16} className={isAnalyzing ? 'animate-spin' : ''} />
        <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Chart'}</span>
      </button>

      {analysis && (
        <div className={`absolute right-4 top-16 w-64 rounded-lg p-4 shadow-lg z-10 ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">Chart Analysis</h3>
            <button
              onClick={() => setAnalysis(null)}
              className={theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}
            >
              ×
            </button>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {analysis}
          </p>
        </div>
      )}
    </>
  );
};

export default ChartAnalysisButton;
