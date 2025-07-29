/**
 * 8085 Microprocessor Assembler
 * This file contains the logic to parse and translate assembly code
 */

class Assembler {
    constructor() {
        // Mapping of instructions to their opcodes and sizes
        this.instructionSet = {
            'MVI': { size: 2 },  // MVI R, data
            'MOV': { size: 1 },  // MOV R1, R2
            'LDA': { size: 3 },  // LDA addr
            'STA': { size: 3 },  // STA addr
            'ADD': { size: 1 },  // ADD R
            'ADI': { size: 2 },  // ADI data
            'SUB': { size: 1 },  // SUB R
            'SUI': { size: 2 },  // SUI data
            'JMP': { size: 3 },  // JMP addr
            'CMA': { size: 1 },  // CMA
            'HLT': { size: 1 }   // HLT
        };
        
        // Valid registers
        this.validRegisters = ['A', 'B', 'C', 'D', 'E', 'H', 'L'];
    }

    /**
     * Parse assembly code into structured instructions
     * @param {string} code - Assembly code to parse
     * @returns {Array} Array of parsed instructions
     */
    parseCode(code) {
        // Split the code into lines and initialize variables
        const lines = code.split('\n');
        const parsedProgram = [];
        const labels = {};
        let currentAddress = 0;
        
        // First pass: collect labels and their addresses
        for (let i = 0; i < lines.length; i++) {
            const line = this._cleanLine(lines[i]);
            
            if (!line) continue;
            
            // Check if line contains a label
            const labelMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
            if (labelMatch) {
                const label = labelMatch[1];
                const remainingLine = labelMatch[2].trim();
                
                labels[label] = currentAddress;
                
                // If there's more content after the label, parse it
                if (remainingLine) {
                    const instruction = this._parseInstruction(remainingLine, i + 1);
                    if (instruction) {
                        currentAddress += this.instructionSet[instruction.mnemonic].size;
                    }
                }
            } else {
                // Regular instruction line
                const instruction = this._parseInstruction(line, i + 1);
                if (instruction) {
                    currentAddress += this.instructionSet[instruction.mnemonic].size;
                }
            }
        }
        
        // Reset for second pass
        currentAddress = 0;
        
        // Second pass: resolve labels and parse instructions
        for (let i = 0; i < lines.length; i++) {
            const line = this._cleanLine(lines[i]);
            
            if (!line) continue;
            
            // Handle lines with labels
            const labelMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
            if (labelMatch) {
                const remainingLine = labelMatch[2].trim();
                
                if (remainingLine) {
                    const instruction = this._parseInstruction(remainingLine, i + 1, labels);
                    if (instruction) {
                        instruction.address = currentAddress;
                        parsedProgram.push(instruction);
                        currentAddress += this.instructionSet[instruction.mnemonic].size;
                    }
                }
            } else {
                // Regular instruction line
                const instruction = this._parseInstruction(line, i + 1, labels);
                if (instruction) {
                    instruction.address = currentAddress;
                    parsedProgram.push(instruction);
                    currentAddress += this.instructionSet[instruction.mnemonic].size;
                }
            }
        }
        
        return parsedProgram;
    }

    /**
     * Clean a line of assembly code (remove comments and trim)
     * @param {string} line - Line to clean
     * @returns {string} Cleaned line
     */
    _cleanLine(line) {
        // Remove comments (starting with ;)
        const withoutComment = line.split(';')[0];
        
        // Trim whitespace
        const trimmed = withoutComment.trim();
        
        return trimmed;
    }

    /**
     * Parse a single instruction
     * @param {string} line - Line containing an instruction
     * @param {number} lineNumber - Line number for error reporting
     * @param {Object} labels - Labels dictionary for resolving addresses
     * @returns {Object|null} Parsed instruction or null if invalid
     */
    _parseInstruction(line, lineNumber, labels = {}) {
        // Skip empty lines
        if (!line) return null;
        
        try {
            // Split the line into mnemonic and operands
            const parts = line.split(/[\s,]+/).filter(Boolean);
            const mnemonic = parts[0].toUpperCase();
            
            // Check if the mnemonic is valid
            if (!this.instructionSet[mnemonic]) {
                throw new Error(`Unknown mnemonic: ${mnemonic}`);
            }
            
            const operands = parts.slice(1);
            
            // Validate operands based on mnemonic
            this._validateOperands(mnemonic, operands, labels);
            
            return {
                mnemonic,
                operands,
                raw: line,
                lineNumber
            };
        } catch (error) {
            console.error(`Error parsing line ${lineNumber}: ${error.message}`);
            return {
                error: true,
                mnemonic: line.split(/\s+/)[0],
                raw: line,
                lineNumber,
                errorMessage: error.message
            };
        }
    }

    /**
     * Validate operands for an instruction
     * @param {string} mnemonic - Instruction mnemonic
     * @param {Array} operands - Instruction operands
     * @param {Object} labels - Labels dictionary
     */
    _validateOperands(mnemonic, operands, labels) {
        switch (mnemonic) {
            case 'MVI':
                if (operands.length !== 2) {
                    throw new Error('MVI requires a register and a value');
                }
                if (!this.validRegisters.includes(operands[0])) {
                    throw new Error(`Invalid register: ${operands[0]}`);
                }
                this._validateHexValue(operands[1]);
                break;
                
            case 'MOV':
                if (operands.length !== 2) {
                    throw new Error('MOV requires two registers');
                }
                if (!this.validRegisters.includes(operands[0]) || !this.validRegisters.includes(operands[1])) {
                    throw new Error('Invalid register(s)');
                }
                break;
                
            case 'ADD':
            case 'SUB':
                if (operands.length !== 1) {
                    throw new Error(`${mnemonic} requires one register operand`);
                }
                if (!this.validRegisters.includes(operands[0])) {
                    throw new Error(`Invalid register: ${operands[0]}`);
                }
                break;
                
            case 'ADI':
            case 'SUI':
                if (operands.length !== 1) {
                    throw new Error(`${mnemonic} requires one immediate value`);
                }
                this._validateHexValue(operands[0]);
                break;
                
            case 'LDA':
            case 'STA':
            case 'JMP':
                if (operands.length !== 1) {
                    throw new Error(`${mnemonic} requires an address operand`);
                }
                
                // Check if operand is a label or direct address
                if (labels && operands[0] in labels) {
                    // It's a label, already validated
                } else {
                    this._validateAddress(operands[0]);
                }
                break;
                
            case 'CMA':
            case 'HLT':
                if (operands.length !== 0) {
                    throw new Error(`${mnemonic} does not take any operands`);
                }
                break;
                
            default:
                throw new Error(`Unknown mnemonic: ${mnemonic}`);
        }
    }

    /**
     * Validate a hexadecimal value
     * @param {string} value - Value to validate
     */
    _validateHexValue(value) {
        // Remove 'H' suffix if present
        const hexValue = value.endsWith('H') || value.endsWith('h') 
            ? value.slice(0, -1) 
            : value;
            
        // Try to parse as hex
        const parsed = parseInt(hexValue, 16);
        
        if (isNaN(parsed) || parsed < 0 || parsed > 0xFF) {
            throw new Error(`Invalid hex value: ${value}. Must be 00H-FFH`);
        }
    }

    /**
     * Validate a memory address
     * @param {string} value - Address to validate
     */
    _validateAddress(value) {
        // Remove 'H' suffix if present
        const hexValue = value.endsWith('H') || value.endsWith('h') 
            ? value.slice(0, -1) 
            : value;
            
        // Try to parse as hex
        const parsed = parseInt(hexValue, 16);
        
        if (isNaN(parsed) || parsed < 0 || parsed > 0xFFFF) {
            throw new Error(`Invalid address: ${value}. Must be 0000H-FFFFH`);
        }
    }
}

export default Assembler;
