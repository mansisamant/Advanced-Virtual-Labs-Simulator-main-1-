import React, { useState, useEffect } from 'react';

/**
 * Editor component for writing and editing 8085 assembly code
 */
const Editor = ({ onLoad, initialCode = '' }) => {
    const [code, setCode] = useState(initialCode);
    const [error, setError] = useState('');

    // Update code when initialCode prop changes
    useEffect(() => {
        if (initialCode && initialCode.trim() !== '') {
            setCode(initialCode);
        }
    }, [initialCode]);

    // Handle code changes
    const handleCodeChange = (e) => {
        setCode(e.target.value);
        setError('');
    };

    // Handle loading of code into the simulator
    const handleLoad = () => {
        if (code.trim() === '') {
            setError('Please enter some code');
            return;
        }
        
        try {
            onLoad(code);
            setError('');
        } catch (e) {
            setError(`Error loading code: ${e.message}`);
        }
    };

    // Sample code for user convenience
    const loadSampleCode = () => {
        const sampleCode = `; Sample 8085 program
; This program adds two values and stores the result
MVI A, 05H       ; Load 5 into A
MVI B, 0AH       ; Load 10 into B
ADD B            ; Add B to A (A = A + B)
STA 2100H        ; Store A to memory location 2100H
HLT              ; Stop execution`;

        setCode(sampleCode);
        setError('');
    };

    // Clear the editor
    const handleClear = () => {
        setCode('');
        setError('');
    };    return (
        <div className="editor-container">
            <div className="editor-header">
                <h3>Assembly Editor</h3>
                <div className="editor-actions">
                    <button onClick={loadSampleCode} className="btn btn-secondary">
                        Load Sample
                    </button>
                    <button onClick={handleClear} className="btn btn-secondary">
                        Clear
                    </button>
                    <button onClick={handleLoad} className="btn btn-primary">
                        Assemble & Load
                    </button>
                </div>
            </div>
            <textarea
                className="editor"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter 8085 assembly code here..."
                spellCheck="false"
                rows={12}
            />
            {error && <div className="editor-error">{error}</div>}
            <div className="editor-footer">
                <div>
                    <span>8085 assembly | Use semicolon (;) for comments</span>
                </div>
                <div>
                    <span>{code.split('\n').length} lines</span>
                </div>
            </div>
        </div>
    );
};

export default Editor;
