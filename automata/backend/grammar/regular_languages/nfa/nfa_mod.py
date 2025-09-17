from typing import Dict, Set
from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton
from .algo import nfa_bfs
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA


class NFA(Automaton[State]):
    def __init__(
        self,
        states: StateSet,
        alphabet: Alphabet,
        transitions: Dict[State, Dict[Symbol, StateSet]],
        start_state: State,
        accept_states: StateSet,
        epsilon_symbol: Symbol = Symbol(""),
    ):
        super().__init__(states, alphabet, start_state, accept_states)
        self.transitions = transitions
        self.epsilon_symbol = epsilon_symbol

    @classmethod
    def from_regex(cls, regex: str) -> "NFA":
        """
        Create an NFA from a regular expression.
        """
        from .regex_to_nfa import regex_to_nfa
        return regex_to_nfa(regex)

    def to_dfa(self) -> "DFA":
        """
        Convert this NFA to an equivalent DFA.
        """
        from .nfa_to_dfa import nfa_to_dfa
        return nfa_to_dfa(self)

    def accepts(self, word: Word) -> bool:
        """
        Checks acceptance using the BFS approach.
        """
        return nfa_bfs.nfa_accept_bfs(
            transitions=self.transitions,
            start_state=self._start_state,
            accept_states=self._accept_states,
            input_string=word,
            epsilon_symbol=self.epsilon_symbol,
        )

    def __str__(self):
        return (
            f"NFA(states={self._states}, "
            f"alphabet={self._alphabet}, "
            f"transitions={self.transitions}, "
            f"start_state={self._start_state}, "
            f"accept_states={self._accept_states}, "
            f"epsilon_symbol={self.epsilon_symbol})"
        )
