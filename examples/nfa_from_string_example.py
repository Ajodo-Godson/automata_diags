import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.dist import Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.drawings.automata_drawer import AutomataDrawer

def main():
    """
    Tests the NFA.from_string() class method.
    """
    print("=== Testing NFA.from_string() ===")

    # This NFA accepts any string containing the substring "aba"
    nfa_string = "q0,a,q0,q1;q0,b,q0;q1,b,q2;q2,a,q3;q3,a,q3;q3,b,q3"
    start_state = "q0"
    accept_states = {"q3"}

    print(f"\nCreating NFA from string: \"{nfa_string}\"")
    nfa = NFA.from_string(
        nfa_string=nfa_string,
        start_state=start_state,
        accept_states=accept_states
    )

    print("\n--- Verifying Language ---")
    test_cases = {
        "aba": True,
        "aaba": True,
        "babab": True,
        "aaabaaa": True,
        "ab": False,
        "baa": False,
        "a": False,
        "": False,
    }

    all_passed = True
    for test_str, expected in test_cases.items():
        word = [Symbol(c) for c in test_str]
        result = nfa.accepts(word)
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
        print(f"  '{test_str}': Expected {expected}, Got {result} -> {status}")

    if all_passed:
        print("\n✓ All test cases passed!")
    else:
        print("\n✗ Some test cases failed.")

    # Visualize the NFA
    print("\n--- Generating Visualization ---")
    try:
        drawer = AutomataDrawer()
        drawer.draw_nfa_from_object(nfa, "nfa_from_string_example")
        print("✓ Visualization saved to 'outputs/nfa_from_string_example.png'")
    except Exception as e:
        print(f"✗ Visualization failed: {e}")

if __name__ == "__main__":
    main()
