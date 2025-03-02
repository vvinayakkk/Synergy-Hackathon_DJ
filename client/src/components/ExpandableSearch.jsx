import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExpandableSearch = ({ theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Sample company data
  const companies = [
    { 
      id: 'AAPL', 
      name: 'Apple Inc', 
      shortName: 'APPLE', 
      logo: 'https://via.placeholder.com/32' 
    },
    { 
      id: 'MSFT', 
      name: 'Microsoft Corporation', 
      shortName: 'MICROSOFT', 
      logo: 'https://via.placeholder.com/32' 
    },
    { 
      id: 'GOOGL', 
      name: 'Alphabet Inc', 
      shortName: 'GOOGLE', 
      logo: 'https://via.placeholder.com/32' 
    },
    { 
      id: 'TATAMOTORS', 
      name: 'Tata Motors Ltd', 
      shortName: 'TATAMOTORS', 
      logo: 'https://via.placeholder.com/32' 
    },
    { 
      id: 'HDFC', 
      name: 'HDFC Bank Ltd', 
      shortName: 'HDFCBANK', 
      logo: 'https://via.placeholder.com/32' 
    },
  ];

  // Filter companies based on search query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    company.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions
  
  // Handle click outside to close expanded search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle navigating to company detail page
  const handleCompanyClick = (companyId) => {
    navigate(`/stockhome/${companyId.toLowerCase()}`);
    setIsExpanded(false);
    setSearchQuery('');
  };

  // Add this function to generate avatar colors
  const getAvatarStyles = (companyName) => {
    const colorSchemes = [
      { bg: 'bg-blue-100', text: 'text-blue-700' },
      { bg: 'bg-purple-100', text: 'text-purple-700' },
      { bg: 'bg-green-100', text: 'text-green-700' },
      { bg: 'bg-red-100', text: 'text-red-700' },
      { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      { bg: 'bg-pink-100', text: 'text-pink-700' },
      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    ];
    const index = companyName.charCodeAt(0) % colorSchemes.length;
    return colorSchemes[index];
  };
  
  return (
    <div ref={searchRef} className="relative flex items-center">
      <div className={`relative ${isExpanded ? 'w-96' : 'w-64'} transition-all duration-300`}>
        <input
          type="text"
          placeholder="Search a company or sector"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className={`w-full ${
            theme === 'dark'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-900'
          } text-sm rounded-full px-10 py-2 focus:outline-none transition-all duration-300`}
        />
        <Search className={`absolute left-3 top-2.5 h-4 w-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <span className="absolute right-3 top-2 text-xs text-gray-400">Ctrl⌘</span>
      </div>
      
      {/* Dropdown suggestions */}
      {isExpanded && filteredCompanies.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg overflow-hidden shadow-lg z-50 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {filteredCompanies.map((company) => (
            <div 
              key={company.id}
              onClick={() => handleCompanyClick(company.id)}
              className={`flex items-center p-3 cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 border-b border-gray-700' 
                  : 'hover:bg-gray-100 border-b border-gray-200'
              }`}
            >
              {/* Letter Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                getAvatarStyles(company.name).bg
              } ${getAvatarStyles(company.name).text}`}>
                {company.name[0]}
              </div>
              
              <div className="flex flex-col ml-3">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {company.shortName}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {company.name}
                </span>
              </div>
              <div className="ml-auto">
                <span className={`px-2 py-1 text-xs rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpandableSearch;