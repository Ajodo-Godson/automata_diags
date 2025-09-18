import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.dist import State, Symbol, Alphabet, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import hopcroft_minimize, analyze_equivalence_classes
from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import myhill_nerode_minimize, get_distinguishability_table, analyze_state_equivalences
from automata.backend.drawings.automata_drawer import AutomataDrawer


def create_example_dfa() -> DFA:
    """
    Create a DFA that accepts strings over {a, b} that end with 'ab'.
    This DFA has some redundant states that can be minimized.
    """
    # States
    q0 = State("q0")  # Start state
    q1 = State("q1")  # Seen 'a'
    q2 = State("q2")  # Seen 'ab' (accepting)
    q3 = State("q3")  # Dead state / other sequences
    q4 = State("q4")  # Redundant state (equivalent to q3)
    
    states = StateSet.from_states([q0, q1, q2, q3, q4])
    
    # Alphabet
    alphabet = Alphabet([Symbol("a"), Symbol("b")])
    
    # Transitions
    transitions = {
        q0: {Symbol("a"): q1, Symbol("b"): q3},
        q1: {Symbol("a"): q1, Symbol("b"): q2},
        q2: {Symbol("a"): q1, Symbol("b"): q3},
        q3: {Symbol("a"): q4, Symbol("b"): q3},  # q3 and q4 are equivalent
        q4: {Symbol("a"): q4, Symbol("b"): q3},  # Both lead to same behavior
    }
    
    # Start state
    start_state = q0
    
    # Accept states
    accept_states = StateSet.from_states([q2])
    
    return DFA(states, alphabet, transitions, start_state, accept_states)


def main():
    """
    Demonstrate DFA minimization using both Hopcroft's and Myhill-Nerode algorithms.
    """
    print("=== DFA Minimization Comparison ===\n")
    
    # Create example DFA
    original_dfa = create_example_dfa()
    
    print("Original DFA:")
    print(f"  States: {[str(s) for s in original_dfa._states.states()]}")
    print(f"  Alphabet: {[str(s) for s in original_dfa._alphabet.symbols()]}")
    print(f"  Start state: {original_dfa._start_state}")
    print(f"  Accept states: {[str(s) for s in original_dfa._accept_states.states()]}")
    print("  Transitions:")
    for state, transitions in original_dfa._transitions.items():
        for symbol, target in transitions.items():
            print(f"    δ({state}, {symbol}) = {target}")
    
    # Test some strings
    test_strings = ["ab", "aab", "bab", "a", "b", "ba", "abb"]
    print(f"\n  Language: strings ending with 'ab'")
    print("  Test strings:")
    for test_str in test_strings:
        word = [Symbol(c) for c in test_str]
        accepted = original_dfa.accepts(word)
        print(f"    '{test_str}': {'✓' if accepted else '✗'}")
    
    print("\n" + "="*60)
    
    # Hopcroft's Algorithm
    print("\n=== Hopcroft's Minimization ===")
    
    hopcroft_dfa = hopcroft_minimize(original_dfa)
    equivalence_classes = analyze_equivalence_classes(original_dfa)
    
    print("\nEquivalence classes found by Hopcroft:")
    for class_name, states in equivalence_classes.items():
        print(f"  {class_name}: {states}")
    
    print(f"\nMinimized DFA (Hopcroft):")
    print(f"  States: {[str(s) for s in hopcroft_dfa._states.states()]}")
    print(f"  Start state: {hopcroft_dfa._start_state}")
    print(f"  Accept states: {[str(s) for s in hopcroft_dfa._accept_states.states()]}")
    print("  Transitions:")
    for state, transitions in hopcroft_dfa._transitions.items():
        for symbol, target in transitions.items():
            print(f"    δ({state}, {symbol}) = {target}")
    
    # Verify minimized DFA accepts same language
    print("\n  Verification (same test strings):")
    for test_str in test_strings:
        word = [Symbol(c) for c in test_str]
        original_result = original_dfa.accepts(word)
        hopcroft_result = hopcroft_dfa.accepts(word)
        status = "✓" if original_result == hopcroft_result else "✗ MISMATCH"
        print(f"    '{test_str}': {status}")
    
    print("\n" + "="*60)
    
    # Myhill-Nerode Algorithm
    print("\n=== Myhill-Nerode Minimization ===")
    
    myhill_nerode_dfa = myhill_nerode_minimize(original_dfa)
    distinguishability_table = get_distinguishability_table(original_dfa)
    state_equivalences = analyze_state_equivalences(original_dfa)
    
    print("\nDistinguishability table:")
    for (state1, state2), distinguishable in distinguishability_table.items():
        status = "distinguishable" if distinguishable else "equivalent"
        print(f"  ({state1}, {state2}): {status}")
    
    print("\nEquivalence groups found by Myhill-Nerode:")
    for group_name, states in state_equivalences.items():
        print(f"  {group_name}: {list(states)}")
    
    print(f"\nMinimized DFA (Myhill-Nerode):")
    print(f"  States: {[str(s) for s in myhill_nerode_dfa._states.states()]}")
    print(f"  Start state: {myhill_nerode_dfa._start_state}")
    print(f"  Accept states: {[str(s) for s in myhill_nerode_dfa._accept_states.states()]}")
    print("  Transitions:")
    for state, transitions in myhill_nerode_dfa._transitions.items():
        for symbol, target in transitions.items():
            print(f"    δ({state}, {symbol}) = {target}")
    
    # Verify minimized DFA accepts same language
    print("\n  Verification (same test strings):")
    for test_str in test_strings:
        word = [Symbol(c) for c in test_str]
        original_result = original_dfa.accepts(word)
        myhill_result = myhill_nerode_dfa.accepts(word)
        status = "✓" if original_result == myhill_result else "✗ MISMATCH"
        print(f"    '{test_str}': {status}")
    
    print("\n" + "="*60)
    
    # Compare results
    print("\n=== Algorithm Comparison ===")
    print(f"Original DFA: {len(original_dfa._states.states())} states")
    print(f"Hopcroft minimized: {len(hopcroft_dfa._states.states())} states")
    print(f"Myhill-Nerode minimized: {len(myhill_nerode_dfa._states.states())} states")
    
    # Both algorithms should produce DFAs with the same number of states
    if len(hopcroft_dfa._states.states()) == len(myhill_nerode_dfa._states.states()):
        print("✓ Both algorithms produced the same number of states (as expected)")
    else:
        print("✗ Algorithms produced different numbers of states (unexpected)")
    
    # Generate visualizations
    print(f"\n=== Generating Visualizations ===")
    drawer = AutomataDrawer()
    
    try:
        drawer.draw_dfa_from_object(
            original_dfa,
            filename="outputs/dfa_original_minimization"
        )
        print("✓ Generated: outputs/dfa_original_minimization.png")
        
        drawer.draw_dfa_from_object(
            hopcroft_dfa,
            filename="outputs/dfa_hopcroft_minimized"
        )
        print("✓ Generated: outputs/dfa_hopcroft_minimized.png")
        
        drawer.draw_dfa_from_object(
            myhill_nerode_dfa,
            filename="outputs/dfa_myhill_nerode_minimized"
        )
        print("✓ Generated: outputs/dfa_myhill_nerode_minimized.png")
        
    except Exception as e:
        print(f"✗ Visualization failed: {e}")


if __name__ == "__main__":
    main()
