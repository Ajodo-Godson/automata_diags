from typing import TypeVar, Generic, List
from abc import ABC, abstractmethod
from automata.backend.grammar.dist import State, Symbol, Word, Alphabet, StateSet, OutputAlphabet

T = TypeVar("T")

class FiniteTransducer(Generic[T], ABC):
    def __init__(
        self,
        states: StateSet,
        input_alphabet: Alphabet,
        output_alphabet: OutputAlphabet,
        start_state: State,
    ):
        self._states = states
        self._input_alphabet = input_alphabet
        self._output_alphabet = output_alphabet
        self._start_state = start_state

    @abstractmethod
    def transduce(self, word: Word) -> List[Symbol]:
        """
        Transduces an input word to an output word.
        """
        pass
