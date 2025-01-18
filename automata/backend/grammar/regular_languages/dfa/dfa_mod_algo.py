from .dfa_mod import DFA
from .algo.kmp import build_kmp_dfa, kmp_search


def create_dfa_from_pattern(pattern: str, alphabet: set[str]) -> DFA:
    """
    Build a DFA that recognizes the single pattern 'pattern' (KMP-based).
    """
    transitions, start_state, accept_states = build_kmp_dfa(pattern, alphabet)
    states = set(transitions.keys())

    return DFA(
        Q=states, Σ=alphabet, δ=transitions, q0=start_state, F=accept_states, sink=None
    )


def find_pattern_in_text(pattern: str, text: str) -> list[int]:
    """
    Return all occurrences of 'pattern' in 'text' using the KMP approach.
    """
    return kmp_search(pattern, text)
