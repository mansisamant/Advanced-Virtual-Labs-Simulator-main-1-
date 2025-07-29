import React, { useState, useEffect } from 'react';

/**
 * MemoryView component to display and interact with the memory
 */
const MemoryView = ({ memory, getMemory, memoryUpdateTrigger }) => {
    const [startAddress, setStartAddress] = useState('2100');
    const [memoryData, setMemoryData] = useState({});
    const [error, setError] = useState('');

    // Format a byte value to hexadecimal with padding
    const formatByte = (value) => {
        if (typeof value === 'string') return value;
        return value.toString(16).padStart(2, '0').toUpperCase();
    };

    // Convert and validate hexadecimal input
    const handleAddressChange = (e) => {
        const input = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
        setStartAddress(input);
        setError('');
        
        // Auto-update when typing
        updateMemoryView(input);
    };
    
    // Update memory view with current address
    const updateMemoryView = (addressInput = startAddress) => {
        try {
            const address = parseInt(addressInput, 16);
            if (isNaN(address) || address < 0 || address > 0xFFFF) {
                setError('Invalid address. Must be between 0000H and FFFFH');
                return;
            }
            
            const memoryRange = getMemory(address, 64);
            setMemoryData(memoryRange);
            setError('');
        } catch (e) {
            setError(`Error: ${e.message}`);
        }
    };

    // View memory at the specified address
    const handleViewMemory = () => {
        updateMemoryView();
    };
    
    // Update memory view whenever CPU state changes or on reset
    useEffect(() => {
        updateMemoryView();
    }, [memoryUpdateTrigger]);    return (
        <div className="memory-view">
            <h3>Memory View</h3>
            <div className="memory-controls">
                <div className="address-input">
                    <label htmlFor="memory-address">Address:</label>
                    <input
                        id="memory-address"
                        type="text"
                        value={startAddress}
                        onChange={handleAddressChange}
                        maxLength={4}
                        placeholder="0000"
                    />
                    <span className="address-suffix">H</span>
                </div>
                <button onClick={handleViewMemory} className="btn btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16" style={{marginRight: '5px'}}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                    View
                </button>
            </div>
            
            {error && <div className="memory-error">{error}</div>}
            
            <div className="memory-container">
                <table className="memory-table">
                    <thead>
                        <tr>
                            <th></th>
                            {[...Array(16).keys()].map(i => (
                                <th key={i}>{i.toString(16).toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(memoryData).length > 0 &&                            [...Array(4).keys()].map(row => {
                                const baseAddress = parseInt(startAddress, 16) + (row * 16);
                                const rowPrefix = baseAddress.toString(16).padStart(4, '0').toUpperCase();
                                
                                return (
                                    <tr key={rowPrefix}>
                                        <td className="address-cell">{rowPrefix}</td>                                        {[...Array(16).keys()].map(col => {
                                            const address = (baseAddress + col).toString(16).padStart(4, '0').toUpperCase();
                                            // Always show '00' for empty cells to make it clear memory is zeroed
                                            return (
                                                <td key={col} className={`memory-cell ${memoryData[address] && memoryData[address] !== 0 ? 'has-value' : ''}`}>
                                                    {memoryData[address] !== undefined ? formatByte(memoryData[address]) : '00'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        }
                        {Object.keys(memoryData).length === 0 && (
                            <tr>
                                <td colSpan="17" className="memory-empty">
                                    Enter an address and click "View Memory"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemoryView;
