# Automata Diags API Reference

## Core Automata Classes

### DFA (Deterministic Finite Automaton)

```python
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
```

#### Constructor
```python
DFA(states, alphabet, transitions, start_state, accept_states, sink_state=None)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `alphabet` (Alphabet): Input alphabet symbols
- `transitions` (Dict[State, Dict[Symbol, State]]): Transition function
- `start_state` (State): Initial state
- `accept_states` (StateSet): Set of accepting states
- `sink_state` (Optional[State]): Dead state for undefined transitions

#### Methods

##### `accepts(word: Word) -> bool`
Test if the DFA accepts a given word.

**Parameters:**
- `word` (Word): List of symbols to process

**Returns:**
- `bool`: True if the word is accepted, False otherwise

**Example:**
```python
word = [Symbol("a"), Symbol("b")]
result = dfa.accepts(word)
```

##### `add_transition(from_state: State, symbol: Symbol, to_state: State) -> None`
Add a single transition to the DFA.

**Parameters:**
- `from_state` (State): Source state
- `symbol` (Symbol): Input symbol
- `to_state` (State): Target state

---

### NFA (Non-deterministic Finite Automaton)

```python
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
```

#### Constructor
```python
NFA(states, alphabet, transitions, start_state, accept_states, epsilon_symbol="ε")
```

**Parameters:**
- `states` (StateSet): Set of all states
- `alphabet` (Alphabet): Input alphabet symbols
- `transitions` (Dict[State, Dict[Symbol, StateSet]]): Non-deterministic transition function
- `start_state` (State): Initial state
- `accept_states` (StateSet): Set of accepting states
- `epsilon_symbol` (str): Symbol representing epsilon transitions

#### Methods

##### `accepts(word: Word) -> bool`
Test if the NFA accepts a word using breadth-first search.

##### `to_dfa() -> DFA`
Convert the NFA to an equivalent DFA using subset construction.

**Returns:**
- `DFA`: Equivalent deterministic finite automaton

**Example:**
```python
dfa = nfa.to_dfa()
print(f"NFA states: {len(nfa._states.states())}")
print(f"DFA states: {len(dfa._states.states())}")
```

##### `from_regex(regex: str) -> "NFA"`
Class method to create an NFA from a regular expression using Thompson's construction.

**Parameters:**
- `regex` (str): Regular expression string

**Returns:**
- `NFA`: NFA that accepts the language defined by the regex

**Example:**
```python
nfa = NFA.from_regex("(a|b)*ab")
```

---

### CFG (Context-Free Grammar)

```python
from automata.backend.grammar.context_free.cfg_mod import CFG
```

#### Constructor
```python
CFG(non_terminals, terminals, productions, start_symbol)
```

**Parameters:**
- `non_terminals` (Set[NonTerminal]): Set of non-terminal symbols
- `terminals` (Set[Terminal]): Set of terminal symbols
- `productions` (List[Production]): List of production rules
- `start_symbol` (NonTerminal): Start symbol of the grammar

#### Methods

##### `from_string(grammar_str: str) -> "CFG"`
Class method to parse a CFG from string representation.

**Parameters:**
- `grammar_str` (str): Multi-line string with production rules

**Returns:**
- `CFG`: Parsed context-free grammar

**Example:**
```python
grammar_str = """
S -> A B | a
A -> a A | ε
B -> b B | b
"""
cfg = CFG.from_string(grammar_str)
```

##### `to_cnf() -> "CFG"`
Convert the grammar to Chomsky Normal Form.

**Returns:**
- `CFG`: Equivalent grammar in CNF

**Algorithm Steps:**
1. Eliminate start symbol from RHS
2. Eliminate ε-productions
3. Eliminate unit productions
4. Separate terminals
5. Binarize productions

---

## Minimization Algorithms

### Hopcroft's Algorithm

```python
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import hopcroft_minimize
```

#### `hopcroft_minimize(dfa: DFA) -> DFA`
Minimize a DFA using Hopcroft's O(n log n) algorithm.

**Parameters:**
- `dfa` (DFA): DFA to minimize

**Returns:**
- `DFA`: Minimized DFA with equivalent language

#### `analyze_equivalence_classes(dfa: DFA) -> Dict[str, List[State]]`
Analyze equivalence classes found during minimization.

**Returns:**
- `Dict[str, List[State]]`: Mapping of class names to equivalent states

---

### Myhill-Nerode Algorithm

```python
from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import myhill_nerode_minimize
```

#### `myhill_nerode_minimize(dfa: DFA) -> DFA`
Minimize a DFA using the Myhill-Nerode theorem approach.

#### `get_distinguishability_table(dfa: DFA) -> Dict[Tuple[State, State], bool]`
Generate the distinguishability table for analysis.

**Returns:**
- `Dict[Tuple[State, State], bool]`: State pair distinguishability mapping

---

## Transducers

### Mealy Machine

```python
from automata.backend.grammar.transducers.mealy_machine import MealyMachine
```

#### Constructor
```python
MealyMachine(states, input_alphabet, output_alphabet, transitions, output_function, start_state)
```

#### Methods

##### `transduce(input_string: str) -> str`
Process input string and produce output.

**Parameters:**
- `input_string` (str): Input sequence

**Returns:**
- `str`: Output sequence based on state transitions and output function

---

## Visualization Tools

### AutomataDrawer

```python
from automata.backend.drawings.automata_drawer import AutomataDrawer
```

#### Methods

##### `draw_dfa_from_object(dfa: DFA, filename: str) -> str`
Generate visualization for a DFA.

**Parameters:**
- `dfa` (DFA): DFA to visualize
- `filename` (str): Output filename (without extension)

**Returns:**
- `str`: Path to generated PNG file

##### `draw_nfa_from_object(nfa: NFA, filename: str) -> str`
Generate visualization for an NFA with ε-transitions.

##### `draw_mealy_machine_from_object(mealy: MealyMachine, filename: str) -> str`
Generate visualization for a Mealy machine.

---

## Utility Types

### Core Types

```python
from automata.backend.grammar.dist import State, Symbol, NonTerminal, Terminal
```

#### State
Represents a state in an automaton.

#### Symbol
Represents an input symbol.

#### NonTerminal
Represents a non-terminal symbol in a grammar.

#### Terminal
Represents a terminal symbol in a grammar.

### Collection Types

#### StateSet
```python
StateSet.from_states(state_list: List[State]) -> StateSet
```

#### Alphabet
```python
Alphabet(symbols: List[Symbol]) -> Alphabet
```

---

## Pattern Matching

### KMP Algorithm

```python
from automata.backend.grammar.regular_languages.dfa.algo.kmp import kmp_search
```

#### `kmp_search(pattern: str, text: str) -> List[int]`
Find all occurrences of pattern in text using Knuth-Morris-Pratt algorithm.

**Parameters:**
- `pattern` (str): Pattern to search for
- `text` (str): Text to search in

**Returns:**
- `List[int]`: List of starting positions where pattern occurs

**Example:**
```python
positions = kmp_search("abc", "abcabcabc")
# Returns: [0, 3, 6]
```

---

## Error Handling

### Common Exceptions

- **ValueError**: Invalid input parameters or malformed data
- **KeyError**: Missing states or symbols in transition functions
- **TypeError**: Incorrect type arguments

### Best Practices

1. **Validate inputs** before creating automata
2. **Handle empty languages** appropriately
3. **Check for completeness** in DFA transition functions
4. **Use type hints** for better error detection

---

## Performance Considerations

### Algorithm Complexities

- **DFA Acceptance**: O(n) where n is word length
- **NFA Acceptance**: O(n × 2^m) where m is number of states
- **NFA to DFA**: O(2^n) worst case, often much better in practice
- **Hopcroft Minimization**: O(n log n)
- **Myhill-Nerode Minimization**: O(n²)

### Memory Usage

- **DFA**: O(|states| × |alphabet|) for transition table
- **NFA**: O(|states| × |alphabet| × |states|) for transition sets
- **Minimization**: Additional O(|states|²) for analysis tables

---

## Integration Examples

### Combining Multiple Algorithms

```python
# Complete workflow: Regex → NFA → DFA → Minimized DFA
nfa = NFA.from_regex("(a|b)*ab")
dfa = nfa.to_dfa()
minimized = hopcroft_minimize(dfa)

# Visualize all steps
drawer = AutomataDrawer()
drawer.draw_nfa_from_object(nfa, "step1_nfa")
drawer.draw_dfa_from_object(dfa, "step2_dfa") 
drawer.draw_dfa_from_object(minimized, "step3_minimized")
```

### Educational Analysis

```python
# Compare minimization algorithms
hopcroft_result = hopcroft_minimize(dfa)
myhill_result = myhill_nerode_minimize(dfa)

print(f"Hopcroft states: {len(hopcroft_result._states.states())}")
print(f"Myhill-Nerode states: {len(myhill_result._states.states())}")

# Analyze equivalence classes
equiv_classes = analyze_equivalence_classes(dfa)
for class_name, states in equiv_classes.items():
    print(f"{class_name}: {states}")
```
