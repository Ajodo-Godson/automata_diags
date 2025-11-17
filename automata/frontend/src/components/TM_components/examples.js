export const useExamples = () => {
    const examples = {
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
            description: "Copies input string (e.g., '101' becomes '101101')",
            rules: [
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q0', writeSymbol: '0', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '□', moveDirection: 'L' },
                { id: '4', currentState: 'q1', readSymbol: '0', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: '1', newState: 'q3', writeSymbol: 'X', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '7', currentState: 'q1', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
                { id: '8', currentState: 'q2', readSymbol: '0', newState: 'q2', writeSymbol: '0', moveDirection: 'R' },
                { id: '9', currentState: 'q2', readSymbol: '1', newState: 'q2', writeSymbol: '1', moveDirection: 'R' },
                { id: '10', currentState: 'q2', readSymbol: 'X', newState: 'q2', writeSymbol: 'X', moveDirection: 'R' },
                { id: '11', currentState: 'q2', readSymbol: '□', newState: 'q4', writeSymbol: '0', moveDirection: 'L' },
                { id: '12', currentState: 'q3', readSymbol: '0', newState: 'q3', writeSymbol: '0', moveDirection: 'R' },
                { id: '13', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'R' },
                { id: '14', currentState: 'q3', readSymbol: 'X', newState: 'q3', writeSymbol: 'X', moveDirection: 'R' },
                { id: '15', currentState: 'q3', readSymbol: '□', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                { id: '16', currentState: 'q4', readSymbol: '0', newState: 'q4', writeSymbol: '0', moveDirection: 'L' },
                { id: '17', currentState: 'q4', readSymbol: '1', newState: 'q4', writeSymbol: '1', moveDirection: 'L' },
                { id: '18', currentState: 'q4', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Unary Addition": {
            description: "Adds two unary numbers (e.g., '111+11' becomes '11111')",
            rules: [
                // Move right past first number
                { id: '1', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                // Replace + with 1 (this adds one to the result)
                { id: '2', currentState: 'q0', readSymbol: '+', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                // Move right past second number
                { id: '3', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                // At end, move left and remove one 1 (to correct for the + -> 1 replacement)
                { id: '4', currentState: 'q1', readSymbol: '□', newState: 'q2', writeSymbol: '□', moveDirection: 'L' },
                { id: '5', currentState: 'q2', readSymbol: '1', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Binary Subtraction": {
            description: "Subtracts second binary number from first (simplified)",
            rules: [
                { id: '1', currentState: 'q0', readSymbol: '0', newState: 'q0', writeSymbol: '0', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: '-', newState: 'q1', writeSymbol: '-', moveDirection: 'R' },
                { id: '4', currentState: 'q1', readSymbol: '0', newState: 'q1', writeSymbol: '0', moveDirection: 'R' },
                { id: '5', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                { id: '6', currentState: 'q1', readSymbol: '□', newState: 'q2', writeSymbol: '□', moveDirection: 'L' },
                { id: '7', currentState: 'q2', readSymbol: '1', newState: 'q2', writeSymbol: '0', moveDirection: 'L' },
                { id: '8', currentState: 'q2', readSymbol: '0', newState: 'q3', writeSymbol: '1', moveDirection: 'L' },
                { id: '9', currentState: 'q3', readSymbol: '0', newState: 'q3', writeSymbol: '0', moveDirection: 'L' },
                { id: '10', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'L' },
                { id: '11', currentState: 'q3', readSymbol: '-', newState: 'qaccept', writeSymbol: '-', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "String Reversal": {
            description: "Reverses input string (e.g., 'abc' becomes 'cba'). Output appears after the original string.",
            rules: [
                // q0: Move right to end, mark end with special marker
                { id: '1', currentState: 'q0', readSymbol: 'a', newState: 'q0', writeSymbol: 'a', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: 'b', newState: 'q0', writeSymbol: 'b', moveDirection: 'R' },
                { id: '3', currentState: 'q0', readSymbol: 'c', newState: 'q0', writeSymbol: 'c', moveDirection: 'R' },
                { id: '4', currentState: 'q0', readSymbol: '□', newState: 'q1', writeSymbol: '□', moveDirection: 'L' },
                
                // q1: Find rightmost unmarked character, mark it
                { id: '5', currentState: 'q1', readSymbol: 'a', newState: 'q2', writeSymbol: 'X', moveDirection: 'L' },
                { id: '6', currentState: 'q1', readSymbol: 'b', newState: 'q3', writeSymbol: 'X', moveDirection: 'L' },
                { id: '7', currentState: 'q1', readSymbol: 'c', newState: 'q4', writeSymbol: 'X', moveDirection: 'L' },
                { id: '8', currentState: 'q1', readSymbol: 'X', newState: 'q1', writeSymbol: 'X', moveDirection: 'L' },
                { id: '9', currentState: 'q1', readSymbol: '□', newState: 'q8', writeSymbol: '□', moveDirection: 'R' },
                
                // q2/q3/q4: Move left to start, then write character at end
                { id: '10', currentState: 'q2', readSymbol: 'a', newState: 'q2', writeSymbol: 'a', moveDirection: 'L' },
                { id: '11', currentState: 'q2', readSymbol: 'b', newState: 'q2', writeSymbol: 'b', moveDirection: 'L' },
                { id: '12', currentState: 'q2', readSymbol: 'c', newState: 'q2', writeSymbol: 'c', moveDirection: 'L' },
                { id: '13', currentState: 'q2', readSymbol: 'X', newState: 'q2', writeSymbol: 'X', moveDirection: 'L' },
                { id: '14', currentState: 'q2', readSymbol: '□', newState: 'q5', writeSymbol: '□', moveDirection: 'R' },
                
                { id: '15', currentState: 'q3', readSymbol: 'a', newState: 'q3', writeSymbol: 'a', moveDirection: 'L' },
                { id: '16', currentState: 'q3', readSymbol: 'b', newState: 'q3', writeSymbol: 'b', moveDirection: 'L' },
                { id: '17', currentState: 'q3', readSymbol: 'c', newState: 'q3', writeSymbol: 'c', moveDirection: 'L' },
                { id: '18', currentState: 'q3', readSymbol: 'X', newState: 'q3', writeSymbol: 'X', moveDirection: 'L' },
                { id: '19', currentState: 'q3', readSymbol: '□', newState: 'q6', writeSymbol: '□', moveDirection: 'R' },
                
                { id: '20', currentState: 'q4', readSymbol: 'a', newState: 'q4', writeSymbol: 'a', moveDirection: 'L' },
                { id: '21', currentState: 'q4', readSymbol: 'b', newState: 'q4', writeSymbol: 'b', moveDirection: 'L' },
                { id: '22', currentState: 'q4', readSymbol: 'c', newState: 'q4', writeSymbol: 'c', moveDirection: 'L' },
                { id: '23', currentState: 'q4', readSymbol: 'X', newState: 'q4', writeSymbol: 'X', moveDirection: 'L' },
                { id: '24', currentState: 'q4', readSymbol: '□', newState: 'q7', writeSymbol: '□', moveDirection: 'R' },
                
                // q5/q6/q7: Move right to end, write character
                { id: '25', currentState: 'q5', readSymbol: 'a', newState: 'q5', writeSymbol: 'a', moveDirection: 'R' },
                { id: '26', currentState: 'q5', readSymbol: 'b', newState: 'q5', writeSymbol: 'b', moveDirection: 'R' },
                { id: '27', currentState: 'q5', readSymbol: 'c', newState: 'q5', writeSymbol: 'c', moveDirection: 'R' },
                { id: '28', currentState: 'q5', readSymbol: 'X', newState: 'q5', writeSymbol: 'X', moveDirection: 'R' },
                { id: '29', currentState: 'q5', readSymbol: '□', newState: 'q9', writeSymbol: 'a', moveDirection: 'R' },
                
                { id: '30', currentState: 'q6', readSymbol: 'a', newState: 'q6', writeSymbol: 'a', moveDirection: 'R' },
                { id: '31', currentState: 'q6', readSymbol: 'b', newState: 'q6', writeSymbol: 'b', moveDirection: 'R' },
                { id: '32', currentState: 'q6', readSymbol: 'c', newState: 'q6', writeSymbol: 'c', moveDirection: 'R' },
                { id: '33', currentState: 'q6', readSymbol: 'X', newState: 'q6', writeSymbol: 'X', moveDirection: 'R' },
                { id: '34', currentState: 'q6', readSymbol: '□', newState: 'q9', writeSymbol: 'b', moveDirection: 'R' },
                
                { id: '35', currentState: 'q7', readSymbol: 'a', newState: 'q7', writeSymbol: 'a', moveDirection: 'R' },
                { id: '36', currentState: 'q7', readSymbol: 'b', newState: 'q7', writeSymbol: 'b', moveDirection: 'R' },
                { id: '37', currentState: 'q7', readSymbol: 'c', newState: 'q7', writeSymbol: 'c', moveDirection: 'R' },
                { id: '38', currentState: 'q7', readSymbol: 'X', newState: 'q7', writeSymbol: 'X', moveDirection: 'R' },
                { id: '39', currentState: 'q7', readSymbol: '□', newState: 'q9', writeSymbol: 'c', moveDirection: 'R' },
                
                // q9: Move back left to find next character
                { id: '40', currentState: 'q9', readSymbol: 'a', newState: 'q9', writeSymbol: 'a', moveDirection: 'L' },
                { id: '41', currentState: 'q9', readSymbol: 'b', newState: 'q9', writeSymbol: 'b', moveDirection: 'L' },
                { id: '42', currentState: 'q9', readSymbol: 'c', newState: 'q9', writeSymbol: 'c', moveDirection: 'L' },
                { id: '43', currentState: 'q9', readSymbol: 'X', newState: 'q9', writeSymbol: 'X', moveDirection: 'L' },
                { id: '44', currentState: 'q9', readSymbol: '□', newState: 'q1', writeSymbol: '□', moveDirection: 'R' },
                
                // q8: All characters processed, clean up and accept
                { id: '45', currentState: 'q8', readSymbol: 'X', newState: 'q8', writeSymbol: '□', moveDirection: 'R' },
                { id: '46', currentState: 'q8', readSymbol: 'a', newState: 'q8', writeSymbol: 'a', moveDirection: 'R' },
                { id: '47', currentState: 'q8', readSymbol: 'b', newState: 'q8', writeSymbol: 'b', moveDirection: 'R' },
                { id: '48', currentState: 'q8', readSymbol: 'c', newState: 'q8', writeSymbol: 'c', moveDirection: 'R' },
                { id: '49', currentState: 'q8', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        },
        "Unary Multiplication": {
            description: "Multiplies two unary numbers. Input: first*second (e.g., '11*111' → '111111' appears after input). Algorithm: For each '1' in first number, copy all '1's from second number to the end.",
            rules: [
                // q0: Move right past first number to *
                { id: '1', currentState: 'q0', readSymbol: '1', newState: 'q0', writeSymbol: '1', moveDirection: 'R' },
                { id: '2', currentState: 'q0', readSymbol: '*', newState: 'q1', writeSymbol: '*', moveDirection: 'R' },
                
                // q1: Move right past second number to end
                { id: '3', currentState: 'q1', readSymbol: '1', newState: 'q1', writeSymbol: '1', moveDirection: 'R' },
                { id: '4', currentState: 'q1', readSymbol: '□', newState: 'q2', writeSymbol: '□', moveDirection: 'L' },
                
                // q2: Mark rightmost '1' from second number
                { id: '5', currentState: 'q2', readSymbol: '1', newState: 'q3', writeSymbol: 'X', moveDirection: 'L' },
                { id: '6', currentState: 'q2', readSymbol: '*', newState: 'q8', writeSymbol: '*', moveDirection: 'R' },
                
                // q3: Move left to *
                { id: '7', currentState: 'q3', readSymbol: '1', newState: 'q3', writeSymbol: '1', moveDirection: 'L' },
                { id: '8', currentState: 'q3', readSymbol: 'X', newState: 'q3', writeSymbol: 'X', moveDirection: 'L' },
                { id: '9', currentState: 'q3', readSymbol: '*', newState: 'q4', writeSymbol: '*', moveDirection: 'L' },
                
                // q4: Mark rightmost '1' from first number
                { id: '10', currentState: 'q4', readSymbol: '1', newState: 'q5', writeSymbol: 'Y', moveDirection: 'R' },
                { id: '11', currentState: 'q4', readSymbol: '□', newState: 'q9', writeSymbol: '□', moveDirection: 'R' },
                
                // q5: Move right to X (start copying from here)
                { id: '12', currentState: 'q5', readSymbol: '*', newState: 'q5', writeSymbol: '*', moveDirection: 'R' },
                { id: '13', currentState: 'q5', readSymbol: '1', newState: 'q5', writeSymbol: '1', moveDirection: 'R' },
                { id: '14', currentState: 'q5', readSymbol: 'X', newState: 'q6', writeSymbol: 'X', moveDirection: 'R' },
                
                // q6: Copy all '1's and X's to end
                { id: '15', currentState: 'q6', readSymbol: '1', newState: 'q6', writeSymbol: '1', moveDirection: 'R' },
                { id: '16', currentState: 'q6', readSymbol: 'X', newState: 'q6', writeSymbol: 'X', moveDirection: 'R' },
                { id: '17', currentState: 'q6', readSymbol: '□', newState: 'q7', writeSymbol: '1', moveDirection: 'L' },
                
                // q7: Move back left to find X (to copy next '1')
                { id: '18', currentState: 'q7', readSymbol: '1', newState: 'q7', writeSymbol: '1', moveDirection: 'L' },
                { id: '19', currentState: 'q7', readSymbol: 'X', newState: 'q7', writeSymbol: 'X', moveDirection: 'L' },
                { id: '20', currentState: 'q7', readSymbol: '*', newState: 'q4', writeSymbol: '*', moveDirection: 'L' },
                
                // q8: All done, restore X markers to '1'
                { id: '21', currentState: 'q8', readSymbol: 'X', newState: 'q8', writeSymbol: '1', moveDirection: 'R' },
                { id: '22', currentState: 'q8', readSymbol: '1', newState: 'q8', writeSymbol: '1', moveDirection: 'R' },
                { id: '23', currentState: 'q8', readSymbol: '□', newState: 'qaccept', writeSymbol: '□', moveDirection: 'R' },
                
                // q9: Restore Y markers to '1', then go to q8
                { id: '24', currentState: 'q9', readSymbol: 'Y', newState: 'q9', writeSymbol: '1', moveDirection: 'R' },
                { id: '25', currentState: 'q9', readSymbol: '*', newState: 'q8', writeSymbol: '*', moveDirection: 'R' },
            ],
            startState: 'q0',
            acceptState: 'qaccept',
            rejectState: 'qreject',
            blankSymbol: '□',
        }
    };

    return { examples };
};

