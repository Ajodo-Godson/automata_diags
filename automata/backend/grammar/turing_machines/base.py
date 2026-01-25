from abc import ABC, abstractmethod
from typing import Set, Dict, Tuple


class TuringMachineBase(ABC):
    """
    A base class for Turing machines.
    """
    def __init__(
        self,
        states: Set[str],
        input_alphabet: Set[str],
        tape_alphabet: Set[str],
        start_state: str,
        blank_symbol: str, 
        final_states: Set[str],
    ):
        self.validate_turing_machine(states, input_alphabet, tape_alphabet, start_state, blank_symbol, final_states)
        self.states = states
        self.input_alphabet = input_alphabet
        self.tape_alphabet = tape_alphabet
        self.start_state = start_state
        self.blank_symbol = blank_symbol
        self.final_states = final_states

    @staticmethod
    def validate_turing_machine(
        states: Set[str],
        input_alphabet: Set[str],
        tape_alphabet: Set[str],
        start_state: str,
        blank_symbol: str, 
        final_states: Set[str],
    ):
        """
        Validates the Turing machine definition.
        """
        if not states:
            raise ValueError("Set of states cannot be empty.")
        if not input_alphabet:
            raise ValueError("Input alphabet cannot be empty.")
        if not tape_alphabet:
            raise ValueError("Tape alphabet cannot be empty.")
        if start_state not in states:
            raise ValueError(f"Start state '{start_state}' is not in the set of states.")
        if blank_symbol not in tape_alphabet:
            raise ValueError(f"Blank symbol '{blank_symbol}' is not in the tape alphabet.")
        if not final_states.issubset(states):
            raise ValueError("Final states must be a subset of the set of states.")
        if not input_alphabet.issubset(tape_alphabet):
            raise ValueError("Input alphabet must be a subset of the tape alphabet.")

    @abstractmethod
    def process_input(self, input_string: str, max_steps: int = 1000) -> bool:
        """
        Processes an input string.
        """
        pass
