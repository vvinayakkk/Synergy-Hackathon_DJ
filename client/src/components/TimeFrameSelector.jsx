import { useContext } from 'react';
import { ThemeContext } from '../themeContext';
const TimeframeSelector = ({ options, active, onChange }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return
    (<div className="flex overflow-hidden rounded-lg">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 text-sm ${
            active === option 
              ? theme === 'dark'
                ? 'bg-gray-700 text-white'
                : 'bg-blue-100 text-blue-800'
              : theme === 'dark'
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {option}
        </button>
      ))}
    </div>)
};

  export default TimeframeSelector;