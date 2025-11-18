Module 2: Nondeterministic Finite Automata (NFA)

1. The Problem with Determinism

In a DFA, every move is uniquely determined. For a given state and input symbol, there is exactly one choice. This is simple, but sometimes designing a DFA directly is complicated.

Consider the language $L = \{w \mid w \text{ ends in 01}\}$.
A DFA would need to "remember" if the last symbol was a 0, in case the current one is a 1.

$q_0$: Start state (haven't seen a 0)

$q_1$: Just saw a 0

$q_2$: Just saw "01" (accept state)

This is manageable. Now consider $L = \{w \mid w \text{ contains the substring 1101}\}$. Building the DFA for this is much more complex, as you have to track partial matches.

2. Nondeterminism

Nondeterminism introduces choice. A Nondeterministic Finite Automaton (NFA) can have multiple possible next states for a given state and input symbol.

It's like having parallel universes. When an NFA sees an input, it can "split" into multiple copies of itself, each one following one of the possible paths.

An NFA accepts a string if at least one of these paths ends in an accept state after reading the entire string.

How Nondeterminism Works:

An NFA can have two types of "choice":

Multiple Transitions: From one state, the same input symbol can lead to multiple different states.

Example: $\delta(q_0, 1) = \{q_1, q_2\}$

Epsilon-Transitions ($\epsilon$): An NFA can transition to another state without reading any input symbol. This is a "free move."

Example: $\delta(q_0, \epsilon) = q_1$ (The NFA can spontaneously jump from $q_0$ to $q_1$ at any time).

3. Formal Definition (The 5-Tuple)

An NFA is also a 5-tuple: $M = (Q, \Sigma, \delta, q_0, F)$. Most is the same as a DFA, but $\delta$ is different.

$Q$: A finite set of states.

$\Sigma$: A finite alphabet.

$\delta$ (delta): The transition function.

It takes a state and an input symbol (or $\epsilon$)

It returns a set of possible next states.

The set of all possible next states is called the powerset of $Q$, written $P(Q)$.

Format: $\delta: Q \times (\Sigma \cup \{\epsilon\}) \to P(Q)$

$q_0$: The start state.

$F$: The set of accept states.

4. Example 1: NFA for $L = \{w \mid w \text{ ends in 01}\}$

Let's build an NFA for this. It's much simpler than the DFA.
"We're just waiting. At some point, we guess that the next two symbols are '01'. If our guess is right and it's the end of the string, we accept."

$Q = \{q_0, q_1, q_2\}$

$\Sigma = \{0, 1\}$

$q_0$: Start state

$F = \{q_2\}$

$\delta$:

$\delta(q_0, 0) = \{q_0, q_1\}$  (Either stay in $q_0$ OR guess this is the start of "01")

$\delta(q_0, 1) = \{q_0\}$      (Stay in $q_0$)

$\delta(q_1, 1) = \{q_2\}$      (If we're in $q_1$ (just saw '0'), and now see '1', move to accept)

State Diagram:

         0,1
         / \
         +--+
         |
  -> (q0) --0--> (q1) --1--> (*q2*)


How it works (Input "101"):

Start at $q_0$.

Read '1'. Path 1: $\delta(q_0, 1) \to q_0$. (Current states: $\{q_0\}$)

Read '0'.

Path 1: From $q_0$, read '0'. $\delta(q_0, 0) \to \{q_0, q_1\}$.

The NFA "splits". (Current states: $\{q_0, q_1\}$)

Read '1'.

Path 1 (from $q_0$): $\delta(q_0, 1) \to q_0$.

Path 2 (from $q_1$): $\delta(q_1, 1) \to q_2$.

End of string. The set of states we are in is $\{q_0, q_2\}$.

Since this set contains an accept state ($q_2$), the string is ACCEPTED.

How it works (Input "00"):

Start at $q_0$.

Read '0'. $\delta(q_0, 0) \to \{q_0, q_1\}$. (Current states: $\{q_0, q_1\}$)

Read '0'.

Path 1 (from $q_0$): $\delta(q_0, 0) \to \{q_0, q_1\}$.

Path 2 (from $q_1$): $\delta(q_1, 0) \to \emptyset$ (dead end).

End of string. The set of states we are in is $\{q_0, q_1\}$.

This set does NOT contain an accept state. The string is REJECTED.

5. Example 2: NFA with $\epsilon$-Transitions

Language: $L = \{w \mid w \text{ is 'a' or 'b' or 'ab'}\}$.

         a
         +------> (*q1*)
         |
  -> (q0) --b--> (*q2*)
         |
         +--epsilon--> (q3) --a--> (q4) --b--> (*q5*)


This NFA has 3 branches from the start.

Path 1 (top): Reads 'a', accepts.

Path 2 (middle): Reads 'b', accepts.

Path 3 (bottom): Takes a free move to $q_3$, then looks for 'a', then 'b'.

This $\epsilon$-transition allows us to "glue" different automata together to recognize the union of their languages.

6. Equivalence of NFAs and DFAs

This is a fundamental theorem of automata theory:
A language is regular if and only if some NFA recognizes it.

This means that for any NFA, you can construct an equivalent DFA that accepts the exact same language. NFAs are not more powerful than DFAs, they are just a different (and often more convenient) way of describing computation.

The process of converting an NFA to a DFA is called Subset Construction.

Idea: The NFA can be in a set of states at any time. We create a DFA where each state corresponds to a set of NFA states.

If the NFA has $k$ states, the equivalent DFA could have up to $2^k$ states (the number of possible subsets).

The start state of the DFA is the set of states the NFA can be in at the beginning (the NFA's $q_0$ plus anything reachable by $\epsilon$-moves).

An accept state in the DFA is any set-state that contains at least one of the NFA's accept states.

Conclusion:

DFA: Deterministic, one path. Can be complex to design.

NFA: Nondeterministic, multiple "guesses." Often easier to design.

Power: NFAs and DFAs are equally powerful. They both recognize the same class of languages: the Regular Languages.