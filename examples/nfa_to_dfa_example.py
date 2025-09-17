import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.drawings.automata_drawer import AutomataDrawer

def main():
    """
    Shows an example of converting an NFA to a DFA.
    """
    # 1. Create an NFA that accepts strings ending with 'ab'
    nfa = NFA(
        states=StateSet({'q0', 'q1', 'q2'}),
        alphabet=Alphabet({'a', 'b'}),
        transitions={
            State('q0'): {
                Symbol('a'): StateSet({'q0', 'q1'}),
                Symbol('b'): StateSet({'q0'}),
            },
            State('q1'): {
                Symbol('b'): StateSet({'q2'}),
            },
            State('q2'): {},
        },
        start_state=State('q0'),
        accept_states=StateSet({'q2'}),
    )

    print("Original NFA:")
    print(nfa)

    # 2. Convert the NFA to a DFA
    dfa = nfa.to_dfa()

    print("\nEquivalent DFA:")
    print(dfa)

    # 3. Visualize both automata
    drawer = AutomataDrawer()
    
    # Draw the NFA
    nfa_path = drawer.draw_nfa_from_object(nfa, "nfa_to_dfa_example_nfa")
    print(f"\nNFA visualization saved to: {nfa_path}")
    
    # Draw the DFA
    dfa_path = drawer.draw_dfa_from_object(dfa, "nfa_to_dfa_example_dfa")
    print(f"DFA visualization saved to: {dfa_path}")


if __name__ == "__main__":
    main()
