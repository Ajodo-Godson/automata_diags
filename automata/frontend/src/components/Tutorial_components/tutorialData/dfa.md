Module 1: Deterministic Finite Automata (DFA)

1. What is a Finite Automaton?

A finite automaton (FA) is a simple model of computation. It's a conceptual machine that processes an input string (a sequence of symbols) and decides whether to "accept" or "reject" it.

Think of it as a machine with a finite number of states. It starts in a "start state" and reads the input string one symbol at a time. Based on the current state and the symbol it just read, it transitions to a new state. After reading the entire string, the machine's final state determines the outcome:

If it ends in an accept state (or "final state"), the string is accepted.

If it ends in any other state, the string is rejected.

The set of all strings that an automaton accepts is called the language of that automaton. Automata that recognize these languages are also called "language recognizers."

2. Deterministic Finite Automata (DFA)

The first type we'll study is the Deterministic Finite Automaton (DFA). The "deterministic" part is key: for any given state and any given input symbol, there is exactly one state it can transition to. There is no ambiguity.

Formal Definition (The 5-Tuple)

A DFA is formally defined as a 5-tuple: $M = (Q, \Sigma, \delta, q_0, F)$

$Q$: A finite set of states.

Example: $\{q_0, q_1, q_2\}$

$\Sigma$ (Sigma): A finite set called the alphabet, which defines the allowed input symbols.

Example: $\{0, 1\}$

$\delta$ (delta): The transition function. This function takes a state and an alphabet symbol and returns the next state.

Format: $\delta: Q \times \Sigma \to Q$

Example: $\delta(q_0, 0) = q_1$ (If in state $q_0$ and you read a '0', go to state $q_1$)

$q_0$: The start state. It must be one of the states in $Q$.

Example: $q_0$

$F$: The set of accept states (or final states). $F$ is a subset of $Q$ ($F \subseteq Q$).

Example: $\{q_2\}$

3. How to Represent a DFA

We can represent a DFA in two common ways:

a) State Diagram

This is the most intuitive way.

States ($Q$) are drawn as circles.

The start state ($q_0$) has an arrow pointing to it from nowhere.

Accept states ($F$) are drawn as double circles.

Transitions ($\delta$) are drawn as arrows from one state to another, labeled with the input symbol(s) that trigger that transition.

Example 1: A DFA that accepts all strings ending in '1'

Alphabet: $\Sigma = \{0, 1\}$

States: $Q = \{q_0, q_1\}$

Start State: $q_0$

Accept State: $F = \{q_1\}$

Diagram:

      (q0) --0--> (q0)
       |           ^
       |           |
       +-----1-----+
       |           |
       v           |
      (q1) --0--> (q0)
      (q1) --1--> (q1)


Text Description:

An arrow from "nowhere" points to $q_0$ (start state).

$q_1$ is a double circle (accept state).

There is an arrow from $q_0$ to itself labeled '0'.

There is an arrow from $q_0$ to $q_1$ labeled '1'.

There is an arrow from $q_1$ to $q_0$ labeled '0'.

There is an arrow from $q_1$ to itself labeled '1'.

How it works:

If the string is "001":

Start at $q_0$. Read '0'. $\delta(q_0, 0) \to q_0$. (Stay at $q_0$)

At $q_0$. Read '0'. $\delta(q_0, 0) \to q_0$. (Stay at $q_0$)

At $q_0$. Read '1'. $\delta(q_0, 1) \to q_1$. (Go to $q_1$)

End of string. We are in state $q_1$, which IS an accept state. String is ACCEPTED.

If the string is "110":

Start at $q_0$. Read '1'. $\delta(q_0, 1) \to q_1$. (Go to $q_1$)

At $q_1$. Read '1'. $\delta(q_1, 1) \to q_1$. (Stay at $q_1$)

At $q_1$. Read '0'. $\delta(q_1, 0) \to q_0$. (Go to $q_0$)

End of string. We are in state $q_0$, which is NOT an accept state. String is REJECTED.

b) Transition Table

This is a tabular representation of the transition function ($\delta$).

State

Input '0'

Input '1'

$\to q_0$

$q_0$

$q_1$

$*q_1$

$q_0$

$q_1$

Rows represent states.

Columns represent input symbols.

The cell (row, col) shows the state you transition to.

The start state is marked with an arrow ($\to$).

Accept states are marked with an asterisk (*).

4. Example 2: DFA for $L = \{w \mid w \text{ has an even number of 0s}\}$

Language: We want to accept strings like "", "1", "111", "00", "1010", "0011"

Reject: "0", "10", "010", "000"

Alphabet: $\Sigma = \{0, 1\}$

Logic: We need to keep track of whether we've seen an even or odd number of 0s. That suggests two states.

$q_{even}$: We have seen an even number of 0s (this is our start state, since 0 is even).

$q_{odd}$: We have seen an odd number of 0s.

Which is the accept state? The language wants an even number of 0s, so $q_{even}$ is our accept state.

Formal Definition:

$Q = \{q_{even}, q_{odd}\}$

$\Sigma = \{0, 1\}$

$q_0 = q_{even}$

$F = \{q_{even}\}$

$\delta$:

$\delta(q_{even}, 0) = q_{odd}$  (Reading a 0 flips us to odd)

$\delta(q_{even}, 1) = q_{even}$ (Reading a 1 changes nothing about 0-parity)

$\delta(q_{odd}, 0) = q_{even}$  (Reading a 0 flips us back to even)

$\delta(q_{odd}, 1) = q_{odd}$  (Reading a 1 changes nothing)

State Diagram:

         <--0--
        |      |
  -> (*q_even*) --1--> (*q_even*)
        |      |
        +--0-->+
               |
      (q_odd) --1--> (q_odd)


Transition Table:
| State | Input '0' | Input '1' |
| :--- | :--- | :--- |
| $\to *q_{even}$ | $q_{odd}$ | $q_{even}$ |
| $q_{odd}$ | $q_{even}$ | $q_{odd}$ |

5. Regular Languages

A language is called a Regular Language if there exists some Deterministic Finite Automaton (DFA) that recognizes it.

DFAs are powerful, but limited. They cannot "count" indefinitely. For example, you cannot build a DFA that recognizes the language $L = \{0^n 1^n \mid n \ge 0\}$ (all strings with some number of 0s followed by the same number of 1s). A DFA has no memory to store the count of 0s it has seen. For that, we'll need more powerful machines.