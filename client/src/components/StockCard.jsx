import { useContext } from 'react';
import { ThemeContext } from '../themeContext';

const StockCard = ({ stock, isGainer }) => {
  const { theme } = useContext(ThemeContext);
  
  const changePercentage = parseFloat(stock.change_percentage || 0).toFixed(2);

  // Create avatar background color based on stock name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-pink-100 text-pink-700'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    } hover:border-blue-500 transition-colors duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
            getAvatarColor(stock.name)
          }`}>
            {stock.name[0]}
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-lg mb-1">{stock.name}</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>NSE</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Vol: {stock.volume || 'N/A'}
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