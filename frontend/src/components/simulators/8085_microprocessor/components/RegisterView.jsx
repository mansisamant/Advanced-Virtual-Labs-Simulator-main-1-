import React from 'react';

/**
 * RegisterView component to display the current state of CPU registers
 */
const RegisterView = ({ registers }) => {
    const { A, B, C, D, E, H, L, PC, SP } = registers;

    // Format a byte value to hexadecimal with padding
    const formatByte = (value) => {
        return value.toString(16).padStart(2, '0').toUpperCase() + 'H';
    };

    // Format a word value (16-bit) to hexadecimal with padding
    const formatWord = (value) => {
        return value.toString(16).padStart(4, '0').toUpperCase() + 'H';
    };

    return (
        <div className="register-view">
            <h3>Registers</h3>
            <div className="register-container">
                <div className="register-group">
                    <div className="register">
                        <span className="register-label">A</span>
                        <span className="register-value">{formatByte(A)}</span>
                    </div>
                    <div className="register-pair">
                        <div className="register">
                            <span className="register-label">B</span>
                            <span className="register-value">{formatByte(B)}</span>
                        </div>
                        <div className="register">
                            <span className="register-label">C</span>
                            <span className="register-value">{formatByte(C)}</span>
                        </div>
                    </div>
                    <div className="register-pair">
                        <div className="register">
                            <span className="register-label">D</span>
                            <span className="register-value">{formatByte(D)}</span>
                        </div>
                        <div className="register">
                            <span className="register-label">E</span>
                            <span className="register-value">{formatByte(E)}</span>
                        </div>
                    </div>
                    <div className="register-pair">
                        <div className="register">
                            <span className="register-label">H</span>
                            <span className="register-value">{formatByte(H)}</span>
                        </div>
                        <div className="register">
                            <span className="register-label">L</span>
                            <span className="register-value">{formatByte(L)}</span>
                        </div>
                    </div>
                    <div className="register-group special-registers">
                        <div className="register">
                            <span className="register-label">PC</span>
                            <span className="register-value">{formatWord(PC)}</span>
                        </div>
                        <div className="register">
                            <span className="register-label">SP</span>
                            <span className="register-value">{formatWord(SP)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;
