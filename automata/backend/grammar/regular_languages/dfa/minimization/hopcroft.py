"""
Hopcroft's DFA Minimization Algorithm

This module implements Hopcroft's algorithm for minimizing DFAs, which runs in O(n log n) time.
The algorithm uses partition refinement to identify equivalent states.
"""

from typing import Dict, Set, List, Tuple
from collections import defaultdict, deque
from automata.backend.grammar.dist import State, Symbol, StateSet, Alphabet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA


def hopcroft_minimize(dfa: DFA) -> DFA:
    """
    Minimize a DFA using Hopcroft's algorithm.
    
    Args:
        dfa: The DFA to minimize
        
    Returns:
        A minimized DFA with equivalent language but fewer states
    """
    # Step 1: Initialize partition with accepting and non-accepting states
    accepting_states = set(dfa._accept_states.states())
    non_accepting_states = set(dfa._states.states()) - accepting_states
    
    # Initial partition
    partition = []
    if non_accepting_states:
        partition.append(non_accepting_states)
    if accepting_states:
        partition.append(accepting_states)
    
    # If only one partition, DFA is already minimal
    if len(partition) <= 1:
        return dfa
    
    # Step 2: Initialize worklist with the smaller partition
    worklist = deque()
    if len(accepting_states) <= len(non_accepting_states):
        worklist.append(accepting_states)
    else:
        worklist.append(non_accepting_states)
    
    # Step 3: Refine partitions
    while worklist:
        splitter = worklist.popleft()
        
        for symbol in dfa._alphabet.symbols():
            # Find states that transition to splitter on symbol
            predecessors = set()
            for state in dfa._states.states():
                if (state in dfa._transitions and 
                    symbol in dfa._transitions[state] and
                    dfa._transitions[state][symbol] in splitter):
                    predecessors.add(state)
            
            # Refine partitions
            new_partition = []
            for block in partition:
                intersection = block & predecessors
                difference = block - predecessors
                
                if intersection and difference:
                    # Split the block
                    new_partition.extend([intersection, difference])
                    
                    # Update worklist
                    if block in worklist:
                        worklist.remove(block)
                        worklist.extend([intersection, difference])
                    else:
                        # Add the smaller block to worklist
                        if len(intersection) <= len(difference):
                            worklist.append(intersection)
                        else:
                            worklist.append(difference)
                else:
                    new_partition.append(block)
            
            partition = new_partition
    
    # Step 4: Build minimized DFA
    return _build_minimized_dfa(dfa, partition)


def _build_minimized_dfa(dfa: DFA, partition: List[Set[State]]) -> DFA:
    """Build the minimized DFA from the final partition."""
    
    # Create state mapping from old states to partition representatives
    state_to_partition = {}
    partition_representatives = {}
    
    for i, block in enumerate(partition):
        rep_state = State(f"q{i}")
        partition_representatives[i] = rep_state
        for state in block:
            state_to_partition[state] = i
    
    # Build new states
    new_states = StateSet.from_states(list(partition_representatives.values()))
    
    # Build new transitions
    new_transitions = defaultdict(dict)
    for old_state in dfa._states.states():
        if old_state in dfa._transitions:
            for symbol, target_state in dfa._transitions[old_state].items():
                from_partition = state_to_partition[old_state]
                to_partition = state_to_partition[target_state]
                
                from_rep = partition_representatives[from_partition]
                to_rep = partition_representatives[to_partition]
                
                new_transitions[from_rep][symbol] = to_rep
    
    # Find new start state
    start_partition = state_to_partition[dfa._start_state]
    new_start_state = partition_representatives[start_partition]
    
    # Find new accept states
    new_accept_states = set()
    for old_accept_state in dfa._accept_states.states():
        accept_partition = state_to_partition[old_accept_state]
        new_accept_states.add(partition_representatives[accept_partition])
    
    return DFA(
        states=new_states,
        alphabet=dfa._alphabet,
        transitions=dict(new_transitions),
        start_state=new_start_state,
        accept_states=StateSet.from_states(list(new_accept_states))
    )


def analyze_equivalence_classes(dfa: DFA) -> Dict[str, List[State]]:
    """
    Analyze and return the equivalence classes found during minimization.
    
    Args:
        dfa: The DFA to analyze
        
    Returns:
        Dictionary mapping equivalence class names to lists of equivalent states
    """
    # Run minimization to get partition
    accepting_states = set(dfa._accept_states.states())
    non_accepting_states = set(dfa._states.states()) - accepting_states
    
    partition = []
    if non_accepting_states:
        partition.append(non_accepting_states)
    if accepting_states:
        partition.append(accepting_states)
    
    if len(partition) <= 1:
        return {"class_0": list(dfa._states.states())}
    
    worklist = deque()
    if len(accepting_states) <= len(non_accepting_states):
        worklist.append(accepting_states)
    else:
        worklist.append(non_accepting_states)
    
    while worklist:
        splitter = worklist.popleft()
        
        for symbol in dfa._alphabet.symbols():
            predecessors = set()
            for state in dfa._states.states():
                if (state in dfa._transitions and 
                    symbol in dfa._transitions[state] and
                    dfa._transitions[state][symbol] in splitter):
                    predecessors.add(state)
            
            new_partition = []
            for block in partition:
                intersection = block & predecessors
                difference = block - predecessors
                
                if intersection and difference:
                    new_partition.extend([intersection, difference])
                    
                    if block in worklist:
                        worklist.remove(block)
                        worklist.extend([intersection, difference])
                    else:
                        if len(intersection) <= len(difference):
                            worklist.append(intersection)
                        else:
                            worklist.append(difference)
                else:
                    new_partition.append(block)
            
            partition = new_partition
    
    # Format result
    result = {}
    for i, equiv_class in enumerate(partition):
        result[f"class_{i}"] = sorted(list(equiv_class))
    
    return result
