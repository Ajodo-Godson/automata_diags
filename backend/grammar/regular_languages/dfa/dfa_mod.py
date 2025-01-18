"""
States
Alphabets
Transition function
Start state
Accept State
"""

from typing import (
    Dict,
    List,
    Tuple,
    Union,
    Any,
    Optional,
    Set,
    Type,
    TypeVar,
    Generic,
    Callable,
    Iterable,
    Mapping,
    Sequence,
    Container,
    Collection,
)


class DFA:
    def __init__(
        self,
        Q: Set[Any],  # states (Q)
        Σ: Set[str],  # alphabet (Sigma)
        δ: Dict[Any, Dict[str, Any]],  # transition function (delta)
        q0: Any,  # start state
        F: Set[Any],  # accept states
    ):
        """Initialize a DFA with the 5-tuple (Q, Σ, δ, q0, F).

        Args:
            Q: Finite set of states
            Σ: Finite set of input symbols (alphabet)
            δ: Transition function mapping Q × Σ → Q
            q0: Initial state, where q0 ∈ Q
            F: Set of accept states, where F ⊆ Q
        """
        self.Q = Q
        self.Σ = Σ
        self.δ = δ
        self.q0 = q0
        self.F = F

    def is_accept(self, string: str) -> bool:
        """Check if the given string is accepted by this DFA."""
        current_state = self.q0
        for char in string:
            if char not in self.Σ:
                raise ValueError(f"Character '{char}' not in alphabet")
            current_state = self.δ[current_state][char]
        return current_state in self.F

    def __str__(self) -> str:
        return (
            f"States (Q): {self.Q}\n"
            f"Alphabet (Σ): {self.Σ}\n"
            f"Transition Function (δ): {self.δ}\n"
            f"Start State (q0): {self.q0}\n"
            f"Accept States (F): {self.F}"
        )

    @classmethod
    def create(
        cls,
        states: Set[Any],
        alphabet: Set[str],
        transitions: Dict[Any, Dict[str, Any]],
        start_state: Any,
        accept_states: Set[Any],
    ) -> "DFA":
        """Create a DFA using plain ASCII names for components.

        A more accessible constructor that uses plain English names
        but creates the formal DFA with mathematical notation internally.

        Args:
            states: Finite set of states (Q)
            alphabet: Finite set of input symbols (Σ)
            transitions: Transition function mapping states × alphabet → states (δ)
            start_state: Initial state (q0)
            accept_states: Set of accept states (F)
        """
        return cls(Q=states, Σ=alphabet, δ=transitions, q0=start_state, F=accept_states)

    @classmethod
    def from_table(
        cls,
        transition_table: Dict[Any, Dict[str, Any]],
        start_state: Any,
        accept_states: Set[Any],
    ) -> "DFA":
        """Create a DFA from a transition table.

        Automatically derives states and alphabet from the transition table.

        Args:
            transition_table: Dictionary mapping states to their transitions
            start_state: The initial state
            accept_states: Set of accepting states
        """
        states = set(transition_table.keys())
        alphabet = set().union(*(d.keys() for d in transition_table.values()))

        return cls(
            Q=states, Σ=alphabet, δ=transition_table, q0=start_state, F=accept_states
        )
