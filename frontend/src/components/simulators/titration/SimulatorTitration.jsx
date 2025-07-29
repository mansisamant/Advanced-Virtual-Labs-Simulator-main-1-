import React, { useState, useRef, useEffect } from "react";
import Burette3D from "./components/Burette3D";
import Flask3D from "./components/Flask3D";
import Beaker3D from "./components/Beaker3D";
import Liquid3D from "./components/Liquid3D";
import ControlPanel3D from "./components/ControlPanel3D";
import Stand3D from "./components/Stand3D";
import ExperimentData from "./components/ExperimentData";
import "./simulatorTitration.css";
import "./components/ExperimentData.css";

const SimulatorTitration = () => {
  // Experiment state
  const [volume, setVolume] = useState(0);
  const [reactionComplete, setReactionComplete] = useState(false);
  const [selectedAcid, setSelectedAcid] = useState("HCl");
  const [selectedBase, setSelectedBase] = useState("NaOH");
  const [concentration, setConcentration] = useState(0.1); // mol/L
  const [equipmentVisible, setEquipmentVisible] = useState({
    burette: true,
    flask: true,
    beaker: true,
    stand: true
  });
  const [measurements, setMeasurements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeElement, setActiveElement] = useState(null);
  const [positions, setPositions] = useState({
    burette: { x: 100, y: 10 },
    flask: { x: 150, y: 280 },
    beaker: { x: 300, y: 300 },
    stand: { x: 80, y: 10 }
  });
  
  // Endpoint calculations based on acid/base
  const getEndpointVolume = () => {
    // In a real app, this would calculate based on concentrations
    const endpointMap = {
      "HCl_NaOH": 25,
      "H2SO4_NaOH": 30,
      "CH3COOH_NaOH": 22,
      "HCl_KOH": 27,
      "H2SO4_KOH": 32,
      "CH3COOH_KOH": 24,
    };
    return endpointMap[`${selectedAcid}_${selectedBase}`] || 25;
  };

  const handleAddTitrant = (amount) => {
    setVolume((prev) => {
      const newVolume = prev + amount;
      const endpoint = getEndpointVolume();
      if (newVolume >= endpoint) {
        setReactionComplete(true);
      }
      return newVolume;
    });
  };

  const handleReduceTitrant = (amount) => {
    setVolume((prev) => {
      const newVolume = Math.max(prev - amount, 0);
      const endpoint = getEndpointVolume();
      if (newVolume < endpoint) setReactionComplete(false);
      return newVolume;
    });
  };

  const handleAcidChange = (event) => {
    setSelectedAcid(event.target.value);
    resetExperiment();
  };

  const handleBaseChange = (event) => {
    setSelectedBase(event.target.value);
    resetExperiment();
  };

  const handleConcentrationChange = (event) => {
    setConcentration(parseFloat(event.target.value));
    resetExperiment();
  };

  const resetExperiment = () => {
    setVolume(0);
    setReactionComplete(false);
  };

  const recordMeasurement = () => {
    const newMeasurement = {
      id: Date.now(),
      acid: selectedAcid,
      base: selectedBase,
      volume,
      concentration,
      reactionComplete,
      timestamp: new Date().toLocaleTimeString()
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  const toggleEquipment = (equipment) => {
    setEquipmentVisible({
      ...equipmentVisible,
      [equipment]: !equipmentVisible[equipment]
    });
  };

  // Drag functionality
  const handleDragStart = (e, element) => {
    setIsDragging(true);
    setActiveElement(element);
    e.preventDefault(); // Prevent default to enable custom drag behavior
  };

  const handleMouseMove = (e) => {
    if (isDragging && activeElement) {
      // Update position of active element
      setPositions({
        ...positions,
        [activeElement]: {
          x: e.clientX - 50, // Offset to center the element
          y: e.clientY - 50
        }
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setActiveElement(null);
  };

  // Handle loading a saved experiment
  const handleLoadSavedExperiment = (experimentData) => {
    try {
      if (experimentData.input) {
        // Load acid type
        if (experimentData.input.selectedAcid) {
          setSelectedAcid(experimentData.input.selectedAcid);
        }
        
        // Load base type
        if (experimentData.input.selectedBase) {
          setSelectedBase(experimentData.input.selectedBase);
        }
        
        // Load concentration
        if (experimentData.input.concentration !== undefined) {
          setConcentration(experimentData.input.concentration);
        }
      }
      
      // Load experiment output data
      if (experimentData.output) {
        // Load titrant volume
        if (experimentData.output.volume !== undefined) {
          setVolume(experimentData.output.volume);
        }
        
        // Load reaction status
        if (experimentData.output.reactionComplete !== undefined) {
          setReactionComplete(experimentData.output.reactionComplete);
        }
        
        // Load measurements
        if (experimentData.output.measurements && Array.isArray(experimentData.output.measurements)) {
          setMeasurements(experimentData.output.measurements);
        }
      }
    } catch (error) {
      console.error('Error loading experiment:', error);
      alert('Failed to load the experiment data');
    }
  };

  useEffect(() => {
    // Add event listeners for dragging
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, activeElement]);

  return (
    <div 
      className="titration-2d-container" 
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
    >
      <h1>Advanced Titration Experiment</h1>

      {/* Chemical selectors */}
      <div className="chemical-selector-panel">
        <div className="chemical-selector">
          <label htmlFor="acid">Acid: </label>
          <select id="acid" value={selectedAcid} onChange={handleAcidChange}>
            <option value="HCl">Hydrochloric Acid (HCl)</option>
            <option value="H2SO4">Sulfuric Acid (H2SO4)</option>
            <option value="CH3COOH">Acetic Acid (CH3COOH)</option>
          </select>
        </div>
        
        <div className="chemical-selector">
          <label htmlFor="base">Base: </label>
          <select id="base" value={selectedBase} onChange={handleBaseChange}>
            <option value="NaOH">Sodium Hydroxide (NaOH)</option>
            <option value="KOH">Potassium Hydroxide (KOH)</option>
          </select>
        </div>

        <div className="chemical-selector">
          <label htmlFor="concentration">Concentration (mol/L): </label>
          <select id="concentration" value={concentration} onChange={handleConcentrationChange}>
            <option value="0.05">0.05</option>
            <option value="0.1">0.10</option>
            <option value="0.5">0.50</option>
            <option value="1.0">1.00</option>
          </select>
        </div>
      </div>

      {/* Equipment toggles */}
      <div className="equipment-toggles">
        <button 
          className={`toggle-btn ${equipmentVisible.burette ? 'active' : ''}`}
          onClick={() => toggleEquipment('burette')}
        >
          Burette
        </button>
        <button 
          className={`toggle-btn ${equipmentVisible.flask ? 'active' : ''}`}
          onClick={() => toggleEquipment('flask')}
        >
          Flask
        </button>
        <button 
          className={`toggle-btn ${equipmentVisible.beaker ? 'active' : ''}`}
          onClick={() => toggleEquipment('beaker')}
        >
          Beaker
        </button>
        <button 
          className={`toggle-btn ${equipmentVisible.stand ? 'active' : ''}`}
          onClick={() => toggleEquipment('stand')}
        >
          Stand
        </button>
      </div>

      {/* Experiment area */}
      <div className="experiment-area">
        {/* Stand needs to render first to be in background */}
        {equipmentVisible.stand && (
          <div 
            className="draggable-equipment stand-equipment"
            style={{left: positions.stand.x, top: positions.stand.y}}
            onMouseDown={(e) => handleDragStart(e, 'stand')}
          >
            <Stand3D />
          </div>
        )}
        
        {equipmentVisible.burette && (
          <div 
            className="draggable-equipment burette-equipment" 
            style={{left: positions.burette.x, top: positions.burette.y}}
            onMouseDown={(e) => handleDragStart(e, 'burette')}
          >
            <Burette3D volume={volume} />
          </div>
        )}
        
        {equipmentVisible.flask && (
          <div 
            className="draggable-equipment flask-equipment"
            style={{left: positions.flask.x, top: positions.flask.y}}
            onMouseDown={(e) => handleDragStart(e, 'flask')}
          >
            <Flask3D 
              reactionComplete={reactionComplete} 
              selectedAcid={selectedAcid} 
            />
          </div>
        )}
        
        {equipmentVisible.beaker && (
          <div 
            className="draggable-equipment beaker-equipment"
            style={{left: positions.beaker.x, top: positions.beaker.y}}
            onMouseDown={(e) => handleDragStart(e, 'beaker')}
          >
            <Beaker3D />
          </div>
        )}

        {equipmentVisible.flask && (
          <Liquid3D 
            volume={volume} 
            reactionComplete={reactionComplete} 
            selectedAcid={selectedAcid}
            position={positions.flask}
          />
        )}
      </div>

      {/* Control panel for titration */}
      <ControlPanel3D 
        onAddTitrant={handleAddTitrant}
        onReduceTitrant={handleReduceTitrant}
        onReset={resetExperiment}
        onRecordMeasurement={recordMeasurement}
      />

      {/* Status indicator */}
      <div className={`status-indicator ${reactionComplete ? 'complete' : ''}`}>
        {reactionComplete ? 
          "Endpoint reached! Indicator has changed color (pink)" : 
          "Titration in progress (blue/yellow/green)"}
      </div>

      {/* Measurement table */}
      <div className="measurement-table-container">
        <h3>Recorded Measurements</h3>
        {measurements.length > 0 ? (
          <table className="measurement-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Acid</th>
                <th>Base</th>
                <th>Volume (mL)</th>
                <th>Concentration (mol/L)</th>
                <th>Endpoint Reached</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map(m => (
                <tr key={m.id}>
                  <td>{m.timestamp}</td>
                  <td>{m.acid}</td>
                  <td>{m.base}</td>
                  <td>{m.volume.toFixed(2)}</td>
                  <td>{m.concentration}</td>
                  <td>{m.reactionComplete ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No measurements recorded yet. Click "Record Data" after performing titration.</p>
        )}
      </div>

      {/* Add ExperimentData component */}
      <ExperimentData
        selectedAcid={selectedAcid}
        selectedBase={selectedBase}
        concentration={concentration}
        volume={volume}
        reactionComplete={reactionComplete}
        measurements={measurements}
        onLoadSavedExperiment={handleLoadSavedExperiment}
      />
    </div>
  );
};

export default SimulatorTitration;