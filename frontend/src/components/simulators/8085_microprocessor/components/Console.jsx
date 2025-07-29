import React, { useEffect, useRef } from 'react';

/**
 * Console component to display execution logs and messages
 */
const Console = ({ logs, onRun, onStep, onReset, isHalted, isRunning }) => {
    const consoleEndRef = useRef(null);
    
    // Auto-scroll to the bottom when new logs are added
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);
    
    return (
        <div className="console-view">            <div className="console-header">
                <h3>Console Output</h3>
                <div className="control-buttons">
                    <button 
                        onClick={onRun} 
                        className="btn btn-primary"
                        disabled={isHalted || isRunning}
                        title="Run the entire program"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg> Run
                    </button>
                    <button 
                        onClick={onStep} 
                        className="btn btn-secondary"
                        disabled={isHalted || isRunning}
                        title="Execute a single instruction"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                            <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                        </svg>
                        Step
                    </button>
                    <button 
                        onClick={onReset} 
                        className="btn btn-danger"
                        title="Reset the simulator"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                            <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                        </svg>
                        Reset
                    </button>
                    <div className="execution-status">
                        {isHalted && <span className="status halted">CPU Halted</span>}
                        {isRunning && <span className="status running">Running...</span>}
                        {!isHalted && !isRunning && <span className="status ready">Ready</span>}
                    </div>
                </div>
            </div>
            <div className="console-container">
                {logs.length === 0 ? (
                    <div className="console-empty">Console output will appear here when you run code...</div>
                ) : (
                    <div className="console-output">
                        {logs.map((log, index) => (
                            <div key={index} className="console-line">
                                <span className="console-prompt">{'>'}</span>
                                <span className={`console-message ${log.type || 'info'}`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Console;
