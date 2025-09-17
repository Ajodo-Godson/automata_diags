from typing import List, Set, Tuple, Union
from collections import defaultdict
import copy
from automata.backend.grammar.dist import NonTerminal, Terminal

class Production:
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

    def is_unary(self) -> bool:
        return len(self.rhs) == 1 and self.rhs[0][0].isupper()

class CFG:
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
            
            rhs_str = rhs_str.strip()
            if not rhs_str or rhs_str == 'epsilon' or rhs_str == 'ε':
                rhs = tuple()
            else:
                rhs = []
                for char in rhs_str:
                    if char.isspace(): continue
                    if char.isupper():
                        nt = NonTerminal(char)
                        non_terminals.add(nt)
                        rhs.append(nt)
                    else:
                        term = Terminal(char)
                        terminals.add(term)
                        rhs.append(term)
            productions.append(Production(lhs, tuple(rhs)))
        return cls(non_terminals, terminals, productions, start_symbol)

    def to_cnf(self) -> "CFG":
        cfg = self._eliminate_start()
        cfg = cfg._eliminate_null()
        cfg = cfg._eliminate_unit()
        cfg = cfg._remove_useless()
        cfg = cfg._separate_terminals()
        cfg = cfg._binarize()
        return cfg

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
                    nullable.add(p.lhs); changed = True
        
        new_productions = set()
        for p in cfg.productions:
            if p.rhs:
                for i in range(1 << len(p.rhs)):
                    new_rhs = [s for j, s in enumerate(p.rhs) if not ((i >> j) & 1 and s in nullable)]
                    if new_rhs: new_productions.add(Production(p.lhs, tuple(new_rhs)))
        cfg.productions = list(new_productions)
        return cfg

    def _eliminate_unit(self) -> "CFG":
        cfg = copy.deepcopy(self)
        unit_productions = {(p.lhs, p.rhs[0]) for p in cfg.productions if p.is_unary()}
        
        closures = {nt: {nt} for nt in cfg.non_terminals}
        for A, B in unit_productions:
            closures[A].add(B)
        
        changed = True
        while changed:
            changed = False
            for A in cfg.non_terminals:
                for B in list(closures[A]):
                    for C in closures[B]:
                        if C not in closures[A]:
                            closures[A].add(C); changed = True

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
        generating = set(cfg.terminals)
        changed = True
        while changed:
            changed = False
            for p in cfg.productions:
                if all(s in generating for s in p.rhs) and p.lhs not in generating:
                    generating.add(p.lhs); changed = True
        
        cfg.productions = [p for p in cfg.productions if p.lhs in generating and all(s in generating for s in p.rhs)]
        cfg.non_terminals = {nt for nt in cfg.non_terminals if nt in generating}

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
        counter = 0
        for p in cfg.productions:
            if len(p.rhs) > 2:
                current_lhs = p.lhs
                for i in range(len(p.rhs) - 2):
                    new_nt = NonTerminal(f"CNF_{counter}")
                    cfg.non_terminals.add(new_nt)
                    new_productions.append(Production(current_lhs, (p.rhs[i], new_nt)))
                    current_lhs = new_nt; counter += 1
                new_productions.append(Production(current_lhs, (p.rhs[-2], p.rhs[-1])))
            else:
                new_productions.append(p)
        cfg.productions = new_productions
        return cfg
        
    def _separate_terminals(self) -> "CFG":
        cfg = copy.deepcopy(self)
        new_productions = []
        terminal_map = {}
        for terminal in cfg.terminals:
            new_nt = NonTerminal(f"T_{terminal}")
            if new_nt not in terminal_map:
                cfg.non_terminals.add(new_nt)
                terminal_map[terminal] = new_nt
                new_productions.append(Production(new_nt, (terminal,)))

        productions_to_add = []
        productions_to_remove = []
        for p in cfg.productions:
            if len(p.rhs) > 1:
                needs_change = any(s in cfg.terminals for s in p.rhs)
                if needs_change:
                    productions_to_remove.append(p)
                    new_rhs = tuple(terminal_map.get(s, s) for s in p.rhs)
                    productions_to_add.append(Production(p.lhs, new_rhs))

        cfg.productions = [p for p in cfg.productions if p not in productions_to_remove]
        cfg.productions.extend(productions_to_add)
        cfg.productions.extend(new_productions)
        return cfg
