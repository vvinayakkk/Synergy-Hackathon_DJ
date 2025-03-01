import React, { useEffect, useRef, useState, useContext } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Camera, TrendingUp, TrendingDown, DollarSign, Send, AlertTriangle, Activity, PieChart, Globe, Search } from 'lucide-react';
import MarketHeader from '../components/header';
import { ThemeContext } from '../themeContext';
import Footer from '../components/footer';
import MarketSentimentSurvey from '../components/marketSurvey';
import MarketDashboard from '../components/market';
import MarketMovers from '../components/marketMovers';
import RecentAISessionsComponent from '../components/Askai';
import axios from 'axios';

const newsData = [
  {
    title: "FED Announces Interest Rate Decision",
    impact: "high",
    sentiment: "neutral",
    summary: "The Federal Reserve announced they will maintain current interest rates after reviewing economic indicators."
  },
  {
    title: "Tech Sector Surges on AI Advancements",
    impact: "medium",
    sentiment: "positive",
    summary: "Technology stocks are experiencing a rally following breakthroughs in artificial intelligence applications."
  },
  {
    title: "Major Merger Announced in Financial Sector",
    impact: "high",
    sentiment: "positive",
    summary: "Two of the largest banks announced a merger that will reshape the banking landscape."
  },
  {
    title: "Supply Chain Issues Impact Manufacturing",
    impact: "medium",
    sentiment: "negative",
    summary: "Ongoing supply chain disruptions continue to affect manufacturing output across multiple sectors."
  },
];

const alertsData = [
  { stock: "TSLA", alert: "Unusual trading volume detected", level: "high" },
  { stock: "AAPL", alert: "Positive sentiment spike on social media", level: "medium" },
  { stock: "AMZN", alert: "Approaching support level", level: "medium" },
  { stock: "NVDA", alert: "Breaking resistance level", level: "high" },
];

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const globeContainerRef = useRef(null);
  const analyticsSphereRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [animatedNumbers, setAnimatedNumbers] = useState({
    marketCap: 0,
    sentiment: 0,
    prediction: 0,
    signals: 0
  });
  const [stockData, setStockData] = useState([]);
  const [timeRange, setTimeRange] = useState('ALL'); // Add this new state

  useEffect(() => {
    const fetchStockData = async () => {
      const API_KEY = 'O65HMHBW44OCOG75'; // Replace with your API key
      const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
      const promises = SYMBOLS.map(symbol =>
        axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`)
      );

      try {
        const responses = await Promise.all(promises);
        const data = responses.map((res, index) => {
          const symbol = SYMBOLS[index];
          const timeSeries = res.data['Time Series (Daily)'];
          return Object.keys(timeSeries).map(date => ({
            date,
            [symbol]: parseFloat(timeSeries[date]['4. close'])
          }));
        });

        // Combine data by date
        const combinedData = {};
        data.forEach(stock => {
          stock.forEach(day => {
            if (!combinedData[day.date]) {
              combinedData[day.date] = { date: day.date };
            }
            combinedData[day.date] = { ...combinedData[day.date], ...day };
          });
        });

        const sortedData = Object.values(combinedData)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setStockData(sortedData.slice(-30)); // Last 30 days
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize ThreeJS Globe
    if (globeContainerRef.current) {
      const width = globeContainerRef.current.clientWidth;
      const height = globeContainerRef.current.clientHeight;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 200;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      
      // Clear previous renders
      if (globeContainerRef.current.firstChild) {
        globeContainerRef.current.removeChild(globeContainerRef.current.firstChild);
      }
      
      globeContainerRef.current.appendChild(renderer.domElement);

      // Create globe
      const globeGeometry = new THREE.SphereGeometry(80, 64, 64);
      const globeMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a4da3,
        emissive: 0x072056,
        specular: 0x2d9eff,
        shininess: 30,
        opacity: 0.9,
        transparent: true,
        wireframe: true
      });
      
      const globe = new THREE.Mesh(globeGeometry, globeMaterial);
      scene.add(globe);

      // Add points representing major financial hubs
      const addFinancialHub = (lat, lng, size, color) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(85 * Math.sin(phi) * Math.cos(theta));
        const z = (85 * Math.sin(phi) * Math.sin(theta));
        const y = (85 * Math.cos(phi));

        const hubGeometry = new THREE.SphereGeometry(size, 16, 16);
        const hubMaterial = new THREE.MeshBasicMaterial({ color });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.position.set(x, y, z);
        scene.add(hub);

        // Add pulse effect
        const pulseGeometry = new THREE.SphereGeometry(size, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.3
        });
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.set(x, y, z);
        scene.add(pulse);

        gsap.to(pulse.scale, {
          x: 3,
          y: 3,
          z: 3,
          duration: 2,
          repeat: -1,
          yoyo: false,
          ease: "power1.inOut",
          onComplete: () => {
            pulse.scale.set(1, 1, 1);
          }
        });
        
        gsap.to(pulseMaterial, {
          opacity: 0,
          duration: 2,
          repeat: -1,
          yoyo: false,
          ease: "power1.inOut",
          onComplete: () => {
            pulseMaterial.opacity = 0.3;
          }
        });
      };

      // Add major financial centers
      addFinancialHub(40.7128, -74.0060, 2, 0x4deeea); // New York
      addFinancialHub(51.5074, -0.1278, 2, 0x74ee15); // London
      addFinancialHub(35.6762, 139.6503, 2, 0xf000ff); // Tokyo
      addFinancialHub(22.3193, 114.1694, 2, 0xff8e01); // Hong Kong
      addFinancialHub(19.0760, 72.8777, 2, 0x01b4ff); // Mumbai
      addFinancialHub(-33.8688, 151.2093, 2, 0xfff610); // Sydney

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 3);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Add data stream effects (lines connecting financial hubs)
      const addDataStream = (startLat, startLng, endLat, endLng, color) => {
        // Convert to Cartesian coordinates
        const startPhi = (90 - startLat) * (Math.PI / 180);
        const startTheta = (startLng + 180) * (Math.PI / 180);
        const startX = -(85 * Math.sin(startPhi) * Math.cos(startTheta));
        const startZ = (85 * Math.sin(startPhi) * Math.sin(startTheta));
        const startY = (85 * Math.cos(startPhi));

        const endPhi = (90 - endLat) * (Math.PI / 180);
        const endTheta = (endLng + 180) * (Math.PI / 180);
        const endX = -(85 * Math.sin(endPhi) * Math.cos(endTheta));
        const endZ = (85 * Math.sin(endPhi) * Math.sin(endTheta));
        const endY = (85 * Math.cos(endPhi));

        // Create a curve between points
        const curvePoints = [];
        for (let i = 0; i <= 20; i++) {
          const p = i / 20;
          const midX = startX + (endX - startX) * p;
          const midY = startY + (endY - startY) * p;
          const midZ = startZ + (endZ - startZ) * p;
          
          // Add arc effect
          const elevation = 20 * Math.sin(Math.PI * p);
          
          // Normalize the direction vector
          const length = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
          const normalizedX = midX / length;
          const normalizedY = midY / length;
          const normalizedZ = midZ / length;
          
          curvePoints.push(
            new THREE.Vector3(
              midX + normalizedX * elevation,
              midY + normalizedY * elevation,
              midZ + normalizedZ * elevation
            )
          );
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.6
        });
        
        const tube = new THREE.Mesh(geometry, material);
        scene.add(tube);
        
        // Animate data packet along the tube
        const packetGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const packetMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        });
        
        const packet = new THREE.Mesh(packetGeometry, packetMaterial);
        scene.add(packet);
        
        gsap.to({}, {
          duration: 3 + Math.random() * 2,
          repeat: -1,
          onUpdate: function() {
            const position = curve.getPoint(this.progress());
            packet.position.set(position.x, position.y, position.z);
          }
        });
      };
      

      // Add data streams between financial hubs
      addDataStream(40.7128, -74.0060, 51.5074, -0.1278, 0x4deeea); // NY to London
      addDataStream(51.5074, -0.1278, 35.6762, 139.6503, 0x74ee15); // London to Tokyo
      addDataStream(35.6762, 139.6503, 22.3193, 114.1694, 0xf000ff); // Tokyo to HK
      addDataStream(22.3193, 114.1694, 19.0760, 72.8777, 0xff8e01); // HK to Mumbai
      addDataStream(19.0760, 72.8777, -33.8688, 151.2093, 0x01b4ff); // Mumbai to Sydney
      addDataStream(-33.8688, 151.2093, 40.7128, -74.0060, 0xfff610); // Sydney to NY

      // Setup controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.enableZoom = false;

      // Auto rotation
      const autoRotate = () => {
        globe.rotation.y += 0.001;
        requestAnimationFrame(autoRotate);
      };
      autoRotate();

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (!globeContainerRef.current) return;
        const width = globeContainerRef.current.clientWidth;
        const height = globeContainerRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Initialize Analytics Sphere
    if (analyticsSphereRef.current) {
      const width = analyticsSphereRef.current.clientWidth;
      const height = analyticsSphereRef.current.clientHeight;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 200;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      
      // Clear previous renders
      if (analyticsSphereRef.current.firstChild) {
        analyticsSphereRef.current.removeChild(analyticsSphereRef.current.firstChild);
      }
      
      analyticsSphereRef.current.appendChild(renderer.domElement);

      // Create particles sphere
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 5000;
      
      const posArray = new Float32Array(particlesCount * 3);
      const colorsArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position (sphere)
        const radius = 50 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = radius * Math.cos(phi);
        
        // Colors (based on position)
        colorsArray[i] = 0.2 + 0.8 * Math.abs(posArray[i]) / 80;
        colorsArray[i + 1] = 0.3 + 0.7 * Math.abs(posArray[i + 1]) / 80;
        colorsArray[i + 2] = 0.5 + 0.5 * Math.abs(posArray[i + 2]) / 80;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particleSystem);
      
      // Add center sphere
      const coreGeometry = new THREE.SphereGeometry(15, 32, 32);
      const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x0055ff,
        emissive: 0x003399,
        specular: 0x111111,
        shininess: 30,
        transparent: true,
        opacity: 0.9
      });
      
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(core);
      
      // Add orbital rings
      const addRing = (radius, color, thickness = 0.5) => {
        const ringGeometry = new THREE.TorusGeometry(radius, thickness, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Tilt the ring
        ring.rotation.x = Math.PI / 2 + Math.random() * 0.5;
        ring.rotation.y = Math.random() * Math.PI;
        
        scene.add(ring);
        return ring;
      };
      
      const ring1 = addRing(25, 0x4deeea);
      const ring2 = addRing(35, 0x74ee15);
      const ring3 = addRing(45, 0xf000ff);
      const ring4 = addRing(55, 0xff8e01);
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0x0055ff, 2, 300);
      pointLight.position.set(0, 0, 0);
      scene.add(pointLight);
      
      // Animation
      const animate = () => {
        requestAnimationFrame(animate);
        
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.001;
        
        ring1.rotation.z += 0.003;
        ring2.rotation.z -= 0.002;
        ring3.rotation.z += 0.001;
        ring4.rotation.z -= 0.0015;
        
        // Pulsate core
        const time = Date.now() * 0.001;
        core.scale.x = 1 + Math.sin(time) * 0.1;
        core.scale.y = 1 + Math.sin(time) * 0.1;
        core.scale.z = 1 + Math.sin(time) * 0.1;
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle resize
      const handleResize = () => {
        if (!analyticsSphereRef.current) return;
        const width = analyticsSphereRef.current.clientWidth;
        const height = analyticsSphereRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Animate counters
  useEffect(() => {
    gsap.to(animatedNumbers, {
      marketCap: 98.7,
      sentiment: 76.3,
      prediction: 89.2,
      signals: 42,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedNumbers({
          marketCap: parseFloat(animatedNumbers.marketCap.toFixed(1)),
          sentiment: parseFloat(animatedNumbers.sentiment.toFixed(1)),
          prediction: parseFloat(animatedNumbers.prediction.toFixed(1)),
          signals: Math.round(animatedNumbers.signals)
        });
      }
    });
  }, []);

  // Add these new functions after your existing useEffect hooks
  const filterStockData = (range) => {
    const now = new Date();
    switch (range) {
      case '1D':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setDate(now.getDate() - 1)));
      case '1W':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setDate(now.getDate() - 7)));
      case '1M':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 1)));
      case '1Y':
        return stockData.filter(entry => 
          new Date(entry.date) >= new Date(now.setFullYear(now.getFullYear() - 1)));
      case 'ALL':
      default:
        return stockData;
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Handle impact level color
  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  // Handle sentiment color
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Algorithm Stock Predictor</h1>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter Stock Symbol"
        />
        <input
          type="number"
          value={displayDays}
          onChange={(e) => setDisplayDays(e.target.value)}
          placeholder="Display Days"
        />
        <button onClick={fetchStockData}>Fetch Stock Data</button>
        <button onClick={fetchCurrentPrice}>Fetch Current Price</button>
        <button onClick={fetchNewsHeadlines}>Fetch News Headlines</button>
        <button onClick={handleForecast}>Forecast with Prophet</button>
        <button onClick={handleTechnicalIndicators}>Calculate Technical Indicators</button>
        <button onClick={handleModelPredictions}>Predict with All Models</button>
        <button onClick={handleRecommendation}>Generate Recommendation</button>
        <button onClick={handleTradeSimulation}>Simulate Trade</button>

        <div>
          <h2>Stock Data</h2>
          <pre>{JSON.stringify(stockData, null, 2)}</pre>
        </div>

        <div>
          <h2>Current Price</h2>
          <pre>{JSON.stringify(currentPrice, null, 2)}</pre>
        </div>

        <div>
          <h2>News Headlines</h2>
          <pre>{JSON.stringify(newsHeadlines, null, 2)}</pre>
        </div>

        <div>
          <h2>Forecast</h2>
          <pre>{JSON.stringify(forecast, null, 2)}</pre>
        </div>

        <div>
          <h2>Technical Indicators</h2>
          <pre>{JSON.stringify(technicalIndicators, null, 2)}</pre>
        </div>

        {/* Middle row - Chart and Sphere */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart */}
          <div className={`lg:col-span-2 ${theme === 'dark' 
            ? 'bg-gray-900 bg-opacity-50 border-blue-800' 
            : 'bg-white bg-opacity-70 border-blue-200'} 
            backdrop-blur-md p-6 rounded-xl border`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Market Performance</h3>
              <div className="flex space-x-2">
                {['1D', '1W', '1M', '1Y', 'ALL'].map((range) => (
                  <button 
                    key={range}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      timeRange === range 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                    onClick={() => handleTimeRangeChange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filterStockData(timeRange)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#999' : '#4b5563'} />
                  <YAxis stroke={theme === 'dark' ? '#999' : '#4b5563'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(10, 15, 30, 0.8)' : 'rgba(255, 255, 255, 0.95)', 
                      borderColor: theme === 'dark' ? '#2c3e50' : '#e5e7eb',
                      color: theme === 'dark' ? '#fff' : '#111827'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="AAPL" 
                    stroke="#4dabf7" 
                    strokeWidth={3} 
                    dot={{ r: 6, strokeWidth: 2 }} 
                    activeDot={{ r: 8, strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="MSFT" 
                    stroke="#da77f2" 
                    strokeWidth={3} 
                    dot={{ r: 6, strokeWidth: 2 }} 
                    activeDot={{ r: 8, strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="GOOGL" 
                    stroke="#69db7c" 
                    strokeWidth={3} 
                    dot={{ r: 6, strokeWidth: 2 }} 
                    activeDot={{ r: 8, strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="AMZN" 
                    stroke="#ffd43b" 
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2 }} 
                    activeDot={{ r: 8, strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analytics Sphere */}
          <div className={`${theme === 'dark' 
            ? 'bg-gray-900 bg-opacity-50 border-blue-800' 
            : 'bg-white bg-opacity-70 border-blue-200'} 
            backdrop-blur-md rounded-xl border overflow-hidden`}>
            <div className="p-4 bg-black bg-opacity-40 border-b border-blue-900">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center">
                  <Activity size={18} className="mr-2 text-purple-400" />
                  AI Analytics Hub
                </h3>
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
            <div ref={analyticsSphereRef} className="h-96" />
          </div>
        </div>

        {/* Bottom row - News, Alerts and Analysis */}
        <MarketSentimentSurvey />
        <MarketDashboard />
        <MarketMovers />
        <RecentAISessionsComponent />
      </main>

      <Footer />

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)'};
        }
      `}</style>
    </div>
  );
}

export default Dashboard;