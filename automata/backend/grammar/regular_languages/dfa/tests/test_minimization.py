"""
Regression tests for DFA minimization on both complete and partial DFAs.

The partial-DFA cases guard against a bug where missing transitions were
skipped during table filling, causing inequivalent states to be merged.
"""

import pytest

from automata.backend.grammar.dist import Alphabet, State, StateSet, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import (
    analyze_equivalence_classes,
    hopcroft_minimize,
)
from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import (
    analyze_state_equivalences,
    myhill_nerode_minimize,
)

MINIMIZERS = [hopcroft_minimize, myhill_nerode_minimize]


def _partial_dfa():
    """s -a-> q0 -a-> qf(accept); s -b-> q1; q1 has no outgoing transitions.

    s, q0, q1 are pairwise inequivalent: s accepts "aa", q0 accepts "a",
    q1 accepts nothing.
    """
    return DFA(
        states=StateSet(["s", "q0", "q1", "qf"]),
        alphabet=Alphabet(["a", "b"]),
        transitions={
            State("s"): {Symbol("a"): State("q0"), Symbol("b"): State("q1")},
            State("q0"): {Symbol("a"): State("qf")},
        },
        start_state=State("s"),
        accept_states=StateSet(["qf"]),
    )


def _words(alphabet, max_len):
    yield []
    frontier = [[]]
    for _ in range(max_len):
        frontier = [w + [s] for w in frontier for s in alphabet]
        yield from frontier


@pytest.mark.parametrize("minimize", MINIMIZERS)
def test_partial_dfa_language_preserved(minimize):
    dfa = _partial_dfa()
    minimized = minimize(dfa)
    for word in _words(["a", "b"], 4):
        assert minimized.accepts(word) == dfa.accepts(word), word


@pytest.mark.parametrize("minimize", MINIMIZERS)
def test_partial_dfa_keeps_inequivalent_states_apart(minimize):
    minimized = minimize(_partial_dfa())
    # s, q0, qf are pairwise inequivalent and must stay separate. q1 rejects
    # everything, so under partial-transition semantics it folds into the
    # pruned dead class: 3 states, with no transition on b from the start.
    assert len(minimized._states) == 3
    assert not minimized.accepts([Symbol("b")])
    assert minimized.accepts([Symbol("a"), Symbol("a")])


def test_equivalence_analyses_do_not_merge_inequivalent_states():
    dfa = _partial_dfa()
    for groups in (
        analyze_state_equivalences(dfa).values(),
        analyze_equivalence_classes(dfa).values(),
    ):
        for group in groups:
            assert len(set(group)) == 1


@pytest.mark.parametrize("minimize", MINIMIZERS)
def test_redundant_states_are_merged(minimize):
    # Classic example: strings over {a,b} ending in "b". q1 and q2 are
    # equivalent accept states; q0 and q3 are equivalent non-accept states.
    dfa = DFA.from_string(
        "q0,a,q3;q0,b,q1;q1,a,q3;q1,b,q2;q2,a,q3;q2,b,q2;q3,a,q3;q3,b,q1",
        start_state="q0",
        accept_states={"q1", "q2"},
    )
    minimized = minimize(dfa)
    assert len(minimized._states) == 2
    for word in _words(["a", "b"], 5):
        assert minimized.accepts(word) == dfa.accepts(word), word


def test_accepts_does_not_crash_on_state_without_transitions():
    dfa = _partial_dfa()
    # Driving the DFA into q1 (no outgoing transitions) then reading more
    # input must reject, not raise KeyError.
    assert not dfa.accepts([Symbol("b"), Symbol("a")])


def test_completed_is_total_and_equivalent():
    dfa = _partial_dfa()
    completed = dfa.completed()
    assert completed.is_complete()
    for word in _words(["a", "b"], 4):
        assert completed.accepts(word) == dfa.accepts(word), word
    # Already-complete DFAs are returned unchanged.
    assert completed.completed() is completed
