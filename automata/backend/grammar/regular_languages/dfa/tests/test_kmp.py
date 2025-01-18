import pytest
from backend.grammar.regular_languages.dfa.dfa_mod_algo import create_dfa_from_pattern


def test_kmp_dfa():
    pattern = "ababc"
    alphabet = set("ab")
    dfa = create_dfa_from_pattern(pattern, alphabet)
    # Now check if it accepts "ababc"
    assert dfa.is_accept("ababc") is True
    # Check partial
    assert dfa.is_accept("abab") is False
