from typing import TypeVar, Generic, Iterable, Union
from abc import ABC, abstractmethod
from .dist import State, Symbol, Word, Alphabet, StateSet

T = TypeVar("T")


class Automaton(Generic[T], ABC):
    def __init__(
        self,
        states: Union[StateSet, Iterable[State]],
        alphabet: Union[Alphabet, Iterable[Symbol]],
        start_state: State,
        accept_states: Union[StateSet, Iterable[State]],
    ):
        # Plain iterables (sets, lists) are accepted and normalized so every
        # automaton exposes the same StateSet/Alphabet interface downstream.
        self._states = states if isinstance(states, StateSet) else StateSet(states)
        self._alphabet = (
            alphabet if isinstance(alphabet, Alphabet) else Alphabet(alphabet)
        )
        self._start_state = start_state
        self._accept_states = (
            accept_states
            if isinstance(accept_states, StateSet)
            else StateSet(accept_states)
        )

    @abstractmethod
    def accepts(self, word: Word) -> bool:
        """
        Returns True if the automaton accepts the given word, False otherwise.
        """
        pass
