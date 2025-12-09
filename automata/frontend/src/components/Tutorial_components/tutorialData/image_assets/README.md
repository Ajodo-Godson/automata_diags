# Tutorial Example Automata - JSON Definitions

This directory contains JSON files for all the key automata examples used in the tutorials. Import these into the simulators to generate clean state diagrams that can be screenshotted and used in the tutorial content.

## DFA Examples

### 1. `dfa_test.json` - Strings Ending in '1'
- **Language**: {w | w ends with '1'}
- **States**: q0, q1
- **Use in Tutorial**: Basic DFA introduction, state diagrams, transition tables
- **Test strings**:
  - Accept: "1", "01", "001", "111", "101"
  - Reject: "0", "00", "110", "010"

### 2. `dfa_even_zeros.json` - Even Number of 0s
- **Language**: {w | w has an even number of 0s}
- **States**: qeven, qodd
- **Use in Tutorial**: Parity checking, toggle states
- **Test strings**:
  - Accept: "", "1", "00", "11", "0011", "1010"
  - Reject: "0", "10", "000", "101"

## NFA Examples

### 3. `nfa_ends_01.json` - Strings Ending in '01'
- **Language**: {w | w ends with '01'}
- **States**: q0, q1, q2
- **Use in Tutorial**: Nondeterminism, guessing, multiple transitions
- **Test strings**:
  - Accept: "01", "101", "001", "1101"
  - Reject: "0", "1", "00", "11", "10"

### 4. `nfa_epsilon_example.json` - a or b or ab
- **Language**: {'a', 'b', 'ab'}
- **States**: q0-q5
- **Use in Tutorial**: Epsilon transitions, modular construction
- **Test strings**:
  - Accept: "a", "b", "ab"
  - Reject: "", "aa", "ba", "abc"

## PDA Example

### 5. `pda_equal_01.json` - Equal 0s and 1s (0ⁿ1ⁿ)
- **Language**: {0ⁿ1ⁿ | n ≥ 0}
- **States**: q0, q1, q2
- **Use in Tutorial**: Stack operations, context-free languages
- **Test strings**:
  - Accept: "", "01", "0011", "000111"
  - Reject: "0", "1", "001", "011", "0110"

## CFG Example

### 6. `cfg_equal_01.json` - Equal 0s and 1s (0ⁿ1ⁿ, n≥1)
- **Language**: {0ⁿ1ⁿ | n ≥ 1}
- **Variables**: S
- **Use in Tutorial**: Grammar rules, recursive production
- **Grammar**:
  ```
  S → 01 | 0S1
  ```

## TM Example

### 7. `tm_palindrome.json` - Palindrome Checker
- **Language**: {w | w is a palindrome over {0,1}}
- **States**: q0-q4, qaccept, qreject
- **Use in Tutorial**: Tape manipulation, bidirectional movement
- **Test strings**:
  - Accept: "", "0", "1", "00", "11", "010", "101", "0110"
  - Reject: "01", "10", "001", "110"

## How to Use

1. **Import into Simulator**:
   - Open the appropriate simulator (DFA/NFA/PDA/CFG/TM)
   - Click the "Import" button in the toolbox
   - Select the JSON file

2. **Generate Diagram**:
   - The automaton will load with its state diagram
   - Use browser zoom if needed for better resolution
   - Take a screenshot of the state diagram

3. **Test with Examples**:
   - Use the provided test strings to verify behavior
   - Run the simulation to see step-by-step execution
   - Screenshot interesting execution traces

4. **Replace ASCII Art**:
   - Save screenshots with descriptive names
   - Replace ASCII diagrams in tutorial content with image references
   - Keep the formal definitions (Q, Σ, δ, etc.) as text

## File Format Notes

- **DFA**: Transitions use object format `{"state": {"symbol": "nextState"}}`
- **NFA**: Transitions use array format `[{"from": "q0", "symbol": "0", "to": "q1"}]`
- **PDA**: Includes stack alphabet and stack operations (push/pop)
- **CFG**: Includes variables, terminals, and production rules
- **TM**: Includes tape alphabet, read/write/move operations

## Tips for Screenshots

- Use the zoom controls in React Flow for optimal diagram size
- Ensure all state labels are clearly visible
- Capture transition labels without overlap
- For complex automata, consider multiple views (zoomed in/out)
- Save as PNG for best quality in tutorials
