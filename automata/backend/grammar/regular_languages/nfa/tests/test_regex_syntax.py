"""Tests for the regex parser: operators, classes, escapes, and errors."""

import pytest

from automata.backend.grammar.regular_languages.regex_to_nfa import (
    RegexSyntaxError,
    regex_to_nfa,
)


@pytest.mark.parametrize(
    "pattern,word,expected",
    [
        # optional
        ("ab?c", "ac", True),
        ("ab?c", "abc", True),
        ("ab?c", "abbc", False),
        # plus
        ("a+b", "ab", True),
        ("a+b", "aaab", True),
        ("a+b", "b", False),
        # bounded repetition
        ("a{2,3}", "a", False),
        ("a{2,3}", "aa", True),
        ("a{2,3}", "aaa", True),
        ("a{2,3}", "aaaa", False),
        ("(ab){2}", "abab", True),
        ("(ab){2}", "ab", False),
        ("a{2,}", "aaaaa", True),
        ("a{2,}", "a", False),
        # character classes
        ("[a-c]*", "abccba", True),
        ("[a-c]*", "d", False),
        ("[a\\-c]", "-", True),  # escaped '-' is a literal
        # escapes
        ("\\.a", ".a", True),
        ("\\.a", "xa", False),
        ("a\\d", "a7", True),
        ("a\\d", "ab", False),
        # epsilon and empty branches
        ("ε|a", "", True),
        ("ε|a", "a", True),
        ("a|", "", True),
        ("a|", "a", True),
        # anchors at the edges are tolerated
        ("^ab$", "ab", True),
        ("^ab$", "b", False),
        # literal '{' when not a quantifier
        ("a{x}", "a{x}", True),
    ],
)
def test_pattern_acceptance(pattern, word, expected):
    assert regex_to_nfa(pattern).accepts(word) == expected


def test_wildcard_matches_pattern_alphabet():
    nfa = regex_to_nfa("a.c")
    assert nfa.accepts("aac")  # '.' ranges over {a, c}
    assert not nfa.accepts("abc")  # 'b' is not in the pattern's alphabet


def test_wildcard_with_explicit_alphabet():
    nfa = regex_to_nfa(".*", alphabet="ab")
    assert nfa.accepts("")
    assert nfa.accepts("abba")
    assert not nfa.accepts("c")


@pytest.mark.parametrize(
    "pattern",
    [
        "(a",  # unbalanced paren
        "a)",
        "*a",  # nothing to repeat
        "+",
        "a{3,1}",  # inverted bounds
        "[z-a]",  # inverted range
        "[",  # unbalanced class
        "[]",  # empty class
        ".",  # wildcard with empty alphabet
        "a^b",  # anchor mid-pattern
        "a\\",  # dangling backslash
        "[^a]",  # negated classes unsupported
    ],
)
def test_malformed_patterns_raise(pattern):
    with pytest.raises(RegexSyntaxError):
        regex_to_nfa(pattern)


def test_error_message_points_at_position():
    with pytest.raises(RegexSyntaxError, match="position"):
        regex_to_nfa("ab)c")
