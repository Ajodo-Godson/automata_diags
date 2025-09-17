from typing import NewType, Set, Iterable, Union, Sequence

Symbol = NewType("Symbol", str)
State = NewType("State", str)
Word = Sequence[Symbol]


class Alphabet:
    """
    Represents a finite set of symbols.
    Internally, we store them in a Python set for quick membership checks.
    """

    def __init__(self, symbols: Iterable[str]):
        # Convert each symbol to Symbol
        self._symbols: Set[Symbol] = {Symbol(s) for s in symbols}

    def __contains__(self, item: Union[str, Symbol]) -> bool:
        """Check if 'item' is a symbol in this alphabet."""
        return item in self._symbols

    def __iter__(self):
        """Iterate over the symbols in this alphabet."""
        return iter(self._symbols)

    def __len__(self):
        return len(self._symbols)

    def __repr__(self):
        return f"Alphabet({sorted(self._symbols)})"

    def add_symbol(self, symbol: Union[str, Symbol]) -> None:
        """
        Add a new symbol to the alphabet.
        """
        self._symbols.add(Symbol(symbol))

    def remove_symbol(self, symbol: Union[str, Symbol]) -> None:
        """
        Remove a symbol from the alphabet (if it exists).
        """
        if symbol in self._symbols:
            self._symbols.remove(Symbol(symbol))

    def symbols(self) -> Set[Symbol]:
        """
        Return a copy of the internal set of symbols.
        """
        return set(self._symbols)


class OutputAlphabet(Alphabet):
    """
    Represents a finite set of output symbols for a transducer.
    Inherits from Alphabet to reuse the same underlying logic.
    """
    pass


class StateSet:
    """
    Represents a finite set of states.
    You can store each state in a Python set, similar to Alphabet.
    """

    def __init__(self, states: Iterable[str]):
        self._states: Set[State] = {State(s) for s in states}

    @classmethod
    def from_states(cls, states: Set[State]) -> "StateSet":
        """
        Create a StateSet directly from a set of State objects.
        """
        instance = cls([])
        instance._states = states
        return instance

    def __contains__(self, item: Union[str, State]) -> bool:
        return item in self._states

    def __iter__(self):
        return iter(self._states)

    def __len__(self):
        return len(self._states)

    def __repr__(self):
        return f"StateSet({sorted(self._states)})"

    def add_state(self, state: Union[str, State]) -> None:
        self._states.add(State(state))

    def remove_state(self, state: Union[str, State]) -> None:
        if state in self._states:
            self._states.remove(State(state))

    def states(self) -> Set[State]:
        """
        Return a copy of the internal set of states.
        """
        return set(self._states)


def is_word_in_alphabet(word: Iterable[str], alphabet: Alphabet) -> bool:
    """
    Utility function to check if every symbol of 'word' is in 'alphabet'.
    """
    return all(symbol in alphabet for symbol in word)
