import React from "react";

const Ammeter = ({ ammeter, current, onTerminalClick, onDragStart, activeTerminals }) => {
  return (
    <div
      className={`component ammeter ${ammeter.connected ? 'connected' : ''}`}
      style={{ top: ammeter.position.y, left: ammeter.position.x }}
      onMouseDown={onDragStart}
    >
      <div 
        className={`terminal terminal-left ${activeTerminals.includes(`ammeter_${ammeter.id}_left`) ? 'connected' : ''}`}
        id={`ammeter_${ammeter.id}_left`}
        onClick={(e) => onTerminalClick(`ammeter_${ammeter.id}_left`, e)}
      ></div>
      
      <div className="component-body">
        <div className="ammeter-symbol">
          <div className="meter-circle"></div>
          <div className="meter-needle" 
            style={{ transform: `rotate(${Math.min(90, current * 900)}deg)` }}
          ></div>
          <div className="meter-label">A</div>
        </div>
        <div className="component-label">Ammeter</div>
        <div className="component-value">{current.toFixed(3)} A</div>
      </div>
      
      <div 
        className={`terminal terminal-right ${activeTerminals.includes(`ammeter_${ammeter.id}_right`) ? 'connected' : ''}`}
        id={`ammeter_${ammeter.id}_right`}
        onClick={(e) => onTerminalClick(`ammeter_${ammeter.id}_right`, e)}
      ></div>
    </div>
  );
};

export default Ammeter;