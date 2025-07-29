import React, { useState, useEffect, useRef } from "react";
import CircuitBoard from "./components/CircuitBoard";
import ControlPanel from "./components/ControlPanel";
import DataTable from "./components/DataTable";
import ExperimentData from "./components/ExperimentData";
import { calculateCircuit } from "./logic/circuitLogic";
import "./simulatorCircuit.css";
import "./components/ExperimentData.css";

const SimulatorOhmsLaw = () => {
  // Circuit state
  const [voltage, setVoltage] = useState(5);
  const [resistance, setResistance] = useState(100);
  const [current, setCurrent] = useState(0.05);
  const [power, setPower] = useState(0.25);
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [components, setComponents] = useState({
    resistors: [{ id: "r1", value: 100, position: { x: 200, y: 150 }, connected: false }],
    voltmeter: { id: "v1", position: { x: 350, y: 200 }, connected: false },
    ammeter: { id: "a1", position: { x: 150, y: 200 }, connected: false },
    powerSource: { id: "ps1", position: { x: 250, y: 300 }, connected: true }
  });
  const [circuitComplete, setCircuitComplete] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [activeTerminals, setActiveTerminals] = useState([]);
  const circuitBoardRef = useRef(null);
  
  const [dragState, setDragState] = useState({
    isDragging: false,
    componentType: null,
    componentId: null,
    initialX: 0,
    initialY: 0,
    offsetX: 0,
    offsetY: 0
  });

  // Update circuit calculations when inputs change
  useEffect(() => {
    if (circuitComplete) {
      const results = calculateCircuit(voltage, resistance);
      setCurrent(results.current);
      setPower(results.power);
    } else {
      setCurrent(0);
      setPower(0);
    }
  }, [voltage, resistance, circuitComplete]);

  // Handle voltage changes
  const handleVoltageChange = (newVoltage) => {
    setVoltage(Number(newVoltage));
  };

  // Handle resistance changes
  const handleResistanceChange = (newResistance) => {
    setResistance(Number(newResistance));
    
    // Update the resistor component
    setComponents(prev => ({
      ...prev,
      resistors: prev.resistors.map(r => 
        r.id === "r1" ? { ...r, value: Number(newResistance) } : r
      )
    }));
  };

  // Start a new connection
  const startConnection = (terminalId) => {
    // Prevent starting a new connection while dragging
    if (dragState.isDragging) return;
    
    setActiveConnection({
      start: terminalId,
      end: null,
      startPos: getTerminalPosition(terminalId),
      currentPos: getTerminalPosition(terminalId)
    });
    setActiveTerminals([...activeTerminals, terminalId]);
  };

  // Update active connection during mouse move
  const updateActiveConnection = (e) => {
    if (activeConnection) {
      const boardRect = circuitBoardRef.current.getBoundingClientRect();
      const x = e.clientX - boardRect.left;
      const y = e.clientY - boardRect.top;
      setActiveConnection({
        ...activeConnection,
        currentPos: { x, y }
      });
    }
  };

  // Complete a connection between two terminals
  const completeConnection = (terminalId) => {
    if (activeConnection && activeConnection.start !== terminalId) {
      const endPos = getTerminalPosition(terminalId);
      const newConnection = {
        id: `conn_${Date.now()}`,
        start: activeConnection.start,
        end: terminalId,
        startPos: activeConnection.startPos,
        endPos
      };
      
      setConnections([...connections, newConnection]);
      setActiveConnection(null);
      setActiveTerminals([...activeTerminals, terminalId]);
      
      // Check if circuit is complete
      checkCircuitCompletion([...connections, newConnection]);
    }
  };

  // Cancel active connection
  const cancelConnection = () => {
    setActiveConnection(null);
  };

  // Get terminal position by ID
  const getTerminalPosition = (terminalId) => {
    const terminal = document.getElementById(terminalId);
    if (!terminal) return { x: 0, y: 0 };
    
    const rect = terminal.getBoundingClientRect();
    const boardRect = circuitBoardRef.current.getBoundingClientRect();
    
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top
    };
  };

  // Start component dragging
  const startDragging = (e, componentType, componentId) => {
    // Don't start drag if we're trying to connect
    if (activeConnection) return;
    
    e.preventDefault();
    const boardRect = circuitBoardRef.current.getBoundingClientRect();
    const initialX = e.clientX - boardRect.left;
    const initialY = e.clientY - boardRect.top;
    
    let component;
    if (componentType === 'resistor') {
      component = components.resistors.find(r => r.id === componentId);
    } else {
      component = components[componentType];
    }
    
    if (!component) return;
    
    setDragState({
      isDragging: true,
      componentType,
      componentId,
      initialX,
      initialY,
      offsetX: initialX - component.position.x,
      offsetY: initialY - component.position.y
    });
    
    // Add event listeners to handle dragging
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // Handle component dragging
  const handleDragMove = (e) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    const boardRect = circuitBoardRef.current.getBoundingClientRect();
    const x = e.clientX - boardRect.left - dragState.offsetX;
    const y = e.clientY - boardRect.top - dragState.offsetY;
    
    // Update component position
    setComponents(prev => {
      if (dragState.componentType === 'resistor') {
        return {
          ...prev,
          resistors: prev.resistors.map(r => 
            r.id === dragState.componentId ? { ...r, position: { x, y } } : r
          )
        };
      } else {
        return {
          ...prev,
          [dragState.componentType]: {
            ...prev[dragState.componentType],
            position: { x, y }
          }
        };
      }
    });
    
    // Update connected wire positions
    updateWirePositions();
  };

  // End component dragging
  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      componentType: null,
      componentId: null,
      initialX: 0,
      initialY: 0,
      offsetX: 0,
      offsetY: 0
    });
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    
    // Update wire positions one final time
    updateWirePositions();
  };

  // Update positions of all wires when components move
  const updateWirePositions = () => {
    setConnections(prev => 
      prev.map(conn => ({
        ...conn,
        startPos: getTerminalPosition(conn.start),
        endPos: getTerminalPosition(conn.end)
      }))
    );
  };

  // Check if the circuit is complete
  const checkCircuitCompletion = (currentConnections) => {
    // For a basic circuit: power source → resistor → ammeter → voltmeter → power source
    // Check if we have connections between all these components
    
    // Create a set of all connected component types
    const connectedComponents = new Set();
    
    // Map of successful connections
    const connectionMap = {
      power_connected: false,
      resistor_connected: false,
      ammeter_connected: false,
      voltmeter_connected: false
    };
    
    // Check each connection
    currentConnections.forEach(conn => {
      const startType = conn.start.split('_')[0];
      const endType = conn.end.split('_')[0];
      
      connectedComponents.add(startType);
      connectedComponents.add(endType);
      
      // Mark components as connected
      if (startType === 'power' || endType === 'power') connectionMap.power_connected = true;
      if (startType === 'resistor' || endType === 'resistor') connectionMap.resistor_connected = true;
      if (startType === 'ammeter' || endType === 'ammeter') connectionMap.ammeter_connected = true;
      if (startType === 'voltmeter' || endType === 'voltmeter') connectionMap.voltmeter_connected = true;
    });
    
    // Circuit is complete if all required components are connected
    const isComplete = Object.values(connectionMap).every(Boolean) && 
                      connectedComponents.size >= 4 && 
                      currentConnections.length >= 4;
    
    setCircuitComplete(isComplete);
    
    // Update component connected states
    setComponents(prev => ({
      ...prev,
      resistors: prev.resistors.map(r => ({ ...r, connected: connectionMap.resistor_connected })),
      voltmeter: { ...prev.voltmeter, connected: connectionMap.voltmeter_connected },
      ammeter: { ...prev.ammeter, connected: connectionMap.ammeter_connected },
      powerSource: { ...prev.powerSource, connected: connectionMap.power_connected }
    }));
  };

  // Record current measurement
  const recordMeasurement = () => {
    const newMeasurement = {
      id: Date.now(),
      voltage,
      resistance,
      current,
      power,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMeasurements([...measurements, newMeasurement]);
  };

  // Reset the circuit
  const resetCircuit = () => {
    setConnections([]);
    setActiveConnection(null);
    setActiveTerminals([]);
    setCircuitComplete(false);
    setComponents({
      resistors: [{ id: "r1", value: resistance, position: { x: 200, y: 150 }, connected: false }],
      voltmeter: { id: "v1", position: { x: 350, y: 200 }, connected: false },
      ammeter: { id: "a1", position: { x: 150, y: 200 }, connected: false },
      powerSource: { id: "ps1", position: { x: 250, y: 300 }, connected: true }
    });
  };

  // Handle loading a saved experiment
  const handleLoadSavedExperiment = (experimentData) => {
    try {
      if (experimentData.input) {
        // Load voltage
        if (experimentData.input.voltage !== undefined) {
          setVoltage(experimentData.input.voltage);
        }
        
        // Load resistance
        if (experimentData.input.resistance !== undefined) {
          setResistance(experimentData.input.resistance);
        }
        
        // Load component positions
        if (experimentData.input.components) {
          setComponents(experimentData.input.components);
        }
        
        // Load connections
        if (experimentData.input.connections) {
          setConnections(experimentData.input.connections);
          
          // Check if circuit is complete
          checkCircuitCompletion(experimentData.input.connections);
        }
      }
      
      // Load measurements if available
      if (experimentData.output && experimentData.output.measurements) {
        setMeasurements(experimentData.output.measurements);
      }
    } catch (error) {
      console.error('Error loading experiment:', error);
      alert('Failed to load the experiment data');
    }
  };

  return (
    <div className="simulator-container">
      <h1>Ohm's Law Circuit Simulator</h1>
      
      <div className="simulator-description">
        <p>
          This simulator demonstrates Ohm's Law: V = I × R, where V is voltage (in volts), 
          I is current (in amperes), and R is resistance (in ohms).
        </p>
        <p><strong>Instructions:</strong> Drag components to position them. Click on terminals to create wire connections.</p>
      </div>
      
      <div className="simulator-layout">
        <div className="simulator-main">
          <div 
            ref={circuitBoardRef}
            className="circuit-board"
            onMouseMove={updateActiveConnection}
            onClick={() => activeConnection && cancelConnection()}
          >
            <CircuitBoard 
              components={components}
              connections={connections}
              activeConnection={activeConnection}
              startConnection={startConnection}
              completeConnection={completeConnection}
              cancelConnection={cancelConnection}
              startDragging={startDragging}
              activeTerminals={activeTerminals}
              circuitComplete={circuitComplete}
              current={current}
              voltage={voltage}
            />
          </div>
          
          <div className="readings-panel">
            <div className="meter-reading ammeter">
              <h3>Ammeter</h3>
              <div className="meter-value">{circuitComplete ? current.toFixed(3) : "0.000"} A</div>
            </div>
            <div className="meter-reading voltmeter">
              <h3>Voltmeter</h3>
              <div className="meter-value">{circuitComplete ? voltage.toFixed(2) : "0.00"} V</div>
            </div>
            <div className="meter-reading power-meter">
              <h3>Power</h3>
              <div className="meter-value">{circuitComplete ? power.toFixed(2) : "0.00"} W</div>
            </div>
          </div>
        </div>
        
        <div className="simulator-controls">
          <ControlPanel 
            voltage={voltage}
            resistance={resistance}
            onVoltageChange={handleVoltageChange}
            onResistanceChange={handleResistanceChange}
            onRecordMeasurement={recordMeasurement}
            onReset={resetCircuit}
            circuitComplete={circuitComplete}
          />
          
          <DataTable measurements={measurements} />
        </div>
      </div>
      
      <div className="circuit-status">
        <div className={`status-indicator ${circuitComplete ? 'complete' : 'incomplete'}`}>
          Circuit Status: {circuitComplete ? 'Complete' : 'Incomplete'}
        </div>
        {!circuitComplete && (
          <div className="help-text">
            Connect all components to complete the circuit. Click on terminals (circles) to create wire connections.
          </div>
        )}
      </div>
      
      {/* Add ExperimentData component */}
      <ExperimentData
        voltage={voltage}
        resistance={resistance}
        current={current}
        power={power}
        components={components}
        connections={connections}
        circuitComplete={circuitComplete}
        measurements={measurements}
        onLoadSavedExperiment={handleLoadSavedExperiment}
      />
    </div>
  );
};

export default SimulatorOhmsLaw;