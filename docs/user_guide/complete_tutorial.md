# Complete Tutorial: Automata Diags

## Table of Contents

1. [Getting Started](#getting-started)
2. [Working with DFAs](#working-with-dfas)
3. [Non-deterministic Finite Automata](#non-deterministic-finite-automata)
4. [Regular Expressions](#regular-expressions)
5. [DFA Minimization](#dfa-minimization)
6. [Context-Free Grammars](#context-free-grammars)
7. [Finite-State Transducers](#finite-state-transducers)
8. [Visualization Techniques](#visualization-techniques)
9. [Advanced Examples](#advanced-examples)
10. [Best Practices](#best-practices)

---

## Getting Started

### Installation

```bash
# Install from TestPyPI (latest features)
pip install -i https://test.pypi.org/simple/ automata-diags==0.2.0

# Or from PyPI (stable)
pip install automata-diags
```

### Basic Imports

```python
# Core automata types
from automata.backend.grammar.dist import State, Symbol, Alphabet, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA

# Visualization
from automata.backend.drawings.automata_drawer import AutomataDrawer

# Algorithms
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import hopcroft_minimize
```

---

## Working with DFAs

### Creating Your First DFA

Let's create a DFA that accepts binary strings with an even number of 1s:

```python
def create_even_ones_dfa():
    """Creates a DFA that accepts strings with even number of 1s"""
    
    # Define states
    even = State("even")  # Even number of 1s (accepting)
    odd = State("odd")    # Odd number of 1s (rejecting)
    
    states = StateSet.from_states([even, odd])
    
    # Define alphabet
    alphabet = Alphabet([Symbol("0"), Symbol("1")])
    
    # Define transitions
    transitions = {
        even: {Symbol("0"): even, Symbol("1"): odd},
        odd:  {Symbol("0"): odd,  Symbol("1"): even},
    }
    
    # Create DFA
    dfa = DFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state=even,
        accept_states=StateSet.from_states([even])
    )
    
    return dfa

# Test the DFA
dfa = create_even_ones_dfa()

test_strings = ["", "0", "1", "11", "101", "1001", "1111"]
for s in test_strings:
    word = [Symbol(c) for c in s]
    result = dfa.accepts(word)
    ones_count = s.count("1")
    print(f"'{s}' ({ones_count} ones): {'✓' if result else '✗'}")
```

**Output:**
```
'' (0 ones): ✓
'0' (0 ones): ✓
'1' (1 ones): ✗
'11' (2 ones): ✓
'101' (2 ones): ✓
'1001' (2 ones): ✓
'1111' (4 ones): ✓
```

### DFA Properties and Analysis

```python
def analyze_dfa(dfa):
    """Analyze DFA properties"""
    
    print(f"States: {len(dfa._states.states())}")
    print(f"Alphabet size: {len(dfa._alphabet.symbols())}")
    print(f"Start state: {dfa._start_state}")
    print(f"Accept states: {list(dfa._accept_states.states())}")
    
    # Check if DFA is complete
    complete = True
    for state in dfa._states.states():
        if state not in dfa._transitions:
            complete = False
            break
        for symbol in dfa._alphabet.symbols():
            if symbol not in dfa._transitions[state]:
                complete = False
                break
    
    print(f"Complete DFA: {'Yes' if complete else 'No'}")

analyze_dfa(dfa)
```

---

## Non-deterministic Finite Automata

### Creating an NFA

NFAs can have multiple transitions from the same state on the same symbol, and ε-transitions:

```python
def create_nfa_example():
    """Creates an NFA that accepts strings ending with 'ab'"""
    
    states = StateSet.from_states([
        State("q0"),  # Start state
        State("q1"),  # After reading 'a'
        State("q2")   # After reading 'ab' (accepting)
    ])
    
    alphabet = Alphabet([Symbol("a"), Symbol("b")])
    
    # NFA transitions (note: values are StateSets, not single States)
    transitions = {
        State("q0"): {
            Symbol("a"): StateSet.from_states([State("q0"), State("q1")]),
            Symbol("b"): StateSet.from_states([State("q0")])
        },
        State("q1"): {
            Symbol("b"): StateSet.from_states([State("q2")])
        },
        State("q2"): {}  # No outgoing transitions
    }
    
    nfa = NFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state=State("q0"),
        accept_states=StateSet.from_states([State("q2")])
    )
    
    return nfa

# Test the NFA
nfa = create_nfa_example()

test_words = ["ab", "aab", "bab", "abb", "a", "b"]
print("NFA accepting strings ending with 'ab':")
for word_str in test_words:
    word = [Symbol(c) for c in word_str]
    result = nfa.accepts(word)
    print(f"'{word_str}': {'✓' if result else '✗'}")
```

### Converting NFA to DFA

```python
# Convert the NFA to an equivalent DFA
dfa_from_nfa = nfa.to_dfa()

print(f"\nNFA has {len(nfa._states.states())} states")
print(f"Equivalent DFA has {len(dfa_from_nfa._states.states())} states")

# Verify they accept the same language
print("\nVerification (NFA vs DFA):")
for word_str in test_words:
    word = [Symbol(c) for c in word_str]
    nfa_result = nfa.accepts(word)
    dfa_result = dfa_from_nfa.accepts(word)
    match = "✓" if nfa_result == dfa_result else "✗ MISMATCH"
    print(f"'{word_str}': NFA={nfa_result}, DFA={dfa_result} {match}")
```

---

## Regular Expressions

### Thompson's Construction

Convert regular expressions to NFAs using Thompson's construction:

```python
def regex_examples():
    """Examples of regex to NFA conversion"""
    
    expressions = [
        "a*",           # Zero or more 'a's
        "(a|b)*",       # Any string over {a,b}
        "(a|b)*ab",     # Strings ending with 'ab'
        "a(b|c)*d",     # 'a' followed by any b's or c's, ending with 'd'
    ]
    
    for regex in expressions:
        print(f"\nRegex: {regex}")
        nfa = NFA.from_regex(regex)
        print(f"Generated NFA with {len(nfa._states.states())} states")
        
        # Test some strings
        if regex == "a*":
            test_strings = ["", "a", "aa", "aaa", "b"]
        elif regex == "(a|b)*ab":
            test_strings = ["ab", "aab", "bab", "abab", "ba"]
        else:
            test_strings = ["a", "ab", "abc", ""]
            
        for test in test_strings:
            word = [Symbol(c) for c in test]
            result = nfa.accepts(word)
            print(f"  '{test}': {'✓' if result else '✗'}")

regex_examples()
```

### Advanced Regex Patterns

```python
def complex_regex_demo():
    """Demonstrate complex regex patterns"""
    
    # Email-like pattern (simplified)
    # Pattern: letter followed by letters/digits, @, letters, dot, letters
    email_pattern = "a(a|b)*"  # Simplified for demo
    
    # Phone number pattern (simplified)
    # Pattern: 3 digits, dash, 4 digits
    phone_pattern = "(0|1)(0|1)(0|1)"  # Simplified for demo
    
    patterns = {
        "Simple email": email_pattern,
        "Binary triplet": phone_pattern,
    }
    
    for name, pattern in patterns.items():
        print(f"\n{name}: {pattern}")
        nfa = NFA.from_regex(pattern)
        
        # Convert to DFA for efficiency
        dfa = nfa.to_dfa()
        print(f"NFA: {len(nfa._states.states())} states")
        print(f"DFA: {len(dfa._states.states())} states")

complex_regex_demo()
```

---

## DFA Minimization

### Comparing Minimization Algorithms

```python
def minimization_comparison():
    """Compare Hopcroft and Myhill-Nerode algorithms"""
    
    # Create a DFA with redundant states
    states = StateSet.from_states([
        State("q0"), State("q1"), State("q2"), 
        State("q3"), State("q4")  # q3 and q4 will be equivalent
    ])
    
    alphabet = Alphabet([Symbol("a"), Symbol("b")])
    
    transitions = {
        State("q0"): {Symbol("a"): State("q1"), Symbol("b"): State("q3")},
        State("q1"): {Symbol("a"): State("q1"), Symbol("b"): State("q2")},
        State("q2"): {Symbol("a"): State("q1"), Symbol("b"): State("q3")},
        State("q3"): {Symbol("a"): State("q4"), Symbol("b"): State("q3")},
        State("q4"): {Symbol("a"): State("q4"), Symbol("b"): State("q3")},
    }
    
    original_dfa = DFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state=State("q0"),
        accept_states=StateSet.from_states([State("q2")])
    )
    
    print(f"Original DFA: {len(original_dfa._states.states())} states")
    
    # Hopcroft's algorithm
    from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import (
        hopcroft_minimize, analyze_equivalence_classes
    )
    
    hopcroft_dfa = hopcroft_minimize(original_dfa)
    equiv_classes = analyze_equivalence_classes(original_dfa)
    
    print(f"Hopcroft minimized: {len(hopcroft_dfa._states.states())} states")
    print("Equivalence classes:")
    for class_name, states in equiv_classes.items():
        print(f"  {class_name}: {states}")
    
    # Myhill-Nerode algorithm
    from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import (
        myhill_nerode_minimize, get_distinguishability_table
    )
    
    myhill_dfa = myhill_nerode_minimize(original_dfa)
    distinguishability = get_distinguishability_table(original_dfa)
    
    print(f"Myhill-Nerode minimized: {len(myhill_dfa._states.states())} states")
    print("Distinguishability table:")
    for (s1, s2), distinguishable in distinguishability.items():
        status = "distinguishable" if distinguishable else "equivalent"
        print(f"  ({s1}, {s2}): {status}")
    
    # Verify both produce same result
    same_size = len(hopcroft_dfa._states.states()) == len(myhill_dfa._states.states())
    print(f"\nBoth algorithms agree: {'✓' if same_size else '✗'}")

minimization_comparison()
```

---

## Context-Free Grammars

### Creating and Parsing Grammars

```python
def cfg_examples():
    """Examples of context-free grammar operations"""
    
    # Arithmetic expressions grammar
    grammar_str = """
    E -> E + T | E - T | T
    T -> T * F | T / F | F
    F -> ( E ) | id | num
    """
    
    print("Original Grammar:")
    print(grammar_str)
    
    from automata.backend.grammar.context_free.cfg_mod import CFG
    
    cfg = CFG.from_string(grammar_str)
    
    print(f"Non-terminals: {cfg.non_terminals}")
    print(f"Terminals: {cfg.terminals}")
    print(f"Start symbol: {cfg.start_symbol}")
    print(f"Number of productions: {len(cfg.productions)}")

cfg_examples()
```

### Chomsky Normal Form Conversion

```python
def cnf_conversion_demo():
    """Demonstrate CNF conversion with step-by-step analysis"""
    
    # Grammar with various types of productions
    grammar_str = """
    S -> A S B | a | b
    A -> a A | ε
    B -> S b | b
    """
    
    print("Original Grammar:")
    for line in grammar_str.strip().split('\n'):
        if line.strip():
            print(f"  {line.strip()}")
    
    cfg = CFG.from_string(grammar_str)
    
    # Convert to CNF
    cnf_cfg = cfg.to_cnf()
    
    print(f"\nChomsky Normal Form:")
    print(f"Productions ({len(cnf_cfg.productions)}):")
    for prod in cnf_cfg.productions:
        print(f"  {prod}")
    
    # Verify CNF properties
    print(f"\nCNF Verification:")
    valid_cnf = True
    for prod in cnf_cfg.productions:
        if len(prod.rhs) == 0:
            print(f"  ✗ Empty production: {prod}")
            valid_cnf = False
        elif len(prod.rhs) == 1:
            # Should be A -> a (terminal)
            if prod.rhs[0][0].isupper():
                print(f"  ✗ Unit production: {prod}")
                valid_cnf = False
        elif len(prod.rhs) == 2:
            # Should be A -> BC (two non-terminals)
            if not (prod.rhs[0][0].isupper() and prod.rhs[1][0].isupper()):
                print(f"  ✗ Mixed production: {prod}")
                valid_cnf = False
        else:
            print(f"  ✗ Long production: {prod}")
            valid_cnf = False
    
    if valid_cnf:
        print("  ✓ All productions are in valid CNF format")

cnf_conversion_demo()
```

---

## Finite-State Transducers

### Mealy Machine Example

```python
def mealy_machine_demo():
    """Create and test a Mealy machine"""
    
    from automata.backend.grammar.transducers.mealy_machine import MealyMachine
    from automata.backend.grammar.dist import OutputAlphabet
    
    # Binary to unary converter
    # Input: binary digits, Output: corresponding unary representation
    
    states = StateSet.from_states([State("q0")])
    input_alphabet = Alphabet([Symbol("0"), Symbol("1")])
    output_alphabet = OutputAlphabet([Symbol(""), Symbol("I")])
    
    transitions = {
        State("q0"): {
            Symbol("0"): State("q0"),
            Symbol("1"): State("q0")
        }
    }
    
    output_function = {
        (State("q0"), Symbol("0")): "",
        (State("q0"), Symbol("1")): "I"
    }
    
    mealy = MealyMachine(
        states=states,
        input_alphabet=input_alphabet,
        output_alphabet=output_alphabet,
        transitions=transitions,
        output_function=output_function,
        start_state=State("q0")
    )
    
    # Test the transducer
    test_inputs = ["0", "1", "10", "11", "101", "1111"]
    
    print("Binary to Unary Conversion:")
    for binary in test_inputs:
        unary = mealy.transduce(binary)
        decimal = sum(int(bit) for bit in binary)
        print(f"  {binary} → '{unary}' (decimal: {decimal})")

mealy_machine_demo()
```

---

## Visualization Techniques

### Creating Professional Diagrams

```python
def visualization_showcase():
    """Demonstrate various visualization options"""
    
    drawer = AutomataDrawer()
    
    # Create sample automata
    dfa = create_even_ones_dfa()  # From earlier example
    nfa = create_nfa_example()    # From earlier example
    
    # Generate visualizations
    print("Generating visualizations...")
    
    try:
        # DFA visualization
        dfa_path = drawer.draw_dfa_from_object(dfa, "even_ones_dfa")
        print(f"✓ DFA diagram: {dfa_path}")
        
        # NFA visualization
        nfa_path = drawer.draw_nfa_from_object(nfa, "ending_ab_nfa")
        print(f"✓ NFA diagram: {nfa_path}")
        
        # Minimized DFA
        minimized = hopcroft_minimize(dfa)
        min_path = drawer.draw_dfa_from_object(minimized, "minimized_dfa")
        print(f"✓ Minimized DFA: {min_path}")
        
    except Exception as e:
        print(f"✗ Visualization error: {e}")

visualization_showcase()
```

### Customizing Visualizations

```python
def advanced_visualization():
    """Advanced visualization techniques"""
    
    # Create a more complex DFA for demonstration
    states = StateSet.from_states([
        State("start"), State("a_seen"), State("ab_seen"), 
        State("reject"), State("accept")
    ])
    
    alphabet = Alphabet([Symbol("a"), Symbol("b")])
    
    transitions = {
        State("start"): {Symbol("a"): State("a_seen"), Symbol("b"): State("reject")},
        State("a_seen"): {Symbol("a"): State("a_seen"), Symbol("b"): State("ab_seen")},
        State("ab_seen"): {Symbol("a"): State("accept"), Symbol("b"): State("reject")},
        State("accept"): {Symbol("a"): State("accept"), Symbol("b"): State("accept")},
        State("reject"): {Symbol("a"): State("reject"), Symbol("b"): State("reject")},
    }
    
    dfa = DFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state=State("start"),
        accept_states=StateSet.from_states([State("accept")])
    )
    
    drawer = AutomataDrawer()
    
    # Different filename formats
    try:
        path = drawer.draw_dfa_from_object(dfa, "complex_dfa_example")
        print(f"Complex DFA visualization saved to: {path}")
        
        # Show the structure
        print(f"\nDFA Analysis:")
        print(f"  States: {len(dfa._states.states())}")
        print(f"  Transitions: {sum(len(trans) for trans in dfa._transitions.values())}")
        print(f"  Language: Strings containing 'aba' as substring")
        
    except Exception as e:
        print(f"Visualization failed: {e}")

advanced_visualization()
```

---

## Advanced Examples

### Complete Workflow Example

```python
def complete_workflow():
    """End-to-end example: Regex → NFA → DFA → Minimization → Analysis"""
    
    print("=== Complete Automata Workflow ===\n")
    
    # Step 1: Start with a regular expression
    regex = "(a|b)*abb"
    print(f"1. Regular Expression: {regex}")
    print("   Language: strings ending with 'abb'")
    
    # Step 2: Convert to NFA
    nfa = NFA.from_regex(regex)
    print(f"2. NFA: {len(nfa._states.states())} states")
    
    # Step 3: Convert to DFA
    dfa = nfa.to_dfa()
    print(f"3. DFA: {len(dfa._states.states())} states")
    
    # Step 4: Minimize DFA
    minimized = hopcroft_minimize(dfa)
    print(f"4. Minimized DFA: {len(minimized._states.states())} states")
    
    # Step 5: Test and analyze
    test_strings = ["abb", "aabb", "babb", "ababb", "ab", "bb", "a"]
    
    print(f"\n5. Testing all automata:")
    print("   String   | NFA | DFA | Min | Expected")
    print("   ---------|-----|-----|-----|----------")
    
    for test in test_strings:
        word = [Symbol(c) for c in test]
        nfa_result = nfa.accepts(word)
        dfa_result = dfa.accepts(word)
        min_result = minimized.accepts(word)
        expected = test.endswith("abb")
        
        status = "✓" if all([nfa_result == expected, 
                           dfa_result == expected, 
                           min_result == expected]) else "✗"
        
        print(f"   {test:8} |  {str(nfa_result)[0]}  |  {str(dfa_result)[0]}  |  {str(min_result)[0]}  | {str(expected):8} {status}")
    
    # Step 6: Generate visualizations
    drawer = AutomataDrawer()
    try:
        drawer.draw_nfa_from_object(nfa, "workflow_nfa")
        drawer.draw_dfa_from_object(dfa, "workflow_dfa")
        drawer.draw_dfa_from_object(minimized, "workflow_minimized")
        print(f"\n6. Visualizations generated in outputs/ directory")
    except Exception as e:
        print(f"\n6. Visualization error: {e}")

complete_workflow()
```

### Educational Analysis Tool

```python
def educational_analysis():
    """Tool for educational analysis of automata properties"""
    
    def analyze_language_properties(automaton, name, test_cases):
        """Analyze properties of the language accepted by an automaton"""
        
        print(f"\n=== Analysis of {name} ===")
        
        # Basic properties
        if hasattr(automaton, '_states'):
            print(f"States: {len(automaton._states.states())}")
        if hasattr(automaton, '_alphabet'):
            print(f"Alphabet: {list(automaton._alphabet.symbols())}")
        
        # Test cases analysis
        accepted = []
        rejected = []
        
        for test in test_cases:
            word = [Symbol(c) for c in test]
            if automaton.accepts(word):
                accepted.append(test)
            else:
                rejected.append(test)
        
        print(f"Accepted strings: {accepted}")
        print(f"Rejected strings: {rejected}")
        
        # Pattern analysis
        if accepted:
            lengths = [len(s) for s in accepted]
            print(f"Accepted string lengths: {sorted(set(lengths))}")
            
            # Look for common patterns
            if all(s.endswith('ab') for s in accepted if len(s) >= 2):
                print("Pattern: All accepted strings end with 'ab'")
            elif all(s.count('1') % 2 == 0 for s in accepted):
                print("Pattern: All accepted strings have even number of 1s")
    
    # Create several automata for analysis
    automata = {
        "Even 1s DFA": create_even_ones_dfa(),
        "Ends with 'ab' NFA": create_nfa_example(),
    }
    
    test_cases = ["", "a", "b", "ab", "ba", "aa", "bb", "aba", "abb", "11", "101"]
    
    for name, automaton in automata.items():
        analyze_language_properties(automaton, name, test_cases)

educational_analysis()
```

---

## Best Practices

### 1. **Design Patterns**

```python
def design_patterns():
    """Best practices for automata design"""
    
    # ✓ Good: Clear state naming
    states_good = StateSet.from_states([
        State("waiting_for_input"),
        State("processing_a"),
        State("accepting_ab"),
        State("rejected")
    ])
    
    # ✗ Avoid: Unclear state names
    states_bad = StateSet.from_states([
        State("q0"), State("q1"), State("q2"), State("q3")
    ])
    
    # ✓ Good: Complete transition function
    def create_complete_dfa():
        states = StateSet.from_states([State("even"), State("odd")])
        alphabet = Alphabet([Symbol("0"), Symbol("1")])
        
        transitions = {}
        for state in states.states():
            transitions[state] = {}
            for symbol in alphabet.symbols():
                # Ensure every (state, symbol) pair has a transition
                if state == State("even"):
                    transitions[state][symbol] = State("odd") if symbol == Symbol("1") else State("even")
                else:
                    transitions[state][symbol] = State("even") if symbol == Symbol("1") else State("odd")
        
        return DFA(states, alphabet, transitions, State("even"), StateSet.from_states([State("even")]))
    
    # ✓ Good: Input validation
    def safe_accepts(dfa, word_string):
        try:
            word = [Symbol(c) for c in word_string]
            # Validate symbols are in alphabet
            for symbol in word:
                if symbol not in dfa._alphabet.symbols():
                    return False, f"Symbol '{symbol}' not in alphabet"
            return dfa.accepts(word), "Valid"
        except Exception as e:
            return False, f"Error: {e}"
    
    print("Design pattern examples created successfully")

design_patterns()
```

### 2. **Performance Optimization**

```python
def performance_tips():
    """Performance optimization techniques"""
    
    # ✓ Minimize DFAs for better performance
    def optimize_dfa(dfa):
        minimized = hopcroft_minimize(dfa)
        reduction = len(dfa._states.states()) - len(minimized._states.states())
        print(f"State reduction: {reduction} states ({reduction/len(dfa._states.states())*100:.1f}%)")
        return minimized
    
    # ✓ Use DFA for repeated string testing
    def efficient_pattern_matching():
        # Convert NFA to DFA once, then reuse
        nfa = NFA.from_regex("(a|b)*ab")
        dfa = nfa.to_dfa()  # One-time conversion cost
        minimized = hopcroft_minimize(dfa)  # Further optimization
        
        # Now test many strings efficiently
        test_strings = ["ab", "aab", "bab"] * 1000  # Large test set
        results = []
        
        for test in test_strings:
            word = [Symbol(c) for c in test]
            results.append(minimized.accepts(word))  # O(n) per test
        
        print(f"Tested {len(test_strings)} strings efficiently")
        return results
    
    # ✓ Memory-efficient state representation
    def memory_efficient_creation():
        # Reuse state objects instead of creating duplicates
        state_cache = {}
        
        def get_state(name):
            if name not in state_cache:
                state_cache[name] = State(name)
            return state_cache[name]
        
        # Use cached states
        s0, s1, s2 = get_state("s0"), get_state("s1"), get_state("s2")
        print(f"Created {len(state_cache)} unique states")
    
    print("Performance optimization examples ready")

performance_tips()
```

### 3. **Error Handling and Debugging**

```python
def error_handling_examples():
    """Best practices for error handling and debugging"""
    
    def robust_dfa_creation(state_names, alphabet_symbols, transitions_dict, start, accept_list):
        """Create DFA with comprehensive error checking"""
        
        try:
            # Validate inputs
            if not state_names:
                raise ValueError("State names cannot be empty")
            
            if not alphabet_symbols:
                raise ValueError("Alphabet cannot be empty")
            
            if start not in state_names:
                raise ValueError(f"Start state '{start}' not in state list")
            
            for accept in accept_list:
                if accept not in state_names:
                    raise ValueError(f"Accept state '{accept}' not in state list")
            
            # Create states and alphabet
            states = StateSet.from_states([State(name) for name in state_names])
            alphabet = Alphabet([Symbol(sym) for sym in alphabet_symbols])
            
            # Validate and create transitions
            transitions = {}
            for state_name, state_transitions in transitions_dict.items():
                if state_name not in state_names:
                    raise ValueError(f"Unknown state in transitions: '{state_name}'")
                
                state_obj = State(state_name)
                transitions[state_obj] = {}
                
                for symbol, target in state_transitions.items():
                    if symbol not in alphabet_symbols:
                        raise ValueError(f"Unknown symbol: '{symbol}'")
                    if target not in state_names:
                        raise ValueError(f"Unknown target state: '{target}'")
                    
                    transitions[state_obj][Symbol(symbol)] = State(target)
            
            # Check completeness
            for state_name in state_names:
                state_obj = State(state_name)
                if state_obj not in transitions:
                    print(f"Warning: No transitions defined for state '{state_name}'")
                else:
                    missing_symbols = set(alphabet_symbols) - set(trans.value for trans in transitions[state_obj].keys())
                    if missing_symbols:
                        print(f"Warning: State '{state_name}' missing transitions for symbols: {missing_symbols}")
            
            # Create DFA
            dfa = DFA(
                states=states,
                alphabet=alphabet,
                transitions=transitions,
                start_state=State(start),
                accept_states=StateSet.from_states([State(name) for name in accept_list])
            )
            
            print(f"✓ Successfully created DFA with {len(state_names)} states")
            return dfa
            
        except Exception as e:
            print(f"✗ Error creating DFA: {e}")
            return None
    
    # Example usage
    dfa = robust_dfa_creation(
        state_names=["q0", "q1", "q2"],
        alphabet_symbols=["a", "b"],
        transitions_dict={
            "q0": {"a": "q1", "b": "q0"},
            "q1": {"a": "q1", "b": "q2"},
            "q2": {"a": "q1", "b": "q0"}
        },
        start="q0",
        accept_list=["q2"]
    )

error_handling_examples()
```

### 4. **Testing and Validation**

```python
def testing_best_practices():
    """Best practices for testing automata"""
    
    def comprehensive_test_suite(automaton, expected_language_description):
        """Comprehensive testing framework for automata"""
        
        print(f"\n=== Testing: {expected_language_description} ===")
        
        # Test categories
        test_cases = {
            "Empty string": "",
            "Single symbols": ["a", "b"],
            "Short strings": ["ab", "ba", "aa", "bb"],
            "Medium strings": ["aba", "abb", "bab", "bba"],
            "Long strings": ["abab", "baba", "aaaa", "bbbb"],
            "Edge cases": ["aaaaab", "bbbba", "ababab"]
        }
        
        total_tests = 0
        categories_passed = 0
        
        for category, tests in test_cases.items():
            if isinstance(tests, str):
                tests = [tests]
            
            print(f"\n{category}:")
            category_passed = True
            
            for test in tests:
                word = [Symbol(c) for c in test]
                try:
                    result = automaton.accepts(word)
                    print(f"  '{test}': {'✓' if result else '✗'}")
                    total_tests += 1
                except Exception as e:
                    print(f"  '{test}': ERROR - {e}")
                    category_passed = False
            
            if category_passed:
                categories_passed += 1
        
        print(f"\nSummary: {categories_passed}/{len(test_cases)} categories completed successfully")
        return categories_passed == len(test_cases)
    
    # Property-based testing
    def property_tests(dfa):
        """Test fundamental DFA properties"""
        
        print("\n=== Property Tests ===")
        
        # Test 1: Determinism
        deterministic = True
        for state in dfa._states.states():
            if state in dfa._transitions:
                for symbol in dfa._alphabet.symbols():
                    if symbol in dfa._transitions[state]:
                        # Should have exactly one target state
                        target = dfa._transitions[state][symbol]
                        if not isinstance(target, State):
                            deterministic = False
                            break
        
        print(f"Deterministic: {'✓' if deterministic else '✗'}")
        
        # Test 2: Completeness
        complete = True
        missing_transitions = []
        for state in dfa._states.states():
            for symbol in dfa._alphabet.symbols():
                if state not in dfa._transitions or symbol not in dfa._transitions[state]:
                    complete = False
                    missing_transitions.append((state, symbol))
        
        print(f"Complete: {'✓' if complete else '✗'}")
        if missing_transitions:
            print(f"  Missing: {missing_transitions[:3]}{'...' if len(missing_transitions) > 3 else ''}")
        
        # Test 3: Consistency
        consistent = True
        try:
            # Test that start state and accept states are in state set
            if dfa._start_state not in dfa._states.states():
                consistent = False
                print("  Start state not in state set")
            
            for accept_state in dfa._accept_states.states():
                if accept_state not in dfa._states.states():
                    consistent = False
                    print(f"  Accept state {accept_state} not in state set")
                    
        except Exception as e:
            consistent = False
            print(f"  Consistency error: {e}")
        
        print(f"Consistent: {'✓' if consistent else '✗'}")
        
        return deterministic and complete and consistent
    
    # Example usage
    dfa = create_even_ones_dfa()
    comprehensive_test_suite(dfa, "strings with even number of 1s")
    property_tests(dfa)

testing_best_practices()
```

---

## Conclusion

This tutorial covered the comprehensive features of the Automata Diags package:

- **Finite Automata**: DFA and NFA creation, conversion, and minimization
- **Regular Expressions**: Thompson's construction and pattern matching
- **Context-Free Grammars**: CNF conversion and grammar analysis
- **Transducers**: Mealy machines for input-output mapping
- **Visualization**: Professional diagram generation
- **Best Practices**: Performance, testing, and error handling

### Next Steps

1. **Explore Advanced Topics**: Look into pushdown automata and context-sensitive grammars
2. **Contribute**: Add new algorithms or improve existing implementations
3. **Integrate**: Use the package in your own projects or educational materials
4. **Extend**: Build custom visualizations or analysis tools

### Resources

- **API Reference**: Complete function documentation
- **Examples**: Additional examples in the `examples/` directory
- **Source Code**: Full implementation available on GitHub
- **Community**: Join discussions and contribute improvements

Happy automata building! 🤖✨
