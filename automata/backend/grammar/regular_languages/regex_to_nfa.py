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

def _tokenize_regex(regex: str):
    """Tokenize regex into meaningful tokens (characters, operators, parentheses)."""
    tokens = []
    i = 0
    while i < len(regex):
        char = regex[i]
        if char in '()|.*':
            tokens.append(char)
        else:
            tokens.append(char)
        i += 1
    return tokens

def _shunting_yard(regex: str):
    """A simple shunting-yard implementation for regex."""
    prec = {'|': 1, '.': 2, '*': 3}
    output = []
    ops = []
    
    tokens = _tokenize_regex(regex)
    
    for token in tokens:
        if token not in '()|.*':
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
    return output

def _expand_character_class(char_class: str) -> str:
    """Expand a character class like [a-zA-Z] into a union expression (a|b|c|...)."""
    if not char_class.startswith('[') or not char_class.endswith(']'):
        return char_class
    
    content = char_class[1:-1]  # Remove [ and ]
    chars = set()
    
    i = 0
    while i < len(content):
        if i + 2 < len(content) and content[i + 1] == '-':
            # Handle ranges like a-z, A-Z, 0-9
            start_char = content[i]
            end_char = content[i + 2]
            for c in range(ord(start_char), ord(end_char) + 1):
                char_to_add = chr(c)
                # Replace literal dots with placeholder to avoid operator confusion
                if char_to_add == '.':
                    char_to_add = '•'
                chars.add(char_to_add)
            i += 3
        else:
            # Handle individual characters
            char_to_add = content[i]
            # Replace literal dots with placeholder to avoid operator confusion
            if char_to_add == '.':
                char_to_add = '•'
            chars.add(char_to_add)
            i += 1
    
    # Convert to union expression
    if not chars:
        return ""
    return "(" + "|".join(sorted(chars)) + ")"

def _preprocess_regex(regex: str) -> str:
    """Preprocess regex to handle character classes, plus quantifier, escaped characters, {n} quantifiers, and anchors."""
    # Handle anchors by removing them (simplified approach)
    # In practice, anchors affect matching behavior but not the core automaton structure
    if regex.startswith('^'):
        regex = regex[1:]
    if regex.endswith('$'):
        regex = regex[:-1]
    
    result = ""
    i = 0
    
    while i < len(regex):
        if regex[i] == '[':
            # Find the end of the character class
            j = i + 1
            while j < len(regex) and regex[j] != ']':
                j += 1
            if j < len(regex):
                char_class = regex[i:j+1]
                result += _expand_character_class(char_class)
                i = j + 1
            else:
                result += regex[i]
                i += 1
        elif regex[i] == '+':
            # Convert a+ to aa*
            if result:
                # Find the last "atom" (could be a character or a parenthesized expression)
                if result.endswith(')'):
                    # Find matching opening parenthesis
                    paren_count = 1
                    j = len(result) - 2
                    while j >= 0 and paren_count > 0:
                        if result[j] == ')':
                            paren_count += 1
                        elif result[j] == '(':
                            paren_count -= 1
                        j -= 1
                    atom = result[j+1:]
                else:
                    # Single character
                    atom = result[-1]
                
                result += atom + "*"
            i += 1
        elif regex[i] == '{' and i + 1 < len(regex):
            # Handle {n} quantifiers
            # Find the closing brace and extract the number
            j = i + 1
            while j < len(regex) and regex[j] != '}':
                j += 1
            
            if j < len(regex) and result:
                quantifier_str = regex[i+1:j]
                try:
                    # Handle {n} - exact repetition
                    if quantifier_str.isdigit():
                        n = int(quantifier_str)
                        if n > 0:
                            # Find the last "atom" to repeat
                            if result.endswith(')'):
                                # Find matching opening parenthesis
                                paren_count = 1
                                k = len(result) - 2
                                while k >= 0 and paren_count > 0:
                                    if result[k] == ')':
                                        paren_count += 1
                                    elif result[k] == '(':
                                        paren_count -= 1
                                    k -= 1
                                atom = result[k+1:]
                                result = result[:k+1]  # Remove the atom since we'll repeat it
                            elif result.endswith(']'):
                                # Find matching opening bracket for character class
                                bracket_count = 1
                                k = len(result) - 2
                                while k >= 0 and bracket_count > 0:
                                    if result[k] == ']':
                                        bracket_count += 1
                                    elif result[k] == '[':
                                        bracket_count -= 1
                                    k -= 1
                                atom = result[k+1:]
                                result = result[:k+1]  # Remove the atom since we'll repeat it
                            else:
                                # Single character
                                atom = result[-1]
                                result = result[:-1]  # Remove the last character since we'll repeat it
                            
                            # Repeat the atom n times
                            result += atom * n
                        i = j + 1
                    # Handle {n,} - minimum repetition (n or more)
                    elif quantifier_str.endswith(',') and quantifier_str[:-1].isdigit():
                        n = int(quantifier_str[:-1])
                        if n >= 0:
                            # Find the last "atom" to repeat
                            if result.endswith(')'):
                                # Find matching opening parenthesis
                                paren_count = 1
                                k = len(result) - 2
                                while k >= 0 and paren_count > 0:
                                    if result[k] == ')':
                                        paren_count += 1
                                    elif result[k] == '(':
                                        paren_count -= 1
                                    k -= 1
                                atom = result[k+1:]
                                result = result[:k+1]  # Remove the atom since we'll repeat it
                            elif result.endswith(']'):
                                # Find matching opening bracket for character class
                                bracket_count = 1
                                k = len(result) - 2
                                while k >= 0 and bracket_count > 0:
                                    if result[k] == ']':
                                        bracket_count += 1
                                    elif result[k] == '[':
                                        bracket_count -= 1
                                    k -= 1
                                atom = result[k+1:]
                                result = result[:k+1]  # Remove the atom since we'll repeat it
                            else:
                                # Single character
                                atom = result[-1]
                                result = result[:-1]  # Remove the last character since we'll repeat it
                            
                            # Convert {n,} to: atom repeated n times + atom*
                            # This means "at least n occurrences"
                            result += atom * n + atom + "*"
                        i = j + 1
                    else:
                        # Not a simple {n} or {n,}, treat as literal
                        result += regex[i]
                        i += 1
                except ValueError:
                    # Not a valid number, treat as literal
                    result += regex[i]
                    i += 1
            else:
                result += regex[i]
                i += 1
        elif regex[i] == '\\' and i + 1 < len(regex):
            # Handle escaped characters and regex shortcuts
            escaped_char = regex[i + 1]
            if escaped_char == '.':
                result += '•'  # Use bullet character as placeholder for literal dot
            elif escaped_char == '*':
                result += '★'  # Use star character as placeholder for literal asterisk
            elif escaped_char == '+':
                result += '✚'  # Use plus character as placeholder for literal plus
            elif escaped_char == '|':
                result += '┃'  # Use vertical bar as placeholder for literal pipe
            elif escaped_char == 'd':
                result += _expand_character_class('[0-9]')  # Convert \d to expanded digit character class
            elif escaped_char == 'w':
                result += _expand_character_class('[a-zA-Z0-9_]')  # Convert \w to expanded word character class
            elif escaped_char == 's':
                result += _expand_character_class('[ \t\n\r]')  # Convert \s to expanded whitespace character class
            else:
                result += escaped_char  # For other escaped characters, just use the character
            i += 2
        else:
            result += regex[i]
            i += 1
    
    return result

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

    # Preprocess the regex to handle character classes, +, and escaped characters
    preprocessed_regex = _preprocess_regex(regex)
    prepared_regex = _add_concat_operator(preprocessed_regex)
    postfix_tokens = _shunting_yard(prepared_regex)
    
    state_counter = itertools.count()
    stack = []
    alphabet = set()

    for token in postfix_tokens:
        if token not in '.|()*':
            # Convert placeholders back to original characters for alphabet
            if token == '•':
                alphabet.add('.')
            elif token == '★':
                alphabet.add('*')
            elif token == '✚':
                alphabet.add('+')
            elif token == '┃':
                alphabet.add('|')
            else:
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
            # Convert placeholders back for Symbol creation
            symbol_char = token
            if token == '•':
                symbol_char = '.'
            elif token == '★':
                symbol_char = '*'
            elif token == '✚':
                symbol_char = '+'
            elif token == '┃':
                symbol_char = '|'
            stack.append(_create_fragment_for_symbol(Symbol(symbol_char), state_counter))
            
    final_fragment = stack.pop()
    all_states = {final_fragment.start_state} | final_fragment.accept_states
    for trans in final_fragment.transitions.values():
        for ss in trans.values():
            all_states.update(ss.states())

    return NFA(
        states=StateSet.from_states(all_states),
        alphabet=Alphabet(list(alphabet)),  # Don't filter out characters - alphabet already contains converted chars
        transitions=final_fragment.transitions,
        start_state=final_fragment.start_state,
        accept_states=StateSet.from_states(final_fragment.accept_states)
    )
