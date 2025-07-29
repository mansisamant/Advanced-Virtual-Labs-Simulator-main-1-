/**
 * 8085 Microprocessor Memory Management
 * This file contains the logic for memory operations
 */

class Memory {
    constructor() {
        // 64KB memory (0x0000 to 0xFFFF)
        this.memory = new Uint8Array(65536);
    }

    /**
     * Reset memory to initial state
     */
    reset() {
        this.memory.fill(0);
    }

    /**
     * Read a byte from memory
     * @param {number} address - Memory address (0x0000 to 0xFFFF)
     * @returns {number} Value at the address
     */
    readByte(address) {
        if (address < 0 || address > 0xFFFF) {
            throw new Error(`Memory address out of range: ${address.toString(16)}`);
        }
        return this.memory[address];
    }

    /**
     * Write a byte to memory
     * @param {number} address - Memory address (0x0000 to 0xFFFF)
     * @param {number} value - Value to write (0x00 to 0xFF)
     */
    writeByte(address, value) {
        if (address < 0 || address > 0xFFFF) {
            throw new Error(`Memory address out of range: ${address.toString(16)}`);
        }
        if (value < 0 || value > 0xFF) {
            throw new Error(`Value out of range: ${value.toString(16)}`);
        }
        this.memory[address] = value;
    }

    /**
     * Read a word (2 bytes) from memory
     * @param {number} address - Memory address (0x0000 to 0xFFFF)
     * @returns {number} Word value at the address
     */
    readWord(address) {
        const lowByte = this.readByte(address);
        const highByte = this.readByte((address + 1) & 0xFFFF);
        return (highByte << 8) | lowByte;
    }

    /**
     * Write a word (2 bytes) to memory
     * @param {number} address - Memory address (0x0000 to 0xFFFF)
     * @param {number} value - Value to write (0x0000 to 0xFFFF)
     */
    writeWord(address, value) {
        if (value < 0 || value > 0xFFFF) {
            throw new Error(`Value out of range: ${value.toString(16)}`);
        }
        this.writeByte(address, value & 0xFF);
        this.writeByte((address + 1) & 0xFFFF, (value >> 8) & 0xFF);
    }

    /**
     * Load a program into memory
     * @param {number} startAddress - Starting memory address
     * @param {Array} program - Array of bytes to load
     */
    loadProgram(startAddress, program) {
        for (let i = 0; i < program.length; i++) {
            this.writeByte((startAddress + i) & 0xFFFF, program[i] & 0xFF);
        }
    }

    /**
     * Get a range of memory as a formatted object
     * @param {number} startAddress - Starting memory address
     * @param {number} length - Number of bytes to read
     * @returns {Object} Object with addresses as keys and values as values
     */
    getMemoryRange(startAddress, length) {
        const result = {};
        const endAddress = Math.min((startAddress + length) & 0xFFFF, 0xFFFF);
        
        for (let address = startAddress; address <= endAddress; address++) {
            // Format the address as a 4-digit hex string
            const addressHex = address.toString(16).padStart(4, '0').toUpperCase();
            // Format the value as a 2-digit hex string
            const valueHex = this.memory[address].toString(16).padStart(2, '0').toUpperCase();
            result[addressHex] = valueHex;
        }
        
        return result;
    }
}

export default Memory;
