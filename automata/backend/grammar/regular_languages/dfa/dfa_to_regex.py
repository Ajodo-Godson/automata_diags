"""
DFA -> regular expression via GNFA state elimination.

Together with regex -> NFA (Thompson) and NFA -> DFA (subset construction),
this closes the Kleene's theorem loop: every DFA in the package can be
round-tripped to a regex and back to an equivalent automaton.

The emitted syntax is the one `regex_to_nfa` parses: literals, `ε`, `|`,
`*`, and parentheses. The expression is correct but not necessarily the
shortest possible — state elimination generally is not.
"""

from typing import Dict, Optional, Tuple

from automata.backend.grammar.dist import State
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA

def _parenthesize_for_concat(expr: str) -> str:
    """Wrap an expression so it binds correctly inside a concatenation."""
    if "|" in _top_level_operators(expr):
        return f"({expr})"
    return expr


def _top_level_operators(expr: str) -> str:
    """Return the operators appearing at paren-depth zero of `expr`."""
    depth = 0
    ops = []
    for ch in expr:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif depth == 0 and ch in "|*":
            ops.append(ch)
    return "".join(ops)


def _union(a: Optional[str], b: Optional[str]) -> Optional[str]:
    if a is None:
        return b
    if b is None:
        return a
    if a == b:
        return a
    return f"{a}|{b}"


def _concat(a: Optional[str], b: Optional[str]) -> Optional[str]:
    if a is None or b is None:
        return None
    if a == "ε":
        return b
    if b == "ε":
        return a
    return _parenthesize_for_concat(a) + _parenthesize_for_concat(b)


def _wraps_whole(expr: str) -> bool:
    """True if expr is '(...)' with the opening paren matching the final one."""
    if not (expr.startswith("(") and expr.endswith(")")):
        return False
    depth = 0
    for i, ch in enumerate(expr):
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return i == len(expr) - 1
    return False


def _star(a: Optional[str]) -> str:
    if a is None or a == "ε":
        return "ε"
    if len(a) == 1:
        return f"{a}*"
    if a.endswith("*"):
        body = a[:-1]
        # (X)** == (X)* only when the star already covers the whole expression
        if len(body) == 1 or _wraps_whole(body):
            return a
    return f"({a})*"


def dfa_to_regex(dfa: DFA) -> Optional[str]:
    """
    Return a regular expression for the DFA's language, or None if the
    language is empty.

    The result uses the syntax accepted by `regex_to_nfa`, so
    `regex_to_nfa(dfa_to_regex(d)).to_dfa()` is equivalent to `d`.

    Raises:
        ValueError: If any alphabet symbol is longer than one character
            (multi-character symbols cannot be expressed in regex syntax).
    """
    for symbol in dfa._alphabet.symbols():
        if len(str(symbol)) != 1:
            raise ValueError(
                f"cannot emit a regex over multi-character symbol {symbol!r}"
            )

    states = sorted(dfa._states.states())
    start = State("__gnfa_start__")
    accept = State("__gnfa_accept__")

    # edges[(i, j)] = regex string labeling the GNFA edge i -> j
    edges: Dict[Tuple[State, State], str] = {}

    def add(i: State, j: State, expr: str) -> None:
        existing = edges.get((i, j))
        edges[(i, j)] = _union(existing, expr)

    add(start, dfa._start_state, "ε")
    for final in dfa._accept_states.states():
        add(final, accept, "ε")
    for state, row in dfa._transitions.items():
        for symbol, target in row.items():
            add(state, target, str(symbol))

    # Eliminate original states one at a time. Order by name for
    # determinism; heuristics only change expression size, not correctness.
    for k in states:
        loop = _star(edges.pop((k, k), None))
        incoming = {i: e for (i, j), e in edges.items() if j == k and i != k}
        outgoing = {j: e for (i, j), e in edges.items() if i == k and j != k}
        for i in incoming:
            del edges[(i, k)]
        for j in outgoing:
            del edges[(k, j)]
        for i, in_expr in incoming.items():
            for j, out_expr in outgoing.items():
                add(i, j, _concat(_concat(in_expr, loop), out_expr))

    return edges.get((start, accept))
