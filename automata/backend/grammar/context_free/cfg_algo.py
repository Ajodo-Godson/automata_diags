"""
Context-Free Grammar Algorithms Module

This module provides algorithms for working with Context-Free Grammars (CFGs):
1. CYK algorithm for membership testing (CNF grammars) - O(n³)
2. BFS-based string acceptance with pruning
3. Generate all strings up to a given length
4. Derivation sequence generation
"""

from typing import List, Set, Tuple, Optional, Generator, Dict
from collections import defaultdict
from automata.backend.grammar.context_free.cfg_mod import CFG, Production
from automata.backend.grammar.dist import NonTerminal, Terminal
import copy


def cyk_accept(cfg: CFG, string: str) -> bool:
    """
    Check if a string can be generated from a CFG using the CYK algorithm.
    
    The grammar MUST be in Chomsky Normal Form (CNF) for this algorithm to work.
    Use cfg.to_cnf() to convert a grammar to CNF before calling this function.
    
    Time Complexity: O(n³ · |G|) where n is string length, |G| is grammar size
    Space Complexity: O(n² · |N|) where |N| is number of non-terminals
    
    Args:
        cfg (CFG): The context-free grammar in CNF.
        string (str): The string to check.

    Returns:
        bool: True if the string can be generated from the CFG, False otherwise.
    """
    n = len(string)
    
    # Handle empty string case
    if n == 0:
        # Check if start symbol can derive epsilon
        for prod in cfg.productions:
            if prod.lhs == cfg.start_symbol and len(prod.rhs) == 0:
                return True
        return False
    
    # Build production lookup dictionary for efficiency
    # unit_productions: maps terminal -> set of non-terminals that produce it
    # binary_productions: maps (NT1, NT2) -> set of non-terminals that produce them
    unit_productions: Dict[str, Set[NonTerminal]] = defaultdict(set)
    binary_productions: Dict[Tuple[NonTerminal, NonTerminal], Set[NonTerminal]] = defaultdict(set)
    
    for prod in cfg.productions:
        if len(prod.rhs) == 1:
            # A -> a (unit production to terminal)
            unit_productions[str(prod.rhs[0])].add(prod.lhs)
        elif len(prod.rhs) == 2:
            # A -> BC (binary production)
            binary_productions[(prod.rhs[0], prod.rhs[1])].add(prod.lhs)
    
    # CYK table: table[i][j] = set of non-terminals that can derive string[i:j+1]
    table: List[List[Set[NonTerminal]]] = [[set() for _ in range(n)] for _ in range(n)]
    
    # Base case: Fill diagonal (substrings of length 1)
    for i in range(n):
        char = string[i]
        table[i][i] = unit_productions.get(char, set()).copy()
    
    # Fill table for substrings of increasing length
    for length in range(2, n + 1):  # length of substring
        for i in range(n - length + 1):  # starting index
            j = i + length - 1  # ending index
            
            # Try all possible split points
            for k in range(i, j):
                # Check all combinations of non-terminals from left and right parts
                for B in table[i][k]:
                    for C in table[k + 1][j]:
                        # Add all non-terminals that can produce BC
                        table[i][j].update(binary_productions.get((B, C), set()))
    
    # Check if start symbol can derive the entire string
    return cfg.start_symbol in table[0][n - 1]


def accept_string(cfg: CFG, string: str, max_steps: Optional[int] = None) -> bool:
    """
    Check if a string can be generated from a CFG using BFS with pruning.
    
    This is a general algorithm that works with any CFG (not just CNF).
    For CNF grammars, consider using cyk_accept() for better performance.
    
    Args:
        cfg (CFG): The context-free grammar.
        string (str): The string to check.
        max_steps (int, optional): Maximum derivation steps. 
                                   Defaults to 3 * len(string) + 10.

    Returns:
        bool: True if the string can be generated from the CFG, False otherwise.
    """
    if max_steps is None:
        max_steps = 3 * len(string) + 10
    
    target_len = len(string)
    target_terminals = set(string)
    
    # Build production lookup for efficiency
    prod_dict: Dict[NonTerminal, List[Tuple]] = defaultdict(list)
    for prod in cfg.productions:
        prod_dict[prod.lhs].append(prod.rhs)
    
    # Convert non-terminals to set of strings for comparison
    nt_strs = {str(nt) for nt in cfg.non_terminals}
    
    def sentential_form_to_str(form: Tuple) -> str: 
        """Convert a sentential form tuple to string.
        Example: ('a', S, 'b') -> "aSb"
        
        """
        return ''.join(str(s) for s in form)
    
    def get_terminal_count(form: Tuple) -> int:
        """Count terminals in a sentential form."""
        return sum(1 for s in form if str(s) not in nt_strs)
    
    def has_non_terminal(form: Tuple) -> bool:
        """Check if sentential form contains non-terminals."""
        return any(str(s) in nt_strs for s in form)
    
    # BFS with pruning
    visited: Set[Tuple] = set()
    current_forms: Set[Tuple] = {(cfg.start_symbol,)}
    
    for step in range(max_steps):
        next_forms: Set[Tuple] = set()
        
        for form in current_forms:
            form_str = sentential_form_to_str(form)
            
            # Check if we found the target
            if form_str == string and not has_non_terminal(form):
                return True
            
            # Skip if already visited
            if form in visited:
                continue
            visited.add(form)
            
            # Pruning: skip if terminal count exceeds target length
            terminal_count = get_terminal_count(form)
            if terminal_count > target_len:
                continue
            
            # Expand each non-terminal in the sentential form
            for i, symbol in enumerate(form):
                if symbol in cfg.non_terminals:
                    for rhs in prod_dict.get(symbol, []):
                        new_form = form[:i] + rhs + form[i+1:]
                        
                        # Pruning: skip if resulting form is too long
                        new_terminal_count = get_terminal_count(new_form)
                        if new_terminal_count <= target_len:
                            next_forms.add(new_form)
        
        if not next_forms:
            break
        current_forms = next_forms
    
    return False


def generate_strings(cfg: CFG, max_length: int) -> Generator[str, None, None]:
    """
    Generate all strings that can be derived from the CFG up to a given length.
    
    Uses BFS to explore derivations and yields terminal strings as they're found.
    
    Args:
        cfg (CFG): The context-free grammar.
        max_length (int): Maximum length of strings to generate.

    Yields:
        str: Strings that can be generated from the CFG.
    """
    # Build production lookup
    prod_dict: Dict[NonTerminal, List[Tuple]] = defaultdict(list)
    for prod in cfg.productions:
        prod_dict[prod.lhs].append(prod.rhs)
    
    nt_strs = {str(nt) for nt in cfg.non_terminals}
    
    def sentential_form_to_str(form: Tuple) -> str:
        return ''.join(str(s) for s in form)
    
    def get_terminal_count(form: Tuple) -> int:
        return sum(1 for s in form if str(s) not in nt_strs)
    
    def has_non_terminal(form: Tuple) -> bool:
        return any(str(s) in nt_strs for s in form)
    
    visited: Set[Tuple] = set()
    yielded: Set[str] = set()
    current_forms: Set[Tuple] = {(cfg.start_symbol,)}
    
    max_steps = max_length * 3 + 10
    
    for _ in range(max_steps):
        next_forms: Set[Tuple] = set()
        
        for form in current_forms:
            if form in visited:
                continue
            visited.add(form)
            
            form_str = sentential_form_to_str(form)
            
            # Yield if it's a terminal string within length limit
            if not has_non_terminal(form):
                if len(form_str) <= max_length and form_str not in yielded:
                    yielded.add(form_str)
                    yield form_str
                continue
            
            # Pruning
            if get_terminal_count(form) > max_length:
                continue
            
            # Expand non-terminals
            for i, symbol in enumerate(form):
                if symbol in cfg.non_terminals:
                    for rhs in prod_dict.get(symbol, []):
                        new_form = form[:i] + rhs + form[i+1:]
                        if get_terminal_count(new_form) <= max_length:
                            next_forms.add(new_form)
        
        if not next_forms:
            break
        current_forms = next_forms


def get_derivation(cfg: CFG, string: str, max_steps: Optional[int] = None) -> Optional[List[str]]:
    """
    Get a derivation sequence for a string from the CFG.
    
    Args:
        cfg (CFG): The context-free grammar.
        string (str): The string to derive.
        max_steps (int, optional): Maximum derivation steps.

    Returns:
        List[str]: A list of sentential forms showing the derivation, 
                   or None if the string cannot be derived.
    """
    if max_steps is None:
        max_steps = 3 * len(string) + 10
    
    target_len = len(string)
    
    # Build production lookup
    prod_dict: Dict[NonTerminal, List[Tuple]] = defaultdict(list)
    for prod in cfg.productions:
        prod_dict[prod.lhs].append(prod.rhs)
    
    nt_strs = {str(nt) for nt in cfg.non_terminals}
    
    def sentential_form_to_str(form: Tuple) -> str:
        return ''.join(str(s) for s in form)
    
    def get_terminal_count(form: Tuple) -> int:
        return sum(1 for s in form if str(s) not in nt_strs)
    
    def has_non_terminal(form: Tuple) -> bool:
        return any(str(s) in nt_strs for s in form)
    
    # BFS with parent tracking
    visited: Set[Tuple] = set()
    parent: Dict[Tuple, Tuple[Tuple, int]] = {}  # form -> (parent_form, step)
    current_forms: Set[Tuple] = {(cfg.start_symbol,)}
    
    for step in range(max_steps):
        next_forms: Set[Tuple] = set()
        
        for form in current_forms:
            form_str = sentential_form_to_str(form)
            
            # Check if we found the target
            if form_str == string and not has_non_terminal(form):
                # Reconstruct derivation path
                derivation = [form_str]
                current = form
                while current in parent:
                    current, _ = parent[current]
                    derivation.append(sentential_form_to_str(current))
                return list(reversed(derivation))
            
            if form in visited:
                continue
            visited.add(form)
            
            if get_terminal_count(form) > target_len:
                continue
            
            # Expand non-terminals
            for i, symbol in enumerate(form):
                if symbol in cfg.non_terminals:
                    for rhs in prod_dict.get(symbol, []):
                        new_form = form[:i] + rhs + form[i+1:]
                        if new_form not in visited and get_terminal_count(new_form) <= target_len:
                            if new_form not in parent:
                                parent[new_form] = (form, step)
                            next_forms.add(new_form)
        
        if not next_forms:
            break
        current_forms = next_forms
    
    return None


def get_all_productions_used(cfg: CFG, string: str) -> Optional[List[Production]]:
    """
    Get the list of productions used to derive a string.
    
    Args:
        cfg (CFG): The context-free grammar.
        string (str): The string to derive.

    Returns:
        List[Production]: Productions used in the derivation, or None if not derivable.
    """
    derivation = get_derivation(cfg, string)
    if derivation is None:
        return None
    
    # This would require more sophisticated tracking
    # For now, return the derivation steps as a placeholder
    return derivation