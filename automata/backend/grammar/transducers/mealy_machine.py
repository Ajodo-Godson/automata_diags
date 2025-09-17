from typing import Dict, Tuple, List
from automata.backend.grammar.dist import State, Symbol, Word, Alphabet, StateSet, OutputAlphabet
from .finite_transducer import FiniteTransducer

class MealyMachine(FiniteTransducer[State]):
    def __init__(
        self,
        states: StateSet,
        input_alphabet: Alphabet,
        output_alphabet: OutputAlphabet,
        transitions: Dict[State, Dict[Symbol, State]],
        output_function: Dict[State, Dict[Symbol, Symbol]],
        start_state: State,
    ):
        super().__init__(states, input_alphabet, output_alphabet, start_state)
        self.transitions = transitions
        self.output_function = output_function

    def transduce(self, word: Word) -> List[Symbol]:
        """
        Transduce an input word to an output word.
        """
        current_state = self._start_state
        output_word = []

        for symbol in word:
            if symbol not in self._input_alphabet:
                raise ValueError(f"Input symbol '{symbol}' not in input alphabet.")
            
            output_symbol = self.output_function[current_state][symbol]
            output_word.append(output_symbol)
            
            current_state = self.transitions[current_state][symbol]
            
        return output_word

    def __str__(self):
        return (
            f"MealyMachine(states={self._states}, "
            f"input_alphabet={self._input_alphabet}, "
            f"output_alphabet={self._output_alphabet}, "
            f"transitions={self.transitions}, "
            f"output_function={self.output_function}, "
            f"start_state={self._start_state})"
        )
