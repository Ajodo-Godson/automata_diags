"""
Closure properties and decision procedures for regular languages via DFAs.

Set operations (complement, union, intersection, difference) use the product
construction over the union of the two alphabets, and decision procedures
(emptiness, equivalence) use breadth-first reachability, so equivalence
checking returns a *shortest* distinguishing string as a counterexample.

All operations accept partial DFAs; missing transitions are treated as
transitions to an implicit dead (rejecting) state.
"""

from typing import Callable, Dict, List, Optional, Tuple
from collections import deque

from automata.backend.grammar.dist import Alphabet, State, StateSet, Symbol, Word
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA

_DEAD = "__dead__"


def complement(dfa: DFA) -> DFA:
    """
    Return a DFA accepting exactly the words over the DFA's alphabet that
    `dfa` rejects.

    The complement is taken relative to Σ* for the DFA's own alphabet Σ;
    the input is completed first so implicit rejections are represented.
    """
    completed = dfa.completed(_DEAD)
    non_accepting = completed._states.states() - completed._accept_states.states()
    return DFA(
        states=StateSet.from_states(completed._states.states()),
        alphabet=completed._alphabet,
        transitions={
            s: dict(t) for s, t in completed._transitions.items()
        },
        start_state=completed._start_state,
        accept_states=StateSet.from_states(non_accepting),
    )


def _product(
    dfa1: DFA, dfa2: DFA, accept_rule: Callable[[bool, bool], bool]
) -> DFA:
    """
    Product construction over the union alphabet, restricted to reachable
    pairs. `accept_rule(in_accept1, in_accept2)` decides acceptance.
    """
    alphabet = Alphabet(dfa1._alphabet.symbols() | dfa2._alphabet.symbols())

    def completed_over(dfa: DFA) -> DFA:
        widened = DFA(
            states=StateSet.from_states(dfa._states.states()),
            alphabet=alphabet,
            transitions=dfa._transitions,
            start_state=dfa._start_state,
            accept_states=StateSet.from_states(dfa._accept_states.states()),
        )
        return widened.completed(_DEAD)

    d1, d2 = completed_over(dfa1), completed_over(dfa2)
    accept1, accept2 = d1._accept_states.states(), d2._accept_states.states()

    def pair_name(a: State, b: State) -> State:
        return State(f"({a}‖{b})")

    start_pair = (d1._start_state, d2._start_state)
    queue = deque([start_pair])
    seen = {start_pair}
    transitions: Dict[State, Dict[Symbol, State]] = {}
    states = set()
    accepting = set()

    while queue:
        a, b = queue.popleft()
        name = pair_name(a, b)
        states.add(name)
        if accept_rule(a in accept1, b in accept2):
            accepting.add(name)
        row = {}
        for symbol in alphabet.symbols():
            target = (d1._transitions[a][symbol], d2._transitions[b][symbol])
            row[symbol] = pair_name(*target)
            if target not in seen:
                seen.add(target)
                queue.append(target)
        transitions[name] = row

    return DFA(
        states=StateSet.from_states(states),
        alphabet=alphabet,
        transitions=transitions,
        start_state=pair_name(*start_pair),
        accept_states=StateSet.from_states(accepting),
    )


def intersection(dfa1: DFA, dfa2: DFA) -> DFA:
    """Return a DFA accepting the words accepted by both inputs."""
    return _product(dfa1, dfa2, lambda a, b: a and b)


def union(dfa1: DFA, dfa2: DFA) -> DFA:
    """Return a DFA accepting the words accepted by either input."""
    return _product(dfa1, dfa2, lambda a, b: a or b)


def difference(dfa1: DFA, dfa2: DFA) -> DFA:
    """Return a DFA accepting the words accepted by dfa1 but not dfa2."""
    return _product(dfa1, dfa2, lambda a, b: a and not b)


def symmetric_difference(dfa1: DFA, dfa2: DFA) -> DFA:
    """Return a DFA accepting the words on which the two inputs disagree."""
    return _product(dfa1, dfa2, lambda a, b: a != b)


def shortest_accepted(dfa: DFA) -> Optional[Word]:
    """
    Return a shortest accepted word (as a list of Symbols), or None if the
    DFA's language is empty. Symbols are tried in sorted order, so the
    result is deterministic.
    """
    if dfa._start_state in dfa._accept_states:
        return []

    symbols = sorted(dfa._alphabet.symbols())
    queue: deque = deque([(dfa._start_state, [])])
    visited = {dfa._start_state}

    while queue:
        state, path = queue.popleft()
        for symbol in symbols:
            target = dfa._transitions.get(state, {}).get(symbol)
            if target is None or target in visited:
                continue
            word = path + [symbol]
            if target in dfa._accept_states:
                return word
            visited.add(target)
            queue.append((target, word))

    return None


def is_empty(dfa: DFA) -> bool:
    """Return True if the DFA accepts no word at all."""
    return shortest_accepted(dfa) is None


def find_distinguishing_string(dfa1: DFA, dfa2: DFA) -> Optional[Word]:
    """
    Return a shortest word accepted by exactly one of the two DFAs, or None
    if they accept the same language (over the union of their alphabets).

    This is the counterexample generator: if a student's DFA differs from a
    reference DFA, the returned word demonstrates the difference.
    """
    return shortest_accepted(symmetric_difference(dfa1, dfa2))


def equivalent(dfa1: DFA, dfa2: DFA) -> bool:
    """Return True if the two DFAs accept exactly the same language."""
    return find_distinguishing_string(dfa1, dfa2) is None
