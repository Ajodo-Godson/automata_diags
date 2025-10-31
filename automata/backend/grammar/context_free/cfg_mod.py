from typing import List, Set, Tuple, Union
from collections import defaultdict
import copy

from automata.backend.grammar.dist import NonTerminal, Terminal

class Production:
    """Represents a production rule in a context-free grammar."""
    def __init__(self, lhs: NonTerminal, rhs: Tuple[Union[NonTerminal, Terminal], ...]):
        self.lhs = lhs
        self.rhs = rhs

    def __repr__(self):
        rhs_str = " ".join(map(str, self.rhs)) if self.rhs else "ε"
        return f"{self.lhs} -> {rhs_str}"
    
    def __eq__(self, other):
        return self.lhs == other.lhs and self.rhs == other.rhs

    def __hash__(self):
        return hash((self.lhs, self.rhs))

    def __lt__(self, other):
        return (self.lhs, str(self.rhs)) < (other.lhs, str(other.rhs))

    def is_unary(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0][0].isupper()

class CFG:
    """Represents a context-free grammar."""
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

    @classmethod
    def from_string(cls, grammar_str: str) -> "CFG":
        non_terminals, terminals, productions, start_symbol = set(), set(), [], None
        for line in grammar_str.strip().split('\n'):
            line = line.strip()
            if not line: continue
            
            lhs_str, rhs_str = line.split(" -> ")
            lhs = NonTerminal(lhs_str.strip())
            if start_symbol is None: start_symbol = lhs
            non_terminals.add(lhs)
            
            # Handle multiple productions separated by |
            rhs_alternatives = rhs_str.split(" | ")
            
            for rhs_alt in rhs_alternatives:
                rhs_alt = rhs_alt.strip()
                if not rhs_alt or rhs_alt == 'epsilon' or rhs_alt == 'ε':
                    rhs = tuple()
                else:
                    rhs = []
                    # Split by spaces to handle multi-character symbols
                    symbols = rhs_alt.split()
                    for symbol in symbols:
                        if symbol[0].isupper():
                            nt = NonTerminal(symbol); non_terminals.add(nt); rhs.append(nt)
                        else:
                            term = Terminal(symbol); terminals.add(term); rhs.append(term)
                productions.append(Production(lhs, tuple(rhs)))
        return cls(non_terminals, terminals, productions, start_symbol)

    def to_cnf(self) -> "CFG":
        """Converts the grammar to Chomsky Normal Form following the step-by-step approach:
        1. Eliminate epsilon productions
        2. Eliminate unit productions  
        3. Convert to CNF form (separate terminals and binarize)
        Note: Useless symbol removal is disabled for complex recursive grammars
        """
        cfg = self._eliminate_start()     # START: Eliminate start symbol from RHS
        cfg = cfg._eliminate_null()       # Step 1: Eliminate ε-rules
        cfg = cfg._eliminate_unit()       # Step 2: Eliminate unit rules
        # cfg = cfg._remove_useless()     # Step 3: Remove useless symbols - disabled for recursive grammars
        cfg = cfg._separate_terminals()   # Step 4a: Separate terminals
        cfg = cfg._binarize()            # Step 4b: Binarize productions
        cfg = cfg._remove_duplicates()    # Remove duplicate productions
        cfg.productions.sort()
        return cfg
    
    def _remove_duplicates(self) -> "CFG":
        """Remove duplicate productions"""
        cfg = copy.deepcopy(self)
        unique_productions = []
        seen = set()
        for p in cfg.productions:
            if (p.lhs, p.rhs) not in seen:
                seen.add((p.lhs, p.rhs))
                unique_productions.append(p)
        cfg.productions = unique_productions
        return cfg

    def _eliminate_start(self) -> "CFG":
        cfg = copy.deepcopy(self)
        if any(cfg.start_symbol in p.rhs for p in cfg.productions):
            new_start = NonTerminal(f"{cfg.start_symbol}0")
            cfg.non_terminals.add(new_start)
            cfg.productions.insert(0, Production(new_start, (cfg.start_symbol,)))
            cfg.start_symbol = new_start
        return cfg

    def _eliminate_null(self) -> "CFG":
        cfg = copy.deepcopy(self)
        nullable = {p.lhs for p in cfg.productions if not p.rhs}
        changed = True
        while changed:
            changed = False
            for p in cfg.productions:
                if p.rhs and all(s in nullable for s in p.rhs) and p.lhs not in nullable:
                    nullable.add(p.lhs); changed = True
        
        new_productions = set()
        for p in cfg.productions:
            if not p.rhs: continue # Skip original null productions
            
            # Find all combinations of nullable symbols to remove
            nullable_indices = [i for i, s in enumerate(p.rhs) if s in nullable]
            for i in range(1 << len(nullable_indices)):
                new_rhs = list(p.rhs)
                # Create a version of the RHS with some nullable symbols removed
                for j in range(len(nullable_indices)):
                    if (i >> j) & 1:
                        new_rhs[nullable_indices[j]] = None
                
                final_rhs = tuple(s for s in new_rhs if s is not None)
                if final_rhs:
                    new_productions.add(Production(p.lhs, final_rhs))
        
        cfg.productions = list(new_productions)
        return cfg

    def _eliminate_unit(self) -> "CFG":
        cfg = copy.deepcopy(self)
        unit_productions = {(p.lhs, p.rhs[0]) for p in cfg.productions if p.is_unary()}
        
        # Compute transitive closure of unit productions
        closures = {nt: {nt} for nt in cfg.non_terminals}
        for A, B in unit_productions:
            closures[A].add(B)
        
        changed = True
        while changed:
            changed = False
            for A in cfg.non_terminals:
                for B in list(closures[A]):
                    for C in closures.get(B, set()):
                        if C not in closures[A]:
                            closures[A].add(C); changed = True

        # Add new productions and remove unit ones
        new_productions = set()
        for A, closure in closures.items():
            for B in closure:
                for p in cfg.productions:
                    if p.lhs == B and not p.is_unary():
                        new_productions.add(Production(A, p.rhs))
        
        cfg.productions = list(new_productions)
        return cfg

    def _remove_useless(self) -> "CFG":
        cfg = copy.deepcopy(self)
        
        # Find generating symbols
        generating = set(cfg.terminals)
        changed = True
        while changed:
            changed = False
            for p in cfg.productions:
                if all(s in generating for s in p.rhs) and p.lhs not in generating:
                    generating.add(p.lhs); changed = True
        
        cfg.productions = [p for p in cfg.productions if p.lhs in generating and all(s in generating for s in p.rhs)]
        cfg.non_terminals = {nt for nt in cfg.non_terminals if nt in generating}

        # Find reachable symbols
        reachable = {cfg.start_symbol}
        changed = True
        while changed:
            changed = False
            for p in cfg.productions:
                if p.lhs in reachable:
                    for s in p.rhs:
                        if s in cfg.non_terminals and s not in reachable:
                            reachable.add(s); changed = True
        
        cfg.productions = [p for p in cfg.productions if p.lhs in reachable]
        cfg.non_terminals = reachable
        return cfg

    def _binarize(self) -> "CFG":
        cfg = copy.deepcopy(self)
        new_productions = []
        productions_to_process = list(cfg.productions)
        binarization_vars = ['P', 'Q', 'R', 'T']  # Use systematic naming
        var_counter = 0
        
        while productions_to_process:
            p = productions_to_process.pop(0)
            if len(p.rhs) > 2:
                # Create a new variable for binarization
                if var_counter < len(binarization_vars):
                    new_nt = NonTerminal(binarization_vars[var_counter])
                    var_counter += 1
                else:
                    new_nt = NonTerminal(f"BIN_{var_counter}")
                    var_counter += 1
                    
                cfg.non_terminals.add(new_nt)
                new_productions.append(Production(p.lhs, (p.rhs[0], new_nt)))
                productions_to_process.append(Production(new_nt, p.rhs[1:]))
            else:
                new_productions.append(p)
        
        # Remove duplicates
        unique_productions = []
        seen = set()
        for p in new_productions:
            if (p.lhs, p.rhs) not in seen:
                seen.add((p.lhs, p.rhs))
                unique_productions.append(p)
        
        cfg.productions = unique_productions
        return cfg
        
    def _separate_terminals(self) -> "CFG":
        cfg = copy.deepcopy(self)
        new_productions = []
        terminal_map = {}
        
        # Create terminal mappings: X -> a, Y -> b, etc.
        terminal_vars = ['X', 'Y', 'W', 'V', 'U']  # Use systematic naming
        for i, terminal in enumerate(sorted(cfg.terminals)):
            if i < len(terminal_vars):
                new_nt = NonTerminal(terminal_vars[i])
                cfg.non_terminals.add(new_nt)
                terminal_map[terminal] = new_nt
                new_productions.append(Production(new_nt, (terminal,)))

        # Replace terminals on RHS of productions with length > 1
        for p in cfg.productions:
            if len(p.rhs) > 1:
                new_rhs = tuple(terminal_map.get(s, s) for s in p.rhs)
                new_productions.append(Production(p.lhs, new_rhs))
            else:
                new_productions.append(p) # Keep A -> a and A -> B rules
        
        cfg.productions = new_productions
        return cfg