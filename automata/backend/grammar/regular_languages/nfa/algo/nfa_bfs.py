# backend/grammar/regular_languages/nfa/algo/nfa_bfs.py
from collections import deque
from typing import Dict, Set, Optional

# We'll assume states and symbols are strings; adapt if you have specific classes


def epsilon_closure(
    states: Set[str],
    transitions: Dict[str, Dict[str, Set[str]]],
    epsilon_symbol: str = "",
) -> Set[str]:
    """
    Compute the ε-closure of a set of states.
    'transitions' is a dict: transitions[state][symbol] = {next_states...}
    'epsilon_symbol' is often "" or "ε"
    """
    stack = deque(states)
    closure = set(states)

    while stack:
        state = stack.pop()
        # Check if there is an ε-transition (empty string transition)
        if epsilon_symbol in transitions.get(state, {}):
            for nxt in transitions[state][epsilon_symbol]:
                if nxt not in closure:
                    closure.add(nxt)
                    stack.append(nxt)
    return closure


def nfa_accept_bfs(
    transitions: Dict[str, Dict[str, Set[str]]],
    start_state: str,
    accept_states: Set[str],
    input_string: str,
    epsilon_symbol: str = "",
) -> bool:
    """
    BFS-based NFA acceptance check.
    Returns True if the NFA described by 'transitions' can accept 'input_string'.
    """
    # 1. Start with ε-closure of {start_state}
    current_states = epsilon_closure({start_state}, transitions, epsilon_symbol)

    # 2. For each symbol in input_string
    for symbol in input_string:
        # Accumulate all possible next states
        next_states = set()
        for s in current_states:
            # If there's a transition on this symbol
            if symbol in transitions.get(s, {}):
                next_states |= transitions[s][symbol]
        # Then take ε-closure of next_states
        current_states = epsilon_closure(next_states, transitions, epsilon_symbol)
        # If no states remain, we can reject early
        if not current_states:
            return False

    # 3. If final set of states intersects with accept_states => accept
    return not current_states.isdisjoint(accept_states)
