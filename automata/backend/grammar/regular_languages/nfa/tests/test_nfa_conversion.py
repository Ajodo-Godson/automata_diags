import unittest
from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA


class TestNFA(unittest.TestCase):
    def test_nfa_acceptance(self):
        """
        Test a simple NFA that accepts strings ending with 'a'.
        """
        states = StateSet({'q0', 'q1'})
        alphabet = Alphabet({'a', 'b'})
        transitions = {
            State('q0'): {
                Symbol('a'): StateSet({'q0', 'q1'}),
                Symbol('b'): StateSet({'q0'}),
            },
            State('q1'): {},
        }
        start_state = State('q0')
        accept_states = StateSet({'q1'})
        nfa = NFA(states, alphabet, transitions, start_state, accept_states)

        self.assertTrue(nfa.accepts('a'))
        self.assertTrue(nfa.accepts('ba'))
        self.assertTrue(nfa.accepts('bba'))
        self.assertFalse(nfa.accepts('b'))
        self.assertFalse(nfa.accepts('bab'))
        self.assertFalse(nfa.accepts(''))

    def test_nfa_to_dfa_conversion(self):
        """
        Test the conversion of the NFA to a DFA.
        The resulting DFA should accept the same language.
        """
        states = StateSet({'q0', 'q1'})
        alphabet = Alphabet({'a', 'b'})
        transitions = {
            State('q0'): {
                Symbol('a'): StateSet({'q0', 'q1'}),
                Symbol('b'): StateSet({'q0'}),
            },
            State('q1'): {},
        }
        start_state = State('q0')
        accept_states = StateSet({'q1'})
        nfa = NFA(states, alphabet, transitions, start_state, accept_states)

        dfa = nfa.to_dfa()

        self.assertTrue(dfa.accepts('a'))
        self.assertTrue(dfa.accepts('ba'))
        self.assertTrue(dfa.accepts('bba'))
        self.assertFalse(dfa.accepts('b'))
        self.assertFalse(dfa.accepts('bab'))
        self.assertFalse(dfa.accepts(''))


if __name__ == '__main__':
    unittest.main()
