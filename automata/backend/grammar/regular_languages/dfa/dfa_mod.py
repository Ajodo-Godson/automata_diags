from typing import Dict, Optional
from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton


class DFA(Automaton[State]):
    def __init__(
        self,
        states: StateSet,
        alphabet: Alphabet,
        transitions: Dict[State, Dict[Symbol, State]],
        start_state: State,
        accept_states: StateSet,
        sink_state: Optional[State] = None,
    ):
        super().__init__(states, alphabet, start_state, accept_states)
        self._transitions = transitions
        self._sink_state = sink_state

    def accepts(self, word: Word) -> bool:

        current = self._start_state
        for symbol in word:
            if symbol not in self._alphabet:
                if self._sink_state is not None:
                    current = self._sink_state
                else:
                    return False
            else:
                current = self._transitions[current][symbol]
        return current in self._accept_states

    def add_transition(
        self, from_state: State, symbol: Symbol, to_state: State
    ) -> None:
        """Utility method to add a single transition to the DFA."""
        self._transitions[from_state][symbol] = to_state
