from typing import Dict, Tuple, Any, Iterable, Union

from .base import TuringMachineBase
from .tape import Tape
from .exceptions import RejectionException, HaltingException
from automata.backend.grammar.dist import State, Symbol, Word, StateSet, Alphabet, TapeAlphabet, TapeSymbol


class TuringMachine(TuringMachineBase):
    """
    Standard Single-Tape Turing Machine.
    """
    def __init__(
        self,
        states: StateSet,
        input_alphabet: Union[Alphabet, Iterable[str]],
        tape_alphabet: Union[TapeAlphabet, Alphabet, Iterable[str]],
        transitions: Dict[State, Dict[TapeSymbol, Tuple[State, TapeSymbol, str]]],
        start_state: State,
        blank_symbol: TapeSymbol,
        final_states: StateSet,
    ):
        """
        transitions structure:
        {
            state: {
                read_symbol: (next_state, write_symbol, direction)
            }
        }
        """
        super().__init__(
            states=states,
            input_alphabet=input_alphabet,
            tape_alphabet=tape_alphabet,
            start_state=start_state,
            blank_symbol=blank_symbol,
            final_states=final_states,
        )
        self.transitions = transitions
        self.current_state = start_state
        self.tape = Tape(blank_symbol=self.blank_symbol)
        self.validate_transitions()

    def validate_transitions(self):
        """
        Validates the transitions function.
        """
        for state, transition_map in self.transitions.items():
            if state not in self._states:
                raise ValueError(f"State '{state}' in transitions is not in the set of states.")
            for read_symbol, (next_state, write_symbol, direction) in transition_map.items():
                if read_symbol not in self.tape_alphabet:
                    raise ValueError(f"Read symbol '{read_symbol}' in transitions is not in the tape alphabet.")
                if next_state not in self._states:
                    raise ValueError(f"Next state '{next_state}' in transitions is not in the set of states.")
                if write_symbol not in self.tape_alphabet:
                    raise ValueError(f"Write symbol '{write_symbol}' in transitions is not in the tape alphabet.")
                if direction not in ['R', 'L', 'N']:
                    raise ValueError(f"Direction '{direction}' must be 'R', 'L', or 'N'.")

    def validate_word(self, word: Word):
        """
        Validates the input word.
        """
        if not all(symbol in self._input_alphabet for symbol in word):
            raise ValueError("Input word contains symbols not in the input alphabet.")

    def step(self) -> None:
        """
        Performs a single transition step.
        """
        current_symbol = self.tape.read()
        
        if self.current_state not in self.transitions or current_symbol not in self.transitions[self.current_state]:
            raise RejectionException(f"No transition defined for state '{self.current_state}' and symbol '{current_symbol}'.")

        next_state, write_symbol, direction = self.transitions[self.current_state][current_symbol]
        
        self.tape.write(write_symbol)
        self.tape.move(direction)
        self.current_state = next_state

    def accepts(self, word: Word, max_steps: int = 1000) -> bool:
        self.validate_word(word)
        self.tape = Tape(word, self.blank_symbol)
        self.current_state = self._start_state
        step_count = 0

        while self.current_state not in self._accept_states:
            if step_count >= max_steps:
                raise HaltingException(f"Maximum number of steps ({max_steps}) reached.")
            
            try:
                self.step()
            except RejectionException:
                return False
            
            step_count += 1
        
        return True

    def get_configuration(self) -> Dict[str, Any]:
        """
        Returns the current configuration of the Turing machine.
        """
        return {
            "current_state": self.current_state,
            "tape": repr(self.tape),
        }
