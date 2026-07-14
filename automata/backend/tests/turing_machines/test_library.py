"""The library machines checked against plain-Python oracles.

Each machine is exercised exhaustively on short inputs and randomly (via
Hypothesis) on longer ones.
"""

import itertools

from hypothesis import given, strategies as st

from automata.backend.grammar.turing_machines.library import (
    anbncn,
    binary_increment,
    palindrome_checker,
    unary_addition,
)

PALINDROME = palindrome_checker()
ANBNCN = anbncn()
INCREMENT = binary_increment()
ADDITION = unary_addition()


def test_palindromes_exhaustive_up_to_length_7():
    for length in range(8):
        for word in map("".join, itertools.product("ab", repeat=length)):
            assert PALINDROME.run(word).accepted == (word == word[::-1]), word


@given(st.text(alphabet="ab", max_size=25))
def test_palindromes_random(word):
    assert PALINDROME.run(word, max_steps=5000).accepted == (word == word[::-1])


def test_anbncn_positive_cases():
    for n in range(6):
        assert ANBNCN.run("a" * n + "b" * n + "c" * n, max_steps=5000).accepted


def test_anbncn_exhaustive_up_to_length_6():
    def oracle(word):
        n = word.count("a")
        return word == "a" * n + "b" * n + "c" * n and len(word) == 3 * n

    for length in range(7):
        for word in map("".join, itertools.product("abc", repeat=length)):
            assert ANBNCN.run(word, max_steps=5000).accepted == oracle(word), word


@given(st.integers(min_value=0, max_value=2 ** 32))
def test_binary_increment_random(n):
    word = bin(n)[2:]
    assert INCREMENT.compute(word) == bin(n + 1)[2:]


@given(st.integers(min_value=0, max_value=60), st.integers(min_value=0, max_value=60))
def test_unary_addition_random(m, n):
    word = "1" * m + "+" + "1" * n
    assert ADDITION.compute(word, max_steps=5000) == "1" * (m + n)
