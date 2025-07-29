import React from "react";
import Resistor from "./Resistor";
import Ammeter from "./Ammeter";
import Voltmeter from "./Voltmeter";
import WireConnection from "./WireConnection";

const CircuitBoard = ({
  components,
  connections,
  activeConnection,
  startConnection,
  completeConnection,
  startDragging,
  activeTerminals,
  circuitComplete,
  current,
  voltage
}) => {
  // Render all wire connections
  const renderConnections = () => {
    return connections.map((conn) => (
      <WireConnection
        key={conn.id}
        connection={conn}
        active={true}
        current={circuitComplete ? current : 0}
      />
    ));
  };

  // Render the active connection being drawn
  const renderActiveConnection = () => {
    if (!activeConnection) return null;
    
    return (
      <line
        x1={activeConnection.startPos.x}
        y1={activeConnection.startPos.y}
        x2={activeConnection.currentPos.x}
        y2={activeConnection.currentPos.y}
        stroke="#ff6700"
        strokeWidth="3"
        strokeDasharray="5,5"
        strokeLinecap="round"
      />
    );
  };

  return (
    <>
      {/* SVG layer for connections */}
      <svg className="circuit-svg">
        {renderConnections()}
        {renderActiveConnection()}
      </svg>
      
      {/* Power Source */}
      <div 
        className="component power-source" 
        style={{ top: components.powerSource.position.y, left: components.powerSource.position.x }}
        onMouseDown={(e) => startDragging(e, 'powerSource', 'ps1')}
      >
        <div className="component-body">
          <div className="battery-symbol">
            <div className="battery-cell"></div>
            <div className="battery-cell"></div>
          </div>
          <div className="component-label">Power Source</div>
          <div className="component-value">{voltage.toFixed(1)} V</div>
        </div>
        <div 
          className={`terminal terminal-positive ${activeTerminals.includes('power_ps1_pos') ? 'connected' : ''}`}
          id="power_ps1_pos"
          onClick={(e) => {
            e.stopPropagation();
            activeConnection ? completeConnection('power_ps1_pos') : startConnection('power_ps1_pos');
          }}
        ></div>
        <div 
          className={`terminal terminal-negative ${activeTerminals.includes('power_ps1_neg') ? 'connected' : ''}`}
          id="power_ps1_neg"
          onClick={(e) => {
            e.stopPropagation();
            activeConnection ? completeConnection('power_ps1_neg') : startConnection('power_ps1_neg');
          }}
        ></div>
      </div>
      
      {/* Resistors */}
      {components.resistors.map(resistor => (
        <Resistor
          key={resistor.id}
          resistor={resistor}
          onTerminalClick={(terminalId, e) => {
            e.stopPropagation();
            activeConnection ? completeConnection(terminalId) : startConnection(terminalId);
          }}
          onDragStart={(e) => startDragging(e, 'resistor', resistor.id)}
          activeTerminals={activeTerminals}
        />
      ))}
      
      {/* Ammeter */}
      <Ammeter
        ammeter={components.ammeter}
        current={circuitComplete ? current : 0}
        onTerminalClick={(terminalId, e) => {
          e.stopPropagation();
          activeConnection ? completeConnection(terminalId) : startConnection(terminalId);
        }}
        onDragStart={(e) => startDragging(e, 'ammeter', 'a1')}
        activeTerminals={activeTerminals}
      />
      
      {/* Voltmeter */}
      <Voltmeter
        voltmeter={components.voltmeter}
        voltage={circuitComplete ? voltage : 0}
        onTerminalClick={(terminalId, e) => {
          e.stopPropagation();
          activeConnection ? completeConnection(terminalId) : startConnection(terminalId);
        }}
        onDragStart={(e) => startDragging(e, 'voltmeter', 'v1')}
        activeTerminals={activeTerminals}
      />
    </>
  );
};

export default CircuitBoard;