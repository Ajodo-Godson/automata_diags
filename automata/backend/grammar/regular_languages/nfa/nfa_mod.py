from typing import Dict, Set
from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton
from .algo import nfa_bfs
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from collections import defaultdict


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
    def from_string(
        cls,
        nfa_string: str,
        start_state: str,
        accept_states: Set[str],
    ) -> "NFA":
        """
        Create an NFA from a simple string representation of transitions.

        Args:
            nfa_string: A string where transitions are separated by semicolons.
                        Each transition is "from_state,symbol,to_state1,to_state2,...".
                        Example: "q0,a,q0,q1;q1,b,q2"
            start_state: The name of the start state.
            accept_states: A set of names for the accept states.

        Returns:
            A new NFA instance.
        """
        states = set()
        alphabet = set()
        transitions = defaultdict(lambda: defaultdict(set))
        epsilon_symbol = "ε"  # Standard epsilon symbol

        # Parse transitions
        for transition_str in nfa_string.strip().split(';'):
            if not transition_str:
                continue
            
            parts = [p.strip() for p in transition_str.split(',')]
            if len(parts) < 3:
                raise ValueError(f"Malformed transition string: '{transition_str}'")

            from_state_str, symbol_str, to_states_str = parts[0], parts[1], parts[2:]

            from_s = State(from_state_str)
            symbol = Symbol(symbol_str)
            
            states.add(from_s)
            if symbol != epsilon_symbol:
                alphabet.add(symbol)
            
            for to_state_str in to_states_str:
                to_s = State(to_state_str)
                states.add(to_s)
                transitions[from_s][symbol].add(to_s)
        
        # Convert sets to StateSets for the final transitions dict
        final_transitions = {
            from_s: {
                symbol: StateSet.from_states(list(to_states))
                for symbol, to_states in trans.items()
            }
            for from_s, trans in transitions.items()
        }

        # Add start and accept states to the set of states
        start_s = State(start_state)
        states.add(start_s)
        accept_s = {State(s) for s in accept_states}
        states.update(accept_s)

        return cls(
            states=StateSet.from_states(list(states)),
            alphabet=Alphabet(list(alphabet)),
            transitions=final_transitions,
            start_state=start_s,
            accept_states=StateSet.from_states(list(accept_s)),
            epsilon_symbol=epsilon_symbol,
        )

    @classmethod
    def from_regex(cls, regex: str) -> "NFA":
        """
        Create an NFA from a regular expression.
        """
        from ..regex_to_nfa import regex_to_nfa
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
