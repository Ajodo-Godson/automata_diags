import unittest
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA

class TestRegexToNFA(unittest.TestCase):
    def test_concatenation(self):
        nfa = NFA.from_regex("ab")
        self.assertTrue(nfa.accepts("ab"))
        self.assertFalse(nfa.accepts("a"))
        self.assertFalse(nfa.accepts("b"))
        self.assertFalse(nfa.accepts("aba"))

    def test_union(self):
        nfa = NFA.from_regex("a|b")
        self.assertTrue(nfa.accepts("a"))
        self.assertTrue(nfa.accepts("b"))
        self.assertFalse(nfa.accepts("ab"))
        self.assertFalse(nfa.accepts(""))

    def test_kleene_star(self):
        nfa = NFA.from_regex("a*")
        self.assertTrue(nfa.accepts(""))
        self.assertTrue(nfa.accepts("a"))
        self.assertTrue(nfa.accepts("aaaa"))
        self.assertFalse(nfa.accepts("b"))
        self.assertFalse(nfa.accepts("ab"))

    def test_grouping(self):
        nfa = NFA.from_regex("(ab)*")
        self.assertTrue(nfa.accepts(""))
        self.assertTrue(nfa.accepts("ab"))
        self.assertTrue(nfa.accepts("abab"))
        self.assertFalse(nfa.accepts("a"))
        self.assertFalse(nfa.accepts("b"))
    
    def test_complex_regex(self):
        nfa = NFA.from_regex("a(b|c)*")
        self.assertTrue(nfa.accepts("a"))
        self.assertTrue(nfa.accepts("ab"))
        self.assertTrue(nfa.accepts("ac"))
        self.assertTrue(nfa.accepts("abbc"))
        self.assertFalse(nfa.accepts(""))
        self.assertFalse(nfa.accepts("b"))
        self.assertFalse(nfa.accepts("bc"))

if __name__ == "__main__":
    unittest.main()
