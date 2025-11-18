// TM Tutorial Content - Rigorous Treatment

export const tmTutorial = {
    description: "Master Turing Machines through formal definitions, Church-Turing thesis, decidability, and computational complexity.",
    lessons: [
        {
            id: 'tm-0',
            title: 'Introduction: The Ultimate Computing Machine',
            description: 'An intuitive introduction to Turing Machines and the limits of computation',
            steps: [
                {
                    title: 'The Limit of PDAs',
                    content: `We've seen that Pushdown Automata (PDAs) can handle "counting" for one-to-one correspondence, like L = {0ⁿ1ⁿ}. But they fail on L = {aⁿbⁿcⁿ}, which requires matching three things. The single stack isn't enough.

We have now reached the limit of "simple" computation. To solve this, we need a more powerful model. We need a machine that can not only read its memory (like a PDA's stack) but also write to it and move freely around it.`,
                    keyPoints: [
                        'PDAs have one stack (one counter)',
                        'aⁿbⁿcⁿ needs two independent counters',
                        'Need more powerful model',
                        'Enter: Turing Machines'
                    ]
                },
                {
                    title: 'The Turing Machine (TM)',
                    content: `In 1936, Alan Turing proposed a simple, hypothetical machine to define the very limits of what is "computable." This model, the Turing Machine, is the foundation of all modern computer science.

A Turing Machine is a finite automaton (like a DFA) connected to an infinite tape.

Components:

1. Finite Control (State): A set of states Q, just like a DFA.

2. Infinite Tape: A tape, divided into cells, that is infinite in both directions. Each cell can hold one symbol from a "tape alphabet."

3. Tape Head: A head that points to one cell of the tape at a time. The machine can:
   • READ the symbol under the tape head.
   • WRITE a new symbol to the cell under the tape head (overwriting what's there).
   • MOVE the tape head one cell to the Left (L) or Right (R).`,
                    keyPoints: [
                        'Infinite tape = unlimited memory',
                        'Can read AND write',
                        'Can move left and right',
                        'Most powerful model of computation'
                    ],
                    tips: [
                        'Think of it as a "program" with infinite memory',
                        'Tape head = cursor',
                        'Can go back and forth',
                        'This is essentially what computers do!'
                    ]
                },
                {
                    title: 'How a Turing Machine Computes',
                    content: `A single "step" of a Turing Machine is determined by two things:

1. The current state (of the finite control).
2. The symbol on the tape under the tape head.

Based on these two things, the machine does three things:

1. Writes a new symbol to the tape (can be the same as the old one).
2. Moves the tape head (L or R).
3. Transitions to a new state (can be the same as the old one).

Special States:

• A TM starts in a start state (q₀).
• When it enters a special accept state (q_accept), it immediately halts and ACCEPTS the input.
• When it enters a special reject state (q_reject), it immediately halts and REJECTS the input.

A TM can also loop forever (never halt), which means it doesn't accept or reject.`,
                    keyPoints: [
                        'Each step: read, write, move, change state',
                        'Can accept, reject, or loop',
                        'Halting = decision made',
                        'Looping = no decision'
                    ],
                    example: {
                        description: 'Visual representation',
                        code: `Tape: ... _ _ a a b b c c _ _ ...
              ↑
         Tape Head
         (current position)
         
State: q₀
Reading: 'a'
Action: Write 'x', move Right, go to q₁

After step:
Tape: ... _ _ x a b b c c _ _ ...
              ↑
         Tape Head moved right`
                    }
                },
                {
                    title: 'Example: TM for aⁿbⁿcⁿ',
                    content: `We can finally design a machine for L = {aⁿbⁿcⁿ | n ≥ 0}!

Input on tape: ... _ _ a a b b c c _ _ ...

General Strategy:

1. Sweep left-to-right across the tape.
2. Find the first 'a', cross it off (replace with 'x').
3. Move right, past any other 'a's and 'x's, and find the first 'b'. Cross it off (replace with 'y').
4. Move right, past any other 'b's and 'y's, and find the first 'c'. Cross it off (replace with 'z').
5. Rewind the tape head all the way to the left (to the first non-blank).
6. Repeat this process (Steps 1-5).

How to accept/reject:

• If, during a sweep, you are looking for a 'b' but find a 'c' or a blank, REJECT (wrong order or not enough 'b's).
• If, after Step 5, you rewind and see a 'y' (meaning you've crossed off all the 'a's), sweep right. If you see any remaining 'b's or 'c's, REJECT. If you only see 'y's and 'z's, ACCEPT.

This is a "crossing-off" algorithm. The tape acts as the machine's memory, allowing it to go back and forth and check for correspondence.`,
                    keyPoints: [
                        'Uses tape to mark symbols',
                        'Can go back and forth',
                        'Can match three groups',
                        'More powerful than PDAs'
                    ],
                    tips: [
                        'Think: "mark and check"',
                        'Tape allows unlimited memory',
                        'Can revisit any part',
                        'This is why TMs are so powerful'
                    ]
                },
                {
                    title: 'Decidability and The Church-Turing Thesis',
                    content: `A TM can do one of three things on a given input:

1. Halt and Accept.
2. Halt and Reject.
3. Loop forever.

This leads to two important classes of languages:

Turing-Recognizable: A language L is "recognizable" if there is a TM that, for any string w ∈ L, will Halt and Accept. (But for w ∉ L, it might halt-reject or loop forever).

Turing-Decidable: A language L is "decidable" if there is a TM that halts on all inputs. It will always either halt-accept (if w ∈ L) or halt-reject (if w ∉ L). It never loops.

Decidable Languages ⊂ Turing-Recognizable Languages

There are languages that are recognizable but not decidable. The most famous is the Halting Problem: "Given a description of a Turing Machine and its input, will it ever halt?" It is impossible to write a program (a TM) that can solve this problem for all possible inputs.`,
                    keyPoints: [
                        'Decidable = always halts',
                        'Recognizable = may loop',
                        'Halting Problem is undecidable',
                        'Fundamental limits of computation'
                    ]
                },
                {
                    title: 'The Church-Turing Thesis',
                    content: `This isn't a mathematical theorem, but a foundational belief in computer science:

"Any function that can be computed by an 'effective method' (i.e., by any conceivable algorithm or computational device) can be computed by a Turing Machine."

This means that a TM is the most powerful model of computation that exists (or that we can imagine). Your laptop, a supercomputer, and a simple Turing Machine are all equivalent in computational power (though not speed). Anything they can compute, a TM can also compute.

If a problem cannot be solved by a Turing Machine (like the Halting Problem), it is considered uncomputable.`,
                    keyPoints: [
                        'TM = ultimate model of computation',
                        'All computers are equivalent to TMs',
                        'Not provable, but universally accepted',
                        'Foundation of computer science'
                    ],
                    tips: [
                        'Think: "if a human can do it, a TM can do it"',
                        'Speed doesn\'t matter, only computability',
                        'This justifies studying TMs',
                        'One of the most important ideas in CS'
                    ]
                },
                {
                    title: 'The Chomsky Hierarchy (Complete)',
                    content: `The complete hierarchy of languages:

| Language Class | Generator | Recognizer | Example |
| :--- | :--- | :--- | :--- |
| Type 3: Regular | Regular Grammar | DFA / NFA | a*b |
| Type 2: Context-Free | CFG | PDA | aⁿbⁿ |
| Type 1: Context-Sensitive | C.S. Grammar | Linear-Bounded Automaton | aⁿbⁿcⁿ |
| Type 0: Recursively Enumerable | Unrestricted Grammar | Turing Machine | Any computable problem |

Each level is more powerful than the previous one. Turing Machines sit at the top - they can recognize (or decide) any language that is computable.`,
                    keyPoints: [
                        'Complete hierarchy of languages',
                        'Each level more powerful',
                        'TMs at the top',
                        'Foundation of formal language theory'
                    ]
                }
            ]
        },
        {
            id: 'tm-1',
            title: 'Formal Definition and Computability',
            description: 'Rigorous treatment of Turing Machines and the foundations of computability theory',
            steps: [
                {
                    title: 'Formal Definition of a Turing Machine',
                    content: `A Turing Machine is a 7-tuple M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject) where:

• Q is finite set of states
• Σ is input alphabet (not containing blank ␣)
• Γ is tape alphabet (Σ ⊂ Γ, ␣ ∈ Γ)
• δ: Q × Γ → Q × Γ × {L, R} is transition function
• q₀ ∈ Q is start state
• q_accept ∈ Q is accept state
• q_reject ∈ Q is reject state (q_accept ≠ q_reject)

δ(q, X) = (p, Y, D) means:
• In state q, reading X
• Write Y, move head direction D (L or R)
• Transition to state p

Note: δ need not be total (undefined = implicit reject).`,
                    example: {
                        description: 'TM recognizing {0ⁿ1ⁿ | n ≥ 1}',
                        code: `High-level description:
1. Scan right, mark first 0 with X
2. Scan right, mark first 1 with Y
3. If more 0s remain, goto step 1
4. If no 0s and no 1s remain, accept
5. Otherwise reject

δ(q₀, 0) = (q₁, X, R)  // Mark first 0
δ(q₁, 0) = (q₁, 0, R)  // Scan past 0s
δ(q₁, Y) = (q₁, Y, R)  // Scan past marked 1s
δ(q₁, 1) = (q₂, Y, L)  // Mark first 1, go back
δ(q₂, Y) = (q₂, Y, L)  // Scan back
δ(q₂, 0) = (q₂, 0, L)  
δ(q₂, X) = (q₀, X, R)  // Return to start of loop
δ(q₀, Y) = (q₃, Y, R)  // No more 0s
δ(q₃, Y) = (q₃, Y, R)  // Check no 1s remain
δ(q₃, ␣) = (q_accept, ␣, R)  // Accept!`
                    },
                    keyPoints: [
                        'Infinite tape (unbounded memory)',
                        'Can read and write (not just read)',
                        'Can move left and right',
                        'Deterministic by default'
                    ]
                },
                {
                    title: 'Church-Turing Thesis',
                    content: `Church-Turing Thesis (informal): The intuitive notion of "algorithm" or "effective procedure" is precisely captured by Turing Machines.

Formally: Any function computable by an algorithm is computable by a Turing Machine.

This is a THESIS, not a theorem (cannot be formally proven).

Evidence:
• All known models of computation (λ-calculus, recursive functions, RAM machines, etc.) are equivalent to TMs
• No counterexample has been found in 90+ years
• TMs formalize our intuition about mechanical computation

Consequence: Results about TMs apply to ALL models of computation.`,
                    keyPoints: [
                        'Connects intuitive and formal notions of computation',
                        'Universally accepted by computer scientists',
                        'Justifies studying TMs to understand computation',
                        'Not mathematically provable (it\'s a thesis)'
                    ]
                },
                {
                    title: 'Decidability and Recognizability',
                    content: `Decidable Language: L is decidable if ∃ TM M that:
• Halts on all inputs
• Accepts if w ∈ L
• Rejects if w ∉ L

Recognizable Language (r.e.): L is recognizable if ∃ TM M that:
• Accepts if w ∈ L
• Rejects OR loops if w ∉ L

Relationship:
• Decidable ⟹ Recognizable
• Decidable = Recognizable ∩ Co-recognizable
• ∃ recognizable but undecidable languages
• ∃ languages that are not even recognizable

Examples:
• {⟨M, w⟩ | M accepts w} is recognizable but undecidable (Halting Problem)
• {⟨M⟩ | L(M) = Σ*} is neither recognizable nor co-recognizable`,
                    keyPoints: [
                        'Decidable = always halts with correct answer',
                        'Recognizable = may not halt on reject',
                        'Hierarchy: Decidable ⊂ Recognizable ⊂ All languages',
                        'Many natural problems are undecidable'
                    ]
                }
            ]
        },
        {
            id: 'tm-2',
            title: 'Undecidability and Reduction',
            description: 'The Halting Problem and proof techniques for undecidability',
            steps: [
                {
                    title: 'The Halting Problem',
                    content: `Halting Problem: Given TM M and input w, does M halt on w?

Formally: H = {⟨M, w⟩ | M halts on input w}

Theorem (Turing, 1936): H is undecidable.

Proof by contradiction:
Assume H decidable. Then ∃ TM R deciding H.
Construct TM D:
  On input ⟨M⟩:
    1. Run R on ⟨M, ⟨M⟩⟩
    2. If R accepts (M halts on ⟨M⟩), loop forever
    3. If R rejects (M doesn't halt), accept

Now run D on ⟨D⟩:
• If D halts on ⟨D⟩, then D loops (by construction)
• If D loops on ⟨D⟩, then D halts (by construction)

Contradiction! Therefore H is undecidable.`,
                    keyPoints: [
                        'First proof of an undecidable problem',
                        'Uses diagonalization (self-reference)',
                        'Fundamental limitation of computation',
                        'Many other problems reduce to Halting'
                    ]
                },
                {
                    title: 'Reductions and Undecidability',
                    content: `Reduction: To prove language A undecidable, show:
"If A were decidable, then known undecidable language B would be decidable"

Formal reduction A ≤_m B (mapping reduction):
Computable function f where w ∈ A ⟺ f(w) ∈ B

Consequence: If A ≤_m B and A undecidable, then B undecidable.

Common reductions from:
• Halting Problem
• A_TM = {⟨M, w⟩ | M accepts w}
• E_TM = {⟨M⟩ | L(M) = ∅}
• EQ_TM = {⟨M₁, M₂⟩ | L(M₁) = L(M₂)}

Strategy: Reduce from known undecidable to prove new problem undecidable.`,
                    example: {
                        description: 'Proving E_TM undecidable',
                        code: `Reduce A_TM to E_TM:

Given ⟨M, w⟩, construct M':
  M' on input x:
    1. If x ≠ w, reject
    2. If x = w, run M on w and accept if M accepts

Observe:
• M accepts w ⟹ L(M') = {w} (nonempty)
• M rejects w ⟹ L(M') = ∅ (empty)

So: ⟨M, w⟩ ∈ A_TM ⟺ ⟨M'⟩ ∉ E_TM

If E_TM decidable, then A_TM decidable (contradiction!).
Therefore E_TM undecidable.`
                    },
                    keyPoints: [
                        'Reductions are primary tool for undecidability proofs',
                        'Transform instance of known problem to new problem',
                        'Preserves decidability/undecidability',
                        'Build up catalog of undecidable problems'
                    ]
                }
            ]
        },
        {
            id: 'tm-3',
            title: 'Computational Complexity',
            description: 'Time and space complexity, P vs NP',
            steps: [
                {
                    title: 'Time Complexity Classes',
                    content: `Time complexity: For TM M, T_M(n) = max steps on inputs of length n.

DTIME(f(n)) = {L | L decided by TM in O(f(n)) time}

P = ⋃_k DTIME(n^k) = polynomial time decidable

Nondeterministic TM: Multiple possible transitions (accepts if ANY path accepts)

NTIME(f(n)) = {L | L decided by NTM in O(f(n)) time}

NP = ⋃_k NTIME(n^k) = nondeterministic polynomial time

P vs NP Question: Is P = NP?
• Biggest open problem in computer science
• $1,000,000 Clay Millennium Prize
• Most believe P ≠ NP but no proof exists`,
                    keyPoints: [
                        'P = efficiently solvable problems',
                        'NP = efficiently verifiable problems',
                        'P ⊆ NP (every P problem is in NP)',
                        'P = NP ⟺ finding solutions as easy as checking them'
                    ]
                },
                {
                    title: 'NP-Completeness',
                    content: `NP-Complete: Language L is NP-complete if:
1. L ∈ NP
2. Every A ∈ NP reduces to L (L is NP-hard)

Theorem (Cook-Levin, 1971): SAT is NP-complete.

Consequence: If ANY NP-complete problem has polynomial-time algorithm, then P = NP.

Common NP-complete problems:
• 3-SAT, Circuit-SAT
• Clique, Independent Set, Vertex Cover
• Hamiltonian Path/Cycle
• Traveling Salesman
• Subset Sum, Knapsack
• Graph Coloring

Thousands of problems are NP-complete!`,
                    keyPoints: [
                        'NP-complete = hardest problems in NP',
                        'All NP-complete problems equally hard',
                        'Reduction between NP-complete problems',
                        'No known polynomial algorithm for any'
                    ]
                }
            ]
        }
    ],
    exercises: [
        {
            id: 'tm-ex-1',
            title: 'Turing Machine Fundamentals',
            description: 'Test understanding of TM definitions',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'What is the key feature that makes Turing Machines more powerful than PDAs?',
                    options: [
                        'Nondeterminism',
                        'Unlimited read-write memory',
                        'Multiple tapes',
                        'Faster computation'
                    ],
                    correctAnswer: 'Unlimited read-write memory',
                    explanation: 'The infinite tape provides unlimited memory that can be both read and written. This is more powerful than a PDA\'s stack (LIFO access only).',
                    hint: 'Think about memory access patterns.'
                },
                {
                    type: 'true-false',
                    question: 'The Church-Turing thesis can be mathematically proven.',
                    options: ['True', 'False'],
                    correctAnswer: 'False',
                    explanation: 'False. It\'s a thesis relating intuitive "algorithm" to formal "Turing Machine". The intuitive notion cannot be formalized, so no proof is possible.',
                    hint: 'Why is it called a thesis rather than a theorem?'
                },
                {
                    type: 'multiple-choice',
                    question: 'What is the relationship between decidable and recognizable languages?',
                    options: [
                        'Decidable = Recognizable',
                        'Decidable ⊂ Recognizable',
                        'Recognizable ⊂ Decidable',
                        'No relationship'
                    ],
                    correctAnswer: 'Decidable ⊂ Recognizable',
                    explanation: 'Every decidable language is recognizable (just halt and reject instead of looping). But some recognizable languages are undecidable.',
                    hint: 'Can a TM that always halts also recognize?'
                },
                {
                    type: 'true-false',
                    question: 'The Halting Problem is decidable.',
                    options: ['True', 'False'],
                    correctAnswer: 'False',
                    explanation: 'False! This is Turing\'s famous result. The Halting Problem is undecidable - no algorithm can determine if arbitrary TMs halt.',
                    hint: 'This is one of the most fundamental results in computability theory.'
                }
            ]
        },
        {
            id: 'tm-ex-2',
            title: 'Complexity Theory',
            description: 'Test understanding of P, NP, and complexity classes',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'Which statement about P and NP is true?',
                    options: [
                        'P = NP has been proven',
                        'P ≠ NP has been proven',
                        'P ⊆ NP but P = NP is unknown',
                        'P and NP are incomparable'
                    ],
                    correctAnswer: 'P ⊆ NP but P = NP is unknown',
                    explanation: 'We know P ⊆ NP (every polynomial-time problem is in NP), but whether P = NP or P ⊂ NP is the biggest open question in CS.',
                    hint: 'This is a million-dollar question!'
                },
                {
                    type: 'true-false',
                    question: 'If we find a polynomial-time algorithm for any NP-complete problem, then P = NP.',
                    options: ['True', 'False'],
                    correctAnswer: 'True',
                    explanation: 'True! All NP-complete problems are equivalent via polynomial-time reductions. Solving one solves all, which means all of NP can be solved in polynomial time.',
                    hint: 'What does NP-completeness mean?'
                },
                {
                    type: 'multiple-choice',
                    question: 'What does it mean for a problem to be NP-complete?',
                    options: [
                        'It cannot be solved by any algorithm',
                        'It is in NP and every NP problem reduces to it',
                        'It requires exponential time',
                        'It is easier than problems in P'
                    ],
                    correctAnswer: 'It is in NP and every NP problem reduces to it',
                    explanation: 'NP-complete means (1) in NP and (2) NP-hard (all NP problems reduce to it). These are the "hardest" problems in NP.',
                    hint: 'NP-complete combines two properties.'
                }
            ]
        }
    ]
};


