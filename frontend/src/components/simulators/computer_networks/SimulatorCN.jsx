import React, { useState, useRef, useEffect } from 'react';
import { Wifi, Server, Monitor, Router, Cable, Plus, Trash2, Terminal, Play, AlertCircle, Settings, Save } from 'lucide-react';
import ExperimentData from './components/ExperimentData';

const NetworkSimulator = () => {
  // Canvas for network topology
  const canvasRef = useRef(null);
  
  // Simulation states
  const [devices, setDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStartDevice, setConnectionStartDevice] = useState(null);
  const [packets, setPackets] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', content: 'Network Simulator Terminal Ready' },
    { type: 'system', content: 'Type "help" to see available commands' }
  ]);
  const [command, setCommand] = useState('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [simulationSettings, setSimulationSettings] = useState({
    packetLoss: 0,
    latency: 100,
    bandwidth: 100
  });
  
  // Function to add a log message to the terminal
  const addLog = (content, type = 'response') => {
    setTerminalOutput(prev => [...prev, { type, content }]);
  };
  
  // Terminal commands handling
  const handleTerminalCommand = () => {
    if (!command.trim()) return;
    
    setTerminalOutput(prev => [...prev, { type: 'command', content: `> ${command}` }]);
    
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    
    switch(cmd) {
      case 'help':
        setTerminalOutput(prev => [...prev, { 
          type: 'response', 
          content: `Available commands:
  - ping [device_id]: Test connectivity to a device
  - ipconfig: Show IP configurations of all devices
  - traceroute [device_id]: Trace route to a device
  - route: Show routing tables
  - clear: Clear terminal output
  - help: Show this help message`
        }]);
        break;
        
      case 'clear':
        setTerminalOutput([{ type: 'system', content: 'Terminal cleared' }]);
        break;
        
      case 'ping':
        if (parts.length < 2) {
          setTerminalOutput(prev => [...prev, { 
            type: 'error', 
            content: 'Usage: ping [device_id]'
          }]);
          break;
        }
        
        const targetId = parseInt(parts[1]);
        const targetDevice = devices.find(d => d.id === targetId);
        
        if (!targetDevice) {
          setTerminalOutput(prev => [...prev, { 
            type: 'error', 
            content: `Device with ID ${targetId} not found`
          }]);
          break;
        }
        
        // Simulate ping
        setTerminalOutput(prev => [...prev, { 
          type: 'response', 
          content: `Pinging ${targetDevice.name} [${targetDevice.ip}] with 32 bytes of data:`
        }]);
        
        // Simulate 4 pings with random RTT
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            const rtt = Math.floor(Math.random() * 20) + simulationSettings.latency;
            setTimeout(() => {
              setTerminalOutput(prev => [...prev, { 
                type: 'response', 
                content: `Reply from ${targetDevice.ip}: bytes=32 time=${rtt}ms TTL=64`
              }]);
              
              // Show summary after last ping
              if (i === 3) {
                setTerminalOutput(prev => [...prev, { 
                  type: 'response', 
                  content: `
Ping statistics for ${targetDevice.ip}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = ${simulationSettings.latency}ms, Maximum = ${simulationSettings.latency + 20}ms, Average = ${simulationSettings.latency + 10}ms`
                }]);
              }
            }, i * 500);
          }
        }, 200);
        break;
        
      case 'ipconfig':
        setTerminalOutput(prev => [...prev, { 
          type: 'response', 
          content: `Network Configuration:\n\n${devices.map(d => 
            `${d.name} (ID: ${d.id}):\n` +
            `   IP Address: ${d.ip}\n` +
            `   MAC Address: ${d.mac}\n` +
            `   Type: ${d.type}\n`
          ).join('\n')}`
        }]);
        break;
        
      case 'traceroute':
        if (parts.length < 2) {
          setTerminalOutput(prev => [...prev, { 
            type: 'error', 
            content: 'Usage: traceroute [device_id]'
          }]);
          break;
        }
        
        const traceTargetId = parseInt(parts[1]);
        const traceTarget = devices.find(d => d.id === traceTargetId);
        
        if (!traceTarget) {
          setTerminalOutput(prev => [...prev, { 
            type: 'error', 
            content: `Device with ID ${traceTargetId} not found`
          }]);
          break;
        }
        
        // Simulate traceroute with fake hops
        setTerminalOutput(prev => [...prev, { 
          type: 'response', 
          content: `Tracing route to ${traceTarget.name} [${traceTarget.ip}]\nover a maximum of 30 hops:\n`
        }]);
        
        // Get all routers
        const routers = devices.filter(d => d.type === 'router');
        const routerCount = Math.min(routers.length, 3);
        
        setTimeout(() => {
          // Show some router hops
          for (let i = 0; i < routerCount; i++) {
            const rtt = Math.floor(Math.random() * 20) + simulationSettings.latency * (i+1)/routerCount;
            setTimeout(() => {
              setTerminalOutput(prev => [...prev, { 
                type: 'response', 
                content: `  ${i+1}    ${rtt}ms    ${routers[i].ip} [${routers[i].name}]`
              }]);
            }, i * 300);
          }
          
          // Show final destination
          setTimeout(() => {
            setTerminalOutput(prev => [...prev, { 
              type: 'response', 
              content: `  ${routerCount+1}    ${simulationSettings.latency + Math.floor(Math.random() * 30)}ms    ${traceTarget.ip} [${traceTarget.name}]`
            }]);
            setTerminalOutput(prev => [...prev, { 
              type: 'response', 
              content: `\nTrace complete.`
            }]);
          }, routerCount * 300 + 300);
        }, 200);
        break;
        
      default:
        setTerminalOutput(prev => [...prev, { 
          type: 'error', 
          content: `Command not recognized: ${cmd}. Type "help" to see available commands.`
        }]);
    }
    
    setCommand('');
  };
  
  // Generate random IP and MAC address
  const generateIP = () => {
    return `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
  };
  
  const generateMAC = () => {
    return Array(6).fill(0).map(() => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':');
  };
  
  // Add a new device to the network
  const addDevice = (type) => {
    const id = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    const newDevice = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}_${id}`,
      type,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      ip: generateIP(),
      mac: generateMAC()
    };
    
    setDevices([...devices, newDevice]);
    setSelectedDevice(newDevice);
  };
  
  // Delete selected device or connection
  const handleDelete = () => {
    if (selectedDevice) {
      setDevices(devices.filter(d => d.id !== selectedDevice.id));
      setConnections(connections.filter(c => 
        c.from !== selectedDevice.id && c.to !== selectedDevice.id
      ));
      setSelectedDevice(null);
    } else if (selectedConnection) {
      setConnections(connections.filter(c => 
        !(c.from === selectedConnection.from && c.to === selectedConnection.to)
      ));
      setSelectedConnection(null);
    }
  };
  
  // Start drawing a connection
  const startConnection = (deviceId) => {
    if (selectedTool === 'connect') {
      setIsDrawingConnection(true);
      setConnectionStartDevice(deviceId);
    }
  };
  
  // Finish drawing a connection
  const finishConnection = (deviceId) => {
    if (isDrawingConnection && connectionStartDevice !== deviceId) {
      // Check if connection already exists
      const connectionExists = connections.some(c => 
        (c.from === connectionStartDevice && c.to === deviceId) ||
        (c.from === deviceId && c.to === connectionStartDevice)
      );
      
      if (!connectionExists) {
        setConnections([...connections, {
          from: connectionStartDevice,
          to: deviceId,
          latency: simulationSettings.latency,
          bandwidth: simulationSettings.bandwidth,
          packetLoss: simulationSettings.packetLoss
        }]);
      }
    }
    
    setIsDrawingConnection(false);
    setConnectionStartDevice(null);
  };
  
  // Draw the network topology
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    connections.forEach(conn => {
      const fromDevice = devices.find(d => d.id === conn.from);
      const toDevice = devices.find(d => d.id === conn.to);
      
      if (fromDevice && toDevice) {
        ctx.beginPath();
        ctx.moveTo(fromDevice.x, fromDevice.y);
        ctx.lineTo(toDevice.x, toDevice.y);
        
        // Highlight selected connection
        if (selectedConnection && 
            selectedConnection.from === conn.from && 
            selectedConnection.to === conn.to) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2;
        }
        
        ctx.stroke();
        
        // Draw connection label (bandwidth, latency)
        const midX = (fromDevice.x + toDevice.x) / 2;
        const midY = (fromDevice.y + toDevice.y) / 2;
        
        ctx.fillStyle = '#475569';
        ctx.font = '10px Arial';
        ctx.fillText(`${conn.bandwidth}Mbps, ${conn.latency}ms`, midX, midY - 5);
      }
    });
    
    // Draw connection being created
    if (isDrawingConnection && connectionStartDevice) {
      const fromDevice = devices.find(d => d.id === connectionStartDevice);
      
      if (fromDevice) {
        ctx.beginPath();
        ctx.moveTo(fromDevice.x, fromDevice.y);
        ctx.lineTo(canvas.mouseX || fromDevice.x, canvas.mouseY || fromDevice.y);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    // Draw devices
    devices.forEach(device => {
      ctx.beginPath();
      ctx.arc(device.x, device.y, 20, 0, Math.PI * 2);
      
      // Highlight selected device
      if (selectedDevice && selectedDevice.id === device.id) {
        ctx.fillStyle = '#3B82F6';
      } else {
        switch(device.type) {
          case 'pc':
            ctx.fillStyle = '#10B981';
            break;
          case 'router':
            ctx.fillStyle = '#F59E0B';
            break;
          case 'switch':
            ctx.fillStyle = '#6366F1';
            break;
          case 'server':
            ctx.fillStyle = '#EF4444';
            break;
          default:
            ctx.fillStyle = '#94A3B8';
        }
      }
      
      ctx.fill();
      
      // Draw device icon
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      switch(device.type) {
        case 'pc':
          ctx.fillText('PC', device.x, device.y);
          break;
        case 'router':
          ctx.fillText('R', device.x, device.y);
          break;
        case 'switch':
          ctx.fillText('SW', device.x, device.y);
          break;
        case 'server':
          ctx.fillText('SRV', device.x, device.y);
          break;
      }
      
      // Draw device label
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(device.name, device.x, device.y + 35);
      
      // Draw device ID
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.fillText(`ID: ${device.id}`, device.x, device.y + 48);
    });
    
    // Draw packets
    packets.forEach(packet => {
      ctx.beginPath();
      ctx.arc(packet.x, packet.y, 5, 0, Math.PI * 2);
      
      // Color based on protocol
      switch(packet.protocol) {
        case 'TCP':
          ctx.fillStyle = '#3B82F6';
          break;
        case 'UDP':
          ctx.fillStyle = '#10B981';
          break;
        case 'ICMP':
          ctx.fillStyle = '#F59E0B';
          break;
        default:
          ctx.fillStyle = '#94A3B8';
      }
      
      ctx.fill();
    });
    
  }, [devices, connections, selectedDevice, selectedConnection, isDrawingConnection, connectionStartDevice, packets]);
  
  // Make the canvas responsive to mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      canvas.mouseX = e.clientX - rect.left;
      canvas.mouseY = e.clientY - rect.top;
      
      // Update device position if dragging
      if (selectedDevice && selectedTool === 'select' && e.buttons === 1) {
        setDevices(devices.map(d => {
          if (d.id === selectedDevice.id) {
            return { ...d, x: canvas.mouseX, y: canvas.mouseY };
          }
          return d;
        }));
      }
    };
    
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if clicked on a device
      let clickedDevice = null;
      for (let i = devices.length - 1; i >= 0; i--) {
        const d = devices[i];
        const distance = Math.sqrt(Math.pow(d.x - mouseX, 2) + Math.pow(d.y - mouseY, 2));
        
        if (distance <= 20) {
          clickedDevice = d;
          break;
        }
      }
      
      if (clickedDevice) {
        if (selectedTool === 'select') {
          setSelectedDevice(clickedDevice);
          setSelectedConnection(null);
        } else if (selectedTool === 'connect') {
          if (isDrawingConnection) {
            finishConnection(clickedDevice.id);
          } else {
            startConnection(clickedDevice.id);
          }
        }
      } else {
        // Check if clicked on a connection
        let clickedConnection = null;
        for (const conn of connections) {
          const fromDevice = devices.find(d => d.id === conn.from);
          const toDevice = devices.find(d => d.id === conn.to);
          
          if (fromDevice && toDevice) {
            // Line equation to check if click is on the line
            const A = toDevice.y - fromDevice.y;
            const B = fromDevice.x - toDevice.x;
            const C = toDevice.x * fromDevice.y - fromDevice.x * toDevice.y;
            
            // Distance from point to line
            const distance = Math.abs(A * mouseX + B * mouseY + C) / 
                             Math.sqrt(A * A + B * B);
            
            // Check if point is within the line segment
            const dotProduct = (mouseX - fromDevice.x) * (toDevice.x - fromDevice.x) + 
                               (mouseY - fromDevice.y) * (toDevice.y - fromDevice.y);
            const squaredLength = Math.pow(toDevice.x - fromDevice.x, 2) + 
                                  Math.pow(toDevice.y - fromDevice.y, 2);
                                  
            if (distance < 5 && dotProduct >= 0 && dotProduct <= squaredLength) {
              clickedConnection = conn;
              break;
            }
          }
        }
        
        if (clickedConnection && selectedTool === 'select') {
          setSelectedConnection(clickedConnection);
          setSelectedDevice(null);
        } else if (selectedTool === 'select') {
          setSelectedDevice(null);
          setSelectedConnection(null);
        }
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [devices, connections, selectedDevice, selectedTool, isDrawingConnection]);
  
  // Start network simulation
  const startSimulation = () => {
    setIsSimulationRunning(true);
    
    // Simulate packet traffic
    const packetInterval = setInterval(() => {
      if (connections.length > 0 && devices.length >= 2) {
        // Randomly select a connection for packet transfer
        const randomConnIndex = Math.floor(Math.random() * connections.length);
        const selectedConn = connections[randomConnIndex];
        
        const fromDevice = devices.find(d => d.id === selectedConn.from);
        const toDevice = devices.find(d => d.id === selectedConn.to);
        
        if (fromDevice && toDevice) {
          // Create a new packet
          const protocols = ['TCP', 'UDP', 'ICMP'];
          const protocol = protocols[Math.floor(Math.random() * protocols.length)];
          
          const newPacket = {
            id: Math.random().toString(36).substring(2, 9),
            from: fromDevice.id,
            to: toDevice.id,
            protocol,
            x: fromDevice.x,
            y: fromDevice.y,
            progress: 0,
            dropped: Math.random() < (selectedConn.packetLoss / 100)
          };
          
          setPackets(prev => [...prev, newPacket]);
          
          // Animate packet
          const packetAnimation = setInterval(() => {
            setPackets(prev => {
              const updatedPackets = prev.map(p => {
                if (p.id === newPacket.id) {
                  // Calculate new position along the line
                  const progress = p.progress + 0.02;
                  
                  if (progress >= 1 || p.dropped) {
                    // Remove packet when it reaches destination or is dropped
                    return null;
                  }
                  
                  const x = fromDevice.x + (toDevice.x - fromDevice.x) * progress;
                  const y = fromDevice.y + (toDevice.y - fromDevice.y) * progress;
                  
                  return { ...p, x, y, progress };
                }
                return p;
              }).filter(Boolean);
              
              return updatedPackets;
            });
          }, 50);
          
          // Clean up animation after packet reaches destination
          setTimeout(() => {
            clearInterval(packetAnimation);
          }, 2000);
        }
      }
    }, 500);
    
    // Clean up interval when simulation stops
    return () => clearInterval(packetInterval);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    setIsSimulationRunning(false);
    setPackets([]);
  };
  
  // Handle loading a saved experiment
  const handleLoadSavedExperiment = (experimentData) => {
    try {
      if (experimentData.input) {
        // Load devices
        if (experimentData.input.devices && Array.isArray(experimentData.input.devices)) {
          setDevices(experimentData.input.devices);
          addLog(`Loaded ${experimentData.input.devices.length} network devices`, 'system');
        }
        
        // Load connections
        if (experimentData.input.connections && Array.isArray(experimentData.input.connections)) {
          setConnections(experimentData.input.connections);
          addLog(`Loaded ${experimentData.input.connections.length} network connections`, 'system');
        }
      }
      
      // Load simulation settings if available
      if (experimentData.output && experimentData.output.simulationSettings) {
        setSimulationSettings(experimentData.output.simulationSettings);
        addLog('Restored simulation settings', 'system');
      }
      
      // Clear selection states
      setSelectedDevice(null);
      setSelectedConnection(null);
      setIsDrawingConnection(false);
      
      addLog('Successfully loaded saved experiment', 'system');
    } catch (error) {
      addLog(`Error loading saved experiment: ${error.message}`, 'error');
      console.error('Error loading saved experiment:', error);
    }
  };
  
  return (
    <div className="network-simulator">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Network Topology Canvas */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Network Topology</h3>
              <div className="flex space-x-2">
                {/* Toolbar */}
                <button
                  onClick={() => setSelectedTool('select')}
                  className={`p-2 rounded ${selectedTool === 'select' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Select/Move"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedTool('connect')}
                  className={`p-2 rounded ${selectedTool === 'connect' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Connect Devices"
                >
                  <Cable className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!selectedDevice && !selectedConnection}
                  className={`p-2 rounded ${!selectedDevice && !selectedConnection ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                  title="Delete Selected"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="relative overflow-hidden" style={{ height: '500px' }}>
              <canvas 
                ref={canvasRef} 
                width="800" 
                height="500"
                className="w-full h-full"
              ></canvas>
              
              {/* Network device palette */}
              <div className="absolute left-4 top-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Add Devices</div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => addDevice('pc')}
                    className="p-2 rounded hover:bg-gray-100 flex flex-col items-center"
                    title="Add PC"
                  >
                    <Monitor className="h-5 w-5 text-green-600" />
                    <span className="text-xs mt-1">PC</span>
                  </button>
                  <button
                    onClick={() => addDevice('server')}
                    className="p-2 rounded hover:bg-gray-100 flex flex-col items-center"
                    title="Add Server"
                  >
                    <Server className="h-5 w-5 text-red-600" />
                    <span className="text-xs mt-1">Server</span>
                  </button>
                  <button
                    onClick={() => addDevice('router')}
                    className="p-2 rounded hover:bg-gray-100 flex flex-col items-center"
                    title="Add Router"
                  >
                    <Router className="h-5 w-5 text-amber-600" />
                    <span className="text-xs mt-1">Router</span>
                  </button>
                  <button
                    onClick={() => addDevice('switch')}
                    className="p-2 rounded hover:bg-gray-100 flex flex-col items-center"
                    title="Add Switch"
                  >
                    <Wifi className="h-5 w-5 text-indigo-600" />
                    <span className="text-xs mt-1">Switch</span>
                  </button>
                </div>
              </div>
              
              {/* Selected device/connection info */}
              {(selectedDevice || selectedConnection) && (
                <div className="absolute right-4 bottom-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
                  {selectedDevice && (
                    <>
                      <h4 className="font-medium text-gray-800 mb-2">
                        {selectedDevice.name} <span className="text-xs text-gray-500">({selectedDevice.type})</span>
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>IP: {selectedDevice.ip}</div>
                        <div>MAC: {selectedDevice.mac}</div>
                        <div>ID: {selectedDevice.id}</div>
                      </div>
                    </>
                  )}
                  {selectedConnection && (
                    <>
                      <h4 className="font-medium text-gray-800 mb-2">Connection</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>From: {devices.find(d => d.id === selectedConnection.from)?.name} (ID: {selectedConnection.from})</div>
                        <div>To: {devices.find(d => d.id === selectedConnection.to)?.name} (ID: {selectedConnection.to})</div>
                        <div>Bandwidth: {selectedConnection.bandwidth} Mbps</div>
                        <div>Latency: {selectedConnection.latency} ms</div>
                        <div>Packet Loss: {selectedConnection.packetLoss}%</div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Simulation controls */}
              <div className="absolute right-4 top-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                <div className="flex items-center">
                  <button
                    onClick={() => isSimulationRunning ? stopSimulation() : startSimulation()}
                    className={`p-2 rounded ${
                      isSimulationRunning 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                    title={isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
                  >
                    <Play className={`h-5 w-5 ${isSimulationRunning ? 'hidden' : 'block'}`} />
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSimulationRunning ? 'block' : 'hidden'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-xs font-medium ml-2">
                    {isSimulationRunning ? 'Simulation Running' : 'Simulation Stopped'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terminal */}
          <div className="bg-gray-900 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center">
              <Terminal className="h-4 w-4 text-gray-400 mr-2" />
              <h3 className="text-sm text-gray-300">Network Terminal</h3>
            </div>
            
            <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
              {terminalOutput.map((line, i) => (
                <div 
                  key={i}
                  className={`mb-1 ${
                    line.type === 'command' 
                      ? 'text-green-400' 
                      : line.type === 'error'
                        ? 'text-red-400'
                        : line.type === 'system'
                          ? 'text-blue-400'
                          : 'text-gray-300'
                  }`}
                >
                  {line.content}
                </div>
              ))}
            </div>
            
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTerminalCommand()}
                className="flex-grow bg-transparent text-gray-300 outline-none"
                placeholder="Type a command (try 'help')..."
              />
            </div>
          </div>
        </div>
        
        <div>
          {/* Control Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Settings</h3>
            
            {/* Network Parameters */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Packet Loss (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulationSettings.packetLoss}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    packetLoss: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{simulationSettings.packetLoss}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latency (ms)
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={simulationSettings.latency}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    latency: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10ms</span>
                  <span>{simulationSettings.latency}ms</span>
                  <span>500ms</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bandwidth (Mbps)
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={simulationSettings.bandwidth}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    bandwidth: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1Mbps</span>
                  <span>{simulationSettings.bandwidth}Mbps</span>
                  <span>1Gbps</span>
                </div>
              </div>
            </div>
            
            {/* Network Statistics */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Network Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Devices:</span>
                  <span className="font-medium">{devices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections:</span>
                  <span className="font-medium">{connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packets Transmitted:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Status:</span>
                  <span className={`font-medium ${isSimulationRunning ? 'text-green-600' : 'text-gray-600'}`}>
                    {isSimulationRunning ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">Quick Help</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
                    <li>Add devices from the palette</li>
                    <li>Use Connect tool to link devices</li>
                    <li>Select tool to move devices</li>
                    <li>Run simulation to see packet flow</li>
                    <li>Use terminal to ping devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add ExperimentData component below the main grid */}
        <div className="lg:col-span-4">
          <ExperimentData
            devices={devices}
            connections={connections}
            terminalOutput={terminalOutput}
            simulationSettings={simulationSettings}
            onLoadSavedExperiment={handleLoadSavedExperiment}
            addLog={addLog}
          />
        </div>
      </div>
    </div>
  );
};

export default NetworkSimulator;