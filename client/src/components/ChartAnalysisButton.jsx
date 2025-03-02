import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChartAnalysisButton = ({ data, chartName, theme }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeChart = async () => {
    setIsAnalyzing(true);
    try {
      // Initialize Gemini AI
      const GEMINI_API_KEY ='AIzaSyDVR0oKgE3VTibkZNm6cSsmKoDudlqbRwE';
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Format data for analysis
      const chartData = data.map(point => 
        `Time: ${point.time}, Value: ${point.value}${point.change ? `, Change: ${point.change}%` : ''}`
      ).join('\n');

      const prompt = `
        Analyze this ${chartName} chart data and provide a concise technical analysis summary.
        Focus on:
        1. Overall trend direction
        2. Key support and resistance levels
        3. Notable patterns or anomalies
        4. Trading volume insights (if available)
        5. Key takeaways

        Data Points:
        ${chartData}

        Provide a brief, clear analysis in 3-4 sentences.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      setAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing chart:', error);
      setAnalysis('Failed to analyze chart. Please try again.');
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
