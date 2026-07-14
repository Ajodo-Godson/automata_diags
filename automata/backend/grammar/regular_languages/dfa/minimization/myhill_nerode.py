"""
Myhill-Nerode DFA Minimization Algorithm

This module implements DFA minimization based on the Myhill-Nerode theorem.
It uses a table-filling algorithm to identify distinguishable state pairs.

The input DFA is first completed (missing transitions are routed to an
explicit dead state) so that partial DFAs are minimized correctly: a missing
transition means "reject", which is only equivalent to another state's
behavior if that state also rejects everything from there on.
"""

from typing import Dict, List, Set, Tuple

from automata.backend.grammar.dist import State, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.dfa.minimization.partition_builder import (
    build_dfa_from_partition,
)

_DEAD = "__dead__"


def _fill_table(dfa: DFA) -> Tuple[DFA, List[State], List[List[bool]]]:
    """
    Run the table-filling algorithm on a completed copy of `dfa`.

    Returns:
        (completed_dfa, states, distinguishable) where `distinguishable[i][j]`
        says whether states[i] and states[j] are distinguishable.
    """
    completed = dfa.completed(_DEAD)
    states = sorted(completed._states.states())
    index = {s: i for i, s in enumerate(states)}
    n = len(states)

    distinguishable = [[False] * n for _ in range(n)]
    accepting = completed._accept_states.states()

    for i in range(n):
        for j in range(i + 1, n):
            if (states[i] in accepting) != (states[j] in accepting):
                distinguishable[i][j] = True
                distinguishable[j][i] = True

    symbols = completed._alphabet.symbols()
    changed = True
    while changed:
        changed = False
        for i in range(n):
            for j in range(i + 1, n):
                if distinguishable[i][j]:
                    continue
                for symbol in symbols:
                    next_i = index[completed._transitions[states[i]][symbol]]
                    next_j = index[completed._transitions[states[j]][symbol]]
                    if distinguishable[next_i][next_j]:
                        distinguishable[i][j] = True
                        distinguishable[j][i] = True
                        changed = True
                        break

    return completed, states, distinguishable


def _find_equivalence_classes(
    states: List[State], distinguishable: List[List[bool]]
) -> List[Set[State]]:
    """Group states into equivalence classes from the distinguishability table."""
    n = len(states)
    visited = [False] * n
    equivalence_classes = []

    for i in range(n):
        if not visited[i]:
            equiv_class = {states[i]}
            visited[i] = True
            for j in range(i + 1, n):
                if not visited[j] and not distinguishable[i][j]:
                    equiv_class.add(states[j])
                    visited[j] = True
            equivalence_classes.append(equiv_class)

    return equivalence_classes


def myhill_nerode_minimize(dfa: DFA) -> DFA:
    """
    Minimize a DFA using the Myhill-Nerode theorem approach.

    This algorithm uses a table-filling method to identify distinguishable
    pairs of states. Two states are equivalent if they cannot be distinguished
    by any string. Works on partial DFAs: missing transitions are treated as
    transitions to an implicit dead state.

    Args:
        dfa: The DFA to minimize

    Returns:
        A minimized DFA accepting the same language
    """
    completed, states, distinguishable = _fill_table(dfa)
    classes = _find_equivalence_classes(states, distinguishable)
    added = completed._states.states() - dfa._states.states()
    dead = next(iter(added)) if added else None
    return build_dfa_from_partition(completed, classes, dead_state=dead)


def get_distinguishability_table(dfa: DFA) -> Dict[Tuple[State, State], bool]:
    """
    Generate the distinguishability table for analysis.

    Args:
        dfa: The DFA to analyze

    Returns:
        Dictionary mapping state pairs to their distinguishability. Only
        pairs of the DFA's own states are included (the implicit dead state
        used internally for partial DFAs is filtered out).
    """
    _, states, distinguishable = _fill_table(dfa)
    original = dfa._states.states()

    result = {}
    for i in range(len(states)):
        for j in range(i + 1, len(states)):
            if states[i] in original and states[j] in original:
                result[(states[i], states[j])] = distinguishable[i][j]
    return result


def analyze_state_equivalences(dfa: DFA) -> Dict[str, Set[State]]:
    """
    Analyze and return equivalent state groups.

    Args:
        dfa: The DFA to analyze

    Returns:
        Dictionary mapping group names to sets of equivalent states
    """
    _, states, distinguishable = _fill_table(dfa)
    original = dfa._states.states()

    result = {}
    group = 0
    for equiv_class in _find_equivalence_classes(states, distinguishable):
        visible = equiv_class & original
        if visible:
            result[f"group_{group}"] = visible
            group += 1
    return result
