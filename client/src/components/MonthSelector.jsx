import { useContext } from 'react';
import { ThemeContext } from '../themeContext';
const MonthSelector = ({ active, onChange }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return
    (<div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
      theme === 'dark' 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-gray-100 hover:bg-gray-200'
    } cursor-pointer`}>
      <span>{active}</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>)
};
  export default MonthSelector;