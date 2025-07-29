import React from "react";

const Liquid3D = ({ volume, reactionComplete, selectedAcid, position }) => {
  // Liquid color based on chemical and endpoint
  const getColor = () => {
    if (reactionComplete) return "pink";
    switch (selectedAcid) {
      case "HCl": return "lightblue";
      case "H2SO4": return "yellow";
      case "CH3COOH": return "lightgreen";
      default: return "lightblue";
    }
  };

  const getDropPosition = () => {
    // Calculate drop position relative to flask position
    return {
      left: position.x + 50,
      top: position.y - 20
    };
  };

  // Dripping effect when volume is being added
  const dropPosition = getDropPosition();
  const dropVisible = volume > 0 && !reactionComplete;
  const dropStyle = {
    position: "absolute", 
    left: dropPosition.left,
    top: dropPosition.top,
    pointerEvents: "none",
    display: dropVisible ? "block" : "none"
  };

  return (
    <>
      {/* Liquid in flask - position is calculated from the flask position */}
      <svg className="liquid-2d" viewBox="0 0 100 120" style={{ 
        position: "absolute", 
        left: position.x, 
        top: position.y, 
        pointerEvents: "none" 
      }}>
        <path
          d="M35 80 Q50 110 65 80 L65 80 L35 80"
          fill={getColor()}
          opacity="0.8"
        />
      </svg>
      
      {/* Dripping effect */}
      <svg width="10" height="20" style={dropStyle}>
        <circle cx="5" cy="5" r="3" fill="#2196f3" />
        <animate 
          attributeName="cy" 
          from="5" 
          to="15" 
          dur="1s" 
          repeatCount="indefinite" />
      </svg>
    </>
  );
};

export default Liquid3D;