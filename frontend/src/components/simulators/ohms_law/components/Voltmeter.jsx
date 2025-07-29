import React from "react";

const Voltmeter = ({ voltmeter, voltage, onTerminalClick, onDragStart, activeTerminals }) => {
  return (
    <div
      className={`component voltmeter ${voltmeter.connected ? 'connected' : ''}`}
      style={{ top: voltmeter.position.y, left: voltmeter.position.x }}
      onMouseDown={onDragStart}
    >
      <div 
        className={`terminal terminal-left ${activeTerminals.includes(`voltmeter_${voltmeter.id}_left`) ? 'connected' : ''}`}
        id={`voltmeter_${voltmeter.id}_left`}
        onClick={(e) => onTerminalClick(`voltmeter_${voltmeter.id}_left`, e)}
      ></div>
      
      <div className="component-body">
        <div className="voltmeter-symbol">
          <div className="meter-circle"></div>
          <div className="meter-needle"
            style={{ transform: `rotate(${Math.min(90, voltage * 7.5)}deg)` }}
          ></div>
          <div className="meter-label">V</div>
        </div>
        <div className="component-label">Voltmeter</div>
        <div className="component-value">{voltage.toFixed(2)} V</div>
      </div>
      
      <div 
        className={`terminal terminal-right ${activeTerminals.includes(`voltmeter_${voltmeter.id}_right`) ? 'connected' : ''}`}
        id={`voltmeter_${voltmeter.id}_right`}
        onClick={(e) => onTerminalClick(`voltmeter_${voltmeter.id}_right`, e)}
      ></div>
    </div>
  );
};

export default Voltmeter;