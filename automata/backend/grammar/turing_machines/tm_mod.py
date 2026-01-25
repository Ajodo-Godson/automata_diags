from typing import Dict, Optional, Set



class TuringMachine:
    def __init__(
        self,
        states: Set[str],
        input_alphabet: Set[str],
        tape_alphabet: Set[str],
        transitions: Dict[str, Dict[str, tuple]],
        start_state: str,
        blank_symbol: str, 
        final_states: Set[str],
    ):
        self.states = states
        self.input_alphabet = input_alphabet
        self.tape_alphabet = tape_alphabet
        self.transitions = transitions
        self.start_state = start_state
        self.blank_symbol = blank_symbol
        self.final_states = final_states