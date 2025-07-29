import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ 
  elementType, 
  focalLength, 
  objectDistance, 
  showRays, 
  showValues, 
  onElementChange, 
  onFocalLengthChange, 
  onObjectDistanceChange, 
  onToggleRays, 
  onToggleValues,
  visibleRays,
  onToggleRayVisibility
}) => {
  return (
    <div className="control-panel">
      <h2>Controls</h2>
      <div className="control-section">
        <div className="control-group">
          <label>Optical Element</label>
          <select 
            value={elementType} 
            onChange={onElementChange}
            className="element-selector"
          >
            <option value="convexLens">Convex Lens</option>
            <option value="concaveLens">Concave Lens</option>
            <option value="concaveMirror">Concave Mirror</option>
            <option value="convexMirror">Convex Mirror</option>
          </select>
        </div>
        
        <div className="control-group slider">
          <div className="slider-header">
            <label>Focal Length</label>
            <span className="value-display">{focalLength} cm</span>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="1" 
              value={focalLength}
              onChange={onFocalLengthChange}
            />
          </div>
        </div>
        
        <div className="control-group slider">
          <div className="slider-header">
            <label>Object Distance</label>
            <span className="value-display">{objectDistance} cm</span>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="1" 
              value={objectDistance}
              onChange={onObjectDistanceChange}
            />
          </div>
        </div>
      </div>
        <div className="toggle-section">
        <div className="toggle-group main-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={showRays} 
              onChange={onToggleRays}
            />
            <span className="toggle-label">Show Rays</span>
          </label>
        </div>
        
        {showRays && (
          <div className="ray-toggles">
            <div className="ray-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={visibleRays.parallel} 
                  onChange={() => onToggleRayVisibility('parallel')}
                />
                <span className="toggle-label">
                  <span className="ray-color-dot" style={{backgroundColor: '#f56565'}}></span>
                  Parallel Ray
                </span>
              </label>
            </div>
            
            <div className="ray-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={visibleRays.throughCenter} 
                  onChange={() => onToggleRayVisibility('throughCenter')}
                />
                <span className="toggle-label">
                  <span className="ray-color-dot" style={{backgroundColor: '#68d391'}}></span>
                  Through Center Ray
                </span>
              </label>
            </div>
            
            <div className="ray-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={visibleRays.throughFocus} 
                  onChange={() => onToggleRayVisibility('throughFocus')}
                />
                <span className="toggle-label">
                  <span className="ray-color-dot" style={{backgroundColor: '#4299e1'}}></span>
                  Through Focus Ray
                </span>
              </label>
            </div>
          </div>
        )}
        
        <div className="toggle-group">
          <label>
            <input 
              type="checkbox" 
              checked={showValues} 
              onChange={onToggleValues}
            />
            <span className="toggle-label">Show Values</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
