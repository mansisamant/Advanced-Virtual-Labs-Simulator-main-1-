import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import RegisterView from './components/RegisterView';
import FlagsView from './components/FlagsView';
import MemoryView from './components/MemoryView';
import Console from './components/Console';
import ExperimentData from './components/ExperimentData';
import CPU from './logic/CPU';
import Assembler from './logic/Assembler';
import './simulator8085.css';
import './components/ExperimentData.css';

const Simulator = () => {
    // Initialize CPU and Assembler
    const [cpu] = useState(new CPU());
    const [assembler] = useState(new Assembler());
    
    // State for parsed program
    const [program, setProgram] = useState([]);
    const [currentInstruction, setCurrentInstruction] = useState(null);
    
    // CPU state
    const [cpuState, setCpuState] = useState({
        registers: cpu.registers,
        flags: cpu.flags,
        halted: false,
        running: false
    });
    
    // Memory update trigger for real-time memory view updates
    const [memoryUpdateTrigger, setMemoryUpdateTrigger] = useState(0);
    
    // Console logs
    const [logs, setLogs] = useState([]);
    
    // Add a log message to the console
    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
    };
    
    // Handle code loading
    const handleLoadCode = (code) => {
        try {
            // Parse the code
            const parsedProgram = assembler.parseCode(code);
            
            // Reset CPU
            cpu.reset();
            
            // Check for errors
            const errors = parsedProgram.filter(instruction => instruction.error);
            if (errors.length > 0) {
                addLog(`Parsing errors found:`, 'error');
                errors.forEach(error => {
                    addLog(`Line ${error.lineNumber}: ${error.errorMessage}`, 'error');
                });
                return;
            }
            
            setProgram(parsedProgram);
            setCurrentInstruction(parsedProgram.length > 0 ? 0 : null);
              // Update CPU state
            setCpuState({
                registers: { ...cpu.registers },
                flags: { ...cpu.flags },
                halted: false,
                running: false
            });
            
            // Trigger memory view update
            setMemoryUpdateTrigger(prev => prev + 1);
            
            addLog(`Code loaded: ${parsedProgram.length} instructions ready for execution`, 'success');
        } catch (error) {
            addLog(`Failed to load code: ${error.message}`, 'error');
        }
    };
    
    // Execute a single instruction
    const executeStep = () => {
        if (currentInstruction === null || currentInstruction >= program.length || cpu.halted) {
            return;
        }
        
        try {
            // Get the current instruction
            const instruction = program[currentInstruction];
            
            // Execute it
            const result = cpu.executeInstruction(instruction);
            
            // Log the result
            if (result.executed) {
                addLog(`Executed: ${instruction.raw}`, 'info');
            } else {
                addLog(result.message, 'error');
            }
            
            // Update the current instruction
            if (instruction.mnemonic === 'JMP') {
                // For JMP, find the instruction at the jump address
                const jumpAddress = parseInt(instruction.operands[0], 16);
                const nextInstructionIndex = program.findIndex(inst => inst.address === jumpAddress);
                setCurrentInstruction(nextInstructionIndex !== -1 ? nextInstructionIndex : null);
            } else if (!cpu.halted) {
                // For other instructions, move to the next one
                setCurrentInstruction(prev => prev + 1);
            }
              // Update CPU state
            setCpuState({
                registers: { ...cpu.registers },
                flags: { ...cpu.flags },
                halted: cpu.halted,
                running: cpu.running
            });
            
            // Trigger memory view update
            setMemoryUpdateTrigger(prev => prev + 1);
            
            // If we reached the end of the program
            if (currentInstruction + 1 >= program.length && !cpu.halted) {
                addLog('Program execution completed', 'success');
                cpu.halted = true;
            }
        } catch (error) {
            addLog(`Execution error: ${error.message}`, 'error');
            cpu.halted = true;
            setCpuState(prev => ({ ...prev, halted: true }));
        }
    };
      // Run the entire program
    const runProgram = () => {
        if (program.length === 0 || currentInstruction === null || cpu.halted) {
            return;
        }
        
        setCpuState(prev => ({ ...prev, running: true }));
        
        // Use setTimeout to allow UI to update before execution
        setTimeout(() => {
            try {
                // Create a local copy of program instructions for execution
                const programLength = program.length;
                let currentInstrIndex = currentInstruction;
                let isHalted = cpu.halted;

                // Execute until halted or end of program
                while (currentInstrIndex !== null && currentInstrIndex < programLength && !isHalted) {
                    // Get the current instruction
                    const instruction = program[currentInstrIndex];
                    
                    // Execute it
                    const result = cpu.executeInstruction(instruction);
                    
                    // Log the result
                    if (result.executed) {
                        addLog(`Executed: ${instruction.raw}`, 'info');
                    } else {
                        addLog(result.message, 'error');
                    }
                    
                    // Handle JMP instruction or move to next instruction
                    if (instruction.mnemonic === 'JMP') {
                        const jumpAddress = parseInt(instruction.operands[0], 16);
                        const nextInstructionIndex = program.findIndex(inst => inst.address === jumpAddress);
                        currentInstrIndex = nextInstructionIndex !== -1 ? nextInstructionIndex : null;
                    } else if (!cpu.halted) {
                        // For other instructions, move to the next one
                        currentInstrIndex++;
                    }
                    
                    // Update halt status
                    isHalted = cpu.halted;
                    
                    // If we reached the end of the program
                    if (currentInstrIndex >= programLength && !isHalted) {
                        cpu.halted = true;
                        isHalted = true;
                    }
                }
                  // Update the current instruction state after completing execution
                setCurrentInstruction(currentInstrIndex);
                
                // Trigger memory view update after all instructions have been executed
                setMemoryUpdateTrigger(prev => prev + 1);
                
                addLog('Program execution completed', 'success');
            } catch (error) {
                addLog(`Runtime error: ${error.message}`, 'error');
            } finally {
                setCpuState(prev => ({ ...prev, running: false }));
            }
        }, 100);
    };    // Reset the simulator
    const resetSimulator = () => {
        cpu.reset();
        setCurrentInstruction(program.length > 0 ? 0 : null);
        setCpuState({
            registers: { ...cpu.registers },
            flags: { ...cpu.flags },
            halted: false,
            running: false
        });
        // Trigger memory view update to show zeroed memory
        setMemoryUpdateTrigger(prev => prev + 1);
        addLog('Simulator reset - memory cleared to zeros', 'info');
    };
    
    // Get memory range from CPU
    const getMemory = (start, length) => {
        return cpu.getMemory(start, length);
    };
    
    // Add state for editor code
    const [editorCode, setEditorCode] = useState('');
    
    // Handle loading a saved experiment
    const handleLoadSavedExperiment = (experimentData) => {
        try {
            // Reset the CPU first
            cpu.reset();
            
            // Load the program from the saved data
            if (experimentData.input && experimentData.input.program) {
                // Convert saved program back to code for the editor
                const regeneratedCode = regenerateCodeFromInstructions(experimentData.input.program);
                setEditorCode(regeneratedCode); // Set editor code state
                
                // Set the program in state
                setProgram(experimentData.input.program);
                setCurrentInstruction(experimentData.input.program.length > 0 ? 0 : null);
                
                addLog(`Loaded program with ${experimentData.input.program.length} instructions`, 'info');
            }
            
            // Load CPU state from the saved data
            if (experimentData.output) {
                // Update registers if they exist in the saved data
                if (experimentData.output.registers) {
                    Object.keys(experimentData.output.registers).forEach(reg => {
                        cpu.registers[reg] = experimentData.output.registers[reg];
                    });
                    addLog('Restored CPU registers', 'info');
                }
                
                // Update flags if they exist in the saved data
                if (experimentData.output.flags) {
                    Object.keys(experimentData.output.flags).forEach(flag => {
                        cpu.flags[flag] = experimentData.output.flags[flag];
                    });
                    addLog('Restored CPU flags', 'info');
                }
                
                // Load memory if it exists in the saved data
                if (experimentData.output.memory) {
                    // Restore memory state
                    for (let address in experimentData.output.memory) {
                        const numAddress = parseInt(address, 10);
                        cpu.memory[numAddress] = experimentData.output.memory[address];
                    }
                    addLog('Restored memory state', 'info');
                }
            }
            
            // Update CPU state in the UI
            setCpuState({
                registers: { ...cpu.registers },
                flags: { ...cpu.flags },
                halted: false,
                running: false
            });
            
            // Trigger memory view update to reflect the loaded memory state
            setMemoryUpdateTrigger(prev => prev + 1);
            
            addLog('Successfully loaded saved experiment state', 'success');
        } catch (error) {
            addLog(`Error loading saved experiment: ${error.message}`, 'error');
            console.error('Error loading saved experiment:', error);
        }
    };
    
    // Helper function to regenerate code from saved program instructions
    const regenerateCodeFromInstructions = (instructions) => {
        if (!instructions || !instructions.length) return '';
        
        // Sort instructions by address to ensure correct order
        const sortedInstructions = [...instructions].sort((a, b) => {
            return parseInt(a.address, 16) - parseInt(b.address, 16);
        });
        
        // Convert instructions back to code
        return sortedInstructions.map(instr => {
            // Format might vary based on your assembler format
            if (instr.raw) return instr.raw;
            
            // Fallback if raw isn't available - reconstruct from mnemonic and operands
            if (instr.mnemonic) {
                if (instr.operands && instr.operands.length > 0) {
                    return `${instr.mnemonic} ${instr.operands.join(', ')}`;
                }
                return instr.mnemonic;
            }
            
            return ''; // Empty string if we can't reconstruct
        }).join('\n');
    };
    
    // Update the CPU state whenever it changes
    useEffect(() => {
        setCpuState({
            registers: { ...cpu.registers },
            flags: { ...cpu.flags },
            halted: cpu.halted,
            running: cpu.running
        });
    }, [cpu.registers, cpu.flags, cpu.halted, cpu.running]);      
    
    
    return (
        <div className="simulator-page">
            <div className="simulator">
                <div className="simulator-header">
                    <h2>8085 Microprocessor Simulator</h2>
                    <p className="simulator-subtitle">Interactive Educational Emulator</p>
                </div>
                <div className="simulator-container">
                    <div className="simulator-left-panel">
                        <Editor 
                            onLoad={handleLoadCode} 
                            initialCode={editorCode} // Pass the code to Editor
                        />
                        <Console 
                            logs={logs}
                            onRun={runProgram}
                            onStep={executeStep}
                            onReset={resetSimulator}
                            isHalted={cpuState.halted}
                            isRunning={cpuState.running}
                        />
                        {/* Pass the handler to the ExperimentData component */}
                        <ExperimentData 
                            cpu={cpu} 
                            program={program} 
                            logs={logs}
                            addLog={addLog}
                            onLoadSavedExperiment={handleLoadSavedExperiment}
                        />
                    </div>
                    <div className="simulator-right-panel">
                        <div className="simulator-control-area">
                            <RegisterView registers={cpuState.registers} />
                            <FlagsView flags={cpuState.flags} />
                        </div>
                        <MemoryView getMemory={getMemory} memoryUpdateTrigger={memoryUpdateTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;