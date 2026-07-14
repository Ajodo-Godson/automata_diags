from collections import deque
from typing import Dict, MutableMapping, Optional, Set, Union
from automata.backend.grammar.dist import State, Symbol, Word, StateSet


def epsilon_closure(
    states: Set[State],
    transitions: Dict[State, Dict[Symbol, Set[State]]],
    epsilon_symbol: Symbol,
) -> Set[State]:
    """
    Compute the ε-closure of a set of states.
    'transitions' is a dict: transitions[state][symbol] = {next_states...}
    'epsilon_symbol' is often "" or "ε"
    """
    stack = deque(list(states))
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
    transitions: Dict[State, Dict[Symbol, StateSet]],
    start_state: State,
    accept_states: StateSet,
    input_string: Word,
    epsilon_symbol: Symbol,
    metrics: Optional[MutableMapping[str, Union[int, bool]]] = None,
) -> bool:
    """
    BFS-based NFA acceptance check.
    Returns True if the NFA described by 'transitions' can accept 'input_string'.
    """
    # 1. Start with ε-closure of {start_state}
    transition_lookups = 0
    epsilon_closure_calls = 0
    epsilon_edges_traversed = 0
    max_frontier_size = 0
    symbols_processed = 0

    def closure_with_metrics(states: Set[State]) -> Set[State]:
        nonlocal epsilon_closure_calls, epsilon_edges_traversed
        epsilon_closure_calls += 1
        stack = deque(list(states))
        closure = set(states)
        while stack:
            state = stack.pop()
            if epsilon_symbol in transitions.get(state, {}):
                for nxt in transitions[state][epsilon_symbol]:
                    epsilon_edges_traversed += 1
                    if nxt not in closure:
                        closure.add(nxt)
                        stack.append(nxt)
        return closure

    current_states = closure_with_metrics({start_state})
    max_frontier_size = max(max_frontier_size, len(current_states))

    # 2. For each symbol in input_string
    for symbol in input_string:
        symbols_processed += 1
        # Accumulate all possible next states
        next_states = set()
        for s in current_states:
            transition_lookups += 1
            # If there's a transition on this symbol
            if symbol in transitions.get(s, {}):
                next_states.update(transitions[s][symbol].states())
        # Then take ε-closure of next_states
        current_states = closure_with_metrics(next_states)
        max_frontier_size = max(max_frontier_size, len(current_states))
        # If no states remain, we can reject early
        if not current_states:
            if metrics is not None:
                metrics.update(
                    {
                        "symbols_processed": symbols_processed,
                        "transition_lookups": transition_lookups,
                        "epsilon_closure_calls": epsilon_closure_calls,
                        "epsilon_edges_traversed": epsilon_edges_traversed,
                        "max_frontier_size": max_frontier_size,
                        "accepted": False,
                    }
                )
            return False

    # 3. If final set of states intersects with accept_states => accept
    accepted = not current_states.isdisjoint(accept_states.states())
    if metrics is not None:
        metrics.update(
            {
                "symbols_processed": symbols_processed,
                "transition_lookups": transition_lookups,
                "epsilon_closure_calls": epsilon_closure_calls,
                "epsilon_edges_traversed": epsilon_edges_traversed,
                "max_frontier_size": max_frontier_size,
                "accepted": accepted,
            }
        )
    return accepted
