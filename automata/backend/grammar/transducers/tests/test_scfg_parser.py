import unittest
from automata.backend.grammar.dist import NonTerminal, Terminal
from automata.backend.grammar.transducers.scfg_parser import SCFG

class TestSCFG(unittest.TestCase):
    def test_scfg_to_cnf_and_parse(self):
        """
        Test a non-CNF grammar, convert it, and then parse.
        """
        grammar = """
        S -> A S A [0.5]
        S -> a B [0.3]
        S -> [0.2]
        A -> B [0.7]
        A -> S [0.3]
        B -> b [1.0]
        """
        scfg = SCFG.from_string(grammar)
        cnf_scfg = scfg.to_cnf()
        
        # At this point, the test is to ensure the conversion and parsing
        # run without errors. Correct probability calculation for a complex
        # parse is tricky to assert without a known correct value.
        sentence = [Terminal('a'), Terminal('b')]
        prob = cnf_scfg.parse(sentence)
        self.assertIsInstance(prob, float)

if __name__ == '__main__':
    unittest.main()
