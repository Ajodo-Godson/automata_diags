"""
Shared helper for building a minimized DFA from a partition of states.

Both minimization algorithms (Hopcroft, Myhill-Nerode) first complete the
input DFA (adding an explicit dead state for missing transitions), compute a
partition into equivalence classes, and then call build_dfa_from_partition.
The dead state's class is pruned from the result so callers get back a DFA in
the same partial-transition style they passed in.
"""

from typing import List, Optional, Set
from collections import defaultdict

from automata.backend.grammar.dist import State, StateSet
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA


def build_dfa_from_partition(
    dfa: DFA,
    partition: List[Set[State]],
    dead_state: Optional[State] = None,
) -> DFA:
    """
    Build a minimized DFA whose states are the blocks of `partition`.

    Args:
        dfa: The (completed) DFA the partition was computed over.
        partition: Disjoint blocks of equivalent states covering dfa's states.
        dead_state: The synthetic dead state added by DFA.completed(), if any.
            Its block is dropped from the result (missing transitions already
            mean "reject"), unless the start state belongs to it.

    Returns:
        The minimized DFA.
    """
    state_to_block = {}
    block_reps = {}
    for i, block in enumerate(partition):
        rep = State(f"q{i}")
        block_reps[i] = rep
        for state in block:
            state_to_block[state] = i

    dead_block: Optional[int] = None
    if dead_state is not None and dead_state in state_to_block:
        candidate = state_to_block[dead_state]
        if state_to_block[dfa._start_state] != candidate:
            dead_block = candidate

    new_transitions = defaultdict(dict)
    for i, block in enumerate(partition):
        if i == dead_block:
            continue
        # All states in a block are equivalent, so any member's transitions
        # determine the block's transitions.
        rep_state = next(iter(block))
        for symbol, target in dfa._transitions.get(rep_state, {}).items():
            target_block = state_to_block[target]
            if target_block == dead_block:
                continue
            new_transitions[block_reps[i]][symbol] = block_reps[target_block]

    new_states = {
        block_reps[i] for i in range(len(partition)) if i != dead_block
    }
    new_accept_states = {
        block_reps[state_to_block[s]] for s in dfa._accept_states.states()
    }

    return DFA(
        states=StateSet.from_states(new_states),
        alphabet=dfa._alphabet,
        transitions=dict(new_transitions),
        start_state=block_reps[state_to_block[dfa._start_state]],
        accept_states=StateSet.from_states(new_accept_states),
    )
