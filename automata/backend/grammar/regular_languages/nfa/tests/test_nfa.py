import pytest
from backend.grammar.regular_languages.nfa.nfa_mod import NFA


def test_nfa_accept():
    # Example NFA
    states = {"q0", "q1", "q2"}
    alphabet = {"a", "b"}
    transitions = {
        "q0": {"": {"q1"}, "a": {"q1"}},  # epsilon transition to q1
        "q1": {"b": {"q2"}},
        "q2": {},
    }
    nfa = NFA(
        states=states,
        alphabet=alphabet,
        transitions=transitions,
        start_state="q0",
        accept_states={"q2"},
        epsilon_symbol="",
    )

    assert nfa.is_accept("a") == False  # "a" leads q0->q1 but no b => no accept
    assert nfa.is_accept("ab") == True  # q0->a->q1->b->q2
    assert nfa.is_accept("b") == True  # q0->ε->q1->b->q2
