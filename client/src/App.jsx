import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import DiscoveryPage from './pages/Discovery'
import TimelinePage from './pages/TimelinePage'
import MarketDashboard from './pages/Market'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/discovery' element={<DiscoveryPage/>} />
      <Route path='/timeline' element={<TimelinePage/>} />
      <Route path='/market' element={<MarketDashboard/>} />
    </Routes>
    
  )
}

export default App
