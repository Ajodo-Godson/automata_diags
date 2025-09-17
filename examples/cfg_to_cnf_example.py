import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.context_free.cfg_mod import CFG

def main():
    """
    Shows an example of converting a CFG to Chomsky Normal Form.
    """
    # 1. Define a grammar that is not in CNF
    grammar_str = """
    S -> A S A
    S -> a B
    A -> B
    A -> S
    B -> b
    B -> ε
    """

    #2. Define a grammar that is not in CNF
    grammar_str2 = """
    S -> A B A
    A -> Aa
    A -> epsilon
    """
    cfg = CFG.from_string(grammar_str2)

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
