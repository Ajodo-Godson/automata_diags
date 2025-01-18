import pytest  # noqa: F401
from automata.backend.grammar.regular_languages.dfa.dfa_mod_algo import (
    create_dfa_from_pattern,
    find_pattern_in_text,
)


def test_dfa_exact_match():
    pattern = "ababc"
    alphabet = {"a", "b", "c"}
    dfa = create_dfa_from_pattern(pattern, alphabet)

    assert dfa.accepts("ababc")
    assert not dfa.accepts("ab")
    assert not dfa.accepts("xxxababc")


def test_kmp_search():
    pattern = "ababc"
    text = "zzzababcxxxababc"
    # Matches at [3, 11]
    indices = find_pattern_in_text(pattern, text)
    assert indices == [3, 11]
