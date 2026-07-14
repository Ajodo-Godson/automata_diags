from typing import Dict, Optional, Set, Tuple, Any, Iterable, Union

from .base import TuringMachineBase
from .tape import Tape
from .exceptions import RejectionException, StepLimitExceeded
from .result import Configuration, Outcome, RunResult
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

    def reset(self, word: Word = ()) -> None:
        """
        Initialize a fresh run for manual stepping: load `word` on the tape
        and rewind to the start state.
        """
        self.validate_word(word)
        self.tape = Tape(word, self.blank_symbol)
        self.current_state = self._start_state

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

    def run(
        self,
        word: Word,
        max_steps: int = 10_000,
        record_trace: bool = False,
    ) -> RunResult:
        """
        Run the machine on `word` and report how the computation ended.

        Unlike `accepts`, this never raises for a machine-level event:
        exceeding `max_steps` is reported as `Outcome.TIMEOUT`, halting with
        no applicable transition as `Outcome.REJECT`, and reaching an
        accepting state as `Outcome.ACCEPT`.

        Args:
            word: Input word (a string works; each character is a symbol).
            max_steps: Step budget before giving up.
            record_trace: If True, `result.trace` holds one `Configuration`
                per step (including the initial one) for visualization.
        """
        self.validate_word(word)
        tape = Tape(word, self.blank_symbol)
        state = self._start_state
        trace = [] if record_trace else None
        steps = 0

        def snap() -> Configuration:
            window, offset = tape.snapshot()
            return Configuration(
                state=state,
                tape=window,
                head=tape.head_position,
                offset=offset,
                step=steps,
            )

        if trace is not None:
            trace.append(snap())

        while state not in self._accept_states:
            if steps >= max_steps:
                return RunResult(Outcome.TIMEOUT, steps, state, tape.contents(), trace)

            row = self.transitions.get(state, {})
            symbol = tape.read()
            if symbol not in row:
                return RunResult(Outcome.REJECT, steps, state, tape.contents(), trace)

            state, write_symbol, direction = row[symbol]
            tape.write(write_symbol)
            tape.move(direction)
            steps += 1
            if trace is not None:
                trace.append(snap())

        return RunResult(Outcome.ACCEPT, steps, state, tape.contents(), trace)

    def accepts(self, word: Word, max_steps: int = 10_000) -> bool:
        """
        True if the machine halts in an accepting state on `word`.

        Raises:
            StepLimitExceeded: If the machine does not halt within
                `max_steps` (use `run()` for a non-raising three-valued
                answer).
        """
        result = self.run(word, max_steps=max_steps)
        if result.outcome is Outcome.TIMEOUT:
            raise StepLimitExceeded(
                f"Maximum number of steps ({max_steps}) reached."
            )
        return result.accepted

    def compute(self, word: Word, max_steps: int = 10_000) -> str:
        """
        Run the machine as a function: return the final tape contents
        (trimmed of blanks) after it halts in an accepting state.

        Raises:
            RejectionException: If the machine halts without accepting.
            StepLimitExceeded: If it does not halt within `max_steps`.
        """
        result = self.run(word, max_steps=max_steps)
        if result.outcome is Outcome.TIMEOUT:
            raise StepLimitExceeded(
                f"Maximum number of steps ({max_steps}) reached."
            )
        if result.outcome is Outcome.REJECT:
            raise RejectionException(
                f"Machine halted in non-accepting state '{result.final_state}'."
            )
        return result.output

    def get_configuration(self) -> Dict[str, Any]:
        """
        Returns the current configuration of the Turing machine.
        """
        return {
            "current_state": self.current_state,
            "tape": repr(self.tape),
        }

    @classmethod
    def from_string(
        cls,
        tm_string: str,
        start_state: str,
        accept_states: Set[str],
        blank_symbol: str = "_",
        input_symbols: Optional[Set[str]] = None,
    ) -> "TuringMachine":
        """
        Create a TuringMachine from a string representation.

        Format: transitions separated by semicolons. Each transition is:
            current_state, read_symbol, next_state, write_symbol, direction

        Direction is R (right), L (left), or N (no move).

        The input alphabet is `input_symbols` if given; otherwise it is
        inferred as the non-blank symbols appearing in *read* position.
        Pass `input_symbols` explicitly when the machine reads its own
        tape markers (e.g. X/Y in a marking machine), since inference
        cannot tell markers apart from genuine input symbols.

        Example:
            "q0,0,q0,0,R; q0,1,q1,1,R; q1,0,q1,0,R; q1,1,q0,1,R; q0,_,qa,_,N"
        """
        all_states: Set[State] = set()
        read_symbols: Set[str] = set()
        tape_symbols: Set[str] = set()
        transitions: Dict[State, Dict[TapeSymbol, Tuple[State, TapeSymbol, str]]] = {}

        tape_symbols.add(blank_symbol)

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

            src = State(src_str)
            dst = State(dst_str)
            read_sym = TapeSymbol(read_str)
            write_sym = TapeSymbol(write_str)

            all_states.add(src)
            all_states.add(dst)
            tape_symbols.add(read_str)
            tape_symbols.add(write_str)

            if read_str != blank_symbol:
                read_symbols.add(read_str)

            if direction not in ("R", "L", "N"):
                raise ValueError(f"Direction must be R, L, or N, got '{direction}'")

            if src not in transitions:
                transitions[src] = {}
            transitions[src][read_sym] = (dst, write_sym, direction)

        start_s = State(start_state)
        all_states.add(start_s)
        for a in accept_states:
            all_states.add(State(a))

        if input_symbols is None:
            input_symbols = read_symbols
        else:
            tape_symbols |= set(input_symbols)

        return cls(
            states=StateSet.from_states(list(all_states)),
            input_alphabet=Alphabet(list(input_symbols)),
            tape_alphabet=TapeAlphabet(list(tape_symbols)),
            transitions=transitions,
            start_state=start_s,
            blank_symbol=TapeSymbol(blank_symbol),
            final_states=StateSet.from_states([State(a) for a in accept_states]),
        )
