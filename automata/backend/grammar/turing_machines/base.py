from abc import ABC, abstractmethod
from typing import Set, Dict, Tuple, Any, Iterable, Union

from automata.backend.grammar.automaton_base import Automaton
from automata.backend.grammar.dist import StateSet, Alphabet, TapeAlphabet, State, Symbol, Word


class TuringMachineBase(Automaton[State], ABC):
    """
    A base class for Turing machines.
    """
    def __init__(
        self,
        states: StateSet,
        input_alphabet: Union[Alphabet, Iterable[str]],
        tape_alphabet: Union[TapeAlphabet, Alphabet, Iterable[str]],
        start_state: State,
        blank_symbol: Symbol,
        final_states: StateSet,
    ):
        input_alphabet = self._coerce_input_alphabet(input_alphabet)
        tape_alphabet = self._coerce_tape_alphabet(tape_alphabet)
        super().__init__(states, input_alphabet, start_state, final_states)
        self._input_alphabet = input_alphabet
        self.tape_alphabet = tape_alphabet
        self.blank_symbol = blank_symbol
        self.validate_turing_machine()

    @staticmethod
    def _coerce_input_alphabet(alphabet: Union[Alphabet, Iterable[str]]) -> Alphabet:
        if isinstance(alphabet, Alphabet):
            return alphabet
        return Alphabet(alphabet)

    @staticmethod
    def _coerce_tape_alphabet(
        alphabet: Union[TapeAlphabet, Alphabet, Iterable[str]]
    ) -> TapeAlphabet:
        if isinstance(alphabet, TapeAlphabet):
            return alphabet
        if isinstance(alphabet, Alphabet):
            return TapeAlphabet(alphabet.symbols())
        return TapeAlphabet(alphabet)

    def validate_turing_machine(self):
        """
        Validates the Turing machine definition.
        """
        if self.blank_symbol not in self.tape_alphabet:
            raise ValueError(f"Blank symbol '{self.blank_symbol}' is not in the tape alphabet.")
        if not self._input_alphabet.symbols().issubset(self.tape_alphabet.symbols()):
            raise ValueError("Input alphabet must be a subset of the tape alphabet.")

    @abstractmethod
    def accepts(self, word: Word) -> bool:
        """
        Returns True if the automaton accepts the given word, False otherwise.
        """
        pass

    @abstractmethod
    def get_configuration(self) -> Any:
        """
        Returns the current configuration of the Turing machine.
        """
        pass
