from typing import List, Set, Tuple, Union, Dict
from collections import defaultdict
import itertools
import copy
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
        self._productions_map = defaultdict(list)
        for p in self.productions:
            self._productions_map[p.lhs].append(p)

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
        Convert the grammar to Chomsky Normal Form using the provided algorithm.
        """
        cnf_scfg = self._eliminate_start()
        cnf_scfg = cnf_scfg._eliminate_null()
        cnf_scfg = cnf_scfg._eliminate_unit()
        cnf_scfg = cnf_scfg._binarize()
        cnf_scfg = cnf_scfg._separate_terminals()
        return cnf_scfg

    def _eliminate_start(self) -> "SCFG":
        """Step 1: If the start symbol appears on the RHS, create a new start symbol."""
        scfg = copy.deepcopy(self)
        start_on_rhs = any(scfg.start_symbol in p.rhs for p in scfg.productions)
        
        if start_on_rhs:
            new_start = NonTerminal(f"{scfg.start_symbol}'")
            scfg.non_terminals.add(new_start)
            new_prod = Production(new_start, (scfg.start_symbol,), 1.0)
            scfg.productions.insert(0, new_prod)
            scfg.start_symbol = new_start
        return scfg

    def _eliminate_null(self) -> "SCFG":
        """Step 2: Remove Null productions."""
        scfg = copy.deepcopy(self)
        nullable = {p.lhs for p in scfg.productions if not p.rhs}
        
        changed = True
        while changed:
            changed = False
            for p in scfg.productions:
                if all(s in nullable for s in p.rhs) and p.lhs not in nullable:
                    nullable.add(p.lhs)
                    changed = True
        
        new_productions = []
        for p in scfg.productions:
            if p.rhs:
                new_productions.append(p)
                
                # Create variations of the production by removing nullable symbols
                nullable_indices = [i for i, s in enumerate(p.rhs) if s in nullable]
                for i in range(1, len(nullable_indices) + 1):
                    for subset in itertools.combinations(nullable_indices, i):
                        new_rhs = tuple(s for j, s in enumerate(p.rhs) if j not in subset)
                        if new_rhs:
                           new_productions.append(Production(p.lhs, new_rhs, p.probability))

        scfg.productions = new_productions
        # Re-normalizing probabilities here is complex; we'll omit for this implementation.
        return scfg

    def _eliminate_unit(self) -> "SCFG":
        """Step 3: Remove unit productions (A -> B)."""
        scfg = copy.deepcopy(self)
        unit_productions = [(p.lhs, p.rhs[0]) for p in scfg.productions if len(p.rhs) == 1 and isinstance(p.rhs[0], NonTerminal)]
        
        while unit_productions:
            a, b = unit_productions.pop(0)
            a_prod = next(p for p in scfg.productions if p.lhs == a and p.rhs == (b,))
            scfg.productions.remove(a_prod)

            for b_prod in scfg._productions_map[b]:
                new_prod = Production(a, b_prod.rhs, a_prod.probability * b_prod.probability)
                scfg.productions.append(new_prod)
                if len(new_prod.rhs) == 1 and isinstance(new_prod.rhs[0], NonTerminal):
                    unit_productions.append((new_prod.lhs, new_prod.rhs[0]))
            
            # Re-build the map after modifications
            scfg._productions_map = defaultdict(list)
            for p in scfg.productions:
                scfg._productions_map[p.lhs].append(p)
        return scfg
    
    def _binarize(self) -> "SCFG":
        """Step 4: Replace each production A -> B1..Bn where n > 2."""
        scfg = copy.deepcopy(self)
        new_productions = []
        counter = 0
        
        for prod in scfg.productions:
            if len(prod.rhs) > 2 and all(isinstance(s, NonTerminal) for s in prod.rhs):
                current_lhs = prod.lhs
                current_prob = prod.probability
                for i in range(len(prod.rhs) - 2):
                    new_nt = NonTerminal(f"CNF_{current_lhs}_{counter}")
                    scfg.non_terminals.add(new_nt)
                    counter += 1
                    
                    new_prod = Production(current_lhs, (prod.rhs[i], new_nt), current_prob)
                    new_productions.append(new_prod)
                    
                    current_lhs = new_nt
                    current_prob = 1.0
                
                final_prod = Production(current_lhs, (prod.rhs[-2], prod.rhs[-1]), 1.0)
                new_productions.append(final_prod)
            else:
                new_productions.append(prod)
        scfg.productions = new_productions
        return scfg
        
    def _separate_terminals(self) -> "SCFG":
        """Step 5: If the right side of any production is in the form A -> aB."""
        scfg = copy.deepcopy(self)
        new_productions = []
        terminal_map = {}

        for terminal in scfg.terminals:
            new_nt = NonTerminal(f"T_{terminal}")
            scfg.non_terminals.add(new_nt)
            terminal_map[terminal] = new_nt
            new_productions.append(Production(new_nt, (terminal,), 1.0))
            
        for prod in scfg.productions:
            if len(prod.rhs) > 1:
                new_rhs = tuple(terminal_map.get(s, s) for s in prod.rhs)
                new_productions.append(Production(prod.lhs, new_rhs, prod.probability))
            else:
                new_productions.append(prod)
        
        scfg.productions = new_productions
        return scfg

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
