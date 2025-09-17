import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.transducers.scfg_parser import SCFG

def main():
    """
    Shows an example of converting an SCFG to Chomsky Normal Form.
    """
    # 1. Define a grammar that is not in CNF
    grammar_str = """
    S -> A S A [0.5]
    S -> a B [0.3]
    S -> [0.2]
    A -> B [0.7]
    A -> S [0.3]
    B -> b [1.0]
    """
    scfg = SCFG.from_string(grammar_str)

    print("Original SCFG:")
    for prod in scfg.productions:
        print(f"  {prod}")


    # 2. Convert the grammar to CNF
    cnf_scfg = scfg.to_cnf()

    print("\nEquivalent SCFG in CNF:")
    print(f"Non-terminals: {cnf_scfg.non_terminals}")
    print(f"Terminals: {cnf_scfg.terminals}")
    print(f"Start Symbol: {cnf_scfg.start_symbol}")
    print("Productions:")
    for prod in cnf_scfg.productions:
        print(f"  {prod}")

if __name__ == "__main__":
    main()
