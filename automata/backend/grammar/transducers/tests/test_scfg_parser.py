import unittest
from automata.backend.grammar.dist import NonTerminal, Terminal
from automata.backend.grammar.transducers.scfg_parser import SCFG

class TestSCFG(unittest.TestCase):
    def test_scfg_parsing_cnf(self):
        """
        Test a simple CNF grammar.
        """
        grammar = """
        S -> A B [1.0]
        A -> a [1.0]
        B -> b [1.0]
        """
        scfg = SCFG.from_string(grammar)
        
        sentence = [Terminal('a'), Terminal('b')]
        prob = scfg.parse(sentence)
        self.assertGreater(prob, 0.0)

        invalid_sentence = [Terminal('b'), Terminal('a')]
        prob_invalid = scfg.parse(invalid_sentence)
        self.assertEqual(prob_invalid, 0.0)

if __name__ == '__main__':
    unittest.main()
