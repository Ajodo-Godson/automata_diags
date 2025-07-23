"""Conversion of an NFA to a DFA."""

from typing import Dict, Set, FrozenSet

from .algo import nfa_bfs
from .nfa_mod import NFA
from ..dfa.dfa_mod import DFA


def nfa_to_dfa(nfa: NFA) -> DFA:
    """Convert ``nfa`` into an equivalent DFA using the subset construction."""

    start_set = nfa_bfs.epsilon_closure({nfa.start_state}, nfa.transitions, nfa.epsilon_symbol)
    unprocessed = [frozenset(start_set)]
    seen: Set[FrozenSet[str]] = {frozenset(start_set)}
    dfa_transitions: Dict[FrozenSet[str], Dict[str, FrozenSet[str]]] = {}

    while unprocessed:
        current = unprocessed.pop()
        dfa_transitions[current] = {}
        for symbol in nfa.alphabet:
            if symbol == nfa.epsilon_symbol:
                continue
            next_states: Set[str] = set()
            for state in current:
                if symbol in nfa.transitions.get(state, {}):
                    next_states |= nfa.transitions[state][symbol]
            if not next_states:
                continue
            closure = nfa_bfs.epsilon_closure(next_states, nfa.transitions, nfa.epsilon_symbol)
            closure_fs = frozenset(closure)
            dfa_transitions[current][symbol] = closure_fs
            if closure_fs not in seen:
                seen.add(closure_fs)
                unprocessed.append(closure_fs)

    accept_sets = {s for s in seen if not set(s).isdisjoint(nfa.accept_states)}

    state_names = {s: "_".join(sorted(s)) or "empty" for s in seen}
    dfa_table: Dict[str, Dict[str, str]] = {}
    for s, trans in dfa_transitions.items():
        dfa_table[state_names[s]] = {}
        for sym, tgt in trans.items():
            dfa_table[state_names[s]][sym] = state_names[tgt]

    dfa_states = set(state_names.values())
    dfa_accept = {state_names[s] for s in accept_sets}
    start_state = state_names[frozenset(start_set)]

    return DFA(
        states=dfa_states,
        alphabet={a for a in nfa.alphabet if a != nfa.epsilon_symbol},
        transitions=dfa_table,
        start_state=start_state,
        accept_states=dfa_accept,
    )
