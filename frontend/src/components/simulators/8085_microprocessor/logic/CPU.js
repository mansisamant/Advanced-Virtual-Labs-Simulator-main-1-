/**
 * 8085 Microprocessor CPU Simulation
 * This file contains the core CPU logic for executing 8085 instructions
 */

class CPU {
    constructor() {
        // Initialize registers
        this.registers = {
            A: 0x00,  // Accumulator
            B: 0x00,
            C: 0x00,
            D: 0x00,
            E: 0x00,
            H: 0x00,
            L: 0x00,
            PC: 0x0000, // Program Counter
            SP: 0xFFFF  // Stack Pointer
        };

        // Initialize flags
        this.flags = {
            Z: false,  // Zero
            S: false,  // Sign
            CY: false, // Carry
            P: false,  // Parity
            AC: false  // Auxiliary Carry
        };

        // Initialize memory (64KB)
        this.memory = new Uint8Array(65536); // 64KB (0x0000 to 0xFFFF)
        
        // Execution state
        this.running = false;
        this.halted = false;
        
        // For logging
        this.executionLog = [];
    }    // Reset the CPU to initial state
    reset() {
        // Reset registers
        Object.keys(this.registers).forEach(reg => {
            this.registers[reg] = reg === 'SP' ? 0xFFFF : 0x00;
        });

        // Reset flags
        Object.keys(this.flags).forEach(flag => {
            this.flags[flag] = false;
        });

        // Reset memory to all zeros
        this.memory.fill(0);

        // Reset execution state
        this.running = false;
        this.halted = false;
        this.executionLog = [];
    }

    // Get register pair value (H-L, B-C, D-E)
    getRegisterPair(highReg, lowReg) {
        return (this.registers[highReg] << 8) | this.registers[lowReg];
    }

    // Set register pair value
    setRegisterPair(highReg, lowReg, value) {
        this.registers[highReg] = (value >> 8) & 0xFF;
        this.registers[lowReg] = value & 0xFF;
    }

    // Update flags based on result
    updateFlags(result, affectCarry = true) {
        // Zero flag
        this.flags.Z = (result & 0xFF) === 0;
        
        // Sign flag
        this.flags.S = (result & 0x80) !== 0;
        
        // Carry flag (if enabled)
        if (affectCarry) {
            this.flags.CY = result > 0xFF;
        }
        
        // Parity flag
        let bit_count = 0;
        for (let i = 0; i < 8; i++) {
            if ((result & (1 << i)) !== 0) {
                bit_count++;
            }
        }
        this.flags.P = (bit_count % 2) === 0;
    }

    // Execute a single instruction
    executeInstruction(instruction) {
        // If halted, don't execute
        if (this.halted) {
            return { executed: false, message: 'CPU is halted' };
        }

        try {
            const { mnemonic, operands } = instruction;
            let executed = true;
            let message = `Executed: ${mnemonic} ${operands ? operands.join(', ') : ''}`;
            let pcIncrement = 1; // Default PC increment

            // Execute based on mnemonic
            switch (mnemonic.toUpperCase()) {
                case 'MVI': {
                    // MVI R, data - Move immediate data to register
                    const register = operands[0];
                    const value = parseInt(operands[1], 16) & 0xFF;
                    this.registers[register] = value;
                    pcIncrement = 2;
                    break;
                }
                
                case 'MOV': {
                    // MOV R1, R2 - Move data between registers
                    const destReg = operands[0];
                    const srcReg = operands[1];
                    this.registers[destReg] = this.registers[srcReg];
                    break;
                }
                
                case 'LDA': {
                    // LDA addr - Load A from memory
                    const address = parseInt(operands[0], 16);
                    this.registers.A = this.memory[address];
                    pcIncrement = 3;
                    break;
                }
                
                case 'STA': {
                    // STA addr - Store A to memory
                    const address = parseInt(operands[0], 16);
                    this.memory[address] = this.registers.A;
                    pcIncrement = 3;
                    break;
                }
                
                case 'ADD': {
                    // ADD R - Add register to A
                    const register = operands[0];
                    const result = this.registers.A + this.registers[register];
                    this.updateFlags(result);
                    this.registers.A = result & 0xFF;
                    break;
                }
                
                case 'ADI': {
                    // ADI data - Add immediate to A
                    const value = parseInt(operands[0], 16) & 0xFF;
                    const result = this.registers.A + value;
                    this.updateFlags(result);
                    this.registers.A = result & 0xFF;
                    pcIncrement = 2;
                    break;
                }
                
                case 'SUB': {
                    // SUB R - Subtract register from A
                    const register = operands[0];
                    const result = this.registers.A - this.registers[register];
                    this.updateFlags(result);
                    this.registers.A = result & 0xFF;
                    break;
                }
                
                case 'SUI': {
                    // SUI data - Subtract immediate from A
                    const value = parseInt(operands[0], 16) & 0xFF;
                    const result = this.registers.A - value;
                    this.updateFlags(result);
                    this.registers.A = result & 0xFF;
                    pcIncrement = 2;
                    break;
                }
                
                case 'JMP': {
                    // JMP addr - Unconditional jump
                    const address = parseInt(operands[0], 16);
                    this.registers.PC = address;
                    pcIncrement = 0; // PC is already set
                    break;
                }
                
                case 'CMA': {
                    // CMA - Complement A
                    this.registers.A = (~this.registers.A) & 0xFF;
                    break;
                }
                
                case 'HLT': {
                    // HLT - Halt execution
                    this.halted = true;
                    message = 'CPU halted';
                    break;
                }
                
                default:
                    executed = false;
                    message = `Unknown instruction: ${mnemonic}`;
                    break;
            }

            // Increment PC if instruction was executed
            if (executed && pcIncrement > 0) {
                this.registers.PC += pcIncrement;
            }

            // Log the execution
            this.executionLog.push(message);

            return { executed, message };
        } catch (error) {
            return { executed: false, message: `Error: ${error.message}` };
        }
    }

    // Get the current state of the CPU
    getState() {
        return {
            registers: { ...this.registers },
            flags: { ...this.flags },
            halted: this.halted,
            running: this.running,
            executionLog: [...this.executionLog]
        };
    }

    // Get memory range
    getMemory(start, length = 16) {
        const result = {};
        for (let i = 0; i < length; i++) {
            const address = start + i;
            if (address >= 0 && address < 65536) {
                result[address.toString(16).padStart(4, '0').toUpperCase()] = this.memory[address];
            }
        }
        return result;
    }
}

export default CPU;
