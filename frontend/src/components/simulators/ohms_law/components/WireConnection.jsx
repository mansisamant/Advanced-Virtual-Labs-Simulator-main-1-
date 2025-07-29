import React from "react";

const WireConnection = ({ connection, active, current }) => {
  // Determine wire color based on current
  const getWireColor = () => {
    if (!active) return "#ccc";
    if (current === 0) return "#333";
    
    // Color based on current intensity
    if (current < 0.05) return "#6495ED"; // Low current
    if (current < 0.1) return "#1E90FF";  // Medium current
    return "#0000FF";                     // High current
  };

  const getWireWidth = () => {
    if (!active) return 2;
    if (current === 0) return 3;
    
    // Width based on current intensity
    return Math.max(3, Math.min(6, current * 20));
  };

  return (
    <line
      x1={connection.startPos.x}
      y1={connection.startPos.y}
      x2={connection.endPos.x}
      y2={connection.endPos.y}
      stroke={getWireColor()}
      strokeWidth={getWireWidth()}
      strokeLinecap="round"
    />
  );
};

export default WireConnection;