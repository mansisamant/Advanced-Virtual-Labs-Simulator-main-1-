import React, { useState, useEffect } from 'react';
import './simulatorOptics.css';
import './components/ExperimentData.css';

// Import components
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import RayCanvas from './components/RayCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import Tutorial from './components/Tutorial';
import ConfigurationManager from './components/ConfigurationManager';
import ExperimentData from './components/ExperimentData';

// Import physics logic
import { calculateImageProperties, getExplanationTip } from './logic/RayOpticsCalculator';

/**
 * Ray Optics Simulator
 * An interactive tool for simulating and visualizing image formation using lenses and mirrors.
 */
const SimulatorOptics = () => {  // State for optical element and parameters
  const [elementType, setElementType] = useState('convexLens');
  const [focalLength, setFocalLength] = useState(10);
  const [objectDistance, setObjectDistance] = useState(20);
  const [showRays, setShowRays] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [explanationTip, setExplanationTip] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showConfigs, setShowConfigs] = useState(false);
  
  // State for individual ray visibility
  const [visibleRays, setVisibleRays] = useState({
    parallel: true,
    throughCenter: true,
    throughFocus: true
  });
  
  // Calculate image properties based on current parameters
  const imageProps = calculateImageProperties(
    objectDistance, 
    focalLength, 
    ['convexLens', 'concaveLens'].includes(elementType)
  );
  
  // Load configuration from URL parameters if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('type')) {
      setElementType(urlParams.get('type'));
    }
    
    if (urlParams.has('focal')) {
      setFocalLength(parseFloat(urlParams.get('focal')));
    }
    
    if (urlParams.has('object')) {
      setObjectDistance(parseFloat(urlParams.get('object')));
    }
  }, []);
  
  // Update explanation tip when parameters change
  useEffect(() => {
    setExplanationTip(getExplanationTip(elementType, objectDistance, focalLength));
    // Trigger animation on parameter change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [elementType, objectDistance, focalLength]);
  
  // Event handlers
  const handleElementChange = (e) => {
    setElementType(e.target.value);
  };
  
  const handleFocalLengthChange = (e) => {
    setFocalLength(parseFloat(e.target.value));
  };
  
  const handleObjectDistanceChange = (e) => {
    setObjectDistance(parseFloat(e.target.value));
  };
  
  const handleToggleRays = () => {
    setShowRays(!showRays);
  };
  const handleToggleValues = () => {
    setShowValues(!showValues);
  };
  
  const handleToggleConfigs = () => {
    setShowConfigs(!showConfigs);
  };
  
  const handleLoadConfiguration = (config) => {
    setElementType(config.elementType);
    setFocalLength(config.focalLength);
    setObjectDistance(config.objectDistance);
  };

  const handleToggleRayVisibility = (rayType) => {
    setVisibleRays(prev => ({
      ...prev,
      [rayType]: !prev[rayType]
    }));
  };

  // Handler for loading saved experiment
  const handleLoadSavedExperiment = (experimentData) => {
    if (experimentData.input) {
      // Load element type
      if (experimentData.input.elementType) {
        setElementType(experimentData.input.elementType);
      }
      
      // Load focal length
      if (experimentData.input.focalLength !== undefined) {
        setFocalLength(experimentData.input.focalLength);
      }
      
      // Load object distance
      if (experimentData.input.objectDistance !== undefined) {
        setObjectDistance(experimentData.input.objectDistance);
      }
    }
  };

  return (
    <div className="simulator-optics">
      <Header 
        title="Ray Optics Simulator" 
        explanationTip={explanationTip} 
      />
      
      <div className="config-toggle">
        <button 
          className={`config-toggle-btn ${showConfigs ? 'active' : ''}`}
          onClick={handleToggleConfigs}
        >
          {showConfigs ? 'Hide Configurations' : 'Saved Configurations'}
        </button>
      </div>
      
      {showConfigs && (
        <ConfigurationManager
          elementType={elementType}
          focalLength={focalLength}
          objectDistance={objectDistance}
          onLoadConfiguration={handleLoadConfiguration}
        />
      )}
      
      <div className="simulator-layout">        <ControlPanel 
          elementType={elementType}
          focalLength={focalLength}
          objectDistance={objectDistance}
          showRays={showRays}
          showValues={showValues}
          onElementChange={handleElementChange}
          onFocalLengthChange={handleFocalLengthChange}
          onObjectDistanceChange={handleObjectDistanceChange}
          onToggleRays={handleToggleRays}
          onToggleValues={handleToggleValues}
          visibleRays={visibleRays}
          onToggleRayVisibility={handleToggleRayVisibility}
        /><RayCanvas 
          elementType={elementType}
          focalLength={focalLength}
          objectDistance={objectDistance}
          showRays={showRays}
          imageProps={imageProps}
          isAnimating={isAnimating}
          onObjectDistanceChange={handleObjectDistanceChange}
          visibleRays={visibleRays}
        />
        
        {showValues && (
          <PropertiesPanel 
            imageProps={imageProps}
            objectDistance={objectDistance}
            focalLength={focalLength}
          />
        )}
      </div>
      
      <Tutorial />
      
      {/* Add ExperimentData component */}
      <ExperimentData
        elementType={elementType}
        focalLength={focalLength}
        objectDistance={objectDistance}
        imageProps={imageProps}
        onLoadSavedExperiment={handleLoadSavedExperiment}
      />
    </div>
  );
};

export default SimulatorOptics;