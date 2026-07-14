"""
Regex -> NFA via a recursive-descent parser and Thompson's construction.

Supported syntax:
    a           literal character
    ε           the empty string
    .           wildcard: any single symbol of the alphabet
    (r)         grouping
    rs          concatenation
    r|s         union
    r*          zero or more
    r+          one or more
    r?          zero or one
    r{n}        exactly n
    r{n,}       n or more
    r{n,m}      between n and m
    [abc]       character class
    [a-z0-9]    character class with ranges
    \\d \\w \\s    digit / word / whitespace classes
    \\. \\* ...    escaped literal metacharacter
    ^r$         anchors at the very start/end are accepted and ignored
                (regex_to_nfa always builds a whole-word matcher)

The wildcard matches any symbol of the NFA's alphabet: the characters that
appear in the pattern itself, plus anything passed via the `alphabet`
argument. A pattern whose alphabet would otherwise be empty (e.g. ".*")
requires an explicit `alphabet`.

The grammar, for reference:
    union  := concat ('|' concat)*
    concat := repeat*
    repeat := atom ('*' | '+' | '?' | '{n[,[m]]}')*
    atom   := '(' union ')' | '[' class ']' | '.' | 'ε' | escape | literal
"""

import itertools
from typing import Iterable, List, Optional, Set, Tuple

from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA

# Canonical epsilon marker, shared with NFA's default epsilon_symbol.
EPSILON = Symbol("ε")

_ESCAPE_CLASSES = {
    "d": set("0123456789"),
    "w": set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"),
    "s": set(" \t\n\r\f\v"),
}

_MAX_REPEAT = 1000


class RegexSyntaxError(ValueError):
    """Raised when a regular expression cannot be parsed."""


# ── AST ──────────────────────────────────────────────────────────────────────
# Nodes are plain tuples: ("lit", char) | ("set", frozenset) | ("any",)
# | ("eps",) | ("cat", [nodes]) | ("alt", [nodes]) | ("star", node)
# | ("rep", node, n, m_or_None)

_Node = tuple


class _Parser:
    def __init__(self, pattern: str):
        self.pattern = pattern
        self.pos = 0

    def error(self, message: str) -> RegexSyntaxError:
        return RegexSyntaxError(
            f"{message} at position {self.pos} in {self.pattern!r}"
        )

    def peek(self) -> Optional[str]:
        return self.pattern[self.pos] if self.pos < len(self.pattern) else None

    def take(self) -> str:
        ch = self.pattern[self.pos]
        self.pos += 1
        return ch

    def parse(self) -> _Node:
        node = self.union()
        if self.pos != len(self.pattern):
            raise self.error(f"unexpected {self.peek()!r}")
        return node

    def union(self) -> _Node:
        branches = [self.concat()]
        while self.peek() == "|":
            self.take()
            branches.append(self.concat())
        return branches[0] if len(branches) == 1 else ("alt", branches)

    def concat(self) -> _Node:
        parts: List[_Node] = []
        while self.peek() is not None and self.peek() not in "|)":
            parts.append(self.repeat())
        if not parts:
            return ("eps",)
        return parts[0] if len(parts) == 1 else ("cat", parts)

    def repeat(self) -> _Node:
        node = self.atom()
        while True:
            ch = self.peek()
            if ch == "*":
                self.take()
                node = ("star", node)
            elif ch == "+":
                self.take()
                node = ("rep", node, 1, None)
            elif ch == "?":
                self.take()
                node = ("rep", node, 0, 1)
            elif ch == "{":
                bounds = self._try_bounds()
                if bounds is None:
                    break  # literal '{'; the next atom() call consumes it
                node = ("rep", node, bounds[0], bounds[1])
            else:
                break
        return node

    def _try_bounds(self) -> Optional[Tuple[int, Optional[int]]]:
        """Parse {n}, {n,}, or {n,m} if present; else leave '{' untouched."""
        end = self.pattern.find("}", self.pos)
        if end == -1:
            return None
        body = self.pattern[self.pos + 1 : end]
        if "," in body:
            low_s, high_s = body.split(",", 1)
            if not low_s.isdigit() or (high_s and not high_s.isdigit()):
                return None
            low, high = int(low_s), int(high_s) if high_s else None
        elif body.isdigit():
            low = high = int(body)
        else:
            return None
        if high is not None and high < low:
            raise self.error(f"bad repeat range {{{body}}}")
        if low > _MAX_REPEAT or (high or 0) > _MAX_REPEAT:
            raise self.error(f"repeat count above {_MAX_REPEAT}")
        self.pos = end + 1
        return (low, high)

    def atom(self) -> _Node:
        ch = self.peek()
        if ch is None or ch in "|)":
            raise self.error("expected an atom")
        if ch in "*+?":
            raise self.error(f"nothing to repeat before {ch!r}")
        if ch == "(":
            self.take()
            node = self.union()
            if self.peek() != ")":
                raise self.error("unbalanced '('")
            self.take()
            return node
        if ch == "[":
            return self._char_class()
        if ch == ".":
            self.take()
            return ("any",)
        if ch == "ε":
            self.take()
            return ("eps",)
        if ch in "^$":
            # Anchors: tolerated at the very edges (whole-word matching is
            # implied), rejected anywhere else.
            if (ch == "^" and self.pos == 0) or (
                ch == "$" and self.pos == len(self.pattern) - 1
            ):
                self.take()
                return ("eps",)
            raise self.error(f"anchor {ch!r} only supported at pattern edges")
        if ch == "\\":
            return self._escape()
        return ("lit", self.take())

    def _escape(self) -> _Node:
        self.take()
        if self.peek() is None:
            raise self.error("dangling backslash")
        ch = self.take()
        if ch in _ESCAPE_CLASSES:
            return ("set", frozenset(_ESCAPE_CLASSES[ch]))
        return ("lit", ch)

    def _char_class(self) -> _Node:
        self.take()  # '['
        if self.peek() == "^":
            raise self.error("negated character classes are not supported")
        chars: Set[str] = set()
        while self.peek() not in (None, "]"):
            ch = self.take()
            if ch == "\\":
                if self.peek() is None:
                    raise self.error("dangling backslash in character class")
                nxt = self.take()
                if nxt in _ESCAPE_CLASSES:
                    chars |= _ESCAPE_CLASSES[nxt]
                    continue
                ch = nxt
            if (
                self.peek() == "-"
                and self.pos + 1 < len(self.pattern)
                and self.pattern[self.pos + 1] != "]"
            ):
                self.take()  # '-'
                high = self.take()
                if ord(high) < ord(ch):
                    raise self.error(f"bad range {ch}-{high}")
                chars |= {chr(c) for c in range(ord(ch), ord(high) + 1)}
            else:
                chars.add(ch)
        if self.peek() != "]":
            raise self.error("unbalanced '['")
        self.take()
        if not chars:
            raise self.error("empty character class")
        return ("set", frozenset(chars))


def _collect_literals(node: _Node, out: Set[str]) -> None:
    kind = node[0]
    if kind == "lit":
        out.add(node[1])
    elif kind == "set":
        out |= node[1]
    elif kind in ("cat", "alt"):
        for child in node[1]:
            _collect_literals(child, out)
    elif kind == "star":
        _collect_literals(node[1], out)
    elif kind == "rep":
        _collect_literals(node[1], out)


def _contains_wildcard(node: _Node) -> bool:
    kind = node[0]
    if kind == "any":
        return True
    if kind in ("cat", "alt"):
        return any(_contains_wildcard(c) for c in node[1])
    if kind == "star":
        return _contains_wildcard(node[1])
    if kind == "rep":
        return _contains_wildcard(node[1])
    return False


# ── Thompson construction ────────────────────────────────────────────────────


class _NFAFragment:
    """A fragment of an NFA with one start state and a set of accept states.

    Invariant: a fragment's accept states have no outgoing transitions when
    the fragment is returned, so combinators may attach ε-edges to them.
    """

    def __init__(self, start_state, accept_states, transitions):
        self.start_state = start_state
        self.accept_states = accept_states
        self.transitions = transitions


def _add_edge(transitions, state, symbol, targets: Set[State]) -> None:
    row = transitions.setdefault(state, {})
    if symbol in row:
        row[symbol] = StateSet.from_states(row[symbol].states() | set(targets))
    else:
        row[symbol] = StateSet.from_states(set(targets))


class _Compiler:
    def __init__(self, alphabet: Set[str]):
        self.alphabet = alphabet
        self.counter = itertools.count()

    def fresh(self) -> State:
        return State(f"q{next(self.counter)}")

    def compile(self, node: _Node) -> _NFAFragment:
        kind = node[0]
        if kind == "lit":
            return self._symbols_fragment({node[1]})
        if kind == "set":
            return self._symbols_fragment(node[1])
        if kind == "any":
            return self._symbols_fragment(self.alphabet)
        if kind == "eps":
            start, accept = self.fresh(), self.fresh()
            transitions = {}
            _add_edge(transitions, start, EPSILON, {accept})
            return _NFAFragment(start, {accept}, transitions)
        if kind == "cat":
            fragment = self.compile(node[1][0])
            for child in node[1][1:]:
                fragment = self._concat(fragment, self.compile(child))
            return fragment
        if kind == "alt":
            return self._union([self.compile(child) for child in node[1]])
        if kind == "star":
            return self._star(self.compile(node[1]))
        if kind == "rep":
            return self._repeat(node[1], node[2], node[3])
        raise AssertionError(f"unknown AST node {kind!r}")

    def _symbols_fragment(self, chars: Iterable[str]) -> _NFAFragment:
        start, accept = self.fresh(), self.fresh()
        transitions = {}
        for ch in chars:
            _add_edge(transitions, start, Symbol(ch), {accept})
        return _NFAFragment(start, {accept}, transitions)

    def _concat(self, f1: _NFAFragment, f2: _NFAFragment) -> _NFAFragment:
        transitions = {**f1.transitions, **f2.transitions}
        for state in f1.accept_states:
            _add_edge(transitions, state, EPSILON, {f2.start_state})
        return _NFAFragment(f1.start_state, f2.accept_states, transitions)

    def _union(self, fragments: List[_NFAFragment]) -> _NFAFragment:
        start, accept = self.fresh(), self.fresh()
        transitions = {}
        for f in fragments:
            transitions.update(f.transitions)
        _add_edge(transitions, start, EPSILON, {f.start_state for f in fragments})
        for f in fragments:
            for state in f.accept_states:
                _add_edge(transitions, state, EPSILON, {accept})
        return _NFAFragment(start, {accept}, transitions)

    def _star(self, f: _NFAFragment) -> _NFAFragment:
        start, accept = self.fresh(), self.fresh()
        transitions = dict(f.transitions)
        _add_edge(transitions, start, EPSILON, {f.start_state, accept})
        for state in f.accept_states:
            _add_edge(transitions, state, EPSILON, {f.start_state, accept})
        return _NFAFragment(start, {accept}, transitions)

    def _optional(self, f: _NFAFragment) -> _NFAFragment:
        start, accept = self.fresh(), self.fresh()
        transitions = dict(f.transitions)
        _add_edge(transitions, start, EPSILON, {f.start_state, accept})
        for state in f.accept_states:
            _add_edge(transitions, state, EPSILON, {accept})
        return _NFAFragment(start, {accept}, transitions)

    def _repeat(self, node: _Node, low: int, high: Optional[int]) -> _NFAFragment:
        """Compile r{low,high}. Each copy is compiled fresh (new states)."""
        parts: List[_NFAFragment] = [self.compile(node) for _ in range(low)]
        if high is None:
            parts.append(self._star(self.compile(node)))
        else:
            parts.extend(
                self._optional(self.compile(node)) for _ in range(high - low)
            )
        if not parts:
            return self.compile(("eps",))
        fragment = parts[0]
        for part in parts[1:]:
            fragment = self._concat(fragment, part)
        return fragment


# ── Public API ───────────────────────────────────────────────────────────────


def regex_to_nfa(regex: str, alphabet: Optional[Iterable[str]] = None) -> NFA:
    """
    Build an NFA accepting exactly the whole words matched by `regex`.

    Args:
        regex: The pattern (see module docstring for supported syntax).
        alphabet: Extra symbols to include in the NFA's alphabet, beyond the
            characters appearing in the pattern. Required when the pattern
            uses the `.` wildcard but contains no literal characters.

    Raises:
        RegexSyntaxError: If the pattern cannot be parsed, or `.` is used
            with an empty alphabet.
    """
    ast = _Parser(regex).parse()

    chars: Set[str] = set()
    _collect_literals(ast, chars)
    if alphabet is not None:
        chars |= {str(a) for a in alphabet}
    if not chars and _contains_wildcard(ast):
        raise RegexSyntaxError(
            "pattern uses '.' but has no alphabet; pass alphabet=..."
        )

    compiler = _Compiler(chars)
    fragment = compiler.compile(ast)

    all_states = {fragment.start_state} | set(fragment.accept_states)
    for row in fragment.transitions.values():
        for targets in row.values():
            all_states.update(targets.states())

    return NFA(
        states=StateSet.from_states(all_states),
        alphabet=Alphabet(chars),
        transitions=fragment.transitions,
        start_state=fragment.start_state,
        accept_states=StateSet.from_states(set(fragment.accept_states)),
        epsilon_symbol=EPSILON,
    )
