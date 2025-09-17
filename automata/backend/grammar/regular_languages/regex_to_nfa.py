import itertools
from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol
from automata.backend.grammar.regular_languages.nfa.nfa_mod import NFA

class _NFAFragment:
    """A helper class to represent a fragment of an NFA."""
    def __init__(self, start_state, accept_states, transitions):
        self.start_state = start_state
        self.accept_states = accept_states
        self.transitions = transitions

def _create_fragment_for_symbol(symbol: Symbol, state_counter: itertools.count):
    start = State(f"q{next(state_counter)}")
    accept = State(f"q{next(state_counter)}")
    return _NFAFragment(
        start_state=start,
        accept_states={accept},
        transitions={start: {symbol: StateSet.from_states({accept})}}
    )

def _concatenate_fragments(f1: _NFAFragment, f2: _NFAFragment):
    transitions = {**f1.transitions, **f2.transitions}
    for state in f1.accept_states:
        transitions.setdefault(state, {})[Symbol('')] = StateSet.from_states({f2.start_state})
    return _NFAFragment(f1.start_state, f2.accept_states, transitions)

def _union_fragments(f1: _NFAFragment, f2: _NFAFragment, state_counter: itertools.count):
    start = State(f"q{next(state_counter)}")
    accept = State(f"q{next(state_counter)}")
    transitions = {
        **f1.transitions, **f2.transitions,
        start: {
            Symbol(''): StateSet.from_states({f1.start_state, f2.start_state})
        }
    }
    for state in f1.accept_states | f2.accept_states:
        transitions.setdefault(state, {})[Symbol('')] = StateSet.from_states({accept})
    return _NFAFragment(start, {accept}, transitions)

def _star_fragment(f: _NFAFragment, state_counter: itertools.count):
    start = State(f"q{next(state_counter)}")
    accept = State(f"q{next(state_counter)}")
    transitions = {
        **f.transitions,
        start: {Symbol(''): StateSet.from_states({f.start_state, accept})}
    }
    for state in f.accept_states:
        transitions.setdefault(state, {})[Symbol('')] = StateSet.from_states({f.start_state, accept})
    return _NFAFragment(start, {accept}, transitions)

def _shunting_yard(regex: str):
    """A simple shunting-yard implementation for regex."""
    prec = {'|': 1, '.': 2, '*': 3}
    output = []
    ops = []
    for token in regex:
        if token.isalnum():
            output.append(token)
        elif token == '(':
            ops.append(token)
        elif token == ')':
            while ops and ops[-1] != '(':
                output.append(ops.pop())
            ops.pop()
        else:
            while ops and ops[-1] != '(' and prec.get(ops[-1], 0) >= prec.get(token, 0):
                output.append(ops.pop())
            ops.append(token)
    while ops:
        output.append(ops.pop())
    return ''.join(output)

def _add_concat_operator(regex: str) -> str:
    """Add explicit concatenation operator to regex."""
    res = ""
    for i in range(len(regex)):
        res += regex[i]
        if i + 1 < len(regex):
            c1 = regex[i]
            c2 = regex[i+1]
            if c1 not in '(|' and c2 not in ')|*':
                res += '.'
    return res

def regex_to_nfa(regex: str) -> NFA:
    if not regex:
        state = State("q0")
        return NFA(
            states=StateSet.from_states({state}),
            alphabet=Alphabet([]),
            transitions={},
            start_state=state,
            accept_states=StateSet.from_states({state}),
        )

    prepared_regex = _add_concat_operator(regex)
    postfix_regex = _shunting_yard(prepared_regex)
    
    state_counter = itertools.count()
    stack = []
    alphabet = set()

    for token in postfix_regex:
        alphabet.add(token)
        if token == '.':
            f2 = stack.pop()
            f1 = stack.pop()
            stack.append(_concatenate_fragments(f1, f2))
        elif token == '|':
            f2 = stack.pop()
            f1 = stack.pop()
            stack.append(_union_fragments(f1, f2, state_counter))
        elif token == '*':
            f = stack.pop()
            stack.append(_star_fragment(f, state_counter))
        else:
            stack.append(_create_fragment_for_symbol(Symbol(token), state_counter))
            
    final_fragment = stack.pop()
    all_states = {final_fragment.start_state} | final_fragment.accept_states
    for trans in final_fragment.transitions.values():
        for ss in trans.values():
            all_states.update(ss.states())

    return NFA(
        states=StateSet.from_states(all_states),
        alphabet=Alphabet([s for s in alphabet if s not in '.|*()']),
        transitions=final_fragment.transitions,
        start_state=final_fragment.start_state,
        accept_states=StateSet.from_states(final_fragment.accept_states)
    )
