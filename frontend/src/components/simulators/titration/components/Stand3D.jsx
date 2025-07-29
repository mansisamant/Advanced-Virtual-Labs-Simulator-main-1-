import React from "react";

const Stand3D = () => {
  return (
    <svg className="stand-2d" viewBox="0 0 100 400">
      {/* Base */}
      <rect x="10" y="370" width="80" height="20" fill="#8d6e63" rx="3" />
      
      {/* Vertical rod */}
      <rect x="48" y="50" width="4" height="320" fill="#5d4037" />
      
      {/* Horizontal support */}
      <rect x="48" y="70" width="40" height="4" fill="#5d4037" />
      
      {/* Clamp */}
      <circle cx="85" cy="72" r="5" fill="#4e342e" />
      
      <text x="50" y="395" fontSize="10" textAnchor="middle" fill="black">Stand</text>
    </svg>
  );
};

export default Stand3D;