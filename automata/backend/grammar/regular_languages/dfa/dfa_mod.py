from typing import Dict, Optional, Set
from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton
from collections import defaultdict


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
                return False

            # If current state doesn't have a transition for this symbol
            if symbol not in self._transitions.get(current, {}):
                if self._sink_state is not None:
                    current = self._sink_state
                else:
                    return False
                continue

            current = self._transitions[current][symbol]

        return current in self._accept_states

    def is_complete(self) -> bool:
        """Return True if every state has a transition on every alphabet symbol."""
        symbols = self._alphabet.symbols()
        return all(
            symbol in self._transitions.get(state, {})
            for state in self._states.states()
            for symbol in symbols
        )

    def completed(self, dead_state_name: str = "__dead__") -> "DFA":
        """
        Return an equivalent DFA with a total transition function.

        Missing transitions are routed to a non-accepting dead state that
        loops to itself on every symbol. Returns self unchanged if the
        transition function is already total. Algorithms that assume a total
        transition function (e.g. minimization) should operate on the result.
        """
        if self.is_complete():
            return self

        dead = State(dead_state_name)
        while dead in self._states:
            dead = State(dead + "_")

        symbols = self._alphabet.symbols()
        transitions = {
            state: dict(self._transitions.get(state, {}))
            for state in self._states.states()
        }
        for state in transitions:
            for symbol in symbols:
                transitions[state].setdefault(symbol, dead)
        transitions[dead] = {symbol: dead for symbol in symbols}

        return DFA(
            states=StateSet.from_states(self._states.states() | {dead}),
            alphabet=self._alphabet,
            transitions=transitions,
            start_state=self._start_state,
            accept_states=self._accept_states,
            sink_state=dead,
        )

    @classmethod
    def from_string(
        cls,
        dfa_string: str,
        start_state: str,
        accept_states: Set[str],
    ) -> "DFA":
        """
        Create a DFA from a simple string representation of transitions.

        Args:
            dfa_string: A string where transitions are separated by semicolons,
                        and each transition is "from_state,symbol,to_state".
                        Example: "q0,a,q1;q1,b,q2;q2,a,q1"
            start_state: The name of the start state.
            accept_states: A set of names for the accept states.

        Returns:
            A new DFA instance.
        """
        states = set()
        alphabet = set()
        transitions = defaultdict(dict)

        # Parse transitions
        for transition_str in dfa_string.strip().split(';'):
            if not transition_str:
                continue
            
            try:
                from_state_str, symbol_str, to_state_str = transition_str.split(',')
            except ValueError:
                raise ValueError(f"Malformed transition string: '{transition_str}'")

            from_s = State(from_state_str.strip())
            symbol = Symbol(symbol_str.strip())
            to_s = State(to_state_str.strip())

            states.add(from_s)
            states.add(to_s)
            alphabet.add(symbol)
            transitions[from_s][symbol] = to_s

        # Add start and accept states to the set of states
        start_s = State(start_state)
        states.add(start_s)
        accept_s = {State(s) for s in accept_states}
        states.update(accept_s)

        return cls(
            states=StateSet.from_states(list(states)),
            alphabet=Alphabet(list(alphabet)),
            transitions=dict(transitions),
            start_state=start_s,
            accept_states=StateSet.from_states(list(accept_s)),
        )

    def complement(self) -> "DFA":
        """Return a DFA accepting exactly the words this DFA rejects (over its alphabet)."""
        from .dfa_ops import complement
        return complement(self)

    def union(self, other: "DFA") -> "DFA":
        """Return a DFA accepting words accepted by this DFA or `other`."""
        from .dfa_ops import union
        return union(self, other)

    def intersection(self, other: "DFA") -> "DFA":
        """Return a DFA accepting words accepted by both this DFA and `other`."""
        from .dfa_ops import intersection
        return intersection(self, other)

    def difference(self, other: "DFA") -> "DFA":
        """Return a DFA accepting words this DFA accepts but `other` rejects."""
        from .dfa_ops import difference
        return difference(self, other)

    def is_empty(self) -> bool:
        """Return True if this DFA accepts no word at all."""
        from .dfa_ops import is_empty
        return is_empty(self)

    def shortest_accepted(self) -> Optional[Word]:
        """Return a shortest accepted word, or None if the language is empty."""
        from .dfa_ops import shortest_accepted
        return shortest_accepted(self)

    def equivalent_to(self, other: "DFA") -> bool:
        """Return True if this DFA and `other` accept exactly the same language."""
        from .dfa_ops import equivalent
        return equivalent(self, other)

    def find_distinguishing_string(self, other: "DFA") -> Optional[Word]:
        """Return a shortest word on which this DFA and `other` disagree, or None."""
        from .dfa_ops import find_distinguishing_string
        return find_distinguishing_string(self, other)

    def to_regex(self) -> Optional[str]:
        """
        Return a regular expression for this DFA's language via GNFA state
        elimination, or None if the language is empty. The result parses
        back through `NFA.from_regex` to an equivalent automaton.
        """
        from .dfa_to_regex import dfa_to_regex
        return dfa_to_regex(self)

    def add_transition(
        self, from_state: State, symbol: Symbol, to_state: State
    ) -> None:
        """Utility method to add a single transition to the DFA."""
        if from_state not in self._transitions:
            self._transitions[from_state] = {}
        self._transitions[from_state][symbol] = to_state

    def __str__(self):
        return (
            f"DFA(states={self._states}, "
            f"alphabet={self._alphabet}, "
            f"transitions={self._transitions}, "
            f"start_state={self._start_state}, "
            f"accept_states={self._accept_states}, "
            f"sink_state={self._sink_state})"
        )
