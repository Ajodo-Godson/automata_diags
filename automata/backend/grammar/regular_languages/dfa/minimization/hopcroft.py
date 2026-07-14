"""
Hopcroft's DFA Minimization Algorithm

This module implements Hopcroft's partition-refinement algorithm with the
data structures needed for the textbook O(|Σ| · n log n) bound:

- an inverse-transition index (predecessors per symbol), built once;
- blocks addressed by id, with a state -> block-id map, so a split only
  touches the blocks that actually contain predecessors of the splitter;
- a worklist of (block_id, symbol) pairs with Hopcroft's rule: when a block
  that is on the worklist splits, both halves replace it; otherwise only the
  smaller half is enqueued. Each state's block can therefore reappear on the
  worklist only O(log n) times per symbol.

The input DFA is first completed (missing transitions are routed to an
explicit dead state) so that partial DFAs are minimized correctly.
"""

from typing import Dict, List, Set
from collections import defaultdict, deque

from automata.backend.grammar.dist import State, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.grammar.regular_languages.dfa.minimization.partition_builder import (
    build_dfa_from_partition,
)

_DEAD = "__dead__"


def _refine_partition(dfa: DFA) -> List[Set[State]]:
    """
    Run Hopcroft's partition refinement on a completed DFA and return the
    final partition into equivalence classes.
    """
    all_states = dfa._states.states()
    accepting = set(dfa._accept_states.states()) & all_states
    non_accepting = all_states - accepting
    symbols = list(dfa._alphabet.symbols())

    # Inverse transition index: predecessors[symbol][state] = states that
    # reach `state` on `symbol`.
    predecessors: Dict[Symbol, Dict[State, Set[State]]] = {
        symbol: defaultdict(set) for symbol in symbols
    }
    for state, trans in dfa._transitions.items():
        for symbol, target in trans.items():
            predecessors[symbol][target].add(state)

    # Blocks are addressed by id so worklist entries stay valid across splits.
    blocks: Dict[int, Set[State]] = {}
    block_of: Dict[State, int] = {}
    next_id = 0
    for group in (non_accepting, accepting):
        if group:
            blocks[next_id] = set(group)
            for s in group:
                block_of[s] = next_id
            next_id += 1

    if len(blocks) <= 1:
        return list(blocks.values())

    smaller_id = min(blocks, key=lambda b: len(blocks[b]))
    worklist = deque((smaller_id, symbol) for symbol in symbols)
    on_worklist = set(worklist)

    while worklist:
        splitter_id, symbol = worklist.popleft()
        on_worklist.discard((splitter_id, symbol))
        preds_on_symbol = predecessors[symbol]

        # Group the splitter's predecessors by the block they currently
        # occupy; only those blocks can split.
        hits_by_block: Dict[int, Set[State]] = defaultdict(set)
        for state in blocks[splitter_id]:
            for pred in preds_on_symbol.get(state, ()):
                hits_by_block[block_of[pred]].add(pred)

        for hit_id, hit in hits_by_block.items():
            remainder = blocks[hit_id]
            if len(hit) == len(remainder):
                continue  # every member leads into the splitter: no split

            # Split: `hit` becomes a new block, hit_id keeps the rest.
            new_id = next_id
            next_id += 1
            remainder -= hit
            blocks[new_id] = hit
            for state in hit:
                block_of[state] = new_id

            for sym in symbols:
                if (hit_id, sym) in on_worklist:
                    # The pending entry now denotes the remainder; enqueue
                    # the split-off half so both are processed.
                    worklist.append((new_id, sym))
                    on_worklist.add((new_id, sym))
                else:
                    enqueue = new_id if len(hit) <= len(remainder) else hit_id
                    worklist.append((enqueue, sym))
                    on_worklist.add((enqueue, sym))

    return list(blocks.values())


def hopcroft_minimize(dfa: DFA) -> DFA:
    """
    Minimize a DFA using Hopcroft's algorithm in O(|Σ| · n log n).

    Works on partial DFAs: missing transitions are treated as transitions to
    an implicit dead state, so states that only differ in *how* they reject
    (dead-state loop vs. missing transition) are correctly merged.

    Args:
        dfa: The DFA to minimize

    Returns:
        A minimized DFA accepting the same language
    """
    completed = dfa.completed(_DEAD)
    partition = _refine_partition(completed)
    added = completed._states.states() - dfa._states.states()
    dead = next(iter(added)) if added else None
    return build_dfa_from_partition(completed, partition, dead_state=dead)


def analyze_equivalence_classes(dfa: DFA) -> Dict[str, List[State]]:
    """
    Analyze and return the equivalence classes found during minimization.

    Args:
        dfa: The DFA to analyze

    Returns:
        Dictionary mapping equivalence class names to sorted lists of
        equivalent states
    """
    completed = dfa.completed(_DEAD)
    partition = _refine_partition(completed)
    original = dfa._states.states()

    result = {}
    index = 0
    for block in partition:
        visible = block & original
        if visible:
            result[f"class_{index}"] = sorted(visible)
            index += 1
    if not result:
        result["class_0"] = sorted(original)
    return result
