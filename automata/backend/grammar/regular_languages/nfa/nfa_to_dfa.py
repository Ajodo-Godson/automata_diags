from collections import deque
from typing import Dict, MutableMapping, Optional, Set

from automata.backend.grammar.dist import State, Symbol, Alphabet, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.grammar.regular_languages.nfa.algo.nfa_bfs import epsilon_closure

def nfa_to_dfa(nfa: NFA, metrics: Optional[MutableMapping[str, int]] = None) -> DFA:
    """
    Convert an NFA to an equivalent DFA.
    """
    dfa_states: Set[State] = set()
    dfa_transitions: Dict[State, Dict[Symbol, State]] = {}
    dfa_start_state: State
    dfa_accept_states: Set[State] = set()

    # The states in the DFA are frozensets of states from the NFA
    transition_lookups = 0
    epsilon_closure_calls = 0
    max_queue_size = 1

    def closure_with_metrics(states: Set[State]) -> frozenset[State]:
        nonlocal epsilon_closure_calls
        epsilon_closure_calls += 1
        return frozenset(epsilon_closure(states, nfa.transitions, nfa.epsilon_symbol))

    nfa_start_closure = closure_with_metrics({nfa._start_state})
    
    queue = deque([nfa_start_closure])
    processed_states = {nfa_start_closure}

    # Convert frozenset of states to a string representation for the DFA state
    def state_name(s: frozenset) -> State:
        return State(','.join(sorted(list(s))))

    dfa_start_state = state_name(nfa_start_closure)
    dfa_states.add(dfa_start_state)
    if not nfa_start_closure.isdisjoint(nfa._accept_states.states()):
        dfa_accept_states.add(dfa_start_state)

    while queue:
        current_nfa_states = queue.popleft()
        current_dfa_state = state_name(current_nfa_states)

        for symbol in nfa._alphabet.symbols():
            next_nfa_states_set = set()
            for nfa_state in current_nfa_states:
                transition_lookups += 1
                if symbol in nfa.transitions.get(nfa_state, {}):
                    next_nfa_states_set.update(nfa.transitions[nfa_state][symbol].states())

            if not next_nfa_states_set:
                continue

            next_nfa_states_closure = closure_with_metrics(next_nfa_states_set)
            
            if next_nfa_states_closure not in processed_states:
                processed_states.add(next_nfa_states_closure)
                queue.append(next_nfa_states_closure)
                max_queue_size = max(max_queue_size, len(queue))

                new_dfa_state = state_name(next_nfa_states_closure)
                dfa_states.add(new_dfa_state)
                if not next_nfa_states_closure.isdisjoint(nfa._accept_states.states()):
                    dfa_accept_states.add(new_dfa_state)

            if current_dfa_state not in dfa_transitions:
                dfa_transitions[current_dfa_state] = {}
            dfa_transitions[current_dfa_state][symbol] = state_name(next_nfa_states_closure)

    dfa = DFA(
        states=StateSet.from_states(dfa_states),
        alphabet=nfa._alphabet,
        transitions=dfa_transitions,
        start_state=dfa_start_state,
        accept_states=StateSet.from_states(dfa_accept_states)
    )
    if metrics is not None:
        metrics.update(
            {
                "subset_count": len(processed_states),
                "transition_lookups": transition_lookups,
                "traversal_work_units": transition_lookups,
                "structural_work_units": len(processed_states),
                "epsilon_closure_calls": epsilon_closure_calls,
                "max_queue_size": max_queue_size,
                "dfa_state_count": len(list(dfa._states.states())),
            }
        )
    return dfa
