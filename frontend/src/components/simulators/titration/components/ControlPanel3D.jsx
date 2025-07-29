import React from "react";

const ControlPanel3D = ({ onAddTitrant, onReduceTitrant, onReset, onRecordMeasurement }) => {
  return (
    <div className="control-panel">
      <div className="control-group">
        <h3>Titrant Controls</h3>
        <div className="button-row">
          <button onClick={() => onAddTitrant(0.1)} className="btn-small">+ 0.1 mL</button>
          <button onClick={() => onAddTitrant(1)} className="btn-medium">+ 1 mL</button>
          <button onClick={() => onAddTitrant(5)} className="btn-large">+ 5 mL</button>
        </div>
        <div className="button-row">
          <button onClick={() => onReduceTitrant(0.1)} className="btn-small">- 0.1 mL</button>
          <button onClick={() => onReduceTitrant(1)} className="btn-medium">- 1 mL</button>
          <button onClick={() => onReduceTitrant(5)} className="btn-large">- 5 mL</button>
        </div>
      </div>
      
      <div className="action-buttons">
        <button onClick={onReset} className="reset-btn">Reset Experiment</button>
        <button onClick={onRecordMeasurement} className="record-btn">Record Data</button>
      </div>
    </div>
  );
};

export default ControlPanel3D;