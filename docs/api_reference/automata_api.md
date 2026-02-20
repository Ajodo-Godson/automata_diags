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

### PDA (Pushdown Automaton)

```python
from automata.backend.grammar.context_free.pda.pda_mod import PDA
# or
from automata import PDA
```

#### Constructor
```python
PDA(states, input_alphabet, stack_alphabet, transitions, start_state,
    start_stack_symbol, accept_states, accept_by_empty_stack=False)
```

**Parameters:**
- `states` (StateSet): Set of all states
- `input_alphabet` (Alphabet): Input alphabet symbols
- `stack_alphabet` (Set[str]): Set of stack symbols
- `transitions` (Dict): Transition function mapping `(State, (Symbol, StackSymbol))` to sets of `(State, Tuple[StackSymbol, ...])`
- `start_state` (State): Initial state
- `start_stack_symbol` (str): Initial symbol on the stack
- `accept_states` (StateSet): Set of accepting states
- `accept_by_empty_stack` (bool): If True, accept when stack is empty after consuming all input

**Transition semantics:**
- Key `(input_symbol, stack_top)` with `stack_top != ""`: pops the top, pushes push_symbols
- Key `(input_symbol, "")`: does NOT pop, pushes on top
- `input_symbol == ""` means epsilon (no input consumed)
- `push_symbols` tuple is in textbook order: first element = new top
- Empty tuple `()` means push nothing (pure pop)

#### Methods

##### `accepts(word: Word, max_steps: int = 50000) -> bool`
Test if the PDA accepts a given word using BFS over configurations.

**Parameters:**
- `word` (Word): List of symbols to process
- `max_steps` (int): Maximum BFS steps before giving up

**Returns:**
- `bool`: True if the word is accepted

**Example:**
```python
pda = PDA.from_string(
    "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q2,Z",
    start_state="q0",
    accept_states={"q2"},
    start_stack_symbol="Z",
)
result = pda.accepts([Symbol("a"), Symbol("b")])  # True
```

##### `get_configuration_trace(word: Word) -> Optional[List[Tuple]]`
Return the sequence of configurations from start to acceptance.

**Returns:**
- `List[Tuple[State, int, Tuple[str, ...]]]`: List of (state, input_position, stack) tuples, or None if not accepted

##### `from_string(pda_string, start_state, accept_states, ...) -> PDA`
Class method to create a PDA from a string representation.

**Format:** Transitions separated by semicolons. Each transition:
`from_state, input_symbol, stack_top, to_state, push_symbols`

Use `e` for epsilon. Push symbols are in textbook order (first char = new top).

**Example:**
```python
# PDA for balanced parentheses
pda = PDA.from_string(
    "q0,(,Z,q0,(Z; q0,(,(,q0,((; q0,),(,q0,e; q0,e,Z,q1,Z",
    start_state="q0",
    accept_states={"q1"},
    start_stack_symbol="Z",
)
```

##### `from_cfg(cfg: CFG) -> PDA`
Convert a Context-Free Grammar to an equivalent PDA using the standard top-down construction.

**Parameters:**
- `cfg` (CFG): A context-free grammar

**Returns:**
- `PDA`: Equivalent pushdown automaton

**Example:**
```python
cfg = CFG.from_string("S -> a S b | a b")
pda = PDA.from_cfg(cfg)
pda.accepts([Symbol("a"), Symbol("a"), Symbol("b"), Symbol("b")])  # True
```

---

### TuringMachine (Single-Tape)

```python
from automata.backend.grammar.turing_machines.standard import TuringMachine
# or
from automata import TuringMachine
```

#### Constructor
```python
TuringMachine(states, input_alphabet, tape_alphabet, transitions,
              start_state, blank_symbol, final_states)
```

**Parameters:**
- `states` (StateSet): Set of all states
- `input_alphabet` (Alphabet | Iterable[str]): Input alphabet
- `tape_alphabet` (TapeAlphabet | Iterable[str]): Tape alphabet (superset of input alphabet)
- `transitions` (Dict[State, Dict[TapeSymbol, Tuple[State, TapeSymbol, str]]]): Transition function
- `start_state` (State): Initial state
- `blank_symbol` (TapeSymbol): Blank symbol on the tape
- `final_states` (StateSet): Set of accepting/halting states

**Transition format:** `{state: {read_symbol: (next_state, write_symbol, direction)}}`
Direction is `'R'` (right), `'L'` (left), or `'N'` (no move).

#### Methods

##### `accepts(word: Word, max_steps: int = 1000) -> bool`
Run the TM on the given word and return whether it accepts.

##### `step() -> None`
Perform a single computation step.

##### `get_configuration() -> Dict`
Return the current state and tape contents.

##### `from_string(tm_string, start_state, accept_states, blank_symbol="_") -> TuringMachine`
Class method to create a TM from a string representation.

**Format:** Transitions separated by semicolons:
`current_state, read_symbol, next_state, write_symbol, direction`

**Example:**
```python
# TM that accepts strings of the form 0^n 1^n
tm = TuringMachine.from_string(
    "q0,0,q1,X,R; q1,0,q1,0,R; q1,Y,q1,Y,R; q1,1,q2,Y,L; "
    "q2,0,q2,0,L; q2,Y,q2,Y,L; q2,X,q0,X,R; "
    "q0,Y,q3,Y,R; q3,Y,q3,Y,R; q3,_,qa,_,N",
    start_state="q0",
    accept_states={"qa"},
    blank_symbol="_",
)
tm.accepts(list("0011"))  # True
```

---

### MultiTapeTuringMachine

```python
from automata import MultiTapeTuringMachine
```

#### Constructor
```python
MultiTapeTuringMachine(states, input_alphabet, tape_alphabet, transitions,
                       start_state, blank_symbol, final_states, num_tapes=2)
```

**Transition format:**
```python
{state: {(read_sym_1, read_sym_2, ...): (next_state, [(write_sym_1, dir_1), ...])}}
```

Input is placed on the first tape; others start blank.

---

### MultiHeadTuringMachine

```python
from automata import MultiHeadTuringMachine
```

Single tape with multiple read/write heads. Same transition format as multi-tape.

---

## CFG Algorithms

```python
from automata import cyk_accept, accept_string, generate_strings, get_derivation, get_all_productions_used
```

### Functions

#### `cyk_accept(cfg: CFG, string: str) -> bool`
CYK membership test. Grammar **must** be in CNF (`cfg.to_cnf()`). O(n^3) time.

#### `accept_string(cfg: CFG, string: str, max_steps=None) -> bool`
BFS-based acceptance. Works on any CFG (not just CNF).

#### `generate_strings(cfg: CFG, max_length: int) -> Generator[str]`
Generate all strings derivable from the CFG up to the given length.

#### `get_derivation(cfg: CFG, string: str) -> Optional[List[str]]`
Get the derivation sequence as a list of sentential forms.

#### `get_all_productions_used(cfg: CFG, string: str) -> Optional[List[Production]]`
Get the list of `Production` objects applied in the derivation.

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

##### `draw_pda(pda: PDA, filename: str, format: str = "png") -> str`
Generate visualization for a PDA. Edge labels use the format `input, stack_top -> push_symbols`.

**Example:**
```python
drawer = AutomataDrawer()
path = drawer.draw_pda(pda, "my_pda")
```

### TMDrawer

```python
from automata import TMDrawer
```

### Methods

#### `draw_turing_machine(tm: TuringMachine, filename: str) -> str`
Generate visualization for a single-tape Turing machine.

#### `draw_multitape_turing_machine(tm: MultiTapeTuringMachine, filename: str) -> str`
Generate visualization for a multi-tape Turing machine.

#### `draw_multihead_turing_machine(tm: MultiHeadTuringMachine, filename: str) -> str`
Generate visualization for a multi-head Turing machine.

**Example:**
```python
drawer = TMDrawer()
path = drawer.draw_turing_machine(tm, "my_tm")
```

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
- **PDA Acceptance**: Exponential in worst case (BFS over configurations); practical for typical inputs
- **CYK Algorithm**: O(n³ × |G|) where n is string length, |G| is grammar size
- **TM Acceptance**: Depends on the machine; bounded by `max_steps` parameter

### Memory Usage

- **DFA**: O(|states| × |alphabet|) for transition table
- **NFA**: O(|states| × |alphabet| × |states|) for transition sets
- **PDA**: O(|configurations visited|) for BFS; bounded by `max_steps`
- **TM**: O(tape cells used) for tape storage
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

### CFG to PDA Pipeline

```python
from automata import CFG, PDA, AutomataDrawer
from automata.backend.grammar.dist import Symbol

# Define a grammar and convert to PDA
cfg = CFG.from_string("S -> a S b | a b")
pda = PDA.from_cfg(cfg)

# Test acceptance
print(pda.accepts([Symbol(c) for c in "aabb"]))  # True

# Visualize
drawer = AutomataDrawer()
drawer.draw_pda(pda, "cfg_to_pda")
```

### Turing Machine Workflow

```python
from automata import TuringMachine, TMDrawer

# Create, test, and visualize a TM
tm = TuringMachine.from_string(
    "q0,0,q0,0,R; q0,1,q1,1,R; q1,0,q1,0,R; q1,1,q0,1,R; q0,_,qa,_,N",
    start_state="q0", accept_states={"qa"}, blank_symbol="_",
)

print(tm.accepts(list("0100")))  # True (even number of 1s)

drawer = TMDrawer()
drawer.draw_turing_machine(tm, "even_ones_tm")
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
