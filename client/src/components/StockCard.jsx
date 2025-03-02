import { useContext } from 'react';
import { ThemeContext } from '../themeContext';

const StockCard = ({ stock, isGainer }) => {
  const { theme } = useContext(ThemeContext);
  
  const changePercentage = parseFloat(stock.change_percentage || 0).toFixed(2);

  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    } hover:border-blue-500 transition-colors duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
            isGainer 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          } font-bold text-xl`}>
            {stock.ticker?.[0] || 'S'}
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{stock.name || stock.ticker}</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{stock.sector}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Vol: {stock.volume}
        </div>
        <div className={`flex items-center ${
          isGainer ? 'text-green-500' : 'text-red-500'
        } text-lg font-semibold`}>
          {isGainer ? '▲' : '▼'} {Math.abs(changePercentage)}%
        </div>
      </div>
    </div>
  );
};

export default StockCard;