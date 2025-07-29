import React from 'react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ imageProps, objectDistance, focalLength }) => {
  // Function to determine the badge class based on image type
  const getBadgeClass = (property) => {
    if (!imageProps.distance) return '';
    
    switch (property) {
      case 'real':
        return imageProps.isReal ? 'badge-success' : 'badge-purple';
      case 'inverted':
        return imageProps.isInverted ? 'badge-warning' : 'badge-success';
      case 'size':
        return imageProps.isEnlarged ? 'badge-info' : 'badge-secondary';
      default:
        return '';
    }
  };
  
  // Function to get text for image type
  const getImageTypeText = (property) => {
    if (!imageProps.distance) return '';
    
    switch (property) {
      case 'real':
        return imageProps.isReal ? 'Real' : 'Virtual';
      case 'inverted':
        return imageProps.isInverted ? 'Inverted' : 'Upright';
      case 'size':
        return imageProps.isEnlarged ? 'Enlarged' : 'Diminished';
      default:
        return '';
    }
  };
  
  return (
    <div className="properties-panel">
      <h2>Image Properties</h2>
      
      <div className="properties-badges">
        <span className={`badge ${getBadgeClass('real')}`}>
          {getImageTypeText('real')}
        </span>
        <span className={`badge ${getBadgeClass('inverted')}`}>
          {getImageTypeText('inverted')}
        </span>
        <span className={`badge ${getBadgeClass('size')}`}>
          {getImageTypeText('size')}
        </span>
      </div>
      
      <div className="properties-table">
        <div className="property-row">
          <div className="property-label">Object Distance (u)</div>
          <div className="property-value">{objectDistance} cm</div>
        </div>
        
        <div className="property-row">
          <div className="property-label">Image Distance (v)</div>
          <div className="property-value">
            {imageProps.distance ? 
              `${Math.abs(imageProps.distance).toFixed(2)} cm` : 
              'Not defined'}
          </div>
        </div>
        
        <div className="property-row">
          <div className="property-label">Focal Length (f)</div>
          <div className="property-value">{focalLength} cm</div>
        </div>
        
        <div className="property-row highlight">
          <div className="property-label">Magnification</div>
          <div className="property-value">
            {imageProps.magnification ? 
              `${Math.abs(imageProps.magnification).toFixed(2)}x` : 
              'Not defined'}
          </div>
        </div>
      </div>
      
      <div className="formula-section">
        <h3>Formulas Used</h3>
        <div className="formula">
          <div className="formula-name">Lens/Mirror Equation:</div>
          <div className="formula-expression">1/f = 1/v ± 1/u</div>
        </div>
        <div className="formula">
          <div className="formula-name">Magnification:</div>
          <div className="formula-expression">M = -v/u</div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
