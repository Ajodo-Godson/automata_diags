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
        }
    };

    return { examples };
};

