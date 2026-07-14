from typing import Dict, Tuple

from automata.backend.grammar.dist import TapeSymbol, Word


class Tape:
    """A two-way infinite tape backed by a sparse dict of non-blank cells.

    Reading never allocates, and writing the blank symbol frees the cell,
    so memory stays proportional to the non-blank content regardless of how
    far the head wanders.
    """

    def __init__(self, word: Word = (), blank_symbol: TapeSymbol = TapeSymbol(" ")):
        self.blank_symbol = blank_symbol
        self.cells: Dict[int, TapeSymbol] = {
            i: char for i, char in enumerate(word) if char != blank_symbol
        }
        self.head_position = 0

    def read(self) -> TapeSymbol:
        return self.cells.get(self.head_position, self.blank_symbol)

    def write(self, symbol: TapeSymbol) -> None:
        if symbol == self.blank_symbol:
            self.cells.pop(self.head_position, None)
        else:
            self.cells[self.head_position] = symbol

    def read_at(self, position: int) -> TapeSymbol:
        return self.cells.get(position, self.blank_symbol)

    def write_at(self, position: int, symbol: TapeSymbol) -> None:
        if symbol == self.blank_symbol:
            self.cells.pop(position, None)
        else:
            self.cells[position] = symbol

    def move(self, direction: str) -> None:
        """
        Moves the head in the specified direction.
        'R' for Right, 'L' for Left, 'N' or others for No Move.
        """
        if direction == "R":
            self.head_position += 1
        elif direction == "L":
            self.head_position -= 1

    def snapshot(self) -> Tuple[str, int]:
        """
        Return (window, offset): the tape from the leftmost to the rightmost
        non-blank cell (always including the head position) as a string, and
        the absolute index of its first character.
        """
        positions = set(self.cells) | {self.head_position}
        lo, hi = min(positions), max(positions)
        window = "".join(
            str(self.cells.get(i, self.blank_symbol)) for i in range(lo, hi + 1)
        )
        return window, lo

    def contents(self) -> str:
        """Return the non-blank portion of the tape, in order."""
        if not self.cells:
            return ""
        lo, hi = min(self.cells), max(self.cells)
        return "".join(
            str(self.cells.get(i, self.blank_symbol)) for i in range(lo, hi + 1)
        )

    def __repr__(self) -> str:
        window, offset = self.snapshot()
        index = self.head_position - offset
        tape_str = "".join(
            f"[{ch}]" if i == index else f" {ch} " for i, ch in enumerate(window)
        )
        return f"<Tape: {tape_str.strip()}>"
