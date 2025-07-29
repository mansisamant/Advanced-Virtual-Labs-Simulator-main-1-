import React from "react";

const Burette2D = ({ volume }) => {
  return (
    <svg className="burette-2d" viewBox="0 0 100 400">
      {/* Burette tube */}
      <rect x="40" y="0" width="20" height="350" fill="#b0b0b0" rx="8" />
      {/* Liquid in burette */}
      <rect x="42" y={350 - volume * 12} width="16" height={volume * 12} fill="#2196f3" rx="6" />
      {/* Stopcock */}
      <rect x="45" y="350" width="10" height="15" fill="#888" />
      {/* Volume label */}
      <text x="50" y="30" textAnchor="middle" fill="#333" fontSize="16" fontWeight="bold">
        {volume} mL
      </text>
      {/* Burette clamp */}
      <rect x="30" y="60" width="40" height="10" fill="#8d5524" rx="3" />
      {/* Stand */}
      <rect x="48" y="0" width="4" height="370" fill="#444" />
      {/* Base */}
      <rect x="30" y="365" width="40" height="20" fill="#a0522d" rx="5" />
    </svg>
  );
};

export default Burette2D;