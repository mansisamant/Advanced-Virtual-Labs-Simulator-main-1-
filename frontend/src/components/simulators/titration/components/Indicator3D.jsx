import React from "react";

const Indicator3D = ({ reactionComplete }) => {
  return (
    <div className="indicator-3d">
      <div
        className={`indicator-color ${
          reactionComplete ? "color-changed" : "original-color"
        }`}
      >
        {reactionComplete ? "Neutralized (Pink)" : "Acidic (Colorless)"}
      </div>
    </div>
  );
};

export default Indicator3D;