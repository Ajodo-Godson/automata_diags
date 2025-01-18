"""
Implements the Knuth-Morris-Pratt (KMP) pattern-matching algorithm in two ways:

1. build_kmp_dfa(pattern, alphabet):
   - Returns a deterministic finite automaton (transitions, start_state, accept_states)
     that accepts precisely those strings whose last m characters match 'pattern'.

2. kmp_search(pattern, text):
   - Returns a list of all 0-based start indices where 'pattern' is found in 'text'.

Author: Your Name
"""

from typing import Dict, Set, List, Tuple


def build_prefix_function(pattern: str) -> List[int]:
    """
    Build the prefix-function (also known as the LPS, or 'longest prefix which
    is also suffix') array for the given pattern.

    prefix_func[i] = the length of the longest proper prefix of pattern[:i+1]
    which is also a suffix of pattern[:i+1].

    Used for building the KMP automaton or for direct pattern searching.
    """
    m = len(pattern)
    prefix_func = [0] * m
    k = 0
    # We start i from 1, comparing pattern[i] to pattern[k]
    for i in range(1, m):
        while k > 0 and pattern[k] != pattern[i]:
            k = prefix_func[k - 1]
        if pattern[k] == pattern[i]:
            k += 1
        prefix_func[i] = k
    return prefix_func


def build_kmp_dfa(
    pattern: str, alphabet: Set[str]
) -> Tuple[Dict[int, Dict[str, int]], int, Set[int]]:
    """
    Build a DFA from a 'pattern' using the KMP approach.

    We create states 0..m, where m = len(pattern).
      - State i means: "we have matched i characters of 'pattern' so far."
      - State m is the accept state (fully matched).

    The transitions dict is of form:
      transitions[current_state][char] = next_state

    Returns:
      (transitions, start_state, accept_states)

    Example usage:
      >>> pattern = "ababc"
      >>> alphabet = {"a", "b", "c"}
      >>> transitions, start, accept = build_kmp_dfa(pattern, alphabet)
      >>> # transitions is a dict-of-dicts, start=0, accept={5}.
    """

    m = len(pattern)
    # The prefix function is used to "fall back" correctly
    prefix_func = build_prefix_function(pattern)

    # transitions[state][symbol] = next_state
    transitions: Dict[int, Dict[str, int]] = {s: {} for s in range(m + 1)}

    for state in range(m + 1):
        for c in alphabet:
            if state == m:
                # Once in accept state, we typically either stay in m or fall back
                # to prefix_func[m-1] if pattern still partially matches
                fallback = prefix_func[m - 1] if m > 0 else 0
                # E.g., transitions[m][c] = next state
                # we'll do a loop to see if c extends that fallback
                new_state = fallback
                while new_state > 0 and pattern[new_state] != c:
                    new_state = prefix_func[new_state - 1]
                if new_state < m and pattern[new_state] == c:
                    new_state += 1
                transitions[m][c] = new_state
            else:
                # Not in accept state
                # Attempt to extend from 'state' if c matches pattern[state]
                new_state = state
                while new_state > 0 and pattern[new_state] != c:
                    new_state = prefix_func[new_state - 1]
                if new_state < m and pattern[new_state] == c:
                    new_state += 1
                transitions[state][c] = new_state

    start_state = 0
    accept_states = {
        m
    }  # once we've matched m characters, we've matched the pattern fully

    return transitions, start_state, accept_states


def kmp_search(pattern: str, text: str) -> List[int]:
    """
    Return a list of all 0-based indices where 'pattern' is found within 'text'
    using the classical KMP "prefix function" approach.

    Runs in O(len(text) + len(pattern)) time.

    Example:
      >>> kmp_search("abc", "zabcabcxy")
      [1, 4]
    """

    if not pattern:
        return list(range(len(text) + 1))  # empty pattern matches at every position

    prefix_func = build_prefix_function(pattern)
    matches = []
    j = 0  # number of chars matched so far
    for i, c in enumerate(text):
        # Fall back if current char doesn't match
        while j > 0 and pattern[j] != c:
            j = prefix_func[j - 1]
        if pattern[j] == c:
            j += 1
        # If we've matched the entire pattern, record a match
        if j == len(pattern):
            start_index = i - (j - 1)
            matches.append(start_index)
            # Fall back to continue searching for next match
            j = prefix_func[j - 1]
    return matches
