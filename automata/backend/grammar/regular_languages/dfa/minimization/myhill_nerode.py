"""
Myhill-Nerode DFA Minimization Algorithm

This module implements DFA minimization based on the Myhill-Nerode theorem.
It uses a table-filling algorithm to identify distinguishable state pairs.
"""

from typing import Dict, Set, List, Tuple, Optional
from collections import defaultdict
from automata.backend.grammar.dist import State, Symbol, StateSet, Alphabet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA


def myhill_nerode_minimize(dfa: DFA) -> DFA:
    """
    Minimize a DFA using the Myhill-Nerode theorem approach.
    
    This algorithm uses a table-filling method to identify distinguishable pairs of states.
    Two states are equivalent if they cannot be distinguished by any string.
    
    Args:
        dfa: The DFA to minimize
        
    Returns:
        A minimized DFA with equivalent language but fewer states
    """
    states = list(dfa._states.states())
    n = len(states)
    
    # Step 1: Create distinguishability table
    # distinguishable[i][j] = True if states[i] and states[j] are distinguishable
    distinguishable = [[False for _ in range(n)] for _ in range(n)]
    
    # Step 2: Mark pairs where one is accepting and one is not
    for i in range(n):
        for j in range(i + 1, n):
            state_i = states[i]
            state_j = states[j]
            
            # If one is accepting and the other is not, they're distinguishable
            is_i_accepting = state_i in dfa._accept_states.states()
            is_j_accepting = state_j in dfa._accept_states.states()
            
            if is_i_accepting != is_j_accepting:
                distinguishable[i][j] = True
                distinguishable[j][i] = True
    
    # Step 3: Iteratively mark distinguishable pairs
    changed = True
    while changed:
        changed = False
        
        for i in range(n):
            for j in range(i + 1, n):
                if not distinguishable[i][j]:
                    state_i = states[i]
                    state_j = states[j]
                    
                    # Check if they transition to distinguishable states on any symbol
                    for symbol in dfa._alphabet.symbols():
                        next_i = _get_next_state(dfa, state_i, symbol)
                        next_j = _get_next_state(dfa, state_j, symbol)
                        
                        if next_i is not None and next_j is not None:
                            idx_i = states.index(next_i)
                            idx_j = states.index(next_j)
                            
                            if distinguishable[idx_i][idx_j]:
                                distinguishable[i][j] = True
                                distinguishable[j][i] = True
                                changed = True
                                break
    
    # Step 4: Group equivalent states
    equivalence_classes = _find_equivalence_classes(states, distinguishable)
    
    # Step 5: Build minimized DFA
    return _build_minimized_dfa_from_classes(dfa, equivalence_classes)


def _get_next_state(dfa: DFA, state: State, symbol: Symbol) -> Optional[State]:
    """Get the next state from a given state on a symbol."""
    if state in dfa._transitions and symbol in dfa._transitions[state]:
        return dfa._transitions[state][symbol]
    return dfa._sink_state


def _find_equivalence_classes(states: List[State], distinguishable: List[List[bool]]) -> List[Set[State]]:
    """Find equivalence classes from the distinguishability table."""
    n = len(states)
    visited = [False] * n
    equivalence_classes = []
    
    for i in range(n):
        if not visited[i]:
            equiv_class = {states[i]}
            visited[i] = True
            
            # Find all states equivalent to states[i]
            for j in range(i + 1, n):
                if not visited[j] and not distinguishable[i][j]:
                    equiv_class.add(states[j])
                    visited[j] = True
            
            equivalence_classes.append(equiv_class)
    
    return equivalence_classes


def _build_minimized_dfa_from_classes(dfa: DFA, equivalence_classes: List[Set[State]]) -> DFA:
    """Build the minimized DFA from equivalence classes."""
    
    # Create state mapping
    state_to_class = {}
    class_representatives = {}
    
    for i, equiv_class in enumerate(equivalence_classes):
        rep_state = State(f"q{i}")
        class_representatives[i] = rep_state
        
        for state in equiv_class:
            state_to_class[state] = i
    
    # Build new states
    new_states = StateSet.from_states(list(class_representatives.values()))
    
    # Build new transitions
    new_transitions = defaultdict(dict)
    
    for class_idx, equiv_class in enumerate(equivalence_classes):
        # Pick any representative from the class
        representative = next(iter(equiv_class))
        
        if representative in dfa._transitions:
            for symbol, target_state in dfa._transitions[representative].items():
                target_class = state_to_class[target_state]
                
                from_rep = class_representatives[class_idx]
                to_rep = class_representatives[target_class]
                
                new_transitions[from_rep][symbol] = to_rep
    
    # Find new start state
    start_class = state_to_class[dfa._start_state]
    new_start_state = class_representatives[start_class]
    
    # Find new accept states
    new_accept_states = set()
    for old_accept_state in dfa._accept_states.states():
        accept_class = state_to_class[old_accept_state]
        new_accept_states.add(class_representatives[accept_class])
    
    return DFA(
        states=new_states,
        alphabet=dfa._alphabet,
        transitions=dict(new_transitions),
        start_state=new_start_state,
        accept_states=StateSet.from_states(list(new_accept_states))
    )


def get_distinguishability_table(dfa: DFA) -> Dict[Tuple[State, State], bool]:
    """
    Generate the distinguishability table for analysis.
    
    Args:
        dfa: The DFA to analyze
        
    Returns:
        Dictionary mapping state pairs to their distinguishability
    """
    states = list(dfa._states.states())
    n = len(states)
    
    distinguishable = [[False for _ in range(n)] for _ in range(n)]
    
    # Initial marking
    for i in range(n):
        for j in range(i + 1, n):
            state_i = states[i]
            state_j = states[j]
            
            is_i_accepting = state_i in dfa._accept_states.states()
            is_j_accepting = state_j in dfa._accept_states.states()
            
            if is_i_accepting != is_j_accepting:
                distinguishable[i][j] = True
                distinguishable[j][i] = True
    
    # Iterative marking
    changed = True
    while changed:
        changed = False
        
        for i in range(n):
            for j in range(i + 1, n):
                if not distinguishable[i][j]:
                    state_i = states[i]
                    state_j = states[j]
                    
                    for symbol in dfa._alphabet.symbols():
                        next_i = _get_next_state(dfa, state_i, symbol)
                        next_j = _get_next_state(dfa, state_j, symbol)
                        
                        if next_i is not None and next_j is not None:
                            idx_i = states.index(next_i)
                            idx_j = states.index(next_j)
                            
                            if distinguishable[idx_i][idx_j]:
                                distinguishable[i][j] = True
                                distinguishable[j][i] = True
                                changed = True
                                break
    
    # Convert to dictionary format
    result = {}
    for i in range(n):
        for j in range(i + 1, n):
            result[(states[i], states[j])] = distinguishable[i][j]
    
    return result


def analyze_state_equivalences(dfa: DFA) -> Dict[str, Set[State]]:
    """
    Analyze and return equivalent state groups.
    
    Args:
        dfa: The DFA to analyze
        
    Returns:
        Dictionary mapping group names to sets of equivalent states
    """
    states = list(dfa._states.states())
    n = len(states)
    
    distinguishable = [[False for _ in range(n)] for _ in range(n)]
    
    # Build distinguishability table
    for i in range(n):
        for j in range(i + 1, n):
            state_i = states[i]
            state_j = states[j]
            
            is_i_accepting = state_i in dfa._accept_states.states()
            is_j_accepting = state_j in dfa._accept_states.states()
            
            if is_i_accepting != is_j_accepting:
                distinguishable[i][j] = True
                distinguishable[j][i] = True
    
    changed = True
    while changed:
        changed = False
        
        for i in range(n):
            for j in range(i + 1, n):
                if not distinguishable[i][j]:
                    state_i = states[i]
                    state_j = states[j]
                    
                    for symbol in dfa._alphabet.symbols():
                        next_i = _get_next_state(dfa, state_i, symbol)
                        next_j = _get_next_state(dfa, state_j, symbol)
                        
                        if next_i is not None and next_j is not None:
                            idx_i = states.index(next_i)
                            idx_j = states.index(next_j)
                            
                            if distinguishable[idx_i][idx_j]:
                                distinguishable[i][j] = True
                                distinguishable[j][i] = True
                                changed = True
                                break
    
    # Find equivalence classes
    equivalence_classes = _find_equivalence_classes(states, distinguishable)
    
    # Format result
    result = {}
    for i, equiv_class in enumerate(equivalence_classes):
        result[f"group_{i}"] = equiv_class
    
    return result
