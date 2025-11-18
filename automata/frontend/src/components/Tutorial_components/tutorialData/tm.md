Module 5: Turing Machines

1. The Limit of PDAs

We've seen that Pushdown Automata (PDAs) can handle "counting" for one-to-one correspondence, like $L = \{0^n 1^n\}$. But they fail on $L = \{a^n b^n c^n\}$, which requires matching three things. The single stack isn't enough.

We have now reached the limit of "simple" computation. To solve this, we need a more powerful model. We need a machine that can not only read its memory (like a PDA's stack) but also write to it and move freely around it.

2. The Turing Machine (TM)

In 1936, Alan Turing proposed a simple, hypothetical machine to define the very limits of what is "computable." This model, the Turing Machine, is the foundation of all modern computer science.

A Turing Machine is a finite automaton (like a DFA) connected to an infinite tape.

Components:

Finite Control (State): A set of states $Q$, just like a DFA.

Infinite Tape: A tape, divided into cells, that is infinite in both directions. Each cell can hold one symbol from a "tape alphabet."

Tape Head: A head that points to one cell of the tape at a time. The machine can:

READ the symbol under the tape head.

WRITE a new symbol to the cell under the tape head (overwriting what's there).

MOVE the tape head one cell to the Left (L) or Right (R).

3. How a Turing Machine Computes

A single "step" of a Turing Machine is determined by two things:

The current state (of the finite control).

The symbol on the tape under the tape head.

Based on these two things, the machine does three things:

Writes a new symbol to the tape (can be the same as the old one).

Moves the tape head (L or R).

Transitions to a new state (can be the same as the old one).

Special States:

A TM starts in a start state ($q_0$).

When it enters a special accept state ($q_{accept}$), it immediately halts and ACCEPTS the input.

When it enters a special reject state ($q_{reject}$), it immediately halts and REJECTS the input.

4. Formal Definition (The 7-Tuple)

A TM is a 7-tuple: $M = (Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject})$

$Q$: Finite set of states.

$\Sigma$: Finite input alphabet. These are the symbols the input string is made of.

$\Gamma$ (Gamma): Finite tape alphabet. This includes all symbols in $\Sigma$ plus a special blank symbol '$\_$'. ($\Sigma \subset \Gamma$ and $\_ \in \Gamma$).

$\delta$: The transition function.

Format: $\delta: Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$

Input: (current state, tape symbol read)

Output: (new state, tape symbol to write, direction to move)

Example: $\delta(q_1, 'a') = (q_2, 'b', R)$

"If in state $q_1$ and the head reads 'a',

...transition to state $q_2$, write 'b' on the tape, and move the head Right."

$q_0$: The start state.

$q_{accept}$: The accept state.

$q_{reject}$: The reject state. ($q_{accept} \ne q_{reject}$)

5. Example: TM for $L = \{a^n b^n c^n \mid n \ge 0\}$

We can finally design a machine for this!

Input on tape: $... \_ \_ a \ a \ b \ b \ c \ c \_ \_ ...$

General Strategy:

Sweep left-to-right across the tape.

Find the first 'a', cross it off (replace with 'x').

Move right, past any other 'a's and 'x's, and find the first 'b'. Cross it off (replace with 'y').

Move right, past any other 'b's and 'y's, and find the first 'c'. Cross it off (replace with 'z').

Rewind the tape head all the way to the left (to the first non-blank).

Repeat this process (Steps 1-5).

How to accept/reject:

If, during a sweep, you are looking for a 'b' but find a 'c' or a blank, REJECT (wrong order or not enough 'b's).

If, after Step 5, you rewind and see a 'y' (meaning you've crossed off all the 'a's), sweep right. If you see any remaining 'b's or 'c's, REJECT. If you only see 'y's and 'z's, ACCEPT.

This is a "crossing-off" algorithm. The tape acts as the machine's memory, allowing it to go back and forth and check for correspondence.

6. Decidability and The Church-Turing Thesis

A TM can do one of three things on a given input:

Halt and Accept.

Halt and Reject.

Loop forever.

This leads to two important classes of languages:

Turing-Recognizable: A language $L$ is "recognizable" if there is a TM that, for any string $w \in L$, will Halt and Accept. (But for $w \notin L$, it might halt-reject or loop forever).

Turing-Decidable: A language $L$ is "decidable" if there is a TM that halts on all inputs. It will always either halt-accept (if $w \in L$) or halt-reject (if $w \notin L$). It never loops.

Decidable Languages $\subset$ Turing-Recognizable Languages

There are languages that are recognizable but not decidable. The most famous is the Halting Problem: "Given a description of a Turing Machine and its input, will it ever halt?" It is impossible to write a program (a TM) that can solve this problem for all possible inputs.

The Church-Turing Thesis

This isn't a mathematical theorem, but a foundational belief in computer science:

"Any function that can be computed by an 'effective method' (i.e., by any conceivable algorithm or computational device) can be computed by a Turing Machine."

This means that a TM is the most powerful model of computation that exists (or that we can imagine). Your laptop, a supercomputer, and a simple Turing Machine are all equivalent in computational power (though not speed). Anything they can compute, a TM can also compute.

If a problem cannot be solved by a Turing Machine (like the Halting Problem), it is considered uncomputable.

The Chomsky Hierarchy (Complete)

Language Class

Generator

Recognizer

Example

Type 3: Regular

Regular Grammar

DFA / NFA

a*b

Type 2: Context-Free

CFG

PDA

$a^n b^n$

Type 1: Context-Sensitive

C.S. Grammar

Linear-Bounded Automaton

$a^n b^n c^n$

Type 0: Recursively Enumerable

Unrestricted Grammar

Turing Machine

Any computable problem