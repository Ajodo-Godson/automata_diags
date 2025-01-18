from typing import TypeVar, Generic
from abc import ABC, abstractmethod
from .dist import State, Symbol, Word, Alphabet, StateSet

T = TypeVar("T")


class Automaton(Generic[T], ABC):
    def __init__(
        self,
        states: StateSet,
        alphabet: Alphabet,
        start_state: State,
        accept_states: StateSet,
    ):
        self._states = states
        self._alphabet = alphabet
        self._start_state = start_state
        self._accept_states = accept_states

    @abstractmethod
    def accepts(self, word: Word) -> bool:
        """
        Returns True if the automaton accepts the given word, False otherwise.
        """
        pass
