import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import DiscoveryPage from './pages/Discovery'
import TimelinePage from './pages/TimelinePage'
import MarketDashboard from './pages/Market'
import CompanyDetail from './pages/CompanyDetails'
import StockScreener from './pages/StockScreener'
import ScreenerResults from './pages/ScreenerResults'
import AIChatInterface from './pages/AIChat'
import Analysis from './pages/Analysis'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/discovery' element={<DiscoveryPage/>} />
      <Route path='/timeline' element={<TimelinePage/>} />
      <Route path='/market' element={<MarketDashboard/>} />
      <Route path='/stockhome/:companyId' element={<CompanyDetail />} />
      <Route path="/screener" element={<StockScreener />} />
      <Route path="/screener/new-screen" element={<ScreenerResults />} />
      <Route path='/aichat' element={<AIChatInterface/>}/>
      <Route path='/analysis' element={<Analysis/>}/>
    </Routes>
    
  )
}

export default App
