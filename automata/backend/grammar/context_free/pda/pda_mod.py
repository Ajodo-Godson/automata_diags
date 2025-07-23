"""Simple pushdown automaton implementation."""

from collections import deque
from typing import Dict, Set, Tuple, Iterable


class PDA:
    def __init__(
        self,
        states: Set[str],
        input_symbols: Set[str],
        stack_symbols: Set[str],
        transitions: Dict[Tuple[str, str, str], Set[Tuple[str, Iterable[str]]]],
        start_state: str,
        start_stack_symbol: str,
        accept_states: Set[str],
        epsilon: str = "",
    ):
        self.states = states
        self.input_symbols = input_symbols
        self.stack_symbols = stack_symbols
        self.transitions = transitions
        self.start_state = start_state
        self.start_stack_symbol = start_stack_symbol
        self.accept_states = accept_states
        self.epsilon = epsilon

    def accepts(self, word: str, max_steps: int = 1000) -> bool:
        """Return True if the PDA accepts the given word."""

        initial = (self.start_state, 0, (self.start_stack_symbol,))
        queue = deque([initial])
        visited = set()
        steps = 0
        while queue and steps < max_steps:
            state, index, stack = queue.popleft()
            steps += 1
            if (state, index, stack) in visited:
                continue
            visited.add((state, index, stack))

            if index == len(word) and state in self.accept_states:
                return True

            top = stack[-1] if stack else self.epsilon
            current_symbol = word[index] if index < len(word) else self.epsilon

            for sym in [current_symbol, self.epsilon]:
                key = (state, sym, top)
                if key not in self.transitions:
                    continue
                for next_state, push_syms in self.transitions[key]:
                    new_stack = list(stack[:-1])
                    for s in reversed(list(push_syms)):
                        if s != self.epsilon:
                            new_stack.append(s)
                    new_index = index + (0 if sym == self.epsilon else 1)
                    queue.append((next_state, new_index, tuple(new_stack)))
        return False
