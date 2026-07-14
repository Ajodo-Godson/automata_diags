"""Result and trace types for Turing machine runs."""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional

from automata.backend.grammar.dist import State


class Outcome(Enum):
    """How a run ended."""

    ACCEPT = "accept"    # halted in an accepting state
    REJECT = "reject"    # halted with no applicable transition
    TIMEOUT = "timeout"  # step budget exhausted; machine may not halt


@dataclass(frozen=True)
class Configuration:
    """A machine configuration: state + full tape snapshot.

    `tape` is the written portion of the tape as a string (blanks included
    inside the window). `offset` is the absolute tape index of `tape[0]`,
    and `head` is the absolute head position, so the symbol under the head
    is `tape[head - offset]`. JSON-friendly by design so visualizers can
    consume traces directly.
    """

    state: State
    tape: str
    head: int
    offset: int
    step: int

    @property
    def symbol_under_head(self) -> str:
        index = self.head - self.offset
        return self.tape[index] if 0 <= index < len(self.tape) else ""

    def __str__(self) -> str:
        index = self.head - self.offset
        cells = [
            f"[{ch}]" if i == index else f" {ch} "
            for i, ch in enumerate(self.tape)
        ]
        return f"{self.state}: {''.join(cells).strip()}"


@dataclass
class RunResult:
    """The outcome of running a Turing machine on a word."""

    outcome: Outcome
    steps: int
    final_state: State
    output: str  # final tape contents, trimmed of surrounding blanks
    trace: Optional[List[Configuration]] = field(default=None, repr=False)

    @property
    def accepted(self) -> bool:
        return self.outcome is Outcome.ACCEPT

    @property
    def halted(self) -> bool:
        return self.outcome is not Outcome.TIMEOUT
