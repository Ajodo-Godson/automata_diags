import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.context_free.cfg_mod import CFG

def main():
    """
    Shows an example of converting a user-provided CFG to Chomsky Normal Form.
    """
    # # 1. Define the user-provided grammar
    # grammar_str = """
    # S -> A A A
    # S -> B
    # A -> a A
    # A -> B
    # B -> ε
    # """

     # 1. Define the user-provided grammar
    grammar_str = """
    S -> AbA
    A -> Aa
    A -> epsilon
    """
    cfg = CFG.from_string(grammar_str)

    print("Original CFG:")
    for prod in cfg.productions:
        print(f"  {prod}")


    # 2. Convert the grammar to CNF
    cnf_cfg = cfg.to_cnf()

    print("\nEquivalent CFG in CNF:")
    print(f"Non-terminals: {cnf_cfg.non_terminals}")
    print(f"Terminals: {cnf_cfg.terminals}")
    print(f"Start Symbol: {cnf_cfg.start_symbol}")
    print("Productions:")
    for prod in cnf_cfg.productions:
        print(f"  {prod}")

if __name__ == "__main__":
    main()
