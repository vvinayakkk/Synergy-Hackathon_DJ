import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeContext, ThemeContextProvider } from './themeContext.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeContextProvider>
    <BrowserRouter>
        <StrictMode>
          <App />
        </StrictMode>
    </BrowserRouter>
  </ThemeContextProvider>
)
