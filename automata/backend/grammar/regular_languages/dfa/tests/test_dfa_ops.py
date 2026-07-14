"""Tests for regular-language closure operations and decision procedures."""

import itertools

from automata.backend.grammar.dist import State, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA


def _ends_in_a():
    # Accepts words over {a,b} ending in 'a'
    return DFA.from_string(
        "q0,a,q1;q0,b,q0;q1,a,q1;q1,b,q0",
        start_state="q0",
        accept_states={"q1"},
    )


def _even_length():
    # Accepts words over {a,b} of even length
    return DFA.from_string(
        "e,a,o;e,b,o;o,a,e;o,b,e",
        start_state="e",
        accept_states={"e"},
    )


def _words(max_len):
    yield []
    for length in range(1, max_len + 1):
        for w in itertools.product([Symbol("a"), Symbol("b")], repeat=length):
            yield list(w)


def test_complement():
    dfa = _ends_in_a()
    comp = dfa.complement()
    for w in _words(5):
        assert comp.accepts(w) == (not dfa.accepts(w)), w


def test_union_intersection_difference():
    d1, d2 = _ends_in_a(), _even_length()
    u, i, d = d1.union(d2), d1.intersection(d2), d1.difference(d2)
    for w in _words(5):
        a1, a2 = d1.accepts(w), d2.accepts(w)
        assert u.accepts(w) == (a1 or a2), w
        assert i.accepts(w) == (a1 and a2), w
        assert d.accepts(w) == (a1 and not a2), w


def test_product_works_on_partial_dfas():
    # d1 is partial: no transitions out of q1 at all.
    d1 = DFA.from_string("q0,a,q1", start_state="q0", accept_states={"q1"})
    d2 = _even_length()
    u = d1.union(d2)
    assert u.accepts([Symbol("a")])  # accepted by d1
    assert u.accepts([Symbol("a"), Symbol("b")])  # even length
    assert not u.accepts([Symbol("b")])


def test_shortest_accepted_and_is_empty():
    dfa = _ends_in_a()
    assert dfa.shortest_accepted() == [Symbol("a")]
    assert not dfa.is_empty()

    empty = DFA.from_string("q0,a,q0", start_state="q0", accept_states=set())
    assert empty.shortest_accepted() is None
    assert empty.is_empty()

    accepts_epsilon = DFA.from_string(
        "q0,a,q1", start_state="q0", accept_states={"q0"}
    )
    assert accepts_epsilon.shortest_accepted() == []


def test_equivalence_and_counterexample():
    d1 = _ends_in_a()
    # Same language, different states: unminimized version of _ends_in_a.
    d1_redundant = DFA.from_string(
        "s,a,p;s,b,t;p,a,p;p,b,t;t,a,p;t,b,t",
        start_state="s",
        accept_states={"p"},
    )
    assert d1.equivalent_to(d1_redundant)
    assert d1.find_distinguishing_string(d1_redundant) is None

    d2 = _even_length()
    assert not d1.equivalent_to(d2)
    witness = d1.find_distinguishing_string(d2)
    assert witness is not None
    assert d1.accepts(witness) != d2.accepts(witness)
    # BFS guarantees a *shortest* counterexample: here, the empty word
    # (even length, doesn't end in 'a').
    assert witness == []


def test_minimization_preserves_equivalence():
    from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import (
        hopcroft_minimize,
    )

    dfa = _ends_in_a()
    assert hopcroft_minimize(dfa).equivalent_to(dfa)
