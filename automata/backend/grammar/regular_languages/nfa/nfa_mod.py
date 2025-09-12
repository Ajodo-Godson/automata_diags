from typing import Dict, Set
from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton
from .algo import nfa_bfs  # import the BFS methods from nfa_bfs.py


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
        self._transitions = transitions
        self._epsilon_symbol = epsilon_symbol

    def accepts(self, word: Word) -> bool:
        """
        Checks acceptance using the BFS approach.
        """
        # Note: nfa_bfs works with primitive types, so we convert.
        # This is not ideal, but we'll stick with it for now to avoid
        # rewriting the BFS logic.

        # Convert transitions
        primitive_transitions: Dict[str, Dict[str, Set[str]]] = {
            str(state): {str(symbol): {str(s) for s in next_states.states()} for symbol, next_states in trans.items()}
            for state, trans in self._transitions.items()
        }

        # Convert accept_states
        primitive_accept_states = {str(s) for s in self._accept_states.states()}
        
        # Convert word
        primitive_word = "".join(map(str, word))


        return nfa_bfs.nfa_accept_bfs(
            transitions=primitive_transitions,
            start_state=str(self._start_state),
            accept_states=primitive_accept_states,
            input_string=primitive_word,
            epsilon_symbol=str(self._epsilon_symbol),
        )

    def __str__(self):
        return (
            f"NFA(states={self._states}, "
            f"alphabet={self._alphabet}, "
            f"transitions={self._transitions}, "
            f"start_state={self._start_state}, "
            f"accept_states={self._accept_states}, "
            f"epsilon_symbol={self._epsilon_symbol})"
        )
