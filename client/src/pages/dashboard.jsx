import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Camera, TrendingUp, TrendingDown, DollarSign, Send, AlertTriangle, Activity, PieChart, Globe, Search } from 'lucide-react';
import MarketHeader from '../components/header';

// Sample data
const stockData = [
  { name: 'Jan', AAPL: 140, MSFT: 220, GOOGL: 2100, AMZN: 3200 },
  { name: 'Feb', AAPL: 145, MSFT: 230, GOOGL: 2200, AMZN: 3300 },
  { name: 'Mar', AAPL: 148, MSFT: 228, GOOGL: 2180, AMZN: 3280 },
  { name: 'Apr', AAPL: 152, MSFT: 235, GOOGL: 2250, AMZN: 3350 },
  { name: 'May', AAPL: 157, MSFT: 240, GOOGL: 2300, AMZN: 3400 },
  { name: 'Jun', AAPL: 160, MSFT: 245, GOOGL: 2320, AMZN: 3380 },
];

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
  const globeContainerRef = useRef(null);
  const analyticsSphereRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [animatedNumbers, setAnimatedNumbers] = useState({
    marketCap: 0,
    sentiment: 0,
    prediction: 0,
    signals: 0
  });

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-black text-white">
      <MarketHeader />
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Top row - Stats and 3D Globe */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Market Intelligence</h3>
                <DollarSign size={20} className="text-blue-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    {animatedNumbers.marketCap}%
                  </p>
                  <p className="text-green-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +2.4% from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="AAPL" stroke="#4dabf7" fill="#4dabf7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Sentiment Score</h3>
                <Activity size={20} className="text-purple-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                    {animatedNumbers.sentiment}%
                  </p>
                  <p className="text-red-400 flex items-center mt-2">
                    <TrendingDown size={16} className="mr-1" /> -1.2% from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="MSFT" stroke="#da77f2" fill="#da77f2" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Prediction Accuracy</h3>
                <PieChart size={20} className="text-green-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">
                    {animatedNumbers.prediction}%
                  </p>
                  <p className="text-green-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +3.7% from last week
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="GOOGL" stroke="#69db7c" fill="#69db7c" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800 transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between">
                <h3 className="text-lg text-gray-300">Trading Signals</h3>
                <Send size={20} className="text-yellow-400" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-300">
                    {animatedNumbers.signals}
                  </p>
                  <p className="text-yellow-400 flex items-center mt-2">
                    <TrendingUp size={16} className="mr-1" /> +8 from yesterday
                  </p>
                </div>
                <div className="h-16 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.slice(0, 5)}>
                      <Area type="monotone" dataKey="AMZN" stroke="#ffd43b" fill="#ffd43b" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1c2d', borderColor: '#2c3e50' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Globe */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-xl border border-blue-800 overflow-hidden">
            <div className="p-4 bg-black bg-opacity-40 border-b border-blue-900">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center">
                  <Globe size={18} className="mr-2 text-blue-400" />
                  Global Market Activity
                </h3>
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
            </div>
            <div ref={globeContainerRef} className="h-96" />
          </div>
        </div>

        {/* Middle row - Chart and Sphere */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Market Performance</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition">1D</button>
                <button className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition">1W</button>
                <button className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition">1M</button>
                <button className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition">1Y</button>
                <button className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition">ALL</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 15, 30, 0.8)', 
                      borderColor: '#2c3e50',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
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
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-xl border border-blue-800 overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800">
            <h3 className="text-lg font-medium mb-4">Market News</h3>
            <div className="space-y-4">
              {newsData.map((news, index) => (
                <div key={index} className="p-4 bg-black bg-opacity-30 rounded-lg border border-blue-900 hover:border-blue-600 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{news.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getImpactColor(news.impact)}`}>
                      {news.impact.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{news.summary}</p>
                  <p className={`text-sm ${getSentimentColor(news.sentiment)}`}>
                    Sentiment: {news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 bg-opacity-50 hover:bg-opacity-70 rounded-lg text-white transition-colors duration-300">
              View All News
            </button>
          </div>

          {/* Alerts */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Real-time Alerts</h3>
              <AlertTriangle size={18} className="text-yellow-500" />
            </div>
            <div className="space-y-4">
              {alertsData.map((alert, index) => (
                <div key={index} className="p-4 bg-black bg-opacity-30 rounded-lg border border-blue-900 hover:border-yellow-600 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{alert.stock}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getImpactColor(alert.level)}`}>
                      {alert.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{alert.alert}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-yellow-600 bg-opacity-50 hover:bg-opacity-70 rounded-lg text-white transition-colors duration-300">
              Configure Alerts
            </button>
          </div>

          {/* AI Analysis */}
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-blue-800">
            <h3 className="text-lg font-medium mb-4">AI Market Analysis</h3>
            
            {/* Tabs */}
            <div className="flex border-b border-blue-900 mb-4">
              <button 
                className={`pb-2 px-4 ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`pb-2 px-4 ${activeTab === 'prediction' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('prediction')}
              >
                Predictions
              </button>
              <button 
                className={`pb-2 px-4 ${activeTab === 'strategy' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('strategy')}
              >
                Strategy
              </button>
            </div>
            
            {/* Tab content */}
            <div className="overflow-y-auto h-64 pr-2 custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    The market is showing <span className="text-green-400">bullish</span> trends with technology and healthcare sectors outperforming. Our AI detects increasing institutional buying pressure in semiconductor stocks with a correlation to AI-related news events.
                  </p>
                  <div className="p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-800">
                    <p className="text-sm font-medium text-blue-300">Key Insight:</p>
                    <p className="text-sm text-gray-300">Recent volatility patterns suggest a potential market rotation toward value stocks in the next 7-10 trading days.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black bg-opacity-30 rounded-lg">
                      <p className="text-sm font-medium text-blue-300">Correlation Score</p>
                      <p className="text-xl font-bold text-white">87.4%</p>
                    </div>
                    <div className="p-3 bg-black bg-opacity-30 rounded-lg">
                      <p className="text-sm font-medium text-blue-300">AI Confidence</p>
                      <p className="text-xl font-bold text-white">92.8%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'prediction' && (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Our quantum-enhanced prediction models indicate a <span className="text-green-400">73% probability</span> of the S&P 500 reaching new highs within the next 30 trading days.
                  </p>
                  <div className="p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-800">
                    <p className="text-sm font-medium text-green-300">Opportunities:</p>
                    <ul className="text-sm text-gray-300 list-disc list-inside space-y-1 mt-1">
                      <li>Semiconductor sector projected to grow 12-15%</li>
                      <li>AI-related stocks showing strong momentum</li>
                      <li>Healthcare innovation catalysts emerging</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-800">
                    <p className="text-sm font-medium text-red-300">Risk Factors:</p>
                    <ul className="text-sm text-gray-300 list-disc list-inside space-y-1 mt-1">
                      <li>Rising treasury yields may pressure growth stocks</li>
                      <li>Geopolitical tensions increasing volatility</li>
                      <li>Consumer sentiment metrics weakening</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'strategy' && (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Based on current market conditions and AI analysis, our strategic recommendation leans <span className="text-blue-400">moderately bullish</span> with sector-specific focus.
                  </p>
                  <div className="p-3 bg-purple-900 bg-opacity-30 rounded-lg border border-purple-800">
                    <p className="text-sm font-medium text-purple-300">Recommended Allocation:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Technology: 35%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Healthcare: 20%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Financial: 15%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Energy: 10%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Utilities: 10%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <p className="text-sm text-gray-300">Cash: 10%</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white transition-colors duration-300">
                    Generate Custom Strategy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 bg-black bg-opacity-40 backdrop-blur-lg border-t border-blue-900 mt-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2025 QuantumTrader AI. All market data is delayed by 15 minutes.
          </div>
          <div className="flex space-x-6 mt-3 md:mt-0">
            <button className="text-gray-400 hover:text-blue-400 transition-colors">Terms</button>
            <button className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</button>
            <button className="text-gray-400 hover:text-blue-400 transition-colors">Help</button>
            <button className="text-gray-400 hover:text-blue-400 transition-colors">Support</button>
          </div>
        </div>
      </footer>

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;