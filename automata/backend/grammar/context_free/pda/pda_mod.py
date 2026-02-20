from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict

from automata.backend.grammar.dist import Alphabet, StateSet, State, Symbol, Word
from automata.backend.grammar.automaton_base import Automaton

StackSymbol = str
EPSILON = ""

PDATransitionKey = Tuple[Symbol, StackSymbol]
PDATransitionValue = Set[Tuple[State, Tuple[StackSymbol, ...]]]
PDATransitions = Dict[State, Dict[PDATransitionKey, PDATransitionValue]]


class PDA(Automaton[State]):
    """
    Pushdown Automaton (PDA).

    A PDA extends a finite automaton with a stack, allowing it to recognize
    context-free languages. Transitions depend on the current state, input
    symbol (or epsilon), and the top of the stack.

    Transition semantics:
      - Key: (input_symbol, stack_top)
        - If stack_top != "": pop the top symbol, then push push_symbols.
        - If stack_top == "": do NOT pop; push push_symbols on top.
        - input_symbol == "" means epsilon (no input consumed).
      - Value: set of (next_state, push_symbols) pairs.
        - push_symbols is a tuple written in textbook order: first element = new top.
        - Empty tuple means push nothing (pure pop).

    Supports two acceptance modes:
      - accept_by_final_state (default): accepted if the PDA reaches a final
        state after consuming all input.
      - accept_by_empty_stack: accepted if the stack is empty after consuming
        all input.
    """

    def __init__(
        self,
        states: StateSet,
        input_alphabet: Alphabet,
        stack_alphabet: Set[StackSymbol],
        transitions: PDATransitions,
        start_state: State,
        start_stack_symbol: StackSymbol,
        accept_states: StateSet,
        accept_by_empty_stack: bool = False,
    ):
        super().__init__(states, input_alphabet, start_state, accept_states)
        self.input_alphabet = input_alphabet
        self.stack_alphabet = stack_alphabet
        self.transitions = transitions
        self.start_stack_symbol = start_stack_symbol
        self.accept_by_empty_stack = accept_by_empty_stack

    @staticmethod
    def _apply_push(base_stack: Tuple[StackSymbol, ...], push_syms: Tuple[StackSymbol, ...]) -> Tuple[StackSymbol, ...]:
        """Push symbols onto the stack. push_syms[0] becomes the new top."""
        if not push_syms:
            return base_stack
        return base_stack + tuple(reversed(push_syms))

    def _expand(
        self,
        state: State,
        input_sym: Symbol,
        stack: Tuple[StackSymbol, ...],
    ) -> List[Tuple[State, Tuple[StackSymbol, ...]]]:
        """
        Return all (next_state, new_stack) reachable from a single transition
        on (state, input_sym, current stack).
        """
        results: List[Tuple[State, Tuple[StackSymbol, ...]]] = []
        state_trans = self.transitions.get(state, {})

        stack_top = stack[-1] if stack else EPSILON

        if stack:
            pop_moves = state_trans.get((input_sym, stack_top), set())
            popped = stack[:-1]
            for next_state, push_syms in pop_moves:
                results.append((next_state, self._apply_push(popped, push_syms)))

        no_pop_moves = state_trans.get((input_sym, EPSILON), set())
        for next_state, push_syms in no_pop_moves:
            results.append((next_state, self._apply_push(stack, push_syms)))

        return results

    def accepts(self, word: Word, max_steps: int = 50000) -> bool:
        """
        Check if the PDA accepts the given word using BFS over
        configurations (state, remaining_input_index, stack).
        """
        input_list = list(word)
        n = len(input_list)

        initial_stack: Tuple[StackSymbol, ...] = (self.start_stack_symbol,)
        start_config = (self._start_state, 0, initial_stack)

        visited: Set[Tuple[State, int, Tuple[StackSymbol, ...]]] = set()
        frontier: List[Tuple[State, int, Tuple[StackSymbol, ...]]] = [start_config]
        steps = 0

        while frontier and steps < max_steps:
            next_frontier: List[Tuple[State, int, Tuple[StackSymbol, ...]]] = []

            for state, pos, stack in frontier:
                config_key = (state, pos, stack)
                if config_key in visited:
                    continue
                visited.add(config_key)
                steps += 1
                if steps >= max_steps:
                    break

                if pos == n:
                    if self.accept_by_empty_stack and len(stack) == 0:
                        return True
                    if not self.accept_by_empty_stack and state in self._accept_states:
                        return True

                eps_results = self._expand(state, Symbol(EPSILON), stack)
                for next_state, new_stack in eps_results:
                    cfg = (next_state, pos, new_stack)
                    if cfg not in visited:
                        next_frontier.append(cfg)

                if pos < n:
                    input_sym = Symbol(input_list[pos])
                    input_results = self._expand(state, input_sym, stack)
                    for next_state, new_stack in input_results:
                        cfg = (next_state, pos + 1, new_stack)
                        if cfg not in visited:
                            next_frontier.append(cfg)

            frontier = next_frontier

        return False

    def get_configuration_trace(
        self, word: Word, max_steps: int = 50000
    ) -> Optional[List[Tuple[State, int, Tuple[StackSymbol, ...]]]]:
        """
        Return a trace of configurations from start to acceptance, or None
        if the word is not accepted.
        """
        input_list = list(word)
        n = len(input_list)

        initial_stack: Tuple[StackSymbol, ...] = (self.start_stack_symbol,)
        start_config = (self._start_state, 0, initial_stack)

        visited: Set[Tuple[State, int, Tuple[StackSymbol, ...]]] = set()
        parent: Dict[
            Tuple[State, int, Tuple[StackSymbol, ...]],
            Tuple[State, int, Tuple[StackSymbol, ...]],
        ] = {}
        frontier = [start_config]
        steps = 0

        while frontier and steps < max_steps:
            next_frontier: List[Tuple[State, int, Tuple[StackSymbol, ...]]] = []

            for state, pos, stack in frontier:
                config_key = (state, pos, stack)
                if config_key in visited:
                    continue
                visited.add(config_key)
                steps += 1
                if steps >= max_steps:
                    break

                if pos == n:
                    accepted = False
                    if self.accept_by_empty_stack and len(stack) == 0:
                        accepted = True
                    if not self.accept_by_empty_stack and state in self._accept_states:
                        accepted = True
                    if accepted:
                        trace = [config_key]
                        cur = config_key
                        while cur in parent:
                            cur = parent[cur]
                            trace.append(cur)
                        return list(reversed(trace))

                for input_sym, advance in [(Symbol(EPSILON), 0)] + (
                    [(Symbol(input_list[pos]), 1)] if pos < n else []
                ):
                    results = self._expand(state, input_sym, stack)
                    for next_state, new_stack in results:
                        new_config = (next_state, pos + advance, new_stack)
                        if new_config not in visited:
                            if new_config not in parent:
                                parent[new_config] = config_key
                            next_frontier.append(new_config)

            frontier = next_frontier

        return None

    @classmethod
    def from_string(
        cls,
        pda_string: str,
        start_state: str,
        accept_states: Set[str],
        start_stack_symbol: str = "Z",
        accept_by_empty_stack: bool = False,
    ) -> "PDA":
        """
        Create a PDA from a string representation.

        Format: transitions separated by semicolons. Each transition is:
            from_state, input_symbol, stack_top, to_state, push_symbols

        - Use 'e' or '' for epsilon (empty input or empty stack_top).
        - push_symbols is the string to push, written in textbook order
          (first char = new top). Use 'e' or '' for pushing nothing (pop only).

        Example (accepts a^n b^n, n >= 1):
            "q0,a,Z,q0,aZ; q0,a,a,q0,aa; q0,b,a,q1,e; q1,b,a,q1,e; q1,e,Z,q2,Z"
        """
        states: Set[State] = set()
        input_alpha: Set[str] = set()
        stack_alpha: Set[StackSymbol] = set()
        transitions: Dict[State, Dict[PDATransitionKey, PDATransitionValue]] = defaultdict(
            lambda: defaultdict(set)
        )

        stack_alpha.add(start_stack_symbol)

        for transition_str in pda_string.strip().split(";"):
            transition_str = transition_str.strip()
            if not transition_str:
                continue

            parts = [p.strip() for p in transition_str.split(",")]
            if len(parts) != 5:
                raise ValueError(
                    f"Expected 5 comma-separated values, got {len(parts)}: '{transition_str}'"
                )

            from_s_str, input_str, stack_top_str, to_s_str, push_str = parts

            from_s = State(from_s_str)
            to_s = State(to_s_str)
            states.add(from_s)
            states.add(to_s)

            input_sym = Symbol("" if input_str in ("e", "ε", "") else input_str)
            if input_sym != Symbol(""):
                input_alpha.add(str(input_sym))

            stack_top = "" if stack_top_str in ("e", "ε", "") else stack_top_str
            if stack_top:
                stack_alpha.add(stack_top)

            if push_str in ("e", "ε", ""):
                push_syms: Tuple[StackSymbol, ...] = ()
            else:
                push_syms = tuple(push_str)
                for s in push_syms:
                    stack_alpha.add(s)

            key: PDATransitionKey = (input_sym, stack_top)
            transitions[from_s][key].add((to_s, push_syms))

        start_s = State(start_state)
        states.add(start_s)
        for a in accept_states:
            states.add(State(a))

        return cls(
            states=StateSet.from_states(list(states)),
            input_alphabet=Alphabet(list(input_alpha)),
            stack_alphabet=stack_alpha,
            transitions=dict(transitions),
            start_state=start_s,
            start_stack_symbol=start_stack_symbol,
            accept_states=StateSet.from_states([State(a) for a in accept_states]),
            accept_by_empty_stack=accept_by_empty_stack,
        )

    @classmethod
    def from_cfg(cls, cfg) -> "PDA":
        """
        Convert a Context-Free Grammar to an equivalent PDA.
        Uses the standard top-down CFG-to-PDA construction:

        States: {q_start, q_loop, q_accept}
        1. (q_start, ε, Z) -> (q_loop, SZ)   [push start symbol on top of Z]
        2. For each production A -> X1 X2 ... Xn:
           (q_loop, ε, A) -> (q_loop, X1 X2 ... Xn)  [expand; X1 on top]
        3. For each terminal a:
           (q_loop, a, a) -> (q_loop, ε)               [match & pop terminal]
        4. (q_loop, ε, Z) -> (q_accept, ε)             [accept when stack marker hit]
        """
        q_start = State("q_start")
        q_loop = State("q_loop")
        q_accept = State("q_accept")

        Z = "Z"
        stack_alpha: Set[StackSymbol] = {Z}

        for nt in cfg.non_terminals:
            stack_alpha.add(str(nt))
        for t in cfg.terminals:
            stack_alpha.add(str(t))

        transitions: Dict[State, Dict[PDATransitionKey, PDATransitionValue]] = defaultdict(
            lambda: defaultdict(set)
        )

        start_sym_str = str(cfg.start_symbol)
        transitions[q_start][(Symbol(""), Z)].add(
            (q_loop, (start_sym_str, Z))
        )

        for prod in cfg.productions:
            lhs_str = str(prod.lhs)
            if prod.rhs:
                push_syms = tuple(str(s) for s in prod.rhs)
            else:
                push_syms = ()
            transitions[q_loop][(Symbol(""), lhs_str)].add(
                (q_loop, push_syms)
            )

        for t in cfg.terminals:
            t_str = str(t)
            transitions[q_loop][(Symbol(t_str), t_str)].add(
                (q_loop, ())
            )

        transitions[q_loop][(Symbol(""), Z)].add((q_accept, ()))

        input_alpha = Alphabet([str(t) for t in cfg.terminals])
        all_states = StateSet.from_states([q_start, q_loop, q_accept])

        return cls(
            states=all_states,
            input_alphabet=input_alpha,
            stack_alphabet=stack_alpha,
            transitions=dict(transitions),
            start_state=q_start,
            start_stack_symbol=Z,
            accept_states=StateSet.from_states([q_accept]),
            accept_by_empty_stack=False,
        )

    def __str__(self):
        return (
            f"PDA(states={self._states}, "
            f"input_alphabet={self.input_alphabet}, "
            f"stack_alphabet={self.stack_alphabet}, "
            f"start_state={self._start_state}, "
            f"start_stack_symbol={self.start_stack_symbol}, "
            f"accept_states={self._accept_states}, "
            f"accept_by_empty_stack={self.accept_by_empty_stack})"
        )

    def __repr__(self):
        return self.__str__()
