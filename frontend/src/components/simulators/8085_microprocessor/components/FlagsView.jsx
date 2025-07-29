import React from 'react';

/**
 * FlagsView component to display the current state of CPU flags
 */
const FlagsView = ({ flags }) => {
    const { Z, S, CY, P, AC } = flags;

    return (
        <div className="flags-view">
            <h3>Flags</h3>
            <div className="flags-container">
                <div className={`flag ${Z ? 'active' : ''}`}>
                    <span className="flag-label">Z</span>
                    <span className="flag-value">{Z ? '1' : '0'}</span>
                    <span className="flag-description">Zero</span>
                </div>
                <div className={`flag ${S ? 'active' : ''}`}>
                    <span className="flag-label">S</span>
                    <span className="flag-value">{S ? '1' : '0'}</span>
                    <span className="flag-description">Sign</span>
                </div>
                <div className={`flag ${CY ? 'active' : ''}`}>
                    <span className="flag-label">CY</span>
                    <span className="flag-value">{CY ? '1' : '0'}</span>
                    <span className="flag-description">Carry</span>
                </div>
                <div className={`flag ${P ? 'active' : ''}`}>
                    <span className="flag-label">P</span>
                    <span className="flag-value">{P ? '1' : '0'}</span>
                    <span className="flag-description">Parity</span>
                </div>
                <div className={`flag ${AC ? 'active' : ''}`}>
                    <span className="flag-label">AC</span>
                    <span className="flag-value">{AC ? '1' : '0'}</span>
                    <span className="flag-description">Aux Carry</span>
                </div>
            </div>
        </div>
    );
};

export default FlagsView;
