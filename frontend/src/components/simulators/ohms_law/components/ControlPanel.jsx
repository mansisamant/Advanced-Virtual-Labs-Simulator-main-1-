import React from "react";

const ControlPanel = ({
  voltage,
  resistance,
  onVoltageChange,
  onResistanceChange,
  onRecordMeasurement,
  onReset
}) => {
  return (
    <div className="control-panel">
      <h2>Controls</h2>
      
      <div className="control-group">
        <label htmlFor="voltage-slider">Voltage (V):</label>
        <input
          id="voltage-slider"
          type="range"
          min="0"
          max="12"
          step="0.1"
          value={voltage}
          onChange={(e) => onVoltageChange(e.target.value)}
          className="slider voltage-slider"
        />
        <div className="slider-value">{voltage.toFixed(1)} V</div>
      </div>
      
      <div className="control-group">
        <label htmlFor="resistance-slider">Resistance (Ω):</label>
        <input
          id="resistance-slider"
          type="range"
          min="10"
          max="1000"
          step="10"
          value={resistance}
          onChange={(e) => onResistanceChange(e.target.value)}
          className="slider resistance-slider"
        />
        <div className="slider-value">{resistance} Ω</div>
      </div>
      
      <div className="control-buttons">
        <button 
          className="record-btn" 
          onClick={onRecordMeasurement}
        >
          Record Measurement
        </button>
        <button 
          className="reset-btn" 
          onClick={onReset}
        >
          Reset Circuit
        </button>
      </div>
      
      <div className="ohms-law-formula">
        <h3>Ohm's Law:</h3>
        <div className="formula">V = I × R</div>
        <div className="formula">I = V ÷ R</div>
        <div className="formula">P = V × I</div>
      </div>
    </div>
  );
};

export default ControlPanel;