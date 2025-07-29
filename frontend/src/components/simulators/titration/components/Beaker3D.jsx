import React from "react";

const Beaker3D = () => {
  return (
    <svg className="beaker-2d" viewBox="0 0 100 100">
      {/* Beaker outline */}
      <rect x="10" y="10" width="80" height="80" fill="transparent" stroke="#333" strokeWidth="2" rx="2" />
      
      {/* Water level */}
      <rect x="10" y="50" width="80" height="40" fill="#e3f2fd" opacity="0.5" />
      
      {/* Measurement marks */}
      <line x1="15" y1="30" x2="20" y2="30" stroke="#333" strokeWidth="1" />
      <line x1="15" y1="50" x2="20" y2="50" stroke="#333" strokeWidth="1" />
      <line x1="15" y1="70" x2="20" y2="70" stroke="#333" strokeWidth="1" />
      
      <text x="25" y="30" fontSize="6" textAnchor="start">250mL</text>
      <text x="25" y="50" fontSize="6" textAnchor="start">150mL</text>
      <text x="25" y="70" fontSize="6" textAnchor="start">50mL</text>
      
      {/* Label */}
      <text x="50" y="95" fontSize="8" textAnchor="middle" fill="black">Beaker</text>
    </svg>
  );
};

export default Beaker3D;