import { useContext } from 'react';
import { ThemeContext } from '../themeContext';

const Footer = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`mt-10 ${
      theme === 'dark'
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-900'
    } px-6 py-8`}>
      <div className="flex mb-8">
        <div className="w-1/4">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z" stroke="#6366F1" strokeWidth="2" />
              <path d="M15 12L21 18L15 24" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="font-bold text-lg flex items-center">
                multibagg.ai
                <span className={`ml-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } text-xs px-2 py-0.5 rounded`}>Beta</span>
              </div>
            </div>
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          } mb-4`}>
            Multibagg is an AI powered stock research and analysis platform. We provide data, information, content, and analytics for publicly traded Indian companies listed on NSE and BSE.
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>Prices might be delayed by a few minutes.</p>
        </div>
        
        <div className="w-3/4 flex justify-between pl-20">
          {['Products', 'Utility', 'Company'].map((section) => (
            <div key={section}>
              <h3 className="font-bold mb-4">{section}</h3>
              <ul className={`space-y-3 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {section === 'Products' && (
                  <>
                    <li>Discovery</li>
                    <li>Timeline</li>
                    <li>Screener</li>
                    <li>Ask AI</li>
                  </>
                )}
                {section === 'Utility' && (
                  <>
                    <li>Market</li>
                    <li>Pricing</li>
                    <li>Calculators</li>
                  </>
                )}
                {section === 'Company' && (
                  <>
                    <li>About Us</li>
                    <li>Contact Us</li>
                    <li>Terms and Conditions</li>
                    <li>Privacy Policy</li>
                    <li>Careers</li>
                  </>
                )}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="font-bold mb-4">Join our Exclusive Community</h3>
            <button className="bg-green-500 text-white rounded-md py-2 px-4 flex items-center hover:bg-green-600 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347" />
              </svg>
              Join WhatsApp
            </button>
            <button className="mt-3 bg-blue-500 text-white rounded-md py-2 px-4 flex items-center hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525L2.1358 21.8642L7.54751 20.9565C8.88837 21.6244 10.4003 22 12 22Z" />
              </svg>
              Join Telegram
            </button>
          </div>
        </div>
      </div>
      
      <div className={`pt-6 mt-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } border-t flex justify-between items-center`}>
        <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}>
          © 2023 Multibagg. All rights reserved.
        </div>
        <div className="flex space-x-4">
          {['twitter', 'github', 'dribbble'].map((social) => (
            <a key={social} href="#" className={`${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-900'
            } transition-colors`}>
              {social === 'twitter' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              )}
              {social === 'github' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              {social === 'dribbble' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;