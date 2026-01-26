from typing import Dict
from collections import defaultdict

from automata.backend.grammar.dist import TapeSymbol, Word


class Tape:
    def __init__(self, word: Word = (), blank_symbol: TapeSymbol = TapeSymbol(" ")):
        self.tape: Dict[int, TapeSymbol] = defaultdict(lambda: blank_symbol)
        for i, char in enumerate(word):
            self.tape[i] = char
        self.head_position = 0
        self.blank_symbol = blank_symbol

    def read(self) -> TapeSymbol:
        return self.tape[self.head_position]

    def write(self, symbol: TapeSymbol) -> None:
        self.tape[self.head_position] = symbol

    def move(self, direction: str) -> None:
        """
        Moves the head in the specified direction.
        'R' for Right, 'L' for Left, 'N' or others for No Move.
        """
        if direction == 'R':
            self.head_position += 1
        elif direction == 'L':
            self.head_position -= 1
    
    def __repr__(self) -> str:
        min_index = min(self.tape.keys()) if self.tape else 0
        max_index = max(self.tape.keys()) if self.tape else 0
        # Ensure head is included
        min_index = min(min_index, self.head_position)
        max_index = max(max_index, self.head_position)
        
        tape_str = ""
        for i in range(min_index, max_index + 1):
            val = self.tape[i]
            if i == self.head_position:
                tape_str += f"[{val}]"
            else:
                tape_str += f" {val} "
        return f"<Tape: {tape_str.strip()}>"
