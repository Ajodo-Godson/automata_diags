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
        if len(self.rhs) == 2 and all(isinstance(s, str) and s[0].isupper() for s in self.rhs):
            return True
        if len(self.rhs) == 1 and isinstance(self.rhs[0], str) and not self.rhs[0][0].isupper():
            return True
        return False

    def is_unary(self) -> bool:
        return len(self.rhs) == 1 and isinstance(self.rhs[0], str) and self.rhs[0][0].isupper()

    def is_terminal(self) -> bool:
        return len(self.rhs) == 1 and isinstance(self.rhs[0], str) and not self.rhs[0][0].isupper()

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
            
            if " [" in rest:
                rhs_str, prob_str = rest.rsplit(" [", 1)
                probability = float(prob_str[:-1])
            else:
                rhs_str = ""
                prob_str = rest.strip()[1:-1]
                probability = float(prob_str)

            lhs = NonTerminal(lhs_str.strip())
            if start_symbol is None:
                start_symbol = lhs

            non_terminals.add(lhs)
            
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
                if p.rhs and all(s in nullable for s in p.rhs) and p.lhs not in nullable:
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
                        if new_rhs and not (len(new_rhs) == 1 and new_rhs[0] == p.lhs):
                           new_productions.append(Production(p.lhs, new_rhs, p.probability))

        scfg.productions = new_productions
        # Re-normalizing probabilities here is complex; we'll omit for this implementation.
        return scfg

    def _eliminate_unit(self) -> "SCFG":
        """Step 3: Remove unit productions (A -> B)."""
        scfg = copy.deepcopy(self)
        
        changed = True
        while changed:
            changed = False
            productions_to_add = []
            productions_to_remove = []

            for p in scfg.productions:
                if p.is_unary():
                    productions_to_remove.append(p)
                    b = p.rhs[0]
                    
                    if p.lhs == b:  # If we have a production like A -> A, just remove it.
                        continue

                    for b_prod in scfg._productions_map[b]:
                        new_prob = p.probability * b_prod.probability
                        new_prod = Production(p.lhs, b_prod.rhs, new_prob)
                        productions_to_add.append(new_prod)
                        changed = True

            if changed:
                temp_productions = []
                for p in scfg.productions:
                    if p not in productions_to_remove:
                        temp_productions.append(p)
                
                temp_productions.extend(productions_to_add)
                scfg.productions = temp_productions
                
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
            if len(prod.rhs) > 2:
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

        # Create productions like T_a -> a for all terminals
        for terminal in scfg.terminals:
            new_nt = NonTerminal(f"T_{terminal}")
            if new_nt not in scfg.non_terminals:
                scfg.non_terminals.add(new_nt)
                terminal_map[terminal] = new_nt
                new_productions.append(Production(new_nt, (terminal,), 1.0))
            else:
                terminal_map[terminal] = new_nt

        # Replace terminals in RHS of length > 1
        for prod in scfg.productions:
            if len(prod.rhs) > 1:
                new_rhs = []
                for s in prod.rhs:
                    if not s[0].isupper():
                        new_rhs.append(terminal_map[s])
                    else:
                        new_rhs.append(s)
                new_productions.append(Production(prod.lhs, tuple(new_rhs), prod.probability))
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
