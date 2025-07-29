import React from 'react';
import './Header.css';

const Header = ({ title, explanationTip }) => {
  return (
    <header className="simulator-header">
      <h1>{title}</h1>
      
      {explanationTip && (
        <div className="explanation-tip">
          <span className="tip-icon">💡</span>
          <span>{explanationTip}</span>
        </div>
      )}
    </header>
  );
};

export default Header;
