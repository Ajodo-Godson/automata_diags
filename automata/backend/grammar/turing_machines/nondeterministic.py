"""
Nondeterministic Turing Machine (NTM).

Acceptance is decided by breadth-first search over configurations, mirroring
the package's PDA: the machine accepts if *any* computation branch reaches
an accepting state. A configuration is (state, frozen tape, head position);
visited configurations are skipped, so machines whose branches loop through
a finite configuration space still terminate.
"""

from collections import deque
from typing import Dict, FrozenSet, Iterable, Optional, Set, Tuple, Union, Any

from .base import TuringMachineBase
from .exceptions import StepLimitExceeded
from automata.backend.grammar.dist import (
    State,
    Word,
    StateSet,
    Alphabet,
    TapeAlphabet,
    TapeSymbol,
)

# One nondeterministic choice: (next_state, write_symbol, direction)
NTMChoice = Tuple[State, TapeSymbol, str]
NTMTransitions = Dict[State, Dict[TapeSymbol, Set[NTMChoice]]]

# A frozen tape: the set of (position, symbol) pairs for non-blank cells.
_FrozenTape = FrozenSet[Tuple[int, TapeSymbol]]


class NondeterministicTuringMachine(TuringMachineBase):
    """
    Nondeterministic single-tape Turing Machine.

    transitions structure:
    {
        state: {
            read_symbol: {(next_state, write_symbol, direction), ...}
        }
    }
    """

    def __init__(
        self,
        states: StateSet,
        input_alphabet: Union[Alphabet, Iterable[str]],
        tape_alphabet: Union[TapeAlphabet, Alphabet, Iterable[str]],
        transitions: NTMTransitions,
        start_state: State,
        blank_symbol: TapeSymbol,
        final_states: StateSet,
    ):
        super().__init__(
            states=states,
            input_alphabet=input_alphabet,
            tape_alphabet=tape_alphabet,
            start_state=start_state,
            blank_symbol=blank_symbol,
            final_states=final_states,
        )
        self.transitions = transitions
        self.validate_transitions()

    def validate_transitions(self):
        for state, transition_map in self.transitions.items():
            if state not in self._states:
                raise ValueError(f"State '{state}' in transitions is not in the set of states.")
            for read_symbol, choices in transition_map.items():
                if read_symbol not in self.tape_alphabet:
                    raise ValueError(f"Read symbol '{read_symbol}' is not in the tape alphabet.")
                for next_state, write_symbol, direction in choices:
                    if next_state not in self._states:
                        raise ValueError(f"Next state '{next_state}' is not in the set of states.")
                    if write_symbol not in self.tape_alphabet:
                        raise ValueError(f"Write symbol '{write_symbol}' is not in the tape alphabet.")
                    if direction not in ("R", "L", "N"):
                        raise ValueError(f"Direction '{direction}' must be 'R', 'L', or 'N'.")

    def validate_word(self, word: Word):
        if not all(symbol in self._input_alphabet for symbol in word):
            raise ValueError("Input word contains symbols not in the input alphabet.")

    def accepts(self, word: Word, max_configurations: int = 100_000) -> bool:
        """
        True if any computation branch reaches an accepting state.

        Explores configurations breadth-first with cycle detection; returns
        False when every branch halts without accepting.

        Raises:
            StepLimitExceeded: If more than `max_configurations`
                configurations are explored without resolving.
        """
        self.validate_word(word)

        initial_tape: _FrozenTape = frozenset(
            (i, TapeSymbol(ch)) for i, ch in enumerate(word) if ch != self.blank_symbol
        )
        start = (self._start_state, initial_tape, 0)

        queue = deque([start])
        visited: Set[Tuple[State, _FrozenTape, int]] = {start}

        while queue:
            if len(visited) > max_configurations:
                raise StepLimitExceeded(
                    f"Explored more than {max_configurations} configurations."
                )

            state, tape, head = queue.popleft()
            if state in self._accept_states:
                return True

            cells = dict(tape)
            symbol = cells.get(head, self.blank_symbol)
            for next_state, write_symbol, direction in self.transitions.get(
                state, {}
            ).get(symbol, ()):
                new_cells = dict(cells)
                if write_symbol == self.blank_symbol:
                    new_cells.pop(head, None)
                else:
                    new_cells[head] = write_symbol
                new_head = head + (1 if direction == "R" else -1 if direction == "L" else 0)
                config = (next_state, frozenset(new_cells.items()), new_head)
                if config not in visited:
                    visited.add(config)
                    queue.append(config)

        return False

    def get_configuration(self) -> Dict[str, Any]:
        """NTMs are explored breadth-first; there is no single current configuration."""
        return {"note": "nondeterministic machine; use accepts() for exploration"}

    @classmethod
    def from_string(
        cls,
        tm_string: str,
        start_state: str,
        accept_states: Set[str],
        blank_symbol: str = "_",
        input_symbols: Optional[Set[str]] = None,
    ) -> "NondeterministicTuringMachine":
        """
        Create an NTM from a string of transitions (same 5-field format as
        `TuringMachine.from_string`). Repeating the same (state, read_symbol)
        pair on multiple transitions makes the machine nondeterministic.
        """
        all_states: Set[State] = set()
        read_symbols: Set[str] = set()
        tape_symbols: Set[str] = {blank_symbol}
        transitions: NTMTransitions = {}

        for transition_str in tm_string.strip().split(";"):
            transition_str = transition_str.strip()
            if not transition_str:
                continue

            parts = [p.strip() for p in transition_str.split(",")]
            if len(parts) != 5:
                raise ValueError(
                    f"Expected 5 comma-separated values, got {len(parts)}: '{transition_str}'"
                )

            src_str, read_str, dst_str, write_str, direction = parts
            if direction not in ("R", "L", "N"):
                raise ValueError(f"Direction must be R, L, or N, got '{direction}'")

            src, dst = State(src_str), State(dst_str)
            all_states.update((src, dst))
            tape_symbols.update((read_str, write_str))
            if read_str != blank_symbol:
                read_symbols.add(read_str)

            transitions.setdefault(src, {}).setdefault(
                TapeSymbol(read_str), set()
            ).add((dst, TapeSymbol(write_str), direction))

        start_s = State(start_state)
        all_states.add(start_s)
        all_states.update(State(a) for a in accept_states)

        if input_symbols is None:
            input_symbols = read_symbols
        else:
            tape_symbols |= set(input_symbols)

        return cls(
            states=StateSet.from_states(all_states),
            input_alphabet=Alphabet(input_symbols),
            tape_alphabet=TapeAlphabet(tape_symbols),
            transitions=transitions,
            start_state=start_s,
            blank_symbol=TapeSymbol(blank_symbol),
            final_states=StateSet.from_states({State(a) for a in accept_states}),
        )
