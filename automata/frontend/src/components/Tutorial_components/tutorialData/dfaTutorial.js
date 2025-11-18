// DFA Tutorial Content - Rigorous Treatment

export const dfaTutorial = {
    description: "Master Deterministic Finite Automata through rigorous mathematical foundations and practical applications in pattern recognition and compiler design.",
    lessons: [
        {
            id: 'dfa-0',
            title: 'Introduction: What is a Finite Automaton?',
            description: 'An intuitive introduction to finite automata and how they work as language recognizers',
            steps: [
                {
                    title: 'What is a Finite Automaton?',
                    content: `A finite automaton (FA) is a simple model of computation - think of it as a conceptual machine that processes an input string (a sequence of symbols) and decides whether to "accept" or "reject" it.

Imagine a machine with a finite number of states. It:
1. Starts in a "start state"
2. Reads the input string one symbol at a time
3. Based on the current state and the symbol it just read, transitions to a new state
4. After reading the entire string, checks its final state

The outcome:
• If it ends in an ACCEPT STATE (or "final state"), the string is ACCEPTED
• If it ends in any other state, the string is REJECTED

The set of all strings that an automaton accepts is called the LANGUAGE of that automaton. Automata that recognize these languages are also called "language recognizers."`,
                    keyPoints: [
                        'Finite automata are simple computational models',
                        'They process input strings symbol by symbol',
                        'Acceptance is determined by the final state',
                        'The language L(M) is the set of all accepted strings'
                    ],
                    tips: [
                        'Think of states as "memory" - but very limited memory',
                        'Each state represents something you need to remember about the input so far',
                        'Finite automata can\'t count arbitrarily - they can only track a fixed number of conditions'
                    ]
                },
                {
                    title: 'Representing DFAs: State Diagrams',
                    content: `The most intuitive way to understand a DFA is through a STATE DIAGRAM.

Components:
• STATES (Q): Drawn as circles
• START STATE (q₀): Has an arrow pointing to it from nowhere
• ACCEPT STATES (F): Drawn as double circles (⊚)
• TRANSITIONS (δ): Arrows between states, labeled with input symbols

Example: DFA accepting strings ending in '1'

Alphabet: Σ = {0, 1}
States: Q = {q₀, q₁}`,
                    example: {
                        description: 'Visual structure and execution trace',
                        visual: require('./Images/dfa_ending_with_1.png'),
                        code: `
Tracing execution on input "001":
Input: "001"

Step 1: Start at q₀, read '0'
   → δ(q₀, 0) = q₀  (stay at q₀)

Step 2: At q₀, read '0'
   → δ(q₀, 0) = q₀  (stay at q₀)

Step 3: At q₀, read '1'
   → δ(q₀, 1) = q₁  (go to q₁)

Final state: q₁ ∈ F  ✓ ACCEPTED

Input: "110"
Step 1: Start at q₀, read '1' → q₁
Step 2: At q₁, read '1' → q₁
Step 3: At q₁, read '0' → q₀

Final state: q₀ ∉ F  ✗ REJECTED`
                    },
                    keyPoints: [
                        'State diagrams provide visual intuition',
                        'Follow arrows for each input symbol',
                        'Start state has incoming arrow from nowhere',
                        'Double circles mark accept states'
                    ]
                },
                {
                    title: 'Representing DFAs: Transition Tables',
                    content: `Another way to represent a DFA is with a TRANSITION TABLE - a tabular form of the transition function δ.

Format:
• Rows: States
• Columns: Input symbols
• Cell (q, a): The state δ(q, a) you transition to
• Notation: → marks start state, * marks accept states`,
                    example: {
                        description: 'Same DFA (strings ending in \'1\') as a transition table',
                        code: `╔═══════╦═════════╦═════════╗
║ State ║ Input 0 ║ Input 1 ║
╠═══════╬═════════╬═════════╣
║ → q₀  ║   q₀    ║   q₁    ║
║ * q₁  ║   q₀    ║   q₁    ║
╚═══════╩═════════╩═════════╝

Reading the table:
• From q₀ on input '0': stay at q₀
• From q₀ on input '1': go to q₁
• From q₁ on input '0': go to q₀
• From q₁ on input '1': stay at q₁`
                    },
                    keyPoints: [
                        'Transition tables are compact and unambiguous',
                        'Easy to implement in code (2D array or map)',
                        'Every cell must be filled (δ is a total function)',
                        'Useful for formal proofs and implementations'
                    ],
                    tips: [
                        'Diagrams are better for visualization',
                        'Tables are better for implementation',
                        'Both represent the exact same automaton',
                        'You should be comfortable converting between them'
                    ]
                },
                {
                    title: 'Example: DFA for Even Number of 0s',
                    content: `Let's design a DFA for the language L = {w | w has an even number of 0s}

This means:
• Accept: "", "1", "111", "00", "1010", "0011"
• Reject: "0", "10", "011", "000"

Key insight: We need to track whether we've seen an even or odd number of 0s. This suggests TWO states.

States:
• q_{even}: Seen an even number of 0s (start state, since 0 is even)
• q_{odd}: Seen an odd number of 0s

Which is accept state? Since we want even 0s: F = {q_{even}}

Transitions:
• δ(q_{even}, 0) = q_{odd}  (0 flips even → odd)
• δ(q_{even}, 1) = q_{even} (1 doesn't change parity)
• δ(q_{odd}, 0) = q_{even}  (0 flips odd → even)
• δ(q_{odd}, 1) = q_{odd}   (1 doesn't change parity)`,
                    example: {
                        description: 'State diagram',
                        visual: require('./Images/dfa_even_zeros.png'),
                        code: `
Transition Table:
╔═══════════╦═════════╦═════════╗
║   State   ║ Input 0 ║ Input 1 ║
╠═══════════╬═════════╬═════════╣
║ →*q_{even}║ q_{odd} ║ q_{even}║
║  q_{odd}  ║ q_{even}║ q_{odd} ║
╚═══════════╩═════════╩═════════╝`
                    },
                    keyPoints: [
                        'This DFA acts as a "parity checker" for 0s',
                        'Each 0 toggles between even/odd states',
                        '1s are "neutral" - they don\'t affect 0-count',
                        'The start state IS an accept state (ε has zero 0s)'
                    ]
                },
                {
                    title: 'Regular Languages: What DFAs Can Recognize',
                    content: `A language is called a REGULAR LANGUAGE if there exists some Deterministic Finite Automaton (DFA) that recognizes it.

In other words:
L is regular ⟺ ∃ DFA M such that L = L(M)

DFAs are powerful, but LIMITED. They have finite memory (the states), so they cannot "count" indefinitely.

Example of a NON-regular language:
L = {0ⁿ1ⁿ | n ≥ 0} = {ε, 01, 0011, 000111, ...}

This requires matching the number of 0s with the number of 1s. Since n can be arbitrarily large, a DFA with finitely many states cannot store this count.

Intuition: DFAs can recognize patterns, but not arbitrary counts.`,
                    keyPoints: [
                        'Regular languages = languages recognizable by DFAs',
                        'DFAs have finite memory (states only)',
                        'Cannot count unboundedly (e.g., matching pairs)',
                        'We\'ll need more powerful machines (like PDAs) for non-regular languages'
                    ],
                    tips: [
                        'If a language requires counting unboundedly, it\'s likely not regular',
                        'Patterns like "ends with 01", "even 0s", "contains aba" are regular',
                        'Patterns like "equal 0s and 1s", "palindromes", "nested structure" are NOT regular',
                        'Later we\'ll learn formal techniques to prove non-regularity'
                    ]
                }
            ]
        },
        {
            id: 'dfa-1',
            title: 'Formal Definition and Mathematical Foundations',
            description: 'Rigorous mathematical treatment of DFAs including formal definitions, notation, and theoretical properties',
            steps: [
                {
                    title: 'Formal Definition of a DFA',
                    content: `A Deterministic Finite Automaton is formally defined as a 5-tuple M = (Q, Σ, δ, q₀, F) where:

• Q is a finite, non-empty set of states
• Σ is a finite, non-empty set of input symbols (the alphabet)
• δ: Q × Σ → Q is the transition function
• q₀ ∈ Q is the initial (start) state
• F ⊆ Q is the set of accept (final) states

The transition function δ is TOTAL, meaning δ(q, a) is defined for all q ∈ Q and a ∈ Σ. This is what makes the automaton "deterministic" - for every state-symbol pair, there exists exactly one next state.`,
                    example: {
                        description: 'Formal DFA accepting strings over {0,1} with an even number of 0s',
                        code: `M = (Q, Σ, δ, q₀, F) where:

Q = {qₑᵥₑₙ, qₒdd}
Σ = {0, 1}
q₀ = qₑᵥₑₙ
F = {qₑᵥₑₙ}

δ: Q × Σ → Q defined by:
δ(qₑᵥₑₙ, 0) = qₒdd
δ(qₑᵥₑₙ, 1) = qₑᵥₑₙ
δ(qₒdd, 0) = qₑᵥₑₙ
δ(qₒdd, 1) = qₒdd`
                    },
                    keyPoints: [
                        'The transition function must be TOTAL (defined everywhere)',
                        'Determinism means exactly one next state per state-symbol pair',
                        'F can be empty (∅), in which case L(M) = ∅',
                        'The definition is mathematically precise and unambiguous'
                    ]
                },
                {
                    title: 'Extended Transition Function δ*',
                    content: `The extended transition function δ*: Q × Σ* → Q extends δ to operate on strings rather than single symbols.

Formally, δ* is defined recursively:

Base case: δ*(q, ε) = q for all q ∈ Q
Recursive case: δ*(q, wa) = δ(δ*(q, w), a) for w ∈ Σ*, a ∈ Σ

Intuition: δ*(q, w) is the state reached by starting in state q and reading string w.

We often write δ̂ instead of δ* in literature.`,
                    example: {
                        description: 'Computing δ* for the even-0s DFA',
                        code: `Given M from previous step, compute δ*(qₑᵥₑₙ, "001"):

δ*(qₑᵥₑₙ, "001")
= δ(δ*(qₑᵥₑₙ, "00"), 1)
= δ(δ(δ*(qₑᵥₑₙ, "0"), 0), 1)
= δ(δ(δ(qₑᵥₑₙ, 0), 0), 1)
= δ(δ(qₒdd, 0), 1)
= δ(qₑᵥₑₙ, 1)
= qₑᵥₑₙ ∈ F ✓ (accepted)`
                    },
                    keyPoints: [
                        'δ* processes entire strings, not just single symbols',
                        'The recursive definition mirrors how we process strings left-to-right',
                        'δ*(q₀, w) ∈ F ⟺ M accepts w',
                        'This extends naturally to the language definition'
                    ]
                },
                {
                    title: 'Language Accepted by a DFA',
                    content: `The language accepted (or recognized) by DFA M = (Q, Σ, δ, q₀, F) is:

L(M) = {w ∈ Σ* | δ*(q₀, w) ∈ F}

In other words, L(M) contains exactly those strings that, when processed starting from q₀, lead to an accept state.

Key observations:
1. L(M) ⊆ Σ* always
2. L(M) can be empty (if no string reaches F)
3. L(M) can be infinite (most interesting cases)
4. Different DFAs can accept the same language`,
                    keyPoints: [
                        'A language is a set of strings over some alphabet',
                        'L(M) precisely defines which strings are "in" the language',
                        'Two DFAs are equivalent if they accept the same language',
                        'This definition forms the basis for language theory'
                    ],
                    tips: [
                        'Always check: does ε (empty string) belong to L(M)? It does iff q₀ ∈ F',
                        'For proofs, you often need to show L(M₁) = L(M₂) by showing ⊆ and ⊇',
                        'To prove w ∈ L(M), show a computation: q₀ →a₁ q₁ →a₂ ... →aₙ qf where qf ∈ F'
                    ]
                },
                {
                    title: 'Regular Languages and Closure Properties',
                    content: `A language L is called REGULAR if there exists a DFA M such that L = L(M).

Theorem (Closure Properties): The class of regular languages is closed under:
1. Union: L₁, L₂ regular ⟹ L₁ ∪ L₂ regular
2. Intersection: L₁, L₂ regular ⟹ L₁ ∩ L₂ regular
3. Complement: L regular ⟹ L̄ = Σ* \\ L regular
4. Concatenation: L₁, L₂ regular ⟹ L₁L₂ regular
5. Kleene star: L regular ⟹ L* regular
6. Reversal: L regular ⟹ Lᴿ regular

Proof techniques:
- Union/Intersection: Product construction
- Complement: Flip accept/non-accept states
- Concatenation/Star: Use NFAs (covered later)`,
                    keyPoints: [
                        'Closure properties let you build complex languages from simple ones',
                        'These properties are FUNDAMENTAL to the theory',
                        'They give us tools to prove languages are regular',
                        'They also help prove languages are NOT regular (by contradiction)'
                    ],
                    tips: [
                        'Use closure properties in proofs instead of building automata from scratch',
                        'Example: To show L = {w | #₀(w) is even AND #₁(w) is even}, use intersection',
                        'Complement is especially powerful: L̄ regular ⟹ L regular'
                    ]
                }
            ]
        },
        {
            id: 'dfa-2',
            title: 'State Minimization and Equivalence',
            description: 'Learn the theory and algorithms for minimizing DFAs and determining state equivalence',
            steps: [
                {
                    title: 'The Myhill-Nerode Theorem',
                    content: `The Myhill-Nerode theorem characterizes regular languages in terms of equivalence classes.

Definition (Indistinguishability): Two strings x, y ∈ Σ* are indistinguishable with respect to language L if:
∀z ∈ Σ*: (xz ∈ L ⟺ yz ∈ L)

We write x ≡ₗ y. This is an equivalence relation.

Myhill-Nerode Theorem: The following are equivalent:
1. L is regular
2. L is the union of some equivalence classes of ≡ₗ of finite index
3. The number of equivalence classes of ≡ₗ is finite

Furthermore, if L is regular, the minimum number of states in any DFA for L equals the number of equivalence classes of ≡ₗ.`,
                    keyPoints: [
                        'This theorem provides a precise characterization of regularity',
                        'It gives us the MINIMUM number of states needed',
                        'The equivalence classes correspond to states in the minimal DFA',
                        'This is one of the most important theorems in automata theory'
                    ]
                },
                {
                    title: 'Proving Languages Non-Regular (Myhill-Nerode)',
                    content: `The Myhill-Nerode theorem gives us a powerful technique to prove languages are NOT regular.

Strategy: Show that L has infinitely many pairwise distinguishable strings.

Definition: Strings x, y ∈ Σ* are distinguishable with respect to L if there exists z ∈ Σ* such that exactly one of xz, yz is in L.

Theorem Application: If L has infinitely many pairwise distinguishable strings, then L requires infinitely many states, so L is not regular.`,
                    example: {
                        description: 'Rigorous proof that L = {0ⁿ1ⁿ | n ≥ 0} is not regular',
                        code: `Theorem: L = {0ⁿ1ⁿ | n ≥ 0} is not regular.

Proof:
Let S = {0ⁿ | n ∈ ℕ} = {ε, 0, 0², 0³, 0⁴, ...}

Claim: All strings in S are pairwise distinguishable with respect to L.

Proof of Claim:
Let i, j ∈ ℕ with i ≠ j. We show that 0ⁱ and 0ʲ are distinguishable.

Consider the distinguishing suffix z = 1ⁱ.

Case 1: 0ⁱ · z = 0ⁱ1ⁱ
   By definition of L, 0ⁱ1ⁱ ∈ L (equal number of 0s and 1s)

Case 2: 0ʲ · z = 0ʲ1ⁱ  
   Since i ≠ j, we have j ≠ i
   Therefore 0ʲ1ⁱ has j zeros and i ones (j ≠ i)
   By definition of L, 0ʲ1ⁱ ∉ L

Since 0ⁱ1ⁱ ∈ L but 0ʲ1ⁱ ∉ L, the strings 0ⁱ and 0ʲ are distinguishable.

Since i and j were arbitrary distinct natural numbers, all pairs in S are distinguishable.

Conclusion:
S is an infinite set of pairwise distinguishable strings.
By Myhill-Nerode theorem, L has infinitely many equivalence classes.
Therefore, no DFA with finitely many states can recognize L.
Hence, L is not regular. ∎`
                    },
                    keyPoints: [
                        'Must prove ALL pairs are distinguishable (not just one pair)',
                        'The distinguishing suffix z depends on the string (here z = 1ⁱ)',
                        'This is more elegant than the pumping lemma',
                        'The number of equivalence classes = minimum number of states needed'
                    ],
                    tips: [
                        'Start by clearly defining the infinite set S',
                        'Take arbitrary i ≠ j and show 0ⁱ ≢ₗ 0ʲ',
                        'Common pattern: For 0ⁿ1ⁿ use S = {0ⁿ} with z = 1ⁿ',
                        'Be explicit about why xz ∈ L but yz ∉ L (or vice versa)'
                    ]
                },
                {
                    title: 'The Pumping Lemma for Regular Languages',
                    content: `The Pumping Lemma is a necessary condition for regularity. It's useful for proving languages are NOT regular.

Statement: If L is a regular language, then there exists a constant p (the "pumping length") such that:

For every string w ∈ L with |w| ≥ p, there exists a decomposition w = xyz satisfying:
1. |xy| ≤ p  (y occurs within first p symbols)
2. |y| ≥ 1   (y is non-empty)
3. For all i ≥ 0: xyⁱz ∈ L  (we can "pump" y any number of times)

Intuition: In a DFA with p states, any string of length ≥ p must revisit some state. The substring y corresponds to the loop.

Contrapositive: To prove L is NOT regular:
Assume L is regular with pumping length p.
Find a string w ∈ L with |w| ≥ p.
Show that for EVERY decomposition w = xyz satisfying (1) and (2),
there exists i ≥ 0 such that xyⁱz ∉ L.
This contradicts the pumping lemma, so L cannot be regular.`,
                    keyPoints: [
                        'The pumping lemma is a NECESSARY condition (not sufficient)',
                        'To prove non-regularity, we must show NO valid decomposition exists',
                        'The adversary chooses p, then the decomposition xyz',
                        'You only choose w and the value of i that breaks the lemma'
                    ],
                    tips: [
                        'Choose w carefully - usually w depends on p',
                        'Remember: you don\'t control where y is placed',
                        'Consider all possible positions of y (within first p symbols)',
                        'Often i=0 or i=2 is enough to show violation'
                    ]
                },
                {
                    title: 'Pumping Lemma: Rigorous Proof Example',
                    content: `Let's prove L = {0ⁿ1ⁿ | n ≥ 0} is not regular using the pumping lemma.`,
                    example: {
                        description: 'Complete formal proof using pumping lemma',
                        code: `Theorem: L = {0ⁿ1ⁿ | n ≥ 0} is not regular.

Proof by Contradiction:
Assume, for the sake of contradiction, that L is regular.
Then by the Pumping Lemma, there exists p ≥ 1 (the pumping length).

Choose w = 0ᵖ1ᵖ.
Note that:
  • w ∈ L (by definition, equal 0s and 1s)
  • |w| = 2p ≥ p (satisfies length requirement)

By the Pumping Lemma, w can be decomposed as w = xyz where:
  (1) |xy| ≤ p
  (2) |y| ≥ 1
  (3) ∀i ≥ 0: xyⁱz ∈ L

Analysis of decomposition:
Since |xy| ≤ p and w = 0ᵖ1ᵖ, the substring xy consists entirely of 0s.
(The first p symbols of w are all 0s)

Therefore:
  • x = 0ᵃ for some a ≥ 0
  • y = 0ᵇ for some b ≥ 1  (from condition 2)
  • z = 0ᶜ1ᵖ where a + b + c = p

Consider i = 2 (pumping up):
xy²z = x · y · y · z
     = 0ᵃ · 0ᵇ · 0ᵇ · 0ᶜ1ᵖ
     = 0ᵃ⁺²ᵇ⁺ᶜ1ᵖ
     = 0ᵖ⁺ᵇ1ᵖ

Count the symbols:
  • Number of 0s: p + b
  • Number of 1s: p
  • Since b ≥ 1, we have p + b > p

Therefore xy²z has MORE 0s than 1s, so xy²z ∉ L.

This contradicts condition (3) of the Pumping Lemma.
Therefore, our assumption was wrong, and L is not regular. ∎`
                    },
                    keyPoints: [
                        'We chose w = 0ᵖ1ᵖ to force y to be all 0s',
                        'Used i=2 to pump up and create imbalance',
                        'Could also use i=0 to pump down: xy⁰z = xz = 0ᵖ⁻ᵇ1ᵖ ∉ L',
                        'The key is that ANY decomposition satisfying (1) and (2) fails (3)'
                    ],
                    tips: [
                        'For 0ⁿ1ⁿ: choose w = 0ᵖ1ᵖ',
                        'For aⁿbⁿ: similar strategy with w = aᵖbᵖ',
                        'For palindromes: choose w that breaks symmetry when pumped',
                        'For primes: choose w = 0ᵖ where p is prime, pump to composite'
                    ]
                },
                {
                    title: 'Myhill-Nerode vs Pumping Lemma',
                    content: `Both techniques prove non-regularity, but they have different strengths.

Pumping Lemma:
• More widely known and taught
• Works well for "counting" languages (0ⁿ1ⁿ)
• Requires choosing specific string and pumping position
• Sometimes difficult to handle all possible decompositions

Myhill-Nerode Theorem:
• More powerful and general
• Gives exact characterization of regular languages
• Often cleaner and more elegant proofs
• Directly connects to DFA state minimization
• Works well when distinguishing suffixes are clear

When to use which:
• Pumping Lemma: Good for sequences with counting (aⁿbⁿ, 0ⁿ1ⁿ)
• Myhill-Nerode: Better for languages with complex structure
• Both can prove the same results, but one may be easier

Example where Myhill-Nerode is cleaner:
L = {w ∈ {0,1}* | w has equal 0s and 1s}
Myhill-Nerode: Use S = {0ⁿ | n ≥ 0}, distinguish with 1ⁿ
Pumping Lemma: Must carefully handle all possible y positions`,
                    keyPoints: [
                        'Myhill-Nerode gives the MINIMUM state count',
                        'Pumping Lemma only proves non-regularity',
                        'Myhill-Nerode can be used to minimize DFAs',
                        'Both are important tools in formal language theory'
                    ]
                },
                {
                    title: 'Hopcroft\'s Minimization Algorithm',
                    content: `Hopcroft's algorithm minimizes a DFA in O(n log n) time where n is the number of states.

Algorithm outline:
1. Remove unreachable states
2. Partition states into equivalence classes:
   - Initially: P = {F, Q \\ F}
   - Refine partitions until no more refinement is possible
3. Two states q, r are in the same class if:
   - They're currently in the same partition
   - For all a ∈ Σ, δ(q,a) and δ(r,a) are in the same partition
4. Merge states in the same equivalence class

The result is the UNIQUE minimal DFA (up to isomorphism).`,
                    example: {
                        description: 'Minimization process example',
                        code: `Initial DFA:
States: {q0, q1, q2, q3, q4}
q0 → q1 on 0, q3 on 1
q1 → q2 on 0, q4 on 1
q2 → q1 on 0,1
q3 → q4 on 0,1
q4 → q4 on 0,1
F = {q2, q4}

Step 1: Initial partition
P₀ = {{q0,q1,q3}, {q2,q4}}

Step 2: Refine on symbol '0'
{q0,q1,q3} splits based on where 0 goes
P₁ = {{q0}, {q1,q3}, {q2,q4}}

Step 3: Continue refining...
Final: P = {{q0}, {q1,q3}, {q2,q4}}

Minimal DFA has 3 states`
                    },
                    keyPoints: [
                        'The minimal DFA is UNIQUE (up to state renaming)',
                        'Running time: O(n log n) - very efficient',
                        'Always remove unreachable states first',
                        'This is the standard algorithm used in practice'
                    ]
                }
            ]
        },
        {
            id: 'dfa-3',
            title: 'Advanced DFA Theory and Applications',
            description: 'Explore advanced topics including product construction, quotient languages, and real-world applications',
            steps: [
                {
                    title: 'Product Construction for Intersection',
                    content: `Given DFAs M₁ = (Q₁, Σ, δ₁, q₁, F₁) and M₂ = (Q₂, Σ, δ₂, q₂, F₂), we construct M = M₁ ∩ M₂ that accepts L(M₁) ∩ L(M₂).

Construction:
M = (Q₁ × Q₂, Σ, δ, (q₁, q₂), F₁ × F₂)

where δ((p,q), a) = (δ₁(p,a), δ₂(q,a))

Proof of correctness:
Need to show: w ∈ L(M) ⟺ w ∈ L(M₁) ∩ L(M₂)

By induction on |w|:
δ*((q₁,q₂), w) = (δ₁*(q₁,w), δ₂*(q₂,w))

So δ*((q₁,q₂), w) ∈ F₁ × F₂
⟺ δ₁*(q₁,w) ∈ F₁ AND δ₂*(q₂,w) ∈ F₂
⟺ w ∈ L(M₁) AND w ∈ L(M₂) ∎`,
                    example: {
                        description: 'Intersecting two simple DFAs',
                        code: `M₁: accepts strings with even length
M₂: accepts strings ending in '0'

Product states:
(even, ends0), (even, !ends0)
(odd, ends0), (odd, !ends0)

Result: accepts strings with even length AND ending in '0'`
                    },
                    keyPoints: [
                        'Product construction simulates two DFAs in parallel',
                        'Number of states: |Q₁| × |Q₂| (can be large!)',
                        'For union, use F = (F₁ × Q₂) ∪ (Q₁ × F₂)',
                        'This is a fundamental construction in automata theory'
                    ]
                },
                {
                    title: 'Applications in Compiler Design',
                    content: `DFAs are fundamental in lexical analysis (tokenization) phase of compilers.

Lexical Analysis Pipeline:
1. Regular expressions define token patterns
2. Convert regexes to NFAs (Thompson's construction)
3. Convert NFA to DFA (subset construction)
4. Minimize DFA for efficiency
5. Implement as lookup table

Example tokens:
- Identifiers: [a-zA-Z][a-zA-Z0-9]*
- Integers: [0-9]+
- Floats: [0-9]+\\.[0-9]+
- Keywords: if|while|for|return

The lexer uses a DFA to scan input and recognize tokens efficiently in O(n) time where n is input length.`,
                    keyPoints: [
                        'Every modern compiler uses DFAs for tokenization',
                        'Performance critical: DFA lookup is O(1) per character',
                        'Real tools: lex, flex, re2 all use DFAs internally',
                        'DFA minimization crucial for production compilers'
                    ]
                },
                {
                    title: 'Quotient Languages and Homomorphisms',
                    content: `The quotient of language L by string u is:
L / u = {v | uv ∈ L}

Theorem: If L is regular, then L / u is regular for all u.

Proof: If M = (Q, Σ, δ, q₀, F) accepts L, then M' = (Q, Σ, δ, δ*(q₀, u), F) accepts L / u.

String homomorphism: h: Σ* → Γ* where h(ε) = ε and h(uv) = h(u)h(v).

Theorem: If L is regular and h is a homomorphism, then:
1. h(L) is regular (homomorphic image)
2. h⁻¹(L) is regular (inverse homomorphism)

These operations preserve regularity and are useful in proving closure properties.`,
                    keyPoints: [
                        'Quotient languages formalize "what remains"',
                        'Closure under quotient is another regular language property',
                        'Homomorphisms provide a way to "map" languages',
                        'These concepts connect to formal language theory'
                    ]
                }
            ]
        }
    ],
    exercises: [
        {
            id: 'dfa-ex-1',
            title: 'Formal Definitions and Basic Theory',
            description: 'Test your understanding of DFA formal definitions',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'Given M = (Q, Σ, δ, q₀, F), what is the domain and codomain of the transition function δ?',
                    options: [
                        'δ: Q → Q',
                        'δ: Q × Σ → Q',
                        'δ: Q × Σ* → Q',
                        'δ: Σ* → Q'
                    ],
                    correctAnswer: 'δ: Q × Σ → Q',
                    explanation: 'The transition function δ takes a state and a single input symbol and returns a single next state. Its signature is δ: Q × Σ → Q.',
                    hint: 'What are the inputs to δ? A state and a symbol. What does it output?'
                },
                {
                    type: 'multiple-choice',
                    question: 'If M has n states and alphabet size k, how many transitions does δ define?',
                    options: [
                        'n',
                        'k',
                        'n + k',
                        'n × k'
                    ],
                    correctAnswer: 'n × k',
                    explanation: 'Since δ is a total function, it must be defined for every (state, symbol) pair. With n states and k symbols, there are exactly n × k transitions.',
                    hint: 'δ must be defined for every combination of state and symbol.'
                },
                {
                    type: 'true-false',
                    question: 'A DFA can have no accept states (F = ∅).',
                    options: ['True', 'False'],
                    correctAnswer: 'True',
                    explanation: 'True. If F = ∅, then L(M) = ∅ (the empty language). This is a valid DFA that rejects all strings.',
                    hint: 'What language would such a DFA accept?'
                },
                {
                    type: 'multiple-choice',
                    question: 'For the extended transition function δ*, what is δ*(q, ε) for any state q?',
                    options: [
                        'q₀ (the start state)',
                        'q (the same state)',
                        'Some state in F',
                        'Undefined'
                    ],
                    correctAnswer: 'q (the same state)',
                    explanation: 'By definition, δ*(q, ε) = q. Reading the empty string doesn\'t change the state - this is the base case of the recursive definition.',
                    hint: 'What happens when you read no symbols?'
                },
                {
                    type: 'multiple-choice',
                    question: 'Which operation does NOT preserve regularity (i.e., if L is regular, the result might not be)?',
                    options: [
                        'L̄ (complement)',
                        'L₁ ∪ L₂ (union)',
                        'L₁ ∩ L₂ (intersection)',
                        'None - all preserve regularity'
                    ],
                    correctAnswer: 'None - all preserve regularity',
                    explanation: 'Regular languages are closed under complement, union, intersection, concatenation, and Kleene star. All these operations preserve regularity.',
                    hint: 'Remember the closure properties of regular languages.'
                }
            ]
        },
        {
            id: 'dfa-ex-2',
            title: 'State Minimization and Equivalence',
            description: 'Advanced exercises on DFA minimization and the Myhill-Nerode theorem',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'According to the Myhill-Nerode theorem, what determines the minimum number of states needed for a DFA accepting language L?',
                    options: [
                        'The length of the shortest string in L',
                        'The number of symbols in the alphabet',
                        'The number of equivalence classes of ≡ₗ',
                        'The number of strings in L'
                    ],
                    correctAnswer: 'The number of equivalence classes of ≡ₗ',
                    explanation: 'The Myhill-Nerode theorem states that the minimum number of states equals the index (number of equivalence classes) of the indistinguishability relation ≡ₗ.',
                    hint: 'What does the Myhill-Nerode theorem relate states to?'
                },
                {
                    type: 'multiple-choice',
                    question: 'To prove L = {0ⁿ1ⁿ | n ≥ 0} is not regular using Myhill-Nerode, which set of strings would you show are pairwise distinguishable?',
                    options: [
                        '{ε, 01, 0011, 000111, ...}',
                        '{0, 00, 000, 0000, ...}',
                        '{1, 11, 111, 1111, ...}',
                        '{01, 10, 0110, 1001, ...}'
                    ],
                    correctAnswer: '{0, 00, 000, 0000, ...}',
                    explanation: 'The strings 0ⁿ for different values of n are pairwise distinguishable. For i ≠ j, we can distinguish 0ⁱ and 0ʲ using the suffix 1ⁱ.',
                    hint: 'You need an infinite set where each pair can be distinguished by some suffix.'
                },
                {
                    type: 'true-false',
                    question: 'The minimal DFA for a regular language is unique up to isomorphism (state renaming).',
                    options: ['True', 'False'],
                    correctAnswer: 'True',
                    explanation: 'True. The Myhill-Nerode theorem guarantees that the minimal DFA is unique up to isomorphism. Any two minimal DFAs for the same language are identical except for state names.',
                    hint: 'Think about what the Myhill-Nerode theorem guarantees.'
                },
                {
                    type: 'multiple-choice',
                    question: 'In Hopcroft\'s minimization algorithm, what is the initial partition of states?',
                    options: [
                        'Each state in its own partition',
                        '{F, Q \\ F} (accept vs non-accept)',
                        'States grouped by outgoing transitions',
                        'States in breadth-first order from q₀'
                    ],
                    correctAnswer: '{F, Q \\ F} (accept vs non-accept)',
                    explanation: 'The initial partition separates accept states from non-accept states. This is the coarsest partition that distinguishes strings in L from those not in L.',
                    hint: 'What\'s the most basic distinction between states?'
                },
                {
                    type: 'multiple-choice',
                    question: 'What is the time complexity of Hopcroft\'s DFA minimization algorithm?',
                    options: [
                        'O(n)',
                        'O(n log n)',
                        'O(n²)',
                        'O(n² log n)'
                    ],
                    correctAnswer: 'O(n log n)',
                    explanation: 'Hopcroft\'s algorithm runs in O(n log n) time where n is the number of states. This is optimal for the general case.',
                    hint: 'This is a famous algorithm known for its efficiency.'
                }
            ]
        },
        {
            id: 'dfa-ex-3',
            title: 'Advanced DFA Theory',
            description: 'Challenging problems on product construction and advanced topics',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'If M₁ has n₁ states and M₂ has n₂ states, how many states does the product construction M₁ × M₂ have?',
                    options: [
                        'n₁ + n₂',
                        'n₁ × n₂',
                        '2^(n₁ + n₂)',
                        'n₁^n₂'
                    ],
                    correctAnswer: 'n₁ × n₂',
                    explanation: 'The product construction creates a state for every pair (q₁, q₂) where q₁ ∈ Q₁ and q₂ ∈ Q₂, giving n₁ × n₂ states total.',
                    hint: 'States in the product are pairs (q₁, q₂).'
                },
                {
                    type: 'true-false',
                    question: 'Product construction can be modified to compute L₁ ∪ L₂ by changing only the accept states.',
                    options: ['True', 'False'],
                    correctAnswer: 'True',
                    explanation: 'True. For union, set F = (F₁ × Q₂) ∪ (Q₁ × F₂). A string is accepted if it\'s accepted by either M₁ or M₂.',
                    hint: 'What needs to change to go from intersection to union?'
                },
                {
                    type: 'multiple-choice',
                    question: 'In compiler design, what is the typical time complexity of tokenizing an input of length n using a DFA-based lexer?',
                    options: [
                        'O(log n)',
                        'O(n)',
                        'O(n log n)',
                        'O(n²)'
                    ],
                    correctAnswer: 'O(n)',
                    explanation: 'DFA-based lexical analysis runs in O(n) time because each character requires exactly one state transition (O(1) lookup in a transition table).',
                    hint: 'How many state transitions are needed per character?'
                },
                {
                    type: 'multiple-choice',
                    question: 'What is the quotient language L / u?',
                    options: [
                        '{v | v ∈ L and u ∈ L}',
                        '{v | uv ∈ L}',
                        '{v | vu ∈ L}',
                        '{v | u is a substring of v}'
                    ],
                    correctAnswer: '{v | uv ∈ L}',
                    explanation: 'L / u = {v | uv ∈ L}. It\'s the set of strings v such that prepending u gives a string in L.',
                    hint: 'The quotient asks: "what can follow u to get a string in L?"'
                },
                {
                    type: 'true-false',
                    question: 'If L is regular and h is a string homomorphism, then both h(L) and h⁻¹(L) are regular.',
                    options: ['True', 'False'],
                    correctAnswer: 'True',
                    explanation: 'True. Regular languages are closed under both homomorphic images and inverse homomorphisms. These are important closure properties.',
                    hint: 'This is a closure property of regular languages.'
                }
            ]
        },
        {
            id: 'dfa-ex-hands-on',
            title: 'Hands-On: Build Your Own DFAs',
            description: 'Practice building DFAs in the simulator with guided challenges',
            questions: [
                {
                    type: 'hands-on',
                    question: 'Build a DFA that accepts all strings over {0,1} ending with \'1\'',
                    image: require('./Images/dfa_ending_with_1.png'),
                    simulatorType: 'DFA',
                    challenge: {
                        description: 'Your DFA should accept any string that ends with the symbol "1". Examples: "1", "01", "11", "001", "101" should be accepted. Examples: "", "0", "10", "100" should be rejected.',
                        testCases: [
                            { input: '1', expected: true, description: 'Single 1' },
                            { input: '01', expected: true, description: 'Ends with 1' },
                            { input: '11', expected: true, description: 'Ends with 1' },
                            { input: '001', expected: true, description: 'Ends with 1' },
                            { input: '101', expected: true, description: 'Ends with 1' },
                            { input: '', expected: false, description: 'Empty string' },
                            { input: '0', expected: false, description: 'Ends with 0' },
                            { input: '10', expected: false, description: 'Ends with 0' },
                            { input: '100', expected: false, description: 'Ends with 0' },
                            { input: '110', expected: false, description: 'Ends with 0' }
                        ],
                        hints: [
                            'You need exactly 2 states: one for "not ending in 1" and one for "ending in 1"',
                            'Start in the "not ending in 1" state',
                            'When you read a 1, go to the "ending in 1" state',
                            'When you read a 0, go back to the "not ending in 1" state (since now it ends in 0)',
                            'Only the "ending in 1" state should be an accept state'
                        ]
                    },
                    explanation: 'This DFA tracks whether the last symbol read was a "1". State q₀ represents "haven\'t seen 1 yet" or "last was 0", and q₁ represents "last symbol was 1".'
                },
                {
                    type: 'hands-on',
                    question: 'Build a DFA that accepts all strings over {0,1} with an even number of 0s',
                    image: require('./Images/dfa_even_zeros.png'),
                    simulatorType: 'DFA',
                    challenge: {
                        description: 'Your DFA should accept strings like "", "1", "00", "1001" and reject "0", "10", "101", "001". Think about using two states to track whether you\'ve seen an even or odd number of 0s.',
                        testCases: [
                            { input: '', expected: true, description: 'Empty string (0 zeros = even)' },
                            { input: '1', expected: true, description: 'Only 1s (0 zeros = even)' },
                            { input: '11', expected: true, description: 'Multiple 1s' },
                            { input: '0', expected: false, description: 'Single 0 (odd)' },
                            { input: '00', expected: true, description: 'Two 0s (even)' },
                            { input: '000', expected: false, description: 'Three 0s (odd)' },
                            { input: '101', expected: false, description: 'One 0 with 1s (odd)' },
                            { input: '1001', expected: true, description: 'Two 0s' },
                            { input: '10010', expected: false, description: 'Three 0s' }
                        ],
                        hints: [
                            'You need exactly 2 states: one representing "even count" and one for "odd count"',
                            'Start in the "even" state (zero 0s seen so far)',
                            'On reading a 0, switch between the two states',
                            'On reading a 1, stay in the same state',
                            'Mark the "even" state as the accept state'
                        ]
                    },
                    explanation: 'This DFA uses two states to track the parity (even/odd) of the number of 0s encountered. Each 0 flips the parity, while 1s don\'t affect it.'
                },
                {
                    type: 'hands-on',
                    question: 'Build a DFA that accepts all strings over {0,1} that end with "01"',
                    simulatorType: 'DFA',
                    challenge: {
                        description: 'Your DFA must accept any string that ends with the pattern "01". Examples: "01", "001", "101", "1101" should be accepted. Examples: "0", "1", "10", "100" should be rejected.',
                        testCases: [
                            { input: '01', expected: true, description: 'Exactly "01"' },
                            { input: '001', expected: true, description: 'Ends with 01' },
                            { input: '101', expected: true, description: 'Ends with 01' },
                            { input: '1101', expected: true, description: 'Ends with 01' },
                            { input: '0', expected: false, description: 'Doesn\'t end with 01' },
                            { input: '1', expected: false, description: 'Doesn\'t end with 01' },
                            { input: '10', expected: false, description: 'Ends with 10' },
                            { input: '100', expected: false, description: 'Ends with 00' },
                            { input: '0101', expected: true, description: 'Ends with 01' }
                        ],
                        hints: [
                            'Think about what you need to remember: the last symbol(s) you\'ve seen',
                            'You need at least 3 states to track: nothing/other, just saw 0, just saw 01',
                            'When you see "01" in sequence, go to an accept state',
                            'Make sure to handle cases where the pattern appears in the middle too'
                        ]
                    },
                    explanation: 'This DFA tracks the last characters seen. It needs states to remember when it has seen a "0" and then transitions to an accept state when it sees "1" after that "0".'
                },
                {
                    type: 'hands-on',
                    question: 'Build a minimal DFA that accepts strings over {a,b} containing the substring "aba"',
                    simulatorType: 'DFA',
                    challenge: {
                        description: 'Your DFA should accept any string that contains "aba" anywhere within it. Once "aba" is found, the string should be accepted regardless of what follows.',
                        testCases: [
                            { input: 'aba', expected: true, description: 'Exactly "aba"' },
                            { input: 'aaba', expected: true, description: 'Contains "aba"' },
                            { input: 'abab', expected: true, description: 'Contains "aba"' },
                            { input: 'baba', expected: true, description: 'Contains "aba"' },
                            { input: 'abaaba', expected: true, description: 'Multiple "aba"' },
                            { input: 'a', expected: false, description: 'Too short' },
                            { input: 'ab', expected: false, description: 'Incomplete' },
                            { input: 'abb', expected: false, description: 'No "aba"' },
                            { input: 'bbb', expected: false, description: 'No "aba"' },
                            { input: 'aabaa', expected: false, description: 'No "aba"' }
                        ],
                        hints: [
                            'You need 4 states: one for each prefix of "aba" and one for having seen "aba"',
                            'States could represent: seen nothing/other, seen "a", seen "ab", seen "aba"',
                            'Once you reach the "seen aba" state, stay there (it\'s a trap state)',
                            'Be careful: seeing "ab" followed by "b" should reset your progress'
                        ]
                    },
                    explanation: 'This DFA progressively matches the pattern "aba". It uses 4 states to track how much of the pattern has been matched, and once complete, stays in an accept state.'
                }
            ]
        }
    ]
};

