import React from "react";

const Flask3D = ({ reactionComplete, selectedAcid }) => {
  // Flask color based on chemical and endpoint
  const getColor = () => {
    if (reactionComplete) return "pink";
    switch (selectedAcid) {
      case "HCl": return "lightblue";
      case "H2SO4": return "yellow";
      case "CH3COOH": return "lightgreen";
      default: return "lightblue";
    }
  };

  return (
    <svg className="flask-2d" viewBox="0 0 100 120">
      {/* Flask outline */}
      <path
        d="M40 10 L60 10 L70 80 Q50 110 30 80 Z"
        fill="#fff"
        stroke="#333"
        strokeWidth="2"
      />
      {/* Flask liquid */}
      <path
        d="M70 80 Q50 110 30 80 Q50 90 70 80 Z"
        fill={getColor()}
        opacity="0.8"
      />
      {/* Flask neck */}
      <rect x="44" y="0" width="12" height="15" fill="#fff" stroke="#333" strokeWidth="2" rx="4" />
      
      {/* Measurement marks */}
      <line x1="35" y1="30" x2="40" y2="30" stroke="#333" strokeWidth="1" />
      <line x1="35" y1="50" x2="40" y2="50" stroke="#333" strokeWidth="1" />
      <line x1="35" y1="70" x2="40" y2="70" stroke="#333" strokeWidth="1" />
      
      <text x="28" y="30" fontSize="6" textAnchor="end">100mL</text>
      <text x="28" y="50" fontSize="6" textAnchor="end">50mL</text>
      <text x="28" y="70" fontSize="6" textAnchor="end">25mL</text>
      
      {/* Label */}
      <text x="50" y="60" fontSize="6" textAnchor="middle" fill="black">Conical Flask</text>
    </svg>
  );
};

export default Flask3D;