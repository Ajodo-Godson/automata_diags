import pytest
from automata.backend.grammar.context_free.pda.pda_mod import PDA
from automata.backend.grammar.context_free.cfg_mod import CFG
from automata.backend.grammar.dist import State, Symbol, Alphabet, StateSet


class TestPDAAnBn:
    """PDA for { a^n b^n | n >= 1 }"""

    @pytest.fixture
    def pda(self):
        return PDA.from_string(
            "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q2,Z",
            start_state="q0",
            accept_states={"q2"},
            start_stack_symbol="Z",
        )

    def test_accepts_ab(self, pda):
        assert pda.accepts([Symbol("a"), Symbol("b")]) is True

    def test_accepts_aabb(self, pda):
        assert pda.accepts([Symbol(c) for c in "aabb"]) is True

    def test_accepts_aaabbb(self, pda):
        assert pda.accepts([Symbol(c) for c in "aaabbb"]) is True

    def test_rejects_empty(self, pda):
        assert pda.accepts([]) is False

    def test_rejects_a(self, pda):
        assert pda.accepts([Symbol("a")]) is False

    def test_rejects_b(self, pda):
        assert pda.accepts([Symbol("b")]) is False

    def test_rejects_aab(self, pda):
        assert pda.accepts([Symbol(c) for c in "aab"]) is False

    def test_rejects_abb(self, pda):
        assert pda.accepts([Symbol(c) for c in "abb"]) is False

    def test_rejects_ba(self, pda):
        assert pda.accepts([Symbol(c) for c in "ba"]) is False


class TestPDABalancedParens:
    """PDA for balanced parentheses."""

    @pytest.fixture
    def pda(self):
        return PDA.from_string(
            "q0,(,Z,q0,(Z; q0,(,(,q0,((; q0,),(,q0,e; q0,e,Z,q1,Z",
            start_state="q0",
            accept_states={"q1"},
            start_stack_symbol="Z",
        )

    def test_accepts_empty(self, pda):
        assert pda.accepts([]) is True

    def test_accepts_single_pair(self, pda):
        assert pda.accepts([Symbol(c) for c in "()"]) is True

    def test_accepts_nested(self, pda):
        assert pda.accepts([Symbol(c) for c in "(())"]) is True

    def test_accepts_sequential(self, pda):
        assert pda.accepts([Symbol(c) for c in "()()"]) is True

    def test_accepts_complex(self, pda):
        assert pda.accepts([Symbol(c) for c in "((())())"]) is True

    def test_rejects_open(self, pda):
        assert pda.accepts([Symbol("(")]) is False

    def test_rejects_close(self, pda):
        assert pda.accepts([Symbol(")")]) is False

    def test_rejects_unbalanced(self, pda):
        assert pda.accepts([Symbol(c) for c in "(()"]) is False


class TestPDAFromCFG:
    """Test converting a CFG to a PDA."""

    def test_cfg_to_pda_anbn(self):
        cfg = CFG.from_string("S -> a S b | a b")
        pda = PDA.from_cfg(cfg)

        assert pda.accepts([Symbol(c) for c in "ab"]) is True
        assert pda.accepts([Symbol(c) for c in "aabb"]) is True
        assert pda.accepts([Symbol(c) for c in "aaabbb"]) is True
        assert pda.accepts([Symbol(c) for c in "a"]) is False
        assert pda.accepts([Symbol(c) for c in "ba"]) is False

    def test_cfg_to_pda_palindrome(self):
        cfg = CFG.from_string("S -> a S a | b S b | a | b | ε")
        pda = PDA.from_cfg(cfg)

        assert pda.accepts([Symbol(c) for c in "aba"]) is True
        assert pda.accepts([Symbol(c) for c in "abba"]) is True
        assert pda.accepts([Symbol(c) for c in "a"]) is True
        assert pda.accepts([]) is True
        assert pda.accepts([Symbol(c) for c in "ab"]) is False


class TestPDAConstructor:
    """Test creating a PDA directly via the constructor."""

    def test_direct_construction(self):
        states = StateSet.from_states([State("q0"), State("q1"), State("q2")])
        input_alphabet = Alphabet(["a", "b"])
        stack_alphabet = {"Z", "a"}

        transitions = {
            State("q0"): {
                (Symbol("a"), "Z"): {(State("q0"), ("a", "Z"))},
                (Symbol("a"), "a"): {(State("q0"), ("a", "a"))},
                (Symbol("b"), "a"): {(State("q1"), ())},
            },
            State("q1"): {
                (Symbol("b"), "a"): {(State("q1"), ())},
                (Symbol(""), "Z"): {(State("q2"), ("Z",))},
            },
        }

        pda = PDA(
            states=states,
            input_alphabet=input_alphabet,
            stack_alphabet=stack_alphabet,
            transitions=transitions,
            start_state=State("q0"),
            start_stack_symbol="Z",
            accept_states=StateSet.from_states([State("q2")]),
        )

        assert pda.accepts([Symbol(c) for c in "ab"]) is True
        assert pda.accepts([Symbol(c) for c in "aabb"]) is True
        assert pda.accepts([Symbol(c) for c in "aab"]) is False


class TestPDAConfigurationTrace:
    """Test the configuration trace feature."""

    def test_trace_returns_path(self):
        pda = PDA.from_string(
            "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q2,Z",
            start_state="q0",
            accept_states={"q2"},
            start_stack_symbol="Z",
        )
        trace = pda.get_configuration_trace([Symbol(c) for c in "ab"])
        assert trace is not None
        assert len(trace) >= 2
        assert trace[0][0] == State("q0")
        assert trace[-1][0] == State("q2")

    def test_trace_returns_none_on_reject(self):
        pda = PDA.from_string(
            "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q2,Z",
            start_state="q0",
            accept_states={"q2"},
            start_stack_symbol="Z",
        )
        trace = pda.get_configuration_trace([Symbol(c) for c in "aab"])
        assert trace is None


class TestPDAAcceptByEmptyStack:
    """Test acceptance by empty stack mode."""

    def test_accept_by_empty_stack(self):
        pda = PDA.from_string(
            "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q1,e",
            start_state="q0",
            accept_states=set(),
            start_stack_symbol="Z",
            accept_by_empty_stack=True,
        )
        assert pda.accepts([Symbol(c) for c in "ab"]) is True
        assert pda.accepts([Symbol(c) for c in "aabb"]) is True
        assert pda.accepts([Symbol(c) for c in "aab"]) is False
