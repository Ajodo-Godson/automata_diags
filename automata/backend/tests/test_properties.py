"""
Property-based tests (Hypothesis) cross-validating the regular-language core.

Each property here is an algebraic law that must hold for *every* input, so
Hypothesis hunts for counterexamples instead of relying on hand-picked cases:

- regex -> NFA agrees with Python's `re.fullmatch` on the shared syntax;
- NFA -> DFA conversion preserves the language;
- both minimizers preserve the language and agree on the minimal size;
- complement/union/intersection satisfy involution and De Morgan's law;
- equivalence counterexamples actually distinguish the two DFAs.
"""

import re

from hypothesis import given, settings, strategies as st

from automata.backend.grammar.dist import Alphabet, State, StateSet, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.dfa.minimization.hopcroft import (
    hopcroft_minimize,
)
from automata.backend.grammar.regular_languages.dfa.minimization.myhill_nerode import (
    myhill_nerode_minimize,
)
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA
from automata.backend.grammar.regular_languages.regex_to_nfa import regex_to_nfa

ALPHABET = ["a", "b"]

# ── Strategies ───────────────────────────────────────────────────────────────

# Regex ASTs over {a, b} with union, concatenation, and star: the syntax
# subset that automata-diags and Python's `re` share.
regex_asts = st.recursive(
    st.sampled_from(ALPHABET),
    lambda inner: st.one_of(
        st.tuples(st.just("|"), inner, inner),
        st.tuples(st.just("cat"), inner, inner),
        st.tuples(st.just("*"), inner),
    ),
    max_leaves=6,
)

words = st.text(alphabet="ab", max_size=7)


def _ast_to_pattern(ast) -> str:
    if isinstance(ast, str):
        return ast
    if ast[0] == "|":
        return f"({_ast_to_pattern(ast[1])}|{_ast_to_pattern(ast[2])})"
    if ast[0] == "cat":
        return f"({_ast_to_pattern(ast[1])}{_ast_to_pattern(ast[2])})"
    return f"({_ast_to_pattern(ast[1])})*"


@st.composite
def dfas(draw, max_states: int = 6):
    """Random partial DFAs over {a, b}."""
    n = draw(st.integers(min_value=1, max_value=max_states))
    states = [f"s{i}" for i in range(n)]
    transitions = {}
    for s in states:
        row = {}
        for c in ALPHABET:
            if draw(st.booleans()):
                row[Symbol(c)] = State(draw(st.sampled_from(states)))
        if row:
            transitions[State(s)] = row
    accepting = draw(st.sets(st.sampled_from(states), max_size=n))
    return DFA(
        states=StateSet(states),
        alphabet=Alphabet(ALPHABET),
        transitions=transitions,
        start_state=State("s0"),
        accept_states=StateSet(accepting),
    )


@st.composite
def nfas(draw, max_states: int = 5):
    """Random NFAs over {a, b} with ε-transitions."""
    n = draw(st.integers(min_value=1, max_value=max_states))
    states = [f"n{i}" for i in range(n)]
    transitions = {}
    for s in states:
        row = {}
        for c in ALPHABET + ["ε"]:
            targets = draw(st.sets(st.sampled_from(states), max_size=n))
            if targets:
                row[Symbol(c)] = StateSet.from_states({State(t) for t in targets})
        if row:
            transitions[State(s)] = row
    accepting = draw(st.sets(st.sampled_from(states), min_size=1, max_size=n))
    return NFA(
        states=StateSet(states),
        alphabet=Alphabet(ALPHABET),
        transitions=transitions,
        start_state=State("n0"),
        accept_states=StateSet.from_states({State(a) for a in accepting}),
    )


# ── Properties ───────────────────────────────────────────────────────────────


@given(regex_asts, words)
def test_regex_to_nfa_agrees_with_python_re(ast, word):
    pattern = _ast_to_pattern(ast)
    expected = re.fullmatch(pattern, word) is not None
    assert regex_to_nfa(pattern).accepts(word) == expected


@given(nfas(), words)
def test_nfa_to_dfa_preserves_language(nfa, word):
    assert nfa.to_dfa().accepts(word) == nfa.accepts(word)


@given(dfas())
def test_minimizers_preserve_language_and_agree(dfa):
    hop = hopcroft_minimize(dfa)
    mn = myhill_nerode_minimize(dfa)
    assert hop.equivalent_to(dfa)
    assert mn.equivalent_to(dfa)
    assert len(hop._states) == len(mn._states)


@given(dfas())
def test_complement_is_involution(dfa):
    assert dfa.complement().complement().equivalent_to(dfa)


@given(dfas(), dfas())
def test_de_morgan(d1, d2):
    lhs = d1.union(d2).complement()
    rhs = d1.complement().intersection(d2.complement())
    assert lhs.equivalent_to(rhs)


@given(dfas(), dfas(), words)
def test_counterexample_actually_distinguishes(d1, d2, word):
    witness = d1.find_distinguishing_string(d2)
    if witness is None:
        # Claimed equivalent: spot-check agreement on an arbitrary word.
        assert d1.accepts(word) == d2.accepts(word)
    else:
        assert d1.accepts(witness) != d2.accepts(witness)
