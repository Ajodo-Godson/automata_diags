from abc import ABC, abstractmethod
from typing import Set, Generic, TypeVar, Union
from .core import State, Symbol, Word, Alphabet, StateSet

TState = TypeVar("TState", bound=State)


class Automaton(ABC, Generic[TState]):
    """
    Abstract base for any automaton.
    """

    def __init__(
        self, states: StateSet, alphabet: Alphabet, start: State, accepts: StateSet
    ):
        self._states = states
        self._alphabet = alphabet
        self._start_state = start
        self._accept_states = accepts

    @property
    def states(self) -> StateSet:
        return self._states

    @property
    def alphabet(self) -> Alphabet:
        return self._alphabet

    @property
    def start_state(self) -> State:
        return self._start_state

    @property
    def accept_states(self) -> StateSet:
        return self._accept_states

    @abstractmethod
    def accepts(self, word: Word) -> bool:
        """
        Consumes 'word' and returns True if the automaton accepts, False if not.
        Must be implemented by subclasses (e.g. DFA, NFA).
        """
        pass
