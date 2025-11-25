from automata.backend.grammar.context_free.cfg_mod import CFG, Production
from automata.backend.grammar.context_free.cfg_algo import accept_string, cyk_accept, generate_strings, get_derivation
from automata.backend.grammar.dist import NonTerminal, Terminal
import unittest


class TestCFGAlgorithms(unittest.TestCase):
    def setUp(self):
        # Example CFG:
        # S -> aSb | ε
        S = NonTerminal('S')
        a = Terminal('a')
        b = Terminal('b')
        
        self.cfg = CFG(
            non_terminals={S},
            terminals={a, b},
            productions=[
                Production(S, (a, S, b)),  # S -> aSb
                Production(S, ()),          # S -> ε
            ],
            start_symbol=S
        )
        
        # Also create a CFG from string for easier testing
        self.cfg_from_str = CFG.from_string("""
            S -> a S b | epsilon
        """)
        
        

    def test_accept_string(self):
        self.assertTrue(accept_string(self.cfg, ''))
        self.assertTrue(accept_string(self.cfg, 'ab'))
        self.assertTrue(accept_string(self.cfg, 'aabb'))
        self.assertTrue(accept_string(self.cfg, 'aaabbb'))
        self.assertTrue(accept_string(self.cfg, 'aaaabbbb'))  # a^4 b^4 is valid
        self.assertFalse(accept_string(self.cfg, 'aab'))
        self.assertFalse(accept_string(self.cfg, 'abab'))
        self.assertFalse(accept_string(self.cfg, 'aaabb'))  # unbalanced

    def test_reject_string(self):
        self.assertFalse(accept_string(self.cfg, 'a'))
        self.assertFalse(accept_string(self.cfg, 'b'))
        self.assertFalse(accept_string(self.cfg, 'aaa'))
        self.assertFalse(accept_string(self.cfg, 'bbb'))
        self.assertFalse(accept_string(self.cfg, 'ababab'))

if __name__ == '__main__':
    unittest.main()