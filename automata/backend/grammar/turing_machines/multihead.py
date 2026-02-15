from typing import Dict, List, Tuple, Any, Iterable, Union

from .base import TuringMachineBase
from .tape import Tape
from .exceptions import RejectionException, HaltingException
from automata.backend.grammar.dist import State, Symbol, Word, StateSet, Alphabet, TapeAlphabet, TapeSymbol


class MultiHeadTuringMachine(TuringMachineBase):
    """
    Multi-Head Turing Machine (Single Tape, Multiple Heads).
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
        num_heads: int = 2,
    ):
        """
        transitions structure:
        {
            state: {
                (read_sym_head_1, read_sym_head_2, ...): (next_state, [(write_sym_head_1, dir_1), ...])
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
        self.num_heads = num_heads
        self.current_state = start_state
        self.tape = Tape(blank_symbol=self.blank_symbol)
        self.head_positions = [0] * self.num_heads
        self.validate_transitions()

    def validate_transitions(self):
        """
        Validates the transitions function.
        """
        for state, transition_map in self.transitions.items():
            if state not in self._states:
                raise ValueError(f"State '{state}' in transitions is not in the set of states.")
            for read_symbols, (next_state, actions) in transition_map.items():
                if len(read_symbols) != self.num_heads:
                    raise ValueError(f"Number of read symbols {len(read_symbols)} does not match number of heads {self.num_heads}.")
                for symbol in read_symbols:
                    if symbol not in self.tape_alphabet:
                        raise ValueError(f"Read symbol '{symbol}' in transitions is not in the tape alphabet.")
                if next_state not in self._states:
                    raise ValueError(f"Next state '{next_state}' in transitions is not in the set of states.")
                if len(actions) != self.num_heads:
                    raise ValueError(f"Number of actions {len(actions)} does not match number of heads {self.num_heads}.")
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
        current_symbols_list = [self.tape.tape[pos] for pos in self.head_positions]
        current_symbols = tuple(current_symbols_list)

        if self.current_state not in self.transitions or current_symbols not in self.transitions[self.current_state]:
            raise RejectionException(f"No transition defined for state '{self.current_state}' and symbols '{current_symbols}'.")

        next_state, actions = self.transitions[self.current_state][current_symbols]

        # Write and Move
        # Note: Concurrent writes to same cell? Last one wins logic here.
        for i, (write_symbol, direction) in enumerate(actions):
            pos = self.head_positions[i]
            self.tape.tape[pos] = write_symbol
            
            if direction == 'R':
                self.head_positions[i] += 1
            elif direction == 'L':
                self.head_positions[i] -= 1
        
        self.current_state = next_state

    def accepts(self, word: Word, max_steps: int = 1000) -> bool:
        self.validate_word(word)
        self.tape = Tape(word, self.blank_symbol)
        self.head_positions = [0] * self.num_heads
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
            "head_positions": self.head_positions,
        }
