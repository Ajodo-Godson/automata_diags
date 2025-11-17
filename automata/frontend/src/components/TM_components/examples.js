/**
 * Turing Machine Examples
 * 
 * Starting with MINIMAL examples to verify the engine works.
 */
export const useExamples = () => {
    const examples = {
        "Test: Write 3 ones": {
            description: "Minimal test: Write three '1's and halt. Verifies basic TM operation.",
            rules: [
                { id: '1', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                { id: '2', currentState: 'q1', readSymbol: '□', newState: 'q2', writeSymbol: '1', moveDirection: 'R' },
                { id: '3', currentState: 'q2', readSymbol: '□', newState: 'qaccept', writeSymbol: '1', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Binary Incrementer": {
            description: "Increments a binary number by 1",
            rules: [
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q0', writeSymbol: '0', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '□', moveDirection: 'L' },
                { id: '4', currentState: 'q1', readSymbol: '0', newState: 'qaccept', writeSymbol: '1', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '0', moveDirection: 'L' },
                { id: '6', currentState: 'q1', readSymbol: '□', newState: 'qaccept', writeSymbol: '1', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Palindrome Checker": {
            description: "Accepts palindromes over {0,1}",
            rules: [
                // q0: Start/return state - skip X's, mark leftmost 0 or 1
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q1', writeSymbol: 'X', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '1', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: 'X', newState: 'q0', writeSymbol: 'X', moveDirection: 'R' },
                { id: '4', currentState: 'q0', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
                
                // q1: Marked 0 on left, find rightmost unmarked symbol
                { id: '5', currentState: 'q1', readSymbol: '0', newState: 'q1', writeSymbol: '0', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                { id: '7', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'R' },
                { id: '8', currentState: 'q1', readSymbol: '□', newState: 'q3', writeSymbol: '□', moveDirection: 'L' },
                
                // q2: Marked 1 on left, find rightmost unmarked symbol
                { id: '9', currentState: 'q2', readSymbol: '0', newState: 'q2', writeSymbol: '0', moveDirection: 'R' },
                { id: '10', currentState: 'q2', readSymbol: '1', newState: 'q2', writeSymbol: '1', moveDirection: 'R' },
                { id: '11', currentState: 'q2', readSymbol: 'X', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '12', currentState: 'q2', readSymbol: '□', newState: 'q4', writeSymbol: '□', moveDirection: 'L' },
                
                // q3: Skip X's, check rightmost unmarked is 0 (we marked 0 on left)
                { id: '13', currentState: 'q3', readSymbol: '0', newState: 'q5', writeSymbol: 'X', moveDirection: 'L' },
                { id: '14', currentState: 'q3', readSymbol: '1', newState: 'qreject', writeSymbol: '1', moveDirection: 'R' },
                { id: '15', currentState: 'q3', readSymbol: 'X', newState: 'q3', writeSymbol: 'X', moveDirection: 'L' },
                { id: '16', currentState: 'q3', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
                
                // q4: Skip X's, check rightmost unmarked is 1 (we marked 1 on left)
                { id: '17', currentState: 'q4', readSymbol: '1', newState: 'q5', writeSymbol: 'X', moveDirection: 'L' },
                { id: '18', currentState: 'q4', readSymbol: '0', newState: 'qreject', writeSymbol: '0', moveDirection: 'R' },
                { id: '19', currentState: 'q4', readSymbol: 'X', newState: 'q4', writeSymbol: 'X', moveDirection: 'L' },
                { id: '20', currentState: 'q4', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
                
                // q5: Return to leftmost position (start)
                { id: '21', currentState: 'q5', readSymbol: '0', newState: 'q5', writeSymbol: '0', moveDirection: 'L' },
                { id: '22', currentState: 'q5', readSymbol: '1', newState: 'q5', writeSymbol: '1', moveDirection: 'L' },
                { id: '23', currentState: 'q5', readSymbol: 'X', newState: 'q5', writeSymbol: 'X', moveDirection: 'L' },
                { id: '24', currentState: 'q5', readSymbol: '□', newState: 'q0', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "0^n 1^n": {
            description: "Accepts strings of form 0^n 1^n",
            rules: [
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q1', writeSymbol: 'X', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: 'Y', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '3', currentState: 'q1', readSymbol: '0', newState: 'q1', writeSymbol: '0', moveDirection: 'R' },
                { id: '4', currentState: 'q1', readSymbol: 'Y', newState: 'q1', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: '1', newState: 'q2', writeSymbol: 'Y', moveDirection: 'L' },
                { id: '6', currentState: 'q2', readSymbol: '0', newState: 'q2', writeSymbol: '0', moveDirection: 'L' },
                { id: '7', currentState: 'q2', readSymbol: 'Y', newState: 'q2', writeSymbol: 'Y', moveDirection: 'L' },
                { id: '8', currentState: 'q2', readSymbol: 'X', newState: 'q0', writeSymbol: 'X', moveDirection: 'R' },
                { id: '9', currentState: 'q3', readSymbol: 'Y', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '10', currentState: 'q3', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'L' },
                { id: '11', currentState: 'q0', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'L' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Busy Beaver (3-state)": {
            description: "Classic 3-state busy beaver",
            rules: [
                { id: '1', currentState: 'A', readSymbol: '□', newState: 'B', writeSymbol: '1', moveDirection: 'R' },
                { id: '2', currentState: 'A', readSymbol: '1', newState: 'C', writeSymbol: '1', moveDirection: 'L' },
                { id: '3', currentState: 'B', readSymbol: '□', newState: 'A', writeSymbol: '1', moveDirection: 'L' },
                { id: '4', currentState: 'B', readSymbol: '1', newState: 'B', writeSymbol: '1', moveDirection: 'R' },
                { id: '5', currentState: 'C', readSymbol: '□', newState: 'B', writeSymbol: '1', moveDirection: 'L' },
                { id: '6', currentState: 'C', readSymbol: '1', newState: 'qaccept', writeSymbol: '1', moveDirection: 'R' },
            ],
            startState: 'A',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Copy Machine": {
            description: "Copies input string with # separator (e.g., '101' → '101#101')",
            rules: [
                // q0: Scan to end and place #
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q0', writeSymbol: '0', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '#', moveDirection: 'L' },
                
                // q1: Mark a symbol and copy it
                { id: '4', currentState: 'q1', readSymbol: '0', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: '1', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '7', currentState: 'q1', readSymbol: 'Y', newState: 'q1', writeSymbol: 'Y', moveDirection: 'L' },
                { id: '8', currentState: 'q1', readSymbol: '□', newState: 'q5', writeSymbol: '□', moveDirection: 'R' },
                
                // q2: Move to # and write 0
                { id: '9', currentState: 'q2', readSymbol: '0', newState: 'q2', writeSymbol: '0', moveDirection: 'R' },
                { id: '10', currentState: 'q2', readSymbol: '1', newState: 'q2', writeSymbol: '1', moveDirection: 'R' },
                { id: '11', currentState: 'q2', readSymbol: 'X', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '12', currentState: 'q2', readSymbol: 'Y', newState: 'q2', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '13', currentState: 'q2', readSymbol: '#', newState: 'q2b', writeSymbol: '#', moveDirection: 'R' },
                
                { id: '14', currentState: 'q2b', readSymbol: '0', newState: 'q2b', writeSymbol: '0', moveDirection: 'R' },
                { id: '15', currentState: 'q2b', readSymbol: '1', newState: 'q2b', writeSymbol: '1', moveDirection: 'R' },
                { id: '16', currentState: 'q2b', readSymbol: '□', newState: 'q4', writeSymbol: '0', moveDirection: 'L' },
                
                // q3: Move to # and write 1
                { id: '17', currentState: 'q3', readSymbol: '0', newState: 'q3', writeSymbol: '0', moveDirection: 'R' },
                { id: '18', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'R' },
                { id: '19', currentState: 'q3', readSymbol: 'X', newState: 'q3', writeSymbol: 'X', moveDirection: 'R' },
                { id: '20', currentState: 'q3', readSymbol: 'Y', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '21', currentState: 'q3', readSymbol: '#', newState: 'q3b', writeSymbol: '#', moveDirection: 'R' },
                
                { id: '22', currentState: 'q3b', readSymbol: '0', newState: 'q3b', writeSymbol: '0', moveDirection: 'R' },
                { id: '23', currentState: 'q3b', readSymbol: '1', newState: 'q3b', writeSymbol: '1', moveDirection: 'R' },
                { id: '24', currentState: 'q3b', readSymbol: '□', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                
                // q4: Return to start
                { id: '25', currentState: 'q4', readSymbol: '0', newState: 'q4', writeSymbol: '0', moveDirection: 'L' },
                { id: '26', currentState: 'q4', readSymbol: '1', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                { id: '27', currentState: 'q4', readSymbol: '#', newState: 'q4b', writeSymbol: '#', moveDirection: 'L' },
                
                { id: '28', currentState: 'q4b', readSymbol: '0', newState: 'q4b', writeSymbol: '0', moveDirection: 'L' },
                { id: '29', currentState: 'q4b', readSymbol: '1', newState: 'q4b', writeSymbol: '1', moveDirection: 'L' },
                { id: '30', currentState: 'q4b', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '31', currentState: 'q4b', readSymbol: 'Y', newState: 'q1', writeSymbol: 'Y', moveDirection: 'L' },
                
                // q5: Restore X's and Y's to original symbols
                { id: '32', currentState: 'q5', readSymbol: 'X', newState: 'q5', writeSymbol: '0', moveDirection: 'R' },
                { id: '33', currentState: 'q5', readSymbol: 'Y', newState: 'q5', writeSymbol: '1', moveDirection: 'R' },
                { id: '34', currentState: 'q5', readSymbol: '#', newState: 'qaccept', writeSymbol: '#', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Unary Addition": {
            description: "Adds two unary numbers. Input: '111+11' (3+2) → '11111' (5). Simple: replace '+' with '1', erase last '1'.",
            rules: [
                // Move right past first number
                { id: '1', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                // Replace + with 1
                { id: '2', currentState: 'q0', readSymbol: '+', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                // Move right past second number
                { id: '3', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                // At end, move left and remove one 1
                { id: '4', currentState: 'q1', readSymbol: '□', newState: 'q2', writeSymbol: '□', moveDirection: 'L' },
                { id: '5', currentState: 'q2', readSymbol: '1', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Unary Doubling": {
            description: "Doubles a unary number. Input: '111' (3) → '111111' (6). Uses # separator.",
            rules: [
                // Mark end of input with #
                { id: '1', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '#', moveDirection: 'L' },
                
                // q1: Mark a 1 with X
                { id: '3', currentState: 'q1', readSymbol: '1', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '4', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '5', currentState: 'q1', readSymbol: '□', newState: 'q6', writeSymbol: '□', moveDirection: 'R' },
                
                // q2: Move to #
                { id: '6', currentState: 'q2', readSymbol: '1', newState: 'q2', writeSymbol: '1', moveDirection: 'R' },
                { id: '7', currentState: 'q2', readSymbol: 'X', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '8', currentState: 'q2', readSymbol: '#', newState: 'q3', writeSymbol: '#', moveDirection: 'R' },
                
                // q3: Write 1 at end
                { id: '9', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'R' },
                { id: '10', currentState: 'q3', readSymbol: '□', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                
                // q4: Return to marked section
                { id: '11', currentState: 'q4', readSymbol: '1', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                { id: '12', currentState: 'q4', readSymbol: '#', newState: 'q5', writeSymbol: '#', moveDirection: 'L' },
                
                // q5: Go back to start of marked section
                { id: '13', currentState: 'q5', readSymbol: '1', newState: 'q5', writeSymbol: '1', moveDirection: 'L' },
                { id: '14', currentState: 'q5', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                
                // q6: Clean up X's and #
                { id: '15', currentState: 'q6', readSymbol: 'X', newState: 'q6', writeSymbol: '1', moveDirection: 'R' },
                { id: '16', currentState: 'q6', readSymbol: '#', newState: 'q7', writeSymbol: '□', moveDirection: 'R' },
                
                // q7: Move to start and accept
                { id: '17', currentState: 'q7', readSymbol: '1', newState: 'q7', writeSymbol: '1', moveDirection: 'L' },
                { id: '18', currentState: 'q7', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "String Reversal": {
            description: "Reverses a string over {a,b,c}. Input: 'abc' → 'cba'. Uses # separator.",
            rules: [
                // q0: Scan to end and place #
                { id: '1', currentState: 'q0', readSymbol: 'a', newState: 'q0', writeSymbol: 'a', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: 'b', newState: 'q0', writeSymbol: 'b', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: 'c', newState: 'q0', writeSymbol: 'c', moveDirection: 'R' },
                { id: '4', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '#', moveDirection: 'L' },
                
                // q1: Read rightmost unmarked char, remember it
                { id: '5', currentState: 'q1', readSymbol: 'a', newState: 'q2a', writeSymbol: 'X', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: 'b', newState: 'q2b', writeSymbol: 'X', moveDirection: 'R' },
                { id: '7', currentState: 'q1', readSymbol: 'c', newState: 'q2c', writeSymbol: 'X', moveDirection: 'R' },
                { id: '8', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '9', currentState: 'q1', readSymbol: '#', newState: 'q8', writeSymbol: '#', moveDirection: 'R' },
                { id: '10', currentState: 'q1', readSymbol: '□', newState: 'q8', writeSymbol: '□', moveDirection: 'R' },
                
                // q2a: Move to #, then write 'a' at end
                { id: '11', currentState: 'q2a', readSymbol: 'a', newState: 'q2a', writeSymbol: 'a', moveDirection: 'R' },
                { id: '12', currentState: 'q2a', readSymbol: 'b', newState: 'q2a', writeSymbol: 'b', moveDirection: 'R' },
                { id: '13', currentState: 'q2a', readSymbol: 'c', newState: 'q2a', writeSymbol: 'c', moveDirection: 'R' },
                { id: '14', currentState: 'q2a', readSymbol: 'X', newState: 'q2a', writeSymbol: 'X', moveDirection: 'R' },
                { id: '15', currentState: 'q2a', readSymbol: '#', newState: 'q3a', writeSymbol: '#', moveDirection: 'R' },
                
                
                { id: '16', currentState: 'q2b', readSymbol: 'a', newState: 'q2b', writeSymbol: 'a', moveDirection: 'R' },
                { id: '17', currentState: 'q2b', readSymbol: 'b', newState: 'q2b', writeSymbol: 'b', moveDirection: 'R' },
                { id: '18', currentState: 'q2b', readSymbol: 'c', newState: 'q2b', writeSymbol: 'c', moveDirection: 'R' },
                { id: '19', currentState: 'q2b', readSymbol: 'X', newState: 'q2b', writeSymbol: 'X', moveDirection: 'R' },
                { id: '20', currentState: 'q2b', readSymbol: '#', newState: 'q3b', writeSymbol: '#', moveDirection: 'R' },
                
                { id: '21', currentState: 'q2c', readSymbol: 'a', newState: 'q2c', writeSymbol: 'a', moveDirection: 'R' },
                { id: '22', currentState: 'q2c', readSymbol: 'b', newState: 'q2c', writeSymbol: 'b', moveDirection: 'R' },
                { id: '23', currentState: 'q2c', readSymbol: 'c', newState: 'q2c', writeSymbol: 'c', moveDirection: 'R' },
                { id: '24', currentState: 'q2c', readSymbol: 'X', newState: 'q2c', writeSymbol: 'X', moveDirection: 'R' },
                { id: '25', currentState: 'q2c', readSymbol: '#', newState: 'q3c', writeSymbol: '#', moveDirection: 'R' },
                
                // q3: Scan to end and write the remembered char
                { id: '26', currentState: 'q3a', readSymbol: 'a', newState: 'q3a', writeSymbol: 'a', moveDirection: 'R' },
                { id: '27', currentState: 'q3a', readSymbol: 'b', newState: 'q3a', writeSymbol: 'b', moveDirection: 'R' },
                { id: '28', currentState: 'q3a', readSymbol: 'c', newState: 'q3a', writeSymbol: 'c', moveDirection: 'R' },
                { id: '29', currentState: 'q3a', readSymbol: '□', newState: 'q4', writeSymbol: 'a', moveDirection: 'L' },
                
                { id: '30', currentState: 'q3b', readSymbol: 'a', newState: 'q3b', writeSymbol: 'a', moveDirection: 'R' },
                { id: '31', currentState: 'q3b', readSymbol: 'b', newState: 'q3b', writeSymbol: 'b', moveDirection: 'R' },
                { id: '32', currentState: 'q3b', readSymbol: 'c', newState: 'q3b', writeSymbol: 'c', moveDirection: 'R' },
                { id: '33', currentState: 'q3b', readSymbol: '□', newState: 'q4', writeSymbol: 'b', moveDirection: 'L' },
                
                { id: '34', currentState: 'q3c', readSymbol: 'a', newState: 'q3c', writeSymbol: 'a', moveDirection: 'R' },
                { id: '35', currentState: 'q3c', readSymbol: 'b', newState: 'q3c', writeSymbol: 'b', moveDirection: 'R' },
                { id: '36', currentState: 'q3c', readSymbol: 'c', newState: 'q3c', writeSymbol: 'c', moveDirection: 'R' },
                { id: '37', currentState: 'q3c', readSymbol: '□', newState: 'q4', writeSymbol: 'c', moveDirection: 'L' },
                
                // q4: Return to start to process next char
                { id: '38', currentState: 'q4', readSymbol: 'a', newState: 'q4', writeSymbol: 'a', moveDirection: 'L' },
                { id: '39', currentState: 'q4', readSymbol: 'b', newState: 'q4', writeSymbol: 'b', moveDirection: 'L' },
                { id: '40', currentState: 'q4', readSymbol: 'c', newState: 'q4', writeSymbol: 'c', moveDirection: 'L' },
                { id: '41', currentState: 'q4', readSymbol: '#', newState: 'q5', writeSymbol: '#', moveDirection: 'L' },
                
                // q5: Continue back to start
                { id: '42', currentState: 'q5', readSymbol: 'a', newState: 'q5', writeSymbol: 'a', moveDirection: 'L' },
                { id: '43', currentState: 'q5', readSymbol: 'b', newState: 'q5', writeSymbol: 'b', moveDirection: 'L' },
                { id: '44', currentState: 'q5', readSymbol: 'c', newState: 'q5', writeSymbol: 'c', moveDirection: 'L' },
                { id: '45', currentState: 'q5', readSymbol: 'X', newState: 'q5', writeSymbol: 'X', moveDirection: 'L' },
                { id: '46', currentState: 'q5', readSymbol: '□', newState: 'q6', writeSymbol: '□', moveDirection: 'R' },
                
                // q6: Skip X's, then continue to # and go back to q1
                { id: '47', currentState: 'q6', readSymbol: 'X', newState: 'q6', writeSymbol: 'X', moveDirection: 'R' },
                { id: '48', currentState: 'q6', readSymbol: 'a', newState: 'q6', writeSymbol: 'a', moveDirection: 'R' },
                { id: '49', currentState: 'q6', readSymbol: 'b', newState: 'q6', writeSymbol: 'b', moveDirection: 'R' },
                { id: '50', currentState: 'q6', readSymbol: 'c', newState: 'q6', writeSymbol: 'c', moveDirection: 'R' },
                { id: '51', currentState: 'q6', readSymbol: '#', newState: 'q1', writeSymbol: '#', moveDirection: 'L' },
                
                // q8: Move to start of tape to begin cleanup
                { id: '52', currentState: 'q8', readSymbol: 'a', newState: 'q8', writeSymbol: 'a', moveDirection: 'L' },
                { id: '53', currentState: 'q8', readSymbol: 'b', newState: 'q8', writeSymbol: 'b', moveDirection: 'L' },
                { id: '54', currentState: 'q8', readSymbol: 'c', newState: 'q8', writeSymbol: 'c', moveDirection: 'L' },
                { id: '55', currentState: 'q8', readSymbol: 'X', newState: 'q8', writeSymbol: 'X', moveDirection: 'L' },
                { id: '56', currentState: 'q8', readSymbol: '#', newState: 'q8', writeSymbol: '#', moveDirection: 'L' },
                { id: '57', currentState: 'q8', readSymbol: '□', newState: 'q9', writeSymbol: '□', moveDirection: 'R' },
                
                // q9: Clean X's and # going right
                { id: '58', currentState: 'q9', readSymbol: 'X', newState: 'q9', writeSymbol: '□', moveDirection: 'R' },
                { id: '59', currentState: 'q9', readSymbol: '#', newState: 'q9', writeSymbol: '□', moveDirection: 'R' },
                { id: '60', currentState: 'q9', readSymbol: 'a', newState: 'qaccept', writeSymbol: 'a', moveDirection: 'R' },
                { id: '61', currentState: 'q9', readSymbol: 'b', newState: 'qaccept', writeSymbol: 'b', moveDirection: 'R' },
                { id: '62', currentState: 'q9', readSymbol: 'c', newState: 'qaccept', writeSymbol: 'c', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Unary Multiplication": {
            description: "Multiplies two unary numbers. Input: '11*111' (2×3) → '111111' (6). For each 1 in first, copy all of second.",
            rules: [
                // q0: Mark a 1 from first number with X
                { id: '1', currentState: 'q0', readSymbol: '1', newState: 'q1', writeSymbol: 'X', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: 'X', newState: 'q0', writeSymbol: 'X', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: '*', newState: 'q10', writeSymbol: '*', moveDirection: 'R' },
                
                // q1: Skip to *
                { id: '4', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: '*', newState: 'q1b', writeSymbol: '*', moveDirection: 'R' },
                
                // q1b: Scan to end to place # marker (first time only)
                { id: '7', currentState: 'q1b', readSymbol: '1', newState: 'q1b', writeSymbol: '1', moveDirection: 'R' },
                { id: '8', currentState: 'q1b', readSymbol: '#', newState: 'q1c', writeSymbol: '#', moveDirection: 'L' },
                { id: '9', currentState: 'q1b', readSymbol: '□', newState: 'q1c', writeSymbol: '#', moveDirection: 'L' },
                
                // q1c: Go back to start of second number
                { id: '10', currentState: 'q1c', readSymbol: '1', newState: 'q1c', writeSymbol: '1', moveDirection: 'L' },
                { id: '11', currentState: 'q1c', readSymbol: '*', newState: 'q2', writeSymbol: '*', moveDirection: 'R' },
                
                // q2: Mark a 1 from second number with Y, copy it to result
                { id: '12', currentState: 'q2', readSymbol: '1', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '13', currentState: 'q2', readSymbol: 'Y', newState: 'q2', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '14', currentState: 'q2', readSymbol: '#', newState: 'q6', writeSymbol: '#', moveDirection: 'L' },
                
                // q3: Move to # (end of result area)
                { id: '15', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'R' },
                { id: '16', currentState: 'q3', readSymbol: 'Y', newState: 'q3', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '17', currentState: 'q3', readSymbol: '#', newState: 'q4', writeSymbol: '#', moveDirection: 'R' },
                
                // q4: Write a 1 at end of result
                { id: '18', currentState: 'q4', readSymbol: '1', newState: 'q4', writeSymbol: '1', moveDirection: 'R' },
                { id: '19', currentState: 'q4', readSymbol: '□', newState: 'q5', writeSymbol: '1', moveDirection: 'L' },
                
                // q5: Return to second number
                { id: '20', currentState: 'q5', readSymbol: '1', newState: 'q5', writeSymbol: '1', moveDirection: 'L' },
                { id: '21', currentState: 'q5', readSymbol: '#', newState: 'q5b', writeSymbol: '#', moveDirection: 'L' },
                
                // q5b: Continue back to second number
                { id: '22', currentState: 'q5b', readSymbol: '1', newState: 'q5b', writeSymbol: '1', moveDirection: 'L' },
                { id: '23', currentState: 'q5b', readSymbol: 'Y', newState: 'q2', writeSymbol: 'Y', moveDirection: 'R' },
                
                // q6: Finished copying second number once, restore Y's and move back to first
                { id: '24', currentState: 'q6', readSymbol: 'Y', newState: 'q6', writeSymbol: '1', moveDirection: 'L' },
                { id: '25', currentState: 'q6', readSymbol: '1', newState: 'q6', writeSymbol: '1', moveDirection: 'L' },
                { id: '26', currentState: 'q6', readSymbol: '*', newState: 'q7', writeSymbol: '*', moveDirection: 'L' },
                
                // q7: Return to first number
                { id: '27', currentState: 'q7', readSymbol: '1', newState: 'q7', writeSymbol: '1', moveDirection: 'L' },
                { id: '28', currentState: 'q7', readSymbol: 'X', newState: 'q0', writeSymbol: 'X', moveDirection: 'R' },
                { id: '29', currentState: 'q7', readSymbol: '□', newState: 'q0', writeSymbol: '□', moveDirection: 'R' },
                
                // q10: All first number processed, clean up
                { id: '30', currentState: 'q10', readSymbol: '1', newState: 'q10', writeSymbol: '□', moveDirection: 'R' },
                { id: '31', currentState: 'q10', readSymbol: 'Y', newState: 'q10', writeSymbol: '□', moveDirection: 'R' },
                { id: '32', currentState: 'q10', readSymbol: '#', newState: 'q11', writeSymbol: '□', moveDirection: 'R' },
                
                // q11: Result is ready, move to start
                { id: '33', currentState: 'q11', readSymbol: '1', newState: 'q11', writeSymbol: '1', moveDirection: 'L' },
                { id: '34', currentState: 'q11', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        }
    };

    return { examples };
};

