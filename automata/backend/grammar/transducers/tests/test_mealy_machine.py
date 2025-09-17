import unittest
from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol, OutputAlphabet
from automata.backend.grammar.transducers.mealy_machine import MealyMachine

class TestMealyMachine(unittest.TestCase):
    def test_mealy_machine_transduction(self):
        """
        Test a simple Mealy machine that outputs '1' for 'a' and '0' for 'b'.
        """
        mealy = MealyMachine(
            states=StateSet({'q0'}),
            input_alphabet=Alphabet({'a', 'b'}),
            output_alphabet=OutputAlphabet({'0', '1'}),
            transitions={
                State('q0'): {Symbol('a'): State('q0'), Symbol('b'): State('q0')}
            },
            output_function={
                State('q0'): {Symbol('a'): Symbol('1'), Symbol('b'): Symbol('0')}
            },
            start_state=State('q0')
        )

        self.assertEqual(mealy.transduce("aba"), [Symbol('1'), Symbol('0'), Symbol('1')])
        self.assertEqual(mealy.transduce("bba"), [Symbol('0'), Symbol('0'), Symbol('1')])
        self.assertEqual(mealy.transduce(""), [])

if __name__ == '__main__':
    unittest.main()
