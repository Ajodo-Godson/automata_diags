import pytest

from automata.backend.grammar.dist import Alphabet, State, StateSet, Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA


def test_nfa_accept_with_epsilon():
    # q0 --ε--> q1, q0 --a--> q1, q1 --b--> q2 (accept)
    nfa = NFA.from_string(
        "q0,ε,q1;q0,a,q1;q1,b,q2",
        start_state="q0",
        accept_states={"q2"},
    )

    assert not nfa.accepts("a")  # q0->q1 but no b => no accept
    assert nfa.accepts("ab")  # q0-a->q1-b->q2
    assert nfa.accepts("b")  # q0-ε->q1-b->q2
    assert not nfa.accepts("aa")


def test_direct_construction_uses_default_epsilon():
    # The default epsilon symbol is "ε", so ε-transitions written directly
    # in the transitions dict must be followed.
    transitions = {
        State("q0"): {Symbol("ε"): StateSet.from_states({State("q1")})},
        State("q1"): {Symbol("a"): StateSet.from_states({State("q2")})},
    }
    nfa = NFA(
        states=StateSet(["q0", "q1", "q2"]),
        alphabet=Alphabet(["a"]),
        transitions=transitions,
        start_state=State("q0"),
        accept_states=StateSet.from_states({State("q2")}),
    )
    assert nfa.accepts("a")
    assert not nfa.accepts("")


def test_mismatched_epsilon_symbol_is_rejected():
    # Transitions written with "" while the NFA's epsilon symbol is "ε"
    # would silently never fire; the constructor must refuse them.
    transitions = {
        State("q0"): {Symbol(""): StateSet.from_states({State("q1")})},
    }
    with pytest.raises(ValueError, match="epsilon"):
        NFA(
            states=StateSet(["q0", "q1"]),
            alphabet=Alphabet(["a"]),
            transitions=transitions,
            start_state=State("q0"),
            accept_states=StateSet.from_states({State("q1")}),
        )
