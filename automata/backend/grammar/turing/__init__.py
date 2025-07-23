"""Basic Turing machine implementation."""

from typing import Dict, Set, Tuple


class TuringMachine:
    def __init__(
        self,
        states: Set[str],
        tape_symbols: Set[str],
        blank: str,
        transitions: Dict[Tuple[str, str], Tuple[str, str, str]],
        start_state: str,
        accept_states: Set[str],
        reject_states: Set[str],
    ):
        self.states = states
        self.tape_symbols = tape_symbols
        self.blank = blank
        self.transitions = transitions
        self.start_state = start_state
        self.accept_states = accept_states
        self.reject_states = reject_states

    def run(self, tape: str, max_steps: int = 1000) -> bool:
        tape_list = list(tape)
        pos = 0
        state = self.start_state
        steps = 0
        while steps < max_steps and state not in self.accept_states | self.reject_states:
            if pos < 0:
                tape_list.insert(0, self.blank)
                pos = 0
            if pos >= len(tape_list):
                tape_list.append(self.blank)
            symbol = tape_list[pos]
            if (state, symbol) not in self.transitions:
                break
            next_state, write, move = self.transitions[(state, symbol)]
            tape_list[pos] = write
            pos += 1 if move == "R" else -1
            state = next_state
            steps += 1
        return state in self.accept_states
