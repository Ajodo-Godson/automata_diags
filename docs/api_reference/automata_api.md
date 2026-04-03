# Automata Diags API Reference

## Core Automata Classes

### DFA (Deterministic Finite Automaton)

A DFA is the simplest model of computation that reads an input string one symbol at a time, moving between states according to a fixed set of rules. "Deterministic" means that in every state there is exactly one transition for each possible input symbol, so the machine's behavior is fully predictable. After reading the entire input, the DFA accepts if it ends in one of its designated accept states, and rejects otherwise. DFAs recognize exactly the class of **regular languages**.

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

##### `from_string(dfa_string, start_state, accept_states) -> DFA`
Class method to create a DFA from a string representation.

**Parameters:**
- `dfa_string` (str): Transitions separated by semicolons. Each transition: `from_state,symbol,to_state`. Example: `"q0,a,q1;q1,b,q2"`
- `start_state` (str): The name of the start state
- `accept_states` (Set[str]): A set of names for the accept states

**Returns:**
- `DFA`: A new DFA instance

**Example:**
```python
dfa = DFA.from_string("q0,a,q1;q1,b,q2;q2,a,q1", start_state="q0", accept_states={"q2"})
```

##### `add_transition(from_state: State, symbol: Symbol, to_state: State) -> None`
Add a single transition to the DFA.

**Parameters:**
- `from_state` (State): Source state
- `symbol` (Symbol): Input symbol
- `to_state` (State): Target state

---

### NFA (Non-deterministic Finite Automaton)

An NFA works like a DFA but with two key relaxations: (1) from any state, there can be zero, one, or many transitions on the same input symbol (the machine "guesses" which path to take), and (2) it may have **epsilon (ε) transitions** that let it change state without consuming any input. An NFA accepts a string if **at least one** possible path through the machine leads to an accept state. NFAs recognize exactly the same languages as DFAs (regular languages), but they are often more compact and easier to construct.

```python
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
```

#### Constructor
```python
NFA(states, alphabet, transitions, start_state, accept_states, epsilon_symbol="ε")
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `alphabet` (Alphabet): Input alphabet symbols
- `transitions` (Dict[State, Dict[Symbol, StateSet]]): Non-deterministic transition function
- `start_state` (State): Initial state
- `accept_states` (StateSet): Set of accepting states
- `epsilon_symbol` (str): Symbol representing epsilon transitions

#### Methods

##### `accepts(word: Word) -> bool`
Test if the NFA accepts a given word using breadth-first search.

**Parameters:**
- `word` (Word): List of symbols to process

**Returns:**
- `bool`: True if the word is accepted, False otherwise

##### `to_dfa() -> DFA`
Convert the NFA to an equivalent DFA using the **subset construction** (also called the powerset construction). The idea is that each state in the new DFA represents a *set* of NFA states that the machine could be in simultaneously. The algorithm tracks all possible NFA states in parallel, so the resulting DFA can have up to 2^n states (where n is the number of NFA states), though in practice it is usually much smaller.

**Returns:**
- `DFA`: Equivalent deterministic finite automaton

**Example:**
```python
dfa = nfa.to_dfa()
print(f"NFA states: {len(nfa._states.states())}")
print(f"DFA states: {len(dfa._states.states())}")
```

##### `from_string(nfa_string, start_state, accept_states) -> NFA`
Class method to create an NFA from a string representation.

**Parameters:**
- `nfa_string` (str): Transitions separated by semicolons. Each transition: `from_state,symbol,to_state1,to_state2,...`. Example: `"q0,a,q0,q1;q1,b,q2"`
- `start_state` (str): The name of the start state
- `accept_states` (Set[str]): A set of names for the accept states

**Returns:**
- `NFA`: A new NFA instance

##### `from_regex(regex: str) -> NFA`
Class method to create an NFA from a regular expression using **Thompson's construction**. This algorithm recursively breaks a regex into its sub-expressions (concatenation, union `|`, and Kleene star `*`) and builds a small NFA fragment for each one, then wires the fragments together with epsilon transitions. The result is an NFA with at most 2× the number of characters in the regex.

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

A context-free grammar is a set of recursive rewriting rules used to generate strings in a language. It consists of **non-terminal** symbols (variables like S, A, B), **terminal** symbols (actual characters like a, b), and **production rules** that describe how non-terminals can be replaced (e.g., `S -> a S b | ε`). Starting from the start symbol, you repeatedly apply productions until only terminals remain. CFGs can describe languages that regular expressions cannot, such as balanced parentheses or `a^n b^n`. They are the foundation of most programming language parsers.

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

##### `from_string(grammar_str: str) -> CFG`
Class method to parse a CFG from string representation.

**Parameters:**
- `grammar_str` (str): Multi-line string with production rules. Use `|` for alternatives and `ε` or `epsilon` for the empty string.

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

##### `to_cnf() -> CFG`
Convert the grammar to **Chomsky Normal Form (CNF)**. In CNF, every production is either `A -> BC` (exactly two non-terminals) or `A -> a` (exactly one terminal). Any CFG can be converted to CNF, and the CYK parsing algorithm requires the grammar to be in this form.

**Returns:**
- `CFG`: Equivalent grammar in CNF

---

### PDA (Pushdown Automaton)

A pushdown automaton is like an NFA with the addition of a **stack** - an unlimited last-in-first-out memory. On each step, the PDA reads an input symbol (or makes an epsilon move), looks at the top of the stack, and based on both, decides which state to go to and what to push onto the stack. This extra memory lets PDAs recognize context-free languages like `a^n b^n` (equal numbers of a's and b's) that finite automata cannot handle. Every context-free grammar has an equivalent PDA and vice versa.

```python
from automata.backend.grammar.context_free.pda.pda_mod import PDA
```

#### Constructor
```python
PDA(states, input_alphabet, stack_alphabet, transitions, start_state,
    start_stack_symbol, accept_states, accept_by_empty_stack=False)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `input_alphabet` (Alphabet): Input alphabet symbols
- `stack_alphabet` (Set[str]): Set of stack symbols
- `transitions` (Dict): Transition function mapping `(State, (Symbol, StackSymbol))` to sets of `(State, Tuple[StackSymbol, ...])`
- `start_state` (State): Initial state
- `start_stack_symbol` (str): Initial symbol on the stack
- `accept_states` (StateSet): Set of accepting states
- `accept_by_empty_stack` (bool): If True, accept when stack is empty after consuming all input

#### Methods

##### `accepts(word: Word, max_steps: int = 50000) -> bool`
Test if the PDA accepts a given word using BFS over configurations.

**Parameters:**
- `word` (Word): List of symbols to process
- `max_steps` (int): Maximum BFS steps before giving up

**Returns:**
- `bool`: True if the word is accepted, False otherwise

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

**Parameters:**
- `pda_string` (str): Transitions separated by semicolons. Each transition: `from_state, input_symbol, stack_top, to_state, push_symbols`. Use `e` for epsilon.
- `start_state` (str): The name of the start state
- `accept_states` (Set[str]): A set of names for the accept states

**Returns:**
- `PDA`: A new PDA instance

**Example:**
```python
pda = PDA.from_string(
    "q0,(,Z,q0,(Z; q0,(,(,q0,((; q0,),(,q0,e; q0,e,Z,q1,Z",
    start_state="q0",
    accept_states={"q1"},
    start_stack_symbol="Z",
)
```

##### `from_cfg(cfg: CFG) -> PDA`
Convert a Context-Free Grammar to an equivalent PDA using the standard **top-down construction**. The resulting PDA simulates leftmost derivations: it pushes the start symbol onto the stack, then repeatedly replaces the top non-terminal with the right-hand side of a matching production, or pops a terminal that matches the next input symbol.

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

A Turing machine is the most powerful standard model of computation. It has an infinite tape (initially filled with blanks except for the input) and a read/write head that can move left or right. On each step, the machine reads the symbol under the head, and based on its current state and that symbol, it writes a new symbol, moves the head one cell left or right, and transitions to a new state. If the machine reaches an accept state it accepts; if it loops forever, it never halts. Turing machines can recognize **recursively enumerable** languages and are equivalent in power to any general-purpose computer.

```python
from automata.backend.grammar.turing_machines.standard import TuringMachine
```

#### Constructor
```python
TuringMachine(states, input_alphabet, tape_alphabet, transitions,
              start_state, blank_symbol, final_states)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `input_alphabet` (Alphabet | Iterable[str]): Input alphabet symbols
- `tape_alphabet` (TapeAlphabet | Iterable[str]): Tape alphabet (superset of input alphabet)
- `transitions` (Dict[State, Dict[TapeSymbol, Tuple[State, TapeSymbol, str]]]): Transition function
- `start_state` (State): Initial state
- `blank_symbol` (TapeSymbol): Blank symbol on the tape
- `final_states` (StateSet): Set of accepting/halting states

#### Methods

##### `accepts(word: Word, max_steps: int = 1000) -> bool`
Test if the TM accepts a given word.

**Parameters:**
- `word` (Word): List of symbols to process
- `max_steps` (int): Maximum computation steps before halting

**Returns:**
- `bool`: True if the word is accepted, False otherwise

##### `step() -> None`
Perform a single computation step.

##### `get_configuration() -> Dict`
Return the current state and tape contents.

##### `from_string(tm_string, start_state, accept_states, blank_symbol="_") -> TuringMachine`
Class method to create a TM from a string representation.

**Parameters:**
- `tm_string` (str): Transitions separated by semicolons. Each transition: `current_state, read_symbol, next_state, write_symbol, direction`. Direction is `R`, `L`, or `N`.
- `start_state` (str): The name of the start state
- `accept_states` (Set[str]): A set of names for the accept states

**Returns:**
- `TuringMachine`: A new TuringMachine instance

**Example:**
```python
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

A multi-tape Turing machine has several independent tapes, each with its own read/write head. On each step, it reads all heads simultaneously, then writes and moves each head independently. Multi-tape TMs are strictly equivalent in power to single-tape TMs (any multi-tape machine can be simulated on one tape), but they can be exponentially faster for some problems and are often easier to design.

```python
from automata.backend.grammar.turing_machines.multitape import MultiTapeTuringMachine
```

#### Constructor
```python
MultiTapeTuringMachine(states, input_alphabet, tape_alphabet, transitions,
                       start_state, blank_symbol, final_states, num_tapes=2)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `input_alphabet` (Alphabet | Iterable[str]): Input alphabet symbols
- `tape_alphabet` (TapeAlphabet | Iterable[str]): Tape alphabet (superset of input alphabet)
- `transitions` (Dict): Transition function mapping state and read-symbol tuples to next state and write/direction actions
- `start_state` (State): Initial state
- `blank_symbol` (TapeSymbol): Blank symbol on the tapes
- `final_states` (StateSet): Set of accepting states
- `num_tapes` (int): Number of tapes (default 2)

#### Methods

##### `accepts(word: Word, max_steps: int = 1000) -> bool`
Test if the multi-tape TM accepts a given word. Input is placed on the first tape; others start blank.

**Parameters:**
- `word` (Word): List of symbols to process
- `max_steps` (int): Maximum computation steps before halting

**Returns:**
- `bool`: True if the word is accepted, False otherwise

##### `step() -> None`
Perform a single computation step across all tapes.

##### `get_configuration() -> Dict`
Return the current state and all tape contents.

---

### MultiHeadTuringMachine

A multi-head Turing machine has a single tape but multiple read/write heads that can each move independently. Like the multi-tape variant, it does not add computational power beyond a standard TM, but it can be more convenient for certain algorithms where you need to compare or copy data at different positions on the same tape.

```python
from automata.backend.grammar.turing_machines.multihead import MultiHeadTuringMachine
```

#### Constructor
```python
MultiHeadTuringMachine(states, input_alphabet, tape_alphabet, transitions,
                       start_state, blank_symbol, final_states, num_heads=2)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `input_alphabet` (Alphabet | Iterable[str]): Input alphabet symbols
- `tape_alphabet` (TapeAlphabet | Iterable[str]): Tape alphabet (superset of input alphabet)
- `transitions` (Dict): Transition function mapping state and read-symbol tuples to next state and write/direction actions
- `start_state` (State): Initial state
- `blank_symbol` (TapeSymbol): Blank symbol on the tape
- `final_states` (StateSet): Set of accepting states
- `num_heads` (int): Number of read/write heads (default 2)

#### Methods

##### `accepts(word: Word, max_steps: int = 1000) -> bool`
Test if the multi-head TM accepts a given word. Single tape with multiple read/write heads.

**Parameters:**
- `word` (Word): List of symbols to process
- `max_steps` (int): Maximum computation steps before halting

**Returns:**
- `bool`: True if the word is accepted, False otherwise

##### `step() -> None`
Perform a single computation step across all heads.

##### `get_configuration() -> Dict`
Return the current state, tape contents, and head positions.

---

## CFG Algorithms

These functions provide ways to test membership, generate strings, and trace derivations for context-free grammars. The CYK algorithm is the standard O(n^3) dynamic-programming approach that fills a triangular table to decide whether a string belongs to the language. It requires the grammar to be in Chomsky Normal Form (CNF), where every production is either `A -> BC` (two non-terminals) or `A -> a` (one terminal). Use `cfg.to_cnf()` to convert any CFG before passing it to CYK.

```python
from automata.backend.grammar.context_free.cfg_algo import cyk_accept, accept_string, generate_strings, get_derivation, get_all_productions_used
```

### Functions

#### `cyk_accept(cfg: CFG, string: str) -> bool`
Check if a string can be generated from a CFG using the CYK algorithm. The grammar must be in Chomsky Normal Form.

**Parameters:**
- `cfg` (CFG): The context-free grammar in CNF
- `string` (str): The string to check

**Returns:**
- `bool`: True if the string can be generated, False otherwise

#### `accept_string(cfg: CFG, string: str, max_steps=None) -> bool`
Check if a string can be generated from a CFG using BFS with pruning. Works on any CFG, not just CNF.

**Parameters:**
- `cfg` (CFG): The context-free grammar
- `string` (str): The string to check
- `max_steps` (int, optional): Maximum derivation steps

**Returns:**
- `bool`: True if the string can be generated, False otherwise

#### `generate_strings(cfg: CFG, max_length: int) -> Generator[str]`
Generate all strings that can be derived from the CFG up to a given length.

**Parameters:**
- `cfg` (CFG): The context-free grammar
- `max_length` (int): Maximum length of strings to generate

**Returns:**
- `Generator[str]`: Strings that can be generated from the CFG

#### `get_derivation(cfg: CFG, string: str) -> Optional[List[str]]`
Get a derivation sequence for a string from the CFG.

**Parameters:**
- `cfg` (CFG): The context-free grammar
- `string` (str): The string to derive

**Returns:**
- `List[str]`: A list of sentential forms showing the derivation, or None if the string cannot be derived

#### `get_all_productions_used(cfg: CFG, string: str) -> Optional[List[Production]]`
Get the list of productions used to derive a string.

**Parameters:**
- `cfg` (CFG): The context-free grammar
- `string` (str): The string to derive

**Returns:**
- `List[Production]`: Production objects used in the derivation, or None if the string cannot be derived

---

## Minimization Algorithms

DFA minimization finds the smallest DFA that recognizes the same language as the original. Two states are "equivalent" if no input string can distinguish them (i.e., both lead to acceptance or both lead to rejection for every possible continuation). Minimization merges all equivalent states into one representative state. This package provides two classical approaches.

### Hopcroft's Algorithm

Hopcroft's algorithm is a partition-refinement method. It starts by splitting states into two groups (accepting vs. non-accepting), then repeatedly refines the partition: if two states in the same group transition to different groups on some symbol, they are split apart. The process runs in O(n log n) time, making it the fastest known DFA minimization algorithm.

```python
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import hopcroft_minimize, analyze_equivalence_classes
```

#### `hopcroft_minimize(dfa: DFA) -> DFA`
Minimize a DFA using Hopcroft's O(n log n) algorithm.

**Parameters:**
- `dfa` (DFA): DFA to minimize

**Returns:**
- `DFA`: Minimized DFA with equivalent language

#### `analyze_equivalence_classes(dfa: DFA) -> Dict[str, List[State]]`
Analyze equivalence classes found during minimization. Returns which original states were merged together.

**Parameters:**
- `dfa` (DFA): DFA to analyze

**Returns:**
- `Dict[str, List[State]]`: Mapping of class names to equivalent states

---

### Myhill-Nerode Algorithm

The Myhill-Nerode approach uses a table-filling method. It builds an n-by-n table of all state pairs and marks pairs as "distinguishable" if one is accepting and the other is not. It then iterates: if states (p, q) transition to an already-distinguished pair on some symbol, (p, q) is also marked distinguishable. When no more pairs can be marked, the unmarked pairs are equivalent and can be merged. This runs in O(n^2) time and produces a distinguishability table useful for educational analysis.

```python
from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import myhill_nerode_minimize, get_distinguishability_table
```

#### `myhill_nerode_minimize(dfa: DFA) -> DFA`
Minimize a DFA using the Myhill-Nerode theorem approach.

**Parameters:**
- `dfa` (DFA): DFA to minimize

**Returns:**
- `DFA`: Minimized DFA with equivalent language

#### `get_distinguishability_table(dfa: DFA) -> Dict[Tuple[State, State], bool]`
Generate the distinguishability table for analysis. Each entry tells you whether two states can be told apart by some input string.

**Parameters:**
- `dfa` (DFA): DFA to analyze

**Returns:**
- `Dict[Tuple[State, State], bool]`: State pair distinguishability mapping (True = distinguishable, False = equivalent)

---

## Transducers

Transducers are automata that produce output, not just accept/reject decisions. While a DFA answers "yes or no" for an input string, a transducer reads input symbols and emits output symbols along the way.

### Mealy Machine

A Mealy machine is a finite-state transducer where the output depends on both the current state **and** the input symbol being read. For every (state, input) pair, the machine produces an output symbol and transitions to a new state. Common uses include protocol encoders, digital circuit design, and any process that transforms one stream of symbols into another.

```python
from automata.backend.grammar.transducers.mealy_machine import MealyMachine
```

#### Constructor
```python
MealyMachine(states, input_alphabet, output_alphabet, transitions, output_function, start_state)
```

**Parameters:**
- `states` (StateSet): Set of all states in the automaton
- `input_alphabet` (Alphabet): Input alphabet symbols
- `output_alphabet` (OutputAlphabet): Output alphabet symbols
- `transitions` (Dict[State, Dict[Symbol, State]]): Transition function
- `output_function` (Dict[Tuple[State, Symbol], str]): Output function mapping (state, input) to output
- `start_state` (State): Initial state

#### Methods

##### `transduce(input_string: str) -> str`
Process input string and produce output.

**Parameters:**
- `input_string` (str): Input sequence

**Returns:**
- `str`: Output sequence based on state transitions and output function

---

### Stochastic CFG (SCFG) and probabilistic CYK

A **stochastic context-free grammar (SCFG)** assigns a **probability** to each production. The grammar defines a distribution over strings; **probabilistic CYK** computes the total probability that the start symbol derives a given string (summing over all parse trees). Productions must be in **Chomsky Normal Form** for `parse()`; use `to_cnf()` first.

```python
from automata.backend.grammar.transducers.scfg_parser import SCFG
```

#### Constructor and parsing from string

```python
SCFG(non_terminals, terminals, productions, start_symbol)
```

Use the class method `SCFG.from_string(grammar_str)` where each line looks like:

`LHS -> RHS [probability]`

For example: `S -> A B [0.7]` or `S -> a [0.3]`. Epsilon may appear as an empty RHS with a probability.

#### Methods

##### `to_cnf() -> SCFG`
Convert the SCFG to Chomsky Normal Form, preserving the stochastic structure (probabilities are adjusted through the transformation pipeline).

##### `parse(sentence: List[Terminal]) -> float`
Run **probabilistic CYK** on a sentence (list of `Terminal` symbols). **Requires** the grammar to already be in CNF. Returns a **float** in `[0, 1]`: the probability of the string under the grammar (sum of probabilities of all derivations). For empty input, returns `1.0` if the start symbol can derive ε, else `0.0`.

**Example:**

```python
grammar_str = """
S -> A B [0.7]
S -> a [0.3]
A -> a [1.0]
B -> b [1.0]
"""
scfg = SCFG.from_string(grammar_str)
cnf = scfg.to_cnf()
from automata.backend.grammar.dist import Terminal
prob = cnf.parse([Terminal("a"), Terminal("b")])
print(prob)  # probability of "ab"
```

**See also:** `examples/scfg_cnf_conversion_example.py` and `automata/backend/grammar/transducers/tests/test_scfg_parser.py`.

#### `FiniteTransducer` (abstract base)

`MealyMachine` subclasses `FiniteTransducer` from `automata.backend.grammar.transducers.finite_transducer`. Subclasses implement `transduce`. Use `MealyMachine` for concrete applications.

---

## Visualization Tools

These tools use [Graphviz](https://graphviz.org/) to generate state-diagram images (PNG, PDF, or SVG) from automaton objects. States are drawn as circles (double circles for accept states), transitions as labeled arrows, and an unlabeled arrow points to the start state.

### AutomataDrawer

```python
from automata.backend.drawings.automata_drawer import AutomataDrawer
```

#### Methods

##### `draw_dfa_from_object(dfa: DFA, filename: str, format: str = "png") -> str`
Generate visualization for a DFA.

**Parameters:**
- `dfa` (DFA): DFA to visualize
- `filename` (str): Output filename (without extension)
- `format` (str): Output format (png, pdf, svg)

**Returns:**
- `str`: Path to generated file

##### `draw_nfa_from_object(nfa: NFA, filename: str, format: str = "png") -> str`
Generate visualization for an NFA with epsilon-transitions.

**Parameters:**
- `nfa` (NFA): NFA to visualize
- `filename` (str): Output filename (without extension)
- `format` (str): Output format (png, pdf, svg)

**Returns:**
- `str`: Path to generated file

##### `draw_mealy_machine_from_object(mealy: MealyMachine, filename: str, format: str = "png") -> str`
Generate visualization for a Mealy machine.

**Parameters:**
- `mealy` (MealyMachine): Mealy machine to visualize
- `filename` (str): Output filename (without extension)
- `format` (str): Output format (png, pdf, svg)

**Returns:**
- `str`: Path to generated file

##### `draw_pda(pda: PDA, filename: str, format: str = "png") -> str`
Generate visualization for a PDA. Edge labels use the format `input, stack_top -> push_symbols`.

**Parameters:**
- `pda` (PDA): PDA to visualize
- `filename` (str): Output filename (without extension)
- `format` (str): Output format (png, pdf, svg)

**Returns:**
- `str`: Path to generated file

---

### TMDrawer

```python
from automata.backend.drawings.tm_drawer import TMDrawer
```

#### Methods

##### `draw_turing_machine(tm: TuringMachine, filename: str) -> str`
Generate visualization for a single-tape Turing machine.

**Parameters:**
- `tm` (TuringMachine): Turing machine to visualize
- `filename` (str): Output filename (without extension)

**Returns:**
- `str`: Path to generated PNG file

##### `draw_multitape_turing_machine(tm: MultiTapeTuringMachine, filename: str) -> str`
Generate visualization for a multi-tape Turing machine.

**Parameters:**
- `tm` (MultiTapeTuringMachine): Multi-tape TM to visualize
- `filename` (str): Output filename (without extension)

**Returns:**
- `str`: Path to generated PNG file

##### `draw_multihead_turing_machine(tm: MultiHeadTuringMachine, filename: str) -> str`
Generate visualization for a multi-head Turing machine.

**Parameters:**
- `tm` (MultiHeadTuringMachine): Multi-head TM to visualize
- `filename` (str): Output filename (without extension)

**Returns:**
- `str`: Path to generated PNG file

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

#### TapeSymbol
A `NewType` wrapper for symbols on a Turing machine tape (often a superset of the input alphabet).

#### Word
Type alias: `Sequence[Symbol]` — sequences accepted by `accepts()` methods.

#### TapeAlphabet
Subclass of `Alphabet` for tape symbols used by Turing machines.

```python
from automata.backend.grammar.dist import TapeSymbol, TapeAlphabet, Word
```

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

The **Knuth-Morris-Pratt (KMP)** algorithm finds all occurrences of a pattern in a text in O(n + m) time, where n is the text length and m is the pattern length. Unlike naive search (which can re-scan characters after a mismatch), KMP preprocesses the pattern into a "failure function" that tells the algorithm how far to shift when a mismatch occurs, so it never backtracks on the text. This makes it particularly efficient for long texts or patterns with repeated prefixes.

```python
from automata.backend.grammar.regular_languages.dfa.algo.kmp import kmp_search
```

#### `kmp_search(pattern: str, text: str) -> List[int]`
Find all occurrences of pattern in text using the Knuth-Morris-Pratt algorithm.

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

#### `build_prefix_function(pattern: str) -> List[int]`
Build the **prefix function** (LPS array: longest proper prefix of `pattern[:i+1]` that is also a suffix). Used internally by `build_kmp_dfa` and `kmp_search`.

#### `build_kmp_dfa(pattern: str, alphabet: Set[str]) -> Tuple[...]`
Build a **DFA** (as transition tables and accept information) that recognizes strings whose **last** `len(pattern)` characters equal `pattern`. This connects KMP pattern matching to finite-state automata.

```python
from automata.backend.grammar.regular_languages.dfa.algo.kmp import (
    build_prefix_function,
    build_kmp_dfa,
    kmp_search,
)
```

**Parameters:**
- `pattern` (str): Pattern string
- `alphabet` (Set[str]): Set of symbols that may appear (must include all characters in `pattern`)

**Returns:**
- `Tuple[Dict[int, Dict[str, int]], int, Set[int]]`: `(transitions, start_state, accept_states)` where states are `0..m` for pattern length `m`, `start_state == 0`, and accept states are `{m}`.

#### Helpers in `dfa_mod_algo`

```python
from automata.backend.grammar.regular_languages.dfa.dfa_mod_algo import (
    create_dfa_from_pattern,
    create_dfa_from_table,
    find_pattern_in_text,
)
```

- **`create_dfa_from_pattern(pattern, alphabet)`** — Builds a `DFA` instance from `build_kmp_dfa` (integer state names, `KMP`-style semantics).
- **`create_dfa_from_table(table, start_state, accept_states, ...)`** — Builds a `DFA` from a string-keyed transition table (used by the public `automata.create_dfa_from_table` export).
- **`find_pattern_in_text(pattern, text)`** — Thin wrapper around `kmp_search`.

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
- **NFA Acceptance**: O(n x 2^m) where m is number of states
- **NFA to DFA**: O(2^n) worst case, often much better in practice
- **Hopcroft Minimization**: O(n log n)
- **Myhill-Nerode Minimization**: O(n^2)
- **PDA Acceptance**: Exponential in worst case (BFS over configurations); practical for typical inputs
- **CYK Algorithm**: O(n^3 x |G|) where n is string length, |G| is grammar size
- **TM Acceptance**: Depends on the machine; bounded by `max_steps` parameter

### Memory Usage

- **DFA**: O(|states| x |alphabet|) for transition table
- **NFA**: O(|states| x |alphabet| x |states|) for transition sets
- **PDA**: O(|configurations visited|) for BFS; bounded by `max_steps`
- **TM**: O(tape cells used) for tape storage
- **Minimization**: Additional O(|states|^2) for analysis tables

---

## Integration Examples

### Combining Multiple Algorithms

```python
# Complete workflow: Regex -> NFA -> DFA -> Minimized DFA
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

print(tm.accepts(list("0110")))  # True (even number of 1s)

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

### SCFG: CNF conversion and probabilistic parsing

```python
from automata.backend.grammar.transducers.scfg_parser import SCFG
from automata.backend.grammar.dist import Terminal

scfg = SCFG.from_string("""
S -> A B [0.5]
S -> a [0.5]
A -> a [1.0]
B -> b [1.0]
""")
cnf = scfg.to_cnf()
p = cnf.parse([Terminal("a"), Terminal("b")])
print("P(ab) =", p)
```

---

## Runtime benchmarks (optional)

The package includes a small **benchmarking** toolkit under `automata.backend.analysis` for measuring algorithm runtimes (e.g., CYK vs input length). This is intended for developers and reproducibility, not for end-user API use.

- `automata.backend.analysis.benchmark` — orchestrates benchmark runs
- `automata.backend.analysis.runtime_benchmarks` — timing helpers
- `automata.backend.analysis.plots` — plotting utilities for benchmark results
- `automata.backend.analysis.generators` — generators for test inputs

See the `analysis` package and `outputs/benchmarks/` if present locally.
