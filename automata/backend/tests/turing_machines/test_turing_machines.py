import pytest

from automata.backend.grammar.turing_machines import (
    TuringMachine,
    MultiTapeTuringMachine,
    MultiHeadTuringMachine,
)


def test_single_tape_accepts_and_rejects():
    transitions = {
        "q0": {
            "1": ("halt", "1", "N"),
            "_": ("halt", "_", "N"),
        }
    }
    tm = TuringMachine(
        states={"q0", "halt"},
        input_alphabet={"1"},
        tape_alphabet={"1", "_"},
        transitions=transitions,
        start_state="q0",
        blank_symbol="_",
        final_states={"halt"},
    )

    assert tm.accepts("1") is True

    with pytest.raises(ValueError):
        tm.accepts("0")


def test_multitape_accepts():
    transitions = {
        "q0": {
            ("a", "_"): ("q0", [("a", "R"), ("a", "R")]),
            ("_", "_"): ("halt", [("_", "N"), ("_", "N")]),
        }
    }
    tm = MultiTapeTuringMachine(
        states={"q0", "halt"},
        input_alphabet={"a"},
        tape_alphabet={"a", "_"},
        transitions=transitions,
        start_state="q0",
        blank_symbol="_",
        final_states={"halt"},
        num_tapes=2,
    )

    assert tm.accepts("aa") is True


def test_multihead_accepts():
    transitions = {
        "start": {
            ("a", "a"): ("start", [("a", "R"), ("a", "R")]),
            ("b", "b"): ("start", [("b", "R"), ("b", "R")]),
            ("_", "_"): ("halt", [("_", "N"), ("_", "N")]),
        }
    }
    tm = MultiHeadTuringMachine(
        states={"start", "halt"},
        input_alphabet={"a", "b"},
        tape_alphabet={"a", "b", "_"},
        transitions=transitions,
        start_state="start",
        blank_symbol="_",
        final_states={"halt"},
        num_heads=2,
    )

    assert tm.accepts("ab") is True
