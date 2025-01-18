"""
States
Alphabets
Transition function
Start state
Accept State
"""

from typing import (
    Dict,
    List,
    Tuple,
    Union,
    Any,
    Optional,
    Set,
    Type,
    TypeVar,
    Generic,
    Callable,
    Iterable,
    Mapping,
    Sequence,
    Container,
    Collection,
)


class DFA:
    def __init__(
        self, states, alphabets, transition_function, start_state, accept_states
    ):
        self.states = states
        self.alphabets = alphabets
        self.transition_function = transition_function
        self.start_state = start_state
        self.accept_states = accept_states

    def is_accept(self, string):
        current_state = self.start_state
        for char in string:
            current_state = self.transition_function[current_state][char]
        return current_state in self.accept_states

    def __str__(self):
        return f"States: {self.states}\nAlphabets: {self.alphabets}\nTransition Function: {self.transition_function}\nStart State: {self.start_state}\nAccept States: {self.accept_states}"
