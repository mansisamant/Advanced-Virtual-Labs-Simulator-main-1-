import React from "react";

const Resistor = ({ resistor, onTerminalClick, onDragStart, activeTerminals }) => {
  return (
    <div
      className={`component resistor ${resistor.connected ? 'connected' : ''}`}
      style={{ top: resistor.position.y, left: resistor.position.x }}
      onMouseDown={onDragStart}
    >
      <div 
        className={`terminal terminal-left ${activeTerminals.includes(`resistor_${resistor.id}_left`) ? 'connected' : ''}`}
        id={`resistor_${resistor.id}_left`}
        onClick={(e) => onTerminalClick(`resistor_${resistor.id}_left`, e)}
      ></div>
      
      <div className="component-body">
        <div className="resistor-symbol">
          <div className="zigzag"></div>
        </div>
        <div className="component-label">Resistor</div>
        <div className="component-value">{resistor.value} Ω</div>
      </div>
      
      <div 
        className={`terminal terminal-right ${activeTerminals.includes(`resistor_${resistor.id}_right`) ? 'connected' : ''}`}
        id={`resistor_${resistor.id}_right`}
        onClick={(e) => onTerminalClick(`resistor_${resistor.id}_right`, e)}
      ></div>
    </div>
  );
};

export default Resistor;