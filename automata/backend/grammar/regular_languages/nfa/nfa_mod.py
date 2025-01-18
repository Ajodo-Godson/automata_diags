from typing import Dict, Set
from .algo import nfa_bfs  # import the BFS methods from nfa_bfs.py


class NFA:
    def __init__(
        self,
        states: Set[str],
        alphabet: Set[str],
        transitions: Dict[str, Dict[str, Set[str]]],
        start_state: str,
        accept_states: Set[str],
        epsilon_symbol: str = "",
    ):
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions
        self.start_state = start_state
        self.accept_states = accept_states
        self.epsilon_symbol = epsilon_symbol

    def is_accept(self, input_string: str) -> bool:
        """
        Checks acceptance using the BFS approach.
        """
        return nfa_bfs.nfa_accept_bfs(
            transitions=self.transitions,
            start_state=self.start_state,
            accept_states=self.accept_states,
            input_string=input_string,
            epsilon_symbol=self.epsilon_symbol,
        )
