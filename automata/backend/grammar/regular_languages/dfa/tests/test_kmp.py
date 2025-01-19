import pytest  # noqa: F401
from automata.backend.grammar.regular_languages.dfa.dfa_mod_algo import (
    create_dfa_from_pattern,
    find_pattern_in_text,
    create_dfa_from_table,
)


def test_create_dfa_from_table():
    table = {
        "q0": {"a": "q1", "b": "q3"},
        "q1": {"a": "q2", "b": "q3"},
        "q2": {"a": "q2", "b": "q4"},
        "q3": {"a": "q1", "b": "q5"},
        "q4": {"a": "q2", "b": "q5"},
        "q5": {"a": "q5", "b": "q5"},
    }
    dfa = create_dfa_from_table(
        table, "q0", accept_states={"q2", "q4"}, alphabet={"a", "b"}
    )
    # print(dfa)
    assert dfa.accepts("abaaaab")
    assert not dfa.accepts("bab")
    assert not dfa.accepts("bababaabaaabbaab")
    assert dfa.accepts("bababaabaaab")


def test_dfa_exact_match():
    pattern = "ababc"
    alphabet = {"a", "b", "c"}
    dfa = create_dfa_from_pattern(pattern, alphabet)
    print(dfa)

    assert dfa.accepts("ababc")
    assert not dfa.accepts("ab")
    assert not dfa.accepts("xxxababc")


def test_kmp_search():
    pattern = "ababc"
    text = "zzzababcxxxababc"
    # Matches at [3, 11]
    indices = find_pattern_in_text(pattern, text)
    assert indices == [3, 11]


def test_simple_dfa():
    alphabet = {"a", "b", "c"}
    # states = {"s1", "s2", "s3"}
    initial_state = "s1"
    accepting_states = {"s3"}
    transition_function = {
        "s1": {"b": "s1", "a": "s2"},
        "s2": {"a": "s3", "b": "s1"},
        "s3": {"c": "s3"},
    }
    dfa = create_dfa_from_table(
        table=transition_function,
        accept_states=accepting_states,
        alphabet=alphabet,
        start_state=initial_state,
    )
    print(dfa)
    word = "bbbac"
    assert dfa.accepts(word)
    # assert not dfa.accepts(word[:-1])
