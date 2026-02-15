from typing import Dict, List, Tuple, Any, Iterable, Union

from .base import TuringMachineBase
from .tape import Tape
from .exceptions import RejectionException, HaltingException
from automata.backend.grammar.dist import State, Symbol, Word, StateSet, Alphabet, TapeAlphabet, TapeSymbol


class MultiTapeTuringMachine(TuringMachineBase):
    """
    Multi-Tape Turing Machine.
    Input string is placed on the first tape. Other tapes are initialized with blanks.
    """
    def __init__(
        self,
        states: StateSet,
        input_alphabet: Union[Alphabet, Iterable[str]],
        tape_alphabet: Union[TapeAlphabet, Alphabet, Iterable[str]],
        transitions: Dict[State, Dict[Tuple[TapeSymbol, ...], Tuple[State, List[Tuple[TapeSymbol, str]]]]],
        start_state: State,
        blank_symbol: TapeSymbol,
        final_states: StateSet,
        num_tapes: int = 2,
    ):
        """
        transitions structure:
        {
            state: {
                (read_sym_1, read_sym_2, ...): (next_state, [(write_sym_1, dir_1), (write_sym_2, dir_2), ...])
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
        self.num_tapes = num_tapes
        self.current_state = start_state
        self.tapes = [Tape(blank_symbol=self.blank_symbol) for _ in range(num_tapes)]
        self.validate_transitions()

    def validate_transitions(self):
        """
        Validates the transitions function.
        """
        for state, transition_map in self.transitions.items():
            if state not in self._states:
                raise ValueError(f"State '{state}' in transitions is not in the set of states.")
            for read_symbols, (next_state, actions) in transition_map.items():
                if len(read_symbols) != self.num_tapes:
                    raise ValueError(f"Number of read symbols {len(read_symbols)} does not match number of tapes {self.num_tapes}.")
                for symbol in read_symbols:
                    if symbol not in self.tape_alphabet:
                        raise ValueError(f"Read symbol '{symbol}' in transitions is not in the tape alphabet.")
                if next_state not in self._states:
                    raise ValueError(f"Next state '{next_state}' in transitions is not in the set of states.")
                if len(actions) != self.num_tapes:
                    raise ValueError(f"Number of actions {len(actions)} does not match number of tapes {self.num_tapes}.")
                for write_symbol, direction in actions:
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
        current_symbols = tuple(tape.read() for tape in self.tapes)
        
        if self.current_state not in self.transitions or current_symbols not in self.transitions[self.current_state]:
            raise RejectionException(f"No transition defined for state '{self.current_state}' and symbols '{current_symbols}'.")

        next_state, actions = self.transitions[self.current_state][current_symbols]
        
        for i, (write_symbol, direction) in enumerate(actions):
            self.tapes[i].write(write_symbol)
            self.tapes[i].move(direction)

        self.current_state = next_state

    def accepts(self, word: Word, max_steps: int = 1000) -> bool:
        self.validate_word(word)
        # First tape gets input, others are blank.
        self.tapes = [Tape(word if i == 0 else (), self.blank_symbol) for i in range(self.num_tapes)]
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
            "tapes": [repr(tape) for tape in self.tapes],
        }
