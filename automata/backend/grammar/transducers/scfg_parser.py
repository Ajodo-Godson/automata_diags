from typing import List, Set, Tuple, Union, Dict
from collections import defaultdict
from automata.backend.grammar.dist import NonTerminal, Terminal

class Production:
    """
    Represents a production rule in a stochastic context-free grammar.
    """
    def __init__(self, lhs: NonTerminal, rhs: Tuple[Union[NonTerminal, Terminal], ...], probability: float):
        self.lhs = lhs
        self.rhs = rhs
        self.probability = probability

    def __repr__(self):
        rhs_str = " ".join(map(str, self.rhs))
        return f"{self.lhs} -> {rhs_str} [{self.probability}]"

    def is_in_cnf(self) -> bool:
        """
        Check if the production is in Chomsky Normal Form.
        A -> B C or A -> a
        """
        if len(self.rhs) == 2 and all(isinstance(s, NonTerminal) for s in self.rhs):
            return True
        if len(self.rhs) == 1 and isinstance(self.rhs[0], Terminal):
            return True
        return False

class SCFG:
    """
    Represents a stochastic context-free grammar.
    """
    def __init__(
        self,
        non_terminals: Set[NonTerminal],
        terminals: Set[Terminal],
        productions: List[Production],
        start_symbol: NonTerminal,
    ):
        self.non_terminals = non_terminals
        self.terminals = terminals
        self.productions = productions
        self.start_symbol = start_symbol

    def __repr__(self):
        return (
            f"SCFG(non_terminals={self.non_terminals}, "
            f"terminals={self.terminals}, "
            f"productions={self.productions}, "
            f"start_symbol={self.start_symbol})"
        )

    @classmethod
    def from_string(cls, grammar_str: str) -> "SCFG":
        """
        Create an SCFG from a string representation.
        Each line should be a production rule, e.g., "S -> NP VP [0.8]"
        """
        non_terminals = set()
        terminals = set()
        productions = []
        start_symbol = None

        for line in grammar_str.strip().split('\n'):
            line = line.strip()
            if not line:
                continue

            lhs_str, rest = line.split(" -> ")
            rhs_str, prob_str = rest.rsplit(" [", 1)
            
            lhs = NonTerminal(lhs_str.strip())
            if start_symbol is None:
                start_symbol = lhs

            non_terminals.add(lhs)
            
            probability = float(prob_str[:-1])
            rhs = []
            for symbol_str in rhs_str.strip().split():
                if symbol_str[0].isupper():
                    nt = NonTerminal(symbol_str)
                    non_terminals.add(nt)
                    rhs.append(nt)
                else:
                    term = Terminal(symbol_str)
                    terminals.add(term)
                    rhs.append(term)
            
            productions.append(Production(lhs, tuple(rhs), probability))

        return cls(non_terminals, terminals, productions, start_symbol)

    def to_cnf(self) -> "SCFG":
        """
        Convert the grammar to Chomsky Normal Form.
        This is a simplified version and has limitations.
        """
        # This is a complex process. For now, we'll assume the grammar
        # is already close to CNF and just handle terminal productions.
        new_productions = []
        new_non_terminals = set(self.non_terminals)
        terminal_map = {}

        for prod in self.productions:
            if len(prod.rhs) == 1 and isinstance(prod.rhs[0], Terminal):
                new_productions.append(prod)
            elif len(prod.rhs) > 1:
                new_rhs = []
                for symbol in prod.rhs:
                    if isinstance(symbol, Terminal):
                        if symbol not in terminal_map:
                            new_nt = NonTerminal(f"T_{symbol}")
                            new_non_terminals.add(new_nt)
                            terminal_map[symbol] = new_nt
                            new_productions.append(Production(new_nt, (symbol,), 1.0))
                        new_rhs.append(terminal_map[symbol])
                    else:
                        new_rhs.append(symbol)
                new_productions.append(Production(prod.lhs, tuple(new_rhs), prod.probability))
            else:
                 new_productions.append(prod)

        return SCFG(new_non_terminals, self.terminals, new_productions, self.start_symbol)

    def parse(self, sentence: List[Terminal]) -> float:
        """
        Parses a sentence and returns its probability using the CYK algorithm.
        Assumes the grammar is in Chomsky Normal Form.
        """
        n = len(sentence)
        if n == 0:
            return 1.0 if any(p.rhs == () for p in self.productions if p.lhs == self.start_symbol) else 0.0
        
        table: Dict[Tuple[int, int, NonTerminal], float] = defaultdict(float)

        # Initialize the table with terminal productions
        for i in range(n):
            for prod in self.productions:
                if prod.rhs == (sentence[i],):
                    table[i, i, prod.lhs] = prod.probability

        # Fill the rest of the table
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                for k in range(i, j):
                    for prod in self.productions:
                        if len(prod.rhs) == 2:
                            b, c = prod.rhs
                            prob_b = table.get((i, k, b), 0.0)
                            prob_c = table.get((k + 1, j, c), 0.0)
                            if prob_b > 0 and prob_c > 0:
                                new_prob = prod.probability * prob_b * prob_c
                                table[i, j, prod.lhs] += new_prob
        
        return table.get((0, n - 1, self.start_symbol), 0.0)
