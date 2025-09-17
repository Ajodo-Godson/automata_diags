from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.drawings.automata_drawer import AutomataDrawer

def main():
    """
    Shows an example of converting a regular expression to an NFA and visualizing it.
    """
    # 1. Define a regular expression
    regex = "a(b|c)*"
    print(f"Regular Expression: {regex}")

    # 2. Convert the regex to an NFA
    nfa = NFA.from_regex(regex)
    print("\nGenerated NFA:")
    print(nfa)

    # 3. Visualize the NFA
    drawer = AutomataDrawer()
    nfa_path = drawer.draw_nfa_from_object(nfa, "regex_to_nfa_example")
    print(f"\nNFA visualization saved to: {nfa_path}")


if __name__ == "__main__":
    main()
