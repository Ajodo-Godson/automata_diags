from typing import List, Set, Tuple, Union
from collections import defaultdict
import itertools
import copy
from automata.backend.grammar.dist import NonTerminal, Terminal

class Production:
    """
    Represents a production rule in a context-free grammar.
    """
    def __init__(self, lhs: NonTerminal, rhs: Tuple[Union[NonTerminal, Terminal], ...]):
        self.lhs = lhs
        self.rhs = rhs

    def __repr__(self):
        rhs_str = " ".join(map(str, self.rhs)) if self.rhs else "ε"
        return f"{self.lhs} -> {rhs_str}"

    def is_unary(self) -> bool:
        return len(self.rhs) == 1 and isinstance(self.rhs[0], str) and self.rhs[0][0].isupper()

class CFG:
    """
    Represents a context-free grammar.
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

    @classmethod
    def from_string(cls, grammar_str: str) -> "CFG":
        """
        Create a CFG from a string representation.
        Each line should be a production rule, e.g., "S -> NP VP"
        """
        non_terminals = set()
        terminals = set()
        productions = []
        start_symbol = None

        for line in grammar_str.strip().split('\n'):
            line = line.strip()
            if not line:
                continue

            lhs_str, rhs_str = line.split(" -> ")
            lhs = NonTerminal(lhs_str.strip())
            if start_symbol is None:
                start_symbol = lhs
            non_terminals.add(lhs)
            
            rhs_symbols = rhs_str.strip().split()
            if rhs_symbols == ['ε']:
                rhs = tuple()
            else:
                rhs = []
                for symbol_str in rhs_symbols:
                    if symbol_str[0].isupper():
                        nt = NonTerminal(symbol_str)
                        non_terminals.add(nt)
                        rhs.append(nt)
                    else:
                        term = Terminal(symbol_str)
                        terminals.add(term)
                        rhs.append(term)
            
            productions.append(Production(lhs, tuple(rhs)))

        return cls(non_terminals, terminals, productions, start_symbol)

    def to_cnf(self) -> "CFG":
        """
        Convert the grammar to Chomsky Normal Form.
        """
        cnf_cfg = self._eliminate_start()
        cnf_cfg = cnf_cfg._eliminate_null()
        cnf_cfg = cnf_cfg._eliminate_unit()
        cnf_cfg = cnf_cfg._binarize()
        cnf_cfg = cnf_cfg._separate_terminals()
        return cnf_cfg

    def _eliminate_start(self) -> "CFG":
        cfg = copy.deepcopy(self)
        if any(cfg.start_symbol in p.rhs for p in cfg.productions):
            new_start = NonTerminal(f"{cfg.start_symbol}'")
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
                    nullable.add(p.lhs)
                    changed = True
        
        new_productions = []
        for p in cfg.productions:
            if p.rhs:
                nullable_indices = [i for i, s in enumerate(p.rhs) if s in nullable]
                for i in range(1, len(nullable_indices) + 1):
                    for subset in itertools.combinations(nullable_indices, i):
                        new_rhs = tuple(s for j, s in enumerate(p.rhs) if j not in subset)
                        if new_rhs and not (len(new_rhs) == 1 and new_rhs[0] == p.lhs):
                           new_productions.append(Production(p.lhs, new_rhs))
                new_productions.append(p)

        cfg.productions = [p for p in new_productions if p.rhs]
        return cfg

    def _eliminate_unit(self) -> "CFG":
        cfg = copy.deepcopy(self)
        changed = True
        while changed:
            changed = False
            productions_to_add = []
            productions_to_remove = []

            for p in cfg.productions:
                if p.is_unary():
                    productions_to_remove.append(p)
                    b = p.rhs[0]
                    if p.lhs != b:
                        for b_prod in cfg._productions_map[b]:
                            new_prod = Production(p.lhs, b_prod.rhs)
                            productions_to_add.append(new_prod)
                            changed = True
            
            if changed:
                cfg.productions = [p for p in cfg.productions if p not in productions_to_remove]
                cfg.productions.extend(productions_to_add)
                cfg._productions_map = defaultdict(list)
                for p in cfg.productions:
                    cfg._productions_map[p.lhs].append(p)
        return cfg
    
    def _binarize(self) -> "CFG":
        cfg = copy.deepcopy(self)
        new_productions = []
        counter = 0
        
        for prod in cfg.productions:
            if len(prod.rhs) > 2:
                current_lhs = prod.lhs
                for i in range(len(prod.rhs) - 2):
                    new_nt = NonTerminal(f"CNF_{current_lhs}_{counter}")
                    cfg.non_terminals.add(new_nt)
                    counter += 1
                    new_prod = Production(current_lhs, (prod.rhs[i], new_nt))
                    new_productions.append(new_prod)
                    current_lhs = new_nt
                final_prod = Production(current_lhs, (prod.rhs[-2], prod.rhs[-1]))
                new_productions.append(final_prod)
            else:
                new_productions.append(prod)
        cfg.productions = new_productions
        return cfg
        
    def _separate_terminals(self) -> "CFG":
        cfg = copy.deepcopy(self)
        new_productions = []
        terminal_map = {}

        for terminal in cfg.terminals:
            new_nt = NonTerminal(f"T_{terminal}")
            if new_nt not in cfg.non_terminals:
                cfg.non_terminals.add(new_nt)
                terminal_map[terminal] = new_nt
                new_productions.append(Production(new_nt, (terminal,)))
            else:
                terminal_map[terminal] = new_nt

        for prod in cfg.productions:
            if len(prod.rhs) > 1:
                new_rhs = tuple(terminal_map.get(s, s) for s in prod.rhs if isinstance(s, str))
                new_productions.append(Production(prod.lhs, new_rhs))
            else:
                new_productions.append(prod)
        
        cfg.productions = new_productions
        return cfg
