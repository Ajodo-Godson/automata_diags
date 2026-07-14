"""Tests for the TM execution core: run/trace/compute/reset semantics."""

import pytest

from automata.backend.grammar.turing_machines import (
    Outcome,
    RejectionException,
    StepLimitExceeded,
    TuringMachine,
)
from automata.backend.grammar.turing_machines.library import binary_increment


def _even_ones() -> TuringMachine:
    # Accepts binary strings with an even number of 1s.
    return TuringMachine.from_string(
        "even,0,even,0,R; even,1,odd,1,R; odd,0,odd,0,R; odd,1,even,1,R;"
        "even,_,qacc,_,N",
        start_state="even",
        accept_states={"qacc"},
    )


def _loops_forever() -> TuringMachine:
    return TuringMachine.from_string(
        "q0,_,q0,_,R",
        start_state="q0",
        accept_states={"qacc"},
    )


def test_run_accept_reject_timeout():
    tm = _even_ones()
    assert tm.run("11").outcome is Outcome.ACCEPT
    assert tm.run("1").outcome is Outcome.REJECT
    assert _loops_forever().run("", max_steps=50).outcome is Outcome.TIMEOUT


def test_run_never_raises_but_accepts_does():
    looper = _loops_forever()
    result = looper.run("", max_steps=10)
    assert result.outcome is Outcome.TIMEOUT
    assert result.steps == 10
    with pytest.raises(StepLimitExceeded):
        looper.accepts("", max_steps=10)


def test_trace_records_every_configuration():
    tm = _even_ones()
    result = tm.run("101", record_trace=True)
    assert result.accepted
    assert result.trace is not None
    assert len(result.trace) == result.steps + 1  # initial config included
    first, last = result.trace[0], result.trace[-1]
    assert first.state == "even" and first.step == 0
    assert last.state == "qacc"
    # The symbol under the head is reconstructible from every configuration.
    assert first.symbol_under_head == "1"


def test_trace_is_json_friendly():
    import json

    from dataclasses import asdict

    result = _even_ones().run("10", record_trace=True)
    payload = json.dumps([asdict(c) for c in result.trace])
    assert "even" in payload


def test_compute_returns_final_tape():
    tm = binary_increment()
    assert tm.compute("1011") == "1100"
    with pytest.raises(StepLimitExceeded):
        _loops_forever().compute("", max_steps=10)


def test_compute_raises_on_rejection():
    tm = _even_ones()
    with pytest.raises(RejectionException):
        tm.compute("1")


def test_runs_are_independent():
    # A rejected run must not pollute the next one (machines used to keep
    # tape/state between calls).
    tm = _even_ones()
    assert not tm.run("1").accepted
    assert tm.run("11").accepted
    assert not tm.run("1").accepted


def test_manual_stepping_via_reset():
    tm = _even_ones()
    tm.reset("11")
    tm.step()
    assert tm.current_state == "odd"
    tm.step()
    assert tm.current_state == "even"


def test_from_string_does_not_leak_markers_into_input_alphabet():
    # Machine writes marker X (but never reads it): X must not become an
    # input symbol. (Markers the machine reads back can't be told apart
    # from input by inference - pass input_symbols explicitly for those.)
    tm = TuringMachine.from_string(
        "q0,a,q1,X,R; q1,_,qacc,_,N",
        start_state="q0",
        accept_states={"qacc"},
    )
    assert "X" not in tm._input_alphabet
    assert "X" in tm.tape_alphabet
    with pytest.raises(ValueError):
        tm.run("X")


def test_from_string_explicit_input_symbols():
    tm = TuringMachine.from_string(
        "q0,a,qacc,a,N",
        start_state="q0",
        accept_states={"qacc"},
        input_symbols={"a", "b"},
    )
    assert "b" in tm._input_alphabet
    assert not tm.run("b").accepted  # valid input, but no transition


def test_tape_reads_do_not_allocate():
    looper = _loops_forever()
    result = looper.run("", max_steps=5000)
    assert result.outcome is Outcome.TIMEOUT
    # The head wandered 5000 cells to the right reading blanks; the final
    # tape must still be empty.
    assert result.output == ""
