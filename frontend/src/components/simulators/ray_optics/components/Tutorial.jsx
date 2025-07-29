import React from 'react';
import './Tutorial.css';

const Tutorial = () => {
  return (
    <div className="tutorial-container">
      <div className="tutorial-section">
        <h2>How to Use This Simulator</h2>
        
        <div className="instruction-list">
          <div className="instruction-item">
            <div className="instruction-icon">1</div>
            <div className="instruction-content">
              <h3>Select an Optical Element</h3>
              <p>Choose from convex/concave lenses or mirrors to see how light behaves differently with each type.</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="instruction-icon">2</div>
            <div className="instruction-content">
              <h3>Adjust the Focal Length</h3>
              <p>Use the slider to change the focal length and observe how it affects the image formation.</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="instruction-icon">3</div>
            <div className="instruction-content">
              <h3>Change Object Position</h3>
              <p>Move the object closer or farther from the lens/mirror to see different image types form.</p>
            </div>
          </div>
          
          <div className="instruction-item">
            <div className="instruction-icon">4</div>
            <div className="instruction-content">
              <h3>Observe Ray Paths</h3>
              <p>Toggle ray visualization to understand how light rays travel and form images.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ray-rules-section">
        <h2>Ray Tracing Rules</h2>
        
        <div className="ray-rules-list">
          <div className="ray-rule">
            <div className="ray-color" style={{backgroundColor: '#f56565'}}></div>
            <div className="ray-description">
              <h3>Red Ray</h3>
              <p>Parallel to the principal axis, then passes through (or appears to come from) the focal point.</p>
            </div>
          </div>
          
          <div className="ray-rule">
            <div className="ray-color" style={{backgroundColor: '#68d391'}}></div>
            <div className="ray-description">
              <h3>Green Ray</h3>
              <p>Passes through the center of the lens or mirror and continues undeviated.</p>
            </div>
          </div>
          
          <div className="ray-rule">
            <div className="ray-color" style={{backgroundColor: '#4299e1'}}></div>
            <div className="ray-description">
              <h3>Blue Ray</h3>
              <p>Passes through (or appears to come from) the focal point, then travels parallel to the principal axis.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glossary-section">
        <h2>Key Concepts</h2>
        
        <div className="glossary-grid">
          <div className="glossary-item">
            <h3>Real Image</h3>
            <p>Forms when light rays actually converge; can be projected on a screen.</p>
          </div>
          
          <div className="glossary-item">
            <h3>Virtual Image</h3>
            <p>Forms when light rays appear to converge; cannot be projected on a screen.</p>
          </div>
          
          <div className="glossary-item">
            <h3>Magnification</h3>
            <p>The ratio of image height to object height, determining if the image is enlarged or diminished.</p>
          </div>
          
          <div className="glossary-item">
            <h3>Focal Length</h3>
            <p>The distance from the optical center to the focal point where parallel rays converge.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
