from .dfa_mod import DFA
from .algo.kmp import build_kmp_dfa, kmp_search
from typing import Dict, Optional


def create_dfa_from_pattern(pattern: str, alphabet: set[str]) -> DFA:
    """
    Build a DFA that recognizes the single pattern 'pattern' (KMP-based).
    """
    transitions, start_state, accept_states = build_kmp_dfa(pattern, alphabet)
    states = set(transitions.keys())

    return DFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state=start_state,
        accept_states=accept_states,
        sink_state=None,
    )


def create_dfa_from_table(
    table: Dict[str, Dict[str, str]],
    start_state: str,
    accept_states: set[str],
    alphabet: Optional[set[str]] = None,
    sink_state: Optional[str] = None,
) -> DFA:
    """
    Build a DFA from a table of transitions.
    """
    # Collect all states that appear either as a source or target
    all_states = set(table.keys())
    for trans_dict in table.values():
        all_states.update(trans_dict.values())
    all_states.add(start_state)
    all_states.update(accept_states)
    if alphabet is None:
        alpha_set = set()
        for trans_dict in table.values():
            alpha_set |= set(trans_dict.keys())
        alphabet = alpha_set

    return DFA(
        states=all_states,
        alphabet=alphabet,
        transitions=table,
        start_state=start_state,
        accept_states=accept_states,
        sink_state=sink_state,
    )


def find_pattern_in_text(pattern: str, text: str) -> list[int]:
    """
    Return all occurrences of 'pattern' in 'text' using the KMP approach.
    """
    return kmp_search(pattern, text)
