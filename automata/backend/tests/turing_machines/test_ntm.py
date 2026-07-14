"""Tests for the nondeterministic Turing machine."""

import pytest

from automata.backend.grammar.turing_machines import (
    NondeterministicTuringMachine,
    StepLimitExceeded,
)


def _third_from_end_is_1() -> NondeterministicTuringMachine:
    """
    L = {w in {0,1}* : the third symbol from the end is 1}.

    The machine scans right and nondeterministically guesses, at some 1,
    that it is the third-from-last symbol; it then verifies exactly two
    more symbols follow.
    """
    return NondeterministicTuringMachine.from_string(
        # Keep scanning...
        "scan,0,scan,0,R;"
        "scan,1,scan,1,R;"
        # ...or guess this 1 is third from the end.
        "scan,1,two_left,1,R;"
        "two_left,0,one_left,0,R; two_left,1,one_left,1,R;"
        "one_left,0,at_end,0,R; one_left,1,at_end,1,R;"
        "at_end,_,qacc,_,N",
        start_state="scan",
        accept_states={"qacc"},
    )


@pytest.mark.parametrize(
    "word,expected",
    [
        ("100", True),
        ("1000", False),
        ("0100", True),
        ("111", True),
        ("011", False),
        ("00", False),
        ("", False),
        ("110101100", True),
    ],
)
def test_nondeterministic_guessing(word, expected):
    assert _third_from_end_is_1().accepts(word) == expected


def test_deterministic_machine_still_works_as_ntm():
    ntm = NondeterministicTuringMachine.from_string(
        "q0,a,q0,a,R; q0,_,qacc,_,N",
        start_state="q0",
        accept_states={"qacc"},
    )
    assert ntm.accepts("aaa")
    assert ntm.accepts("")  # empty word: blank is read immediately, accepted


def test_looping_branch_does_not_prevent_acceptance():
    # One branch loops in place forever (finite configuration space, so BFS
    # revisit-detection kills it); another accepts.
    ntm = NondeterministicTuringMachine.from_string(
        "q0,a,q0,a,N;"  # looping branch (same configuration forever)
        "q0,a,qacc,a,N",
        start_state="q0",
        accept_states={"qacc"},
    )
    assert ntm.accepts("a")


def test_all_branches_rejecting_returns_false():
    ntm = NondeterministicTuringMachine.from_string(
        "q0,a,q1,a,R; q0,a,q2,a,R",
        start_state="q0",
        accept_states={"qacc"},
    )
    assert not ntm.accepts("a")


def test_configuration_budget_enforced():
    # Head runs right forever writing a's: unboundedly many configurations.
    ntm = NondeterministicTuringMachine.from_string(
        "q0,_,q0,a,R",
        start_state="q0",
        accept_states={"qacc"},
    )
    with pytest.raises(StepLimitExceeded):
        ntm.accepts("", max_configurations=100)
