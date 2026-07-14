"""Tests for DFA -> regex conversion (GNFA state elimination)."""

import pytest

from automata.backend.grammar.dist import State, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA


def _roundtrip(dfa: DFA) -> DFA:
    regex = dfa.to_regex()
    assert regex is not None
    return NFA.from_regex(regex).to_dfa()


def test_ends_in_a_roundtrip():
    dfa = DFA.from_string(
        "q0,a,q1;q0,b,q0;q1,a,q1;q1,b,q0",
        start_state="q0",
        accept_states={"q1"},
    )
    assert _roundtrip(dfa).equivalent_to(dfa)


def test_even_number_of_as_roundtrip():
    dfa = DFA.from_string(
        "e,a,o;o,a,e;e,b,e;o,b,o",
        start_state="e",
        accept_states={"e"},
    )
    assert _roundtrip(dfa).equivalent_to(dfa)


def test_partial_dfa_roundtrip():
    dfa = DFA.from_string("q0,a,q1;q1,b,q2", start_state="q0", accept_states={"q2"})
    regex = dfa.to_regex()
    assert regex == "ab"
    assert _roundtrip(dfa).equivalent_to(dfa)


def test_empty_language_returns_none():
    dfa = DFA.from_string("q0,a,q0", start_state="q0", accept_states=set())
    assert dfa.to_regex() is None


def test_epsilon_only_language():
    dfa = DFA.from_string("q0,a,q1", start_state="q0", accept_states={"q0"})
    regex = dfa.to_regex()
    assert regex is not None
    nfa = NFA.from_regex(regex)
    assert nfa.accepts("")
    assert not nfa.accepts("a")


def test_multichar_symbols_rejected():
    dfa = DFA.from_string("q0,ab,q1", start_state="q0", accept_states={"q1"})
    with pytest.raises(ValueError, match="multi-character"):
        dfa.to_regex()
