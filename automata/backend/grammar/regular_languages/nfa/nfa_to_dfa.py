from collections import deque
from typing import Dict, Set

from automata.backend.grammar.dist import State, Symbol, Alphabet, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.grammar.regular_languages.nfa.algo.nfa_bfs import epsilon_closure

def nfa_to_dfa(nfa: NFA) -> DFA:
    """
    Convert an NFA to an equivalent DFA.
    """
    dfa_states: Set[State] = set()
    dfa_transitions: Dict[State, Dict[Symbol, State]] = {}
    dfa_start_state: State
    dfa_accept_states: Set[State] = set()

    # The states in the DFA are frozensets of states from the NFA
    nfa_start_closure = frozenset(epsilon_closure({nfa.start_state}, nfa.transitions, nfa.epsilon_symbol))
    
    queue = deque([nfa_start_closure])
    processed_states = {nfa_start_closure}

    # Convert frozenset of states to a string representation for the DFA state
    def state_name(s: frozenset) -> State:
        return State(','.join(sorted(list(s))))

    dfa_start_state = state_name(nfa_start_closure)
    dfa_states.add(dfa_start_state)
    if not nfa_start_closure.isdisjoint(nfa.accept_states.states()):
        dfa_accept_states.add(dfa_start_state)

    while queue:
        current_nfa_states = queue.popleft()
        current_dfa_state = state_name(current_nfa_states)

        for symbol in nfa.alphabet.symbols():
            next_nfa_states_set = set()
            for nfa_state in current_nfa_states:
                if symbol in nfa.transitions.get(nfa_state, {}):
                    next_nfa_states_set.update(nfa.transitions[nfa_state][symbol].states())

            if not next_nfa_states_set:
                continue

            next_nfa_states_closure = frozenset(epsilon_closure(next_nfa_states_set, nfa.transitions, nfa.epsilon_symbol))
            
            if next_nfa_states_closure not in processed_states:
                processed_states.add(next_nfa_states_closure)
                queue.append(next_nfa_states_closure)

                new_dfa_state = state_name(next_nfa_states_closure)
                dfa_states.add(new_dfa_state)
                if not next_nfa_states_closure.isdisjoint(nfa.accept_states.states()):
                    dfa_accept_states.add(new_dfa_state)

            if current_dfa_state not in dfa_transitions:
                dfa_transitions[current_dfa_state] = {}
            dfa_transitions[current_dfa_state][symbol] = state_name(next_nfa_states_closure)

    return DFA(
        states=StateSet.from_states(dfa_states),
        alphabet=nfa.alphabet,
        transitions=dfa_transitions,
        start_state=dfa_start_state,
        accept_states=StateSet.from_states(dfa_accept_states)
    )
