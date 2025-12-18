// NFA Tutorial Content - Rigorous Treatment

export const nfaTutorial = {
    description: "Master Nondeterministic Finite Automata through formal definitions, equivalence with DFAs, and conversion algorithms.",
    lessons: [
        {
            id: 'nfa-0',
            title: 'Introduction: The Power of Nondeterminism',
            description: 'An intuitive introduction to NFAs and why nondeterminism makes design easier',
            steps: [
                {
                    title: 'The Problem with Determinism',
                    content: `In a DFA, every move is uniquely determined. For a given state and input symbol, there is exactly one choice. This is simple, but sometimes designing a DFA directly is complicated.

Consider the language L = {w | w ends in 01}.
A DFA would need to "remember" if the last symbol was a 0, in case the current one is a 1.

States needed:
• q₀: Start state (haven't seen a 0)
• q₁: Just saw a 0
• q₂: Just saw "01" (accept state)

This is manageable. Now consider L = {w | w contains the substring 1101}. Building the DFA for this is much more complex, as you have to track partial matches.`,
                    keyPoints: [
                        'DFAs require explicit tracking of all possibilities',
                        'Complex patterns require many states',
                        'Design becomes tedious for certain languages',
                        'There must be a better way...'
                    ]
                },
                {
                    title: 'Nondeterminism: Parallel Universes',
                    content: `Nondeterminism introduces choice. A Nondeterministic Finite Automaton (NFA) can have multiple possible next states for a given state and input symbol.

It's like having parallel universes. When an NFA sees an input, it can "split" into multiple copies of itself, each one following one of the possible paths.

An NFA accepts a string if at least one of these paths ends in an accept state after reading the entire string.

How Nondeterminism Works:

An NFA can have two types of "choice":

1. Multiple Transitions: From one state, the same input symbol can lead to multiple different states.
   Example: δ(q₀, 1) = {q₁, q₂}

2. Epsilon-Transitions (ε): An NFA can transition to another state without reading any input symbol. This is a "free move."
   Example: δ(q₀, ε) = q₁ (The NFA can spontaneously jump from q₀ to q₁ at any time).`,
                    keyPoints: [
                        'Nondeterminism = multiple choices at each step',
                        'Think of it as "guessing" the right path',
                        'Accept if ANY path succeeds',
                        'ε-transitions allow "free moves"'
                    ],
                    tips: [
                        'Nondeterminism doesn\'t mean "random" - it means "all possibilities explored"',
                        'In practice, NFAs are simulated by trying all paths',
                        'ε-transitions are incredibly useful for combining automata',
                        'NFAs are often much simpler to design than DFAs'
                    ]
                },
                {
                    title: 'Example: NFA for Strings Ending in "01"',
                    content: `Let's build an NFA for L = {w | w ends in 01}. It's much simpler than the DFA!

Intuition: "We're just waiting. At some point, we guess that the next two symbols are '01'. If our guess is right and it's the end of the string, we accept."

Formal Definition:

Q = {q₀, q₁, q₂}
Σ = {0, 1}
q₀: Start state
F = {q₂}

Transitions:
• δ(q₀, 0) = {q₀, q₁}  (Either stay in q₀ OR guess this is the start of "01")
• δ(q₀, 1) = {q₀}      (Stay in q₀)
• δ(q₁, 1) = {q₂}      (If we're in q₁ (just saw '0'), and now see '1', move to accept)`,
                    example: {
                        description: 'State diagram and execution trace',
                        code: `State Diagram:

         0,1
         / \\
         +--+
         |
  -> (q₀) --0--> (q₁) --1--> ((q₂))  ← Accept state

Tracing execution on input "101":
Input: "101"

Start at q₀.

Read '1':
  Path 1: δ(q₀, 1) → q₀  (Current states: {q₀})

Read '0':
  Path 1: From q₀, read '0'. δ(q₀, 0) → {q₀, q₁}
  The NFA "splits"! (Current states: {q₀, q₁})

Read '1':
  Path 1 (from q₀): δ(q₀, 1) → q₀
  Path 2 (from q₁): δ(q₁, 1) → q₂
  
End of string. The set of states we are in is {q₀, q₂}.

Since this set contains an accept state (q₂), the string is ACCEPTED. ✓

Input: "00"
Start at q₀.
Read '0': δ(q₀, 0) → {q₀, q₁}  (Current: {q₀, q₁})
Read '0':
  Path 1 (from q₀): δ(q₀, 0) → {q₀, q₁}
  Path 2 (from q₁): δ(q₁, 0) → ∅ (dead end)
  
End of string. Current states: {q₀, q₁}

This set does NOT contain an accept state. The string is REJECTED. ✗`
                    },
                    keyPoints: [
                        'NFAs track a SET of possible states',
                        'Each symbol can cause "splitting"',
                        'Accept if final set contains any accept state',
                        'Much simpler than equivalent DFA!'
                    ]
                },
                {
                    title: 'Example: NFA with ε-Transitions',
                    content: `Language: L = {w | w is 'a' or 'b' or 'ab'}

This NFA has 3 branches from the start:

Path 1 (top): Reads 'a', accepts.
Path 2 (middle): Reads 'b', accepts.
Path 3 (bottom): Takes a free move (ε) to q₃, then looks for 'a', then 'b'.

This ε-transition allows us to "glue" different automata together to recognize the union of their languages.`,
                    example: {
                        description: 'State diagram',
                        code: `         a
         +------> ((q₁))  ← Accept
         |
  -> (q₀) --b--> ((q₂))  ← Accept
         |
         +--ε--> (q₃) --a--> (q₄) --b--> ((q₅))  ← Accept`
                    },
                    keyPoints: [
                        'ε-transitions enable modular construction',
                        'Can combine multiple automata easily',
                        'Very useful for building complex languages',
                        'Think of ε as "free move" or "empty string"'
                    ],
                    tips: [
                        'ε-transitions are like "shortcuts"',
                        'They don\'t consume input',
                        'Can be taken at any time',
                        'Essential for Thompson\'s construction (regex → NFA)'
                    ]
                },
                {
                    title: 'Equivalence of NFAs and DFAs',
                    content: `This is a fundamental theorem of automata theory:

A language is regular if and only if some NFA recognizes it.

This means that for any NFA, you can construct an equivalent DFA that accepts the exact same language. NFAs are not more powerful than DFAs, they are just a different (and often more convenient) way of describing computation.

The process of converting an NFA to a DFA is called Subset Construction.

Idea: The NFA can be in a set of states at any time. We create a DFA where each state corresponds to a set of NFA states.

If the NFA has k states, the equivalent DFA could have up to 2^k states (the number of possible subsets).

The start state of the DFA is the set of states the NFA can be in at the beginning (the NFA's q₀ plus anything reachable by ε-moves).

An accept state in the DFA is any set-state that contains at least one of the NFA's accept states.

Conclusion:
• DFA: Deterministic, one path. Can be complex to design.
• NFA: Nondeterministic, multiple "guesses." Often easier to design.
• Power: NFAs and DFAs are equally powerful. They both recognize the same class of languages: the Regular Languages.`,
                    keyPoints: [
                        'NFAs and DFAs recognize the same languages',
                        'NFAs are often simpler to design',
                        'Subset construction converts NFA → DFA',
                        'Worst case: exponential blowup (2^k states)'
                    ],
                    tips: [
                        'Use NFAs for design, convert to DFA for implementation',
                        'Most practical NFAs convert to reasonable-sized DFAs',
                        'The exponential worst case is rare in practice',
                        'This equivalence is crucial for automata theory'
                    ]
                }
            ]
        },
        {
            id: 'nfa-1',
            title: 'Formal Definition and Nondeterminism',
            description: 'Rigorous treatment of NFAs, including formal definitions and the power of nondeterminism',
            steps: [
                {
                    title: 'Formal Definition of an NFA',
                    content: `A Nondeterministic Finite Automaton is formally defined as a 5-tuple N = (Q, Σ, δ, q₀, F) where:

• Q is a finite set of states
• Σ is a finite alphabet
• δ: Q × Σ_ε → P(Q) is the transition function
• q₀ ∈ Q is the start state
• F ⊆ Q is the set of accept states

Key differences from DFA:
1. Σ_ε = Σ ∪ {ε} (allows ε-transitions)
2. δ returns a SET of states (P(Q) is the power set of Q)
3. δ(q, a) can be empty, contain one state, or multiple states

Acceptance: N accepts string w if there EXISTS at least one computation path from q₀ that ends in a state in F after reading w.`,
                    example: {
                        description: 'NFA accepting strings ending in "01"',
                        code: `N = (Q, Σ, δ, q₀, F) where:

Q = {q₀, q₁, q₂}
Σ = {0, 1}
F = {q₂}

δ(q₀, 0) = {q₀, q₁}  (nondeterministic choice!)
δ(q₀, 1) = {q₀}
δ(q₁, 1) = {q₂}
δ(q₂, 0) = δ(q₂, 1) = ∅

On input "001":
Possible computations:
{q₀} →0 {q₀,q₁} →0 {q₀,q₁} →1 {q₀,q₂}
Since q₂ ∈ F, accept! ✓`
                    },
                    keyPoints: [
                        'δ maps to P(Q), the set of ALL possible subsets of Q',
                        'Nondeterminism: multiple valid next states possible',
                        'ε-transitions: move without consuming input',
                        'Accept if ANY computation path accepts'
                    ]
                },
                {
                    title: 'Extended Transition Function δ* for NFAs',
                    content: `For NFAs, δ*: Q × Σ* → P(Q) computes the set of all reachable states.

We need ε-closure first:
ε-CLOSE(q) = {r | r is reachable from q using only ε-transitions}

This includes q itself, and any states reachable by following zero or more ε-transitions.

Then δ* is defined:
δ*(q, ε) = ε-CLOSE(q)
δ*(q, wa) = ε-CLOSE(⋃_{r ∈ δ*(q,w)} δ(r, a))

Intuition: From set of states S after reading w, follow an 'a' transition from any state in S, then take ε-closure.

Acceptance: w ∈ L(N) ⟺ δ*(q₀, w) ∩ F ≠ ∅`,
                    example: {
                        description: 'Computing δ* with ε-transitions',
                        code: `NFA with ε-transitions:
q₀ --ε--> q₁
q₀ --a--> q₀
q₁ --b--> q₂

Compute δ*(q₀, "ab"):

ε-CLOSE(q₀) = {q₀, q₁}
δ*(q₀, "a")
= ε-CLOSE(δ(q₀, a) ∪ δ(q₁, a))
= ε-CLOSE({q₀} ∪ ∅)
= {q₀, q₁}

δ*(q₀, "ab")
= ε-CLOSE(δ(q₀, b) ∪ δ(q₁, b))
= ε-CLOSE(∅ ∪ {q₂})
= {q₂}`
                    },
                    keyPoints: [
                        'ε-closure is crucial for NFAs with ε-transitions',
                        'δ* returns a SET of states, not a single state',
                        'Must compute ε-closure after every symbol',
                        'Empty set is possible (computation "dies")'
                    ]
                },
                {
                    title: 'Equivalence of NFAs and DFAs',
                    content: `Fundamental Theorem: NFAs and DFAs are equivalent in computational power.

Theorem: For every NFA N, there exists a DFA M such that L(N) = L(M).

Proof technique: Subset Construction (Rabin-Scott powerset construction)

Conversely, every DFA is trivially an NFA (just make δ return singleton sets).

Consequence: A language L is accepted by some NFA ⟺ L is accepted by some DFA ⟺ L is regular.

Important: While NFAs and DFAs accept the same languages, NFAs can be EXPONENTIALLY more succinct.

Example: Language "strings where k-th symbol from end is 1" requires 2^k DFA states but only k+1 NFA states.`,
                    keyPoints: [
                        'NFAs don\'t add computational power, just convenience',
                        'Subset construction proves equivalence constructively',
                        'DFA from NFA can have exponentially many states',
                        'NFAs are often easier to design and understand'
                    ],
                    tips: [
                        'Use NFAs for design, convert to DFA for implementation',
                        'ε-transitions make constructions cleaner',
                        'Think of nondeterminism as "guessing" the right path',
                        'In practice, many NFAs convert to compact DFAs'
                    ]
                }
            ]
        },
        {
            id: 'nfa-2',
            title: 'Subset Construction Algorithm',
            description: 'Learn the formal subset construction for converting NFAs to DFAs',
            steps: [
                {
                    title: 'The Subset Construction Algorithm',
                    content: `Given NFA N = (Q_N, Σ, δ_N, q₀, F_N), construct DFA M = (Q_M, Σ, δ_M, q₀_M, F_M):

Construction:
1. Q_M = P(Q_N) (states are subsets of N's states)
2. q₀_M = ε-CLOSE(q₀)
3. F_M = {S ⊆ Q_N | S ∩ F_N ≠ ∅}
4. For each S ∈ Q_M and a ∈ Σ:
   δ_M(S, a) = ε-CLOSE(⋃_{q ∈ S} δ_N(q, a))

Optimization: Only construct reachable states (don't enumerate all 2^|Q_N| states).

Proof of correctness:
By induction on |w|, show:
δ_M*(q₀_M, w) = δ_N*(q₀, w)

Therefore: w ∈ L(M) ⟺ w ∈ L(N)`,
                    example: {
                        description: 'Subset construction example',
                        code: `NFA:
Q_N = {q₀, q₁, q₂}
q₀ --0--> {q₀, q₁}
q₀ --1--> {q₀}
q₁ --1--> {q₂}
F_N = {q₂}

Subset Construction:

State {q₀}:
  on 0: {q₀, q₁}
  on 1: {q₀}

State {q₀, q₁}:
  on 0: {q₀, q₁}
  on 1: {q₀, q₂}

State {q₀, q₂}:
  on 0: {q₀, q₁}
  on 1: {q₀}

Reachable DFA states: {q₀}, {q₀,q₁}, {q₀,q₂}
Accept states: {q₀,q₂} (contains q₂)`
                    },
                    keyPoints: [
                        'Each DFA state represents a set of NFA states',
                        'Start state is ε-closure of NFA start state',
                        'Accept if set contains any NFA accept state',
                        'Only build reachable states for efficiency'
                    ]
                },
                {
                    title: 'Complexity Analysis',
                    content: `Worst-case analysis of subset construction:

• NFA states: n
• Potential DFA states: 2^n (all subsets)
• Actual reachable states: often much smaller

Time complexity:
- Naive: O(2^n × |Σ|) to enumerate all states
- On-the-fly: O(m × |Σ|) where m is # reachable states

Space complexity: O(m) for reachable DFA states

Exponential blowup is UNAVOIDABLE in worst case:
Example: L_k = {w | k-th symbol from end is 1}
- NFA: k+1 states
- Minimal DFA: 2^k states

Practical impact: Most real NFAs convert to reasonably sized DFAs.`,
                    keyPoints: [
                        'Theoretical worst case: exponential blowup',
                        'Practice: usually polynomial or small exponential',
                        'Some languages inherently need exponentially more DFA states',
                        'Modern tools handle this well'
                    ],
                    tips: [
                        'Don\'t pre-compute all 2^n states',
                        'Use BFS/DFS to explore only reachable states',
                        'Apply minimization after construction',
                        'Profile real-world cases, not worst case'
                    ]
                },
                {
                    title: 'Eliminating ε-Transitions',
                    content: `Theorem: For every NFA with ε-transitions, there exists an equivalent NFA without ε-transitions.

Algorithm:
1. Compute ε-CLOSE(q) for all states q
2. For each state q and symbol a:
   δ'(q, a) = ⋃_{r ∈ ε-CLOSE(q)} δ(r, a)
   Then apply ε-closure to result
3. If ε-CLOSE(q₀) ∩ F ≠ ∅, add q₀ to F'
   (This handles case where ε is in L(N))

Result: NFA without ε-transitions accepting same language.

Note: This doesn't reduce nondeterminism, just eliminates ε-transitions.`,
                    example: {
                        description: 'Eliminating ε-transitions',
                        code: `Original NFA:
q₀ --ε--> q₁
q₁ --a--> q₂
q₀ --b--> q₂

ε-closures:
ε-CLOSE(q₀) = {q₀, q₁}
ε-CLOSE(q₁) = {q₁}
ε-CLOSE(q₂) = {q₂}

New transitions:
δ'(q₀, a) = ε-CLOSE(δ(q₁, a)) = {q₂}
δ'(q₀, b) = ε-CLOSE(δ(q₀, b)) = {q₂}
δ'(q₁, a) = {q₂}

No ε-transitions remain!`
                    },
                    keyPoints: [
                        'ε-transitions can always be eliminated',
                        'Number of states stays the same',
                        'May increase number of transitions',
                        'Useful preprocessing step'
                    ]
                }
            ]
        },
        {
            id: 'nfa-3',
            title: 'Regular Expressions and NFAs',
            description: 'The connection between regular expressions and NFAs via Kleene\'s theorem',
            steps: [
                {
                    title: 'Kleene\'s Theorem',
                    content: `Kleene's Theorem: The following are equivalent:
1. L is accepted by some DFA
2. L is accepted by some NFA
3. L is described by some regular expression

This establishes three equivalent characterizations of regular languages!

Proof outline:
1→2: Every DFA is an NFA (trivial)
2→3: Convert NFA to regex (state elimination)
3→2: Convert regex to NFA (Thompson's construction)
2→1: Subset construction

This is one of the most important theorems in theoretical computer science.`,
                    keyPoints: [
                        'Three equivalent models of regular languages',
                        'Can convert between any two models',
                        'Each model has advantages for different tasks',
                        'Foundation of lexical analysis and pattern matching'
                    ]
                },
                {
                    title: 'Thompson\'s Construction',
                    content: `Thompson's construction converts regex to NFA compositionally.

Base cases:
• ∅: No accept states
• ε: Start state is accept state with ε-transition
• a ∈ Σ: Two states with transition labeled 'a'

Inductive cases:
• R₁|R₂ (union): Create new start, ε-transition to both
• R₁R₂ (concat): Connect accept states of R₁ to start of R₂ via ε
• R* (star): New start/accept, ε to old start, ε from old accepts back

Result: NFA with O(|r|) states where |r| is regex length.

ε-transitions make this construction elegant and modular.`,
                    example: {
                        description: 'Thompson\'s construction for (a|b)*c',
                        code: `Build incrementally:

1. NFA for 'a': q₀ --a--> q₁
2. NFA for 'b': q₂ --b--> q₃
3. Union a|b:
   q₄ --ε--> q₀ --a--> q₁ --ε--> q₅
   q₄ --ε--> q₂ --b--> q₃ --ε--> q₅
4. (a|b)*: Add ε-loops
5. Concatenate with 'c'

Final: ~10 states with ε-transitions`
                    },
                    keyPoints: [
                        'Compositional: build complex from simple',
                        'Linear size: O(|r|) states',
                        'Heavy use of ε-transitions',
                        'Basis for lex/flex and similar tools'
                    ]
                }
            ]
        }
    ],
    exercises: [
        {
            id: 'nfa-ex-1',
            title: 'NFA Fundamentals',
            description: 'Test understanding of NFA definitions and nondeterminism',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'What is the type signature of the NFA transition function δ?',
                    options: [
                        'δ: Q × Σ → Q',
                        'δ: Q × Σ_ε → P(Q)',
                        'δ: Q × Σ* → P(Q)',
                        'δ: P(Q) × Σ → P(Q)'
                    ],
                    correctAnswer: 'δ: Q × Σ_ε → P(Q)',
                    explanation: 'The NFA transition function takes a state and a symbol from Σ_ε = Σ ∪ {ε}, and returns a set of states (element of power set P(Q)).',
                    hint: 'What are the inputs? What does it return - a state or set of states?'
                },
                {
                    type: 'true-false',
                    question: 'An NFA accepts a string w if ALL computation paths lead to an accept state.',
                    options: ['True', 'False'],
                    correctAnswer: 'False',
                    explanation: 'False! An NFA accepts if AT LEAST ONE (i.e., ANY) computation path leads to an accept state. This is the essence of nondeterminism.',
                    hint: 'Does every path need to succeed, or just one?'
                },
                {
                    type: 'multiple-choice',
                    question: 'What does ε-CLOSE(q) compute?',
                    options: [
                        'All states reachable from q by any path',
                        'All states reachable from q by reading one symbol',
                        'All states reachable from q using only ε-transitions',
                        'The set of accept states reachable from q'
                    ],
                    correctAnswer: 'All states reachable from q using only ε-transitions',
                    explanation: 'ε-CLOSE(q) is the set of all states reachable from q by following zero or more ε-transitions (including q itself).',
                    hint: 'What kind of transitions does ε-closure follow?'
                },
                {
                    type: 'multiple-choice',
                    question: 'Are NFAs more powerful than DFAs in terms of what languages they can recognize?',
                    options: [
                        'Yes, NFAs can recognize more languages',
                        'No, they recognize exactly the same languages',
                        'Sometimes, it depends on the language',
                        'DFAs are more powerful'
                    ],
                    correctAnswer: 'No, they recognize exactly the same languages',
                    explanation: 'NFAs and DFAs are equivalent in power - they both recognize exactly the regular languages. NFAs just provide notational convenience.',
                    hint: 'Think about the fundamental theorem relating NFAs and DFAs.'
                },
                {
                    type: 'multiple-choice',
                    question: 'An NFA with n states can be converted to a DFA with at most how many states?',
                    options: [
                        'n states',
                        'n² states',
                        '2^n states',
                        'n! states'
                    ],
                    correctAnswer: '2^n states',
                    explanation: 'The subset construction creates one DFA state for each subset of NFA states. With n NFA states, there are 2^n possible subsets.',
                    hint: 'DFA states correspond to subsets of NFA states. How many subsets are there?'
                }
            ]
        },
        {
            id: 'nfa-ex-2',
            title: 'Subset Construction',
            description: 'Advanced exercises on NFA to DFA conversion',
            questions: [
                {
                    type: 'multiple-choice',
                    question: 'In the subset construction, what is the start state of the resulting DFA?',
                    options: [
                        '{q₀} where q₀ is the NFA start state',
                        'ε-CLOSE(q₀)',
                        'The set of all NFA states',
                        'The set F_N of NFA accept states'
                    ],
                    correctAnswer: 'ε-CLOSE(q₀)',
                    explanation: 'The DFA start state is ε-CLOSE(q₀), the set of all NFA states reachable from q₀ via ε-transitions.',
                    hint: 'Need to account for ε-transitions from the start state.'
                },
                {
                    type: 'multiple-choice',
                    question: 'Which DFA states are accept states after subset construction?',
                    options: [
                        'Only the set F_N itself',
                        'All sets S where S ⊆ F_N',
                        'All sets S where S ∩ F_N ≠ ∅',
                        'All singleton sets {q} where q ∈ F_N'
                    ],
                    correctAnswer: 'All sets S where S ∩ F_N ≠ ∅',
                    explanation: 'A DFA state S is accepting if it contains at least one NFA accept state. If any state in S is accepting, the DFA accepts.',
                    hint: 'Remember: NFA accepts if ANY path reaches an accept state.'
                },
                {
                    type: 'true-false',
                    question: 'When converting an NFA to DFA, you always need to create all 2^n possible states.',
                    options: ['True', 'False'],
                    correctAnswer: 'False',
                    explanation: 'False! You only need to create reachable states. Use BFS/DFS from the start state to explore only states that can actually be reached.',
                    hint: 'Think about efficiency - do you need states that can never be reached?'
                },
                {
                    type: 'multiple-choice',
                    question: 'For an NFA with 5 states, what is the MAXIMUM number of states the minimal equivalent DFA could have?',
                    options: [
                        '5',
                        '10',
                        '25',
                        '32'
                    ],
                    correctAnswer: '32',
                    explanation: 'After subset construction, you could have up to 2^5 = 32 states. This is the maximum, though minimization might reduce it.',
                    hint: 'Maximum is 2^n, and here n = 5.'
                },
                {
                    type: 'multiple-choice',
                    question: 'The time complexity of on-the-fly subset construction (building only reachable states) is:',
                    options: [
                        'O(n) where n is number of NFA states',
                        'O(m × |Σ|) where m is number of reachable DFA states',
                        'O(2^n × |Σ|) always',
                        'O(n²)'
                    ],
                    correctAnswer: 'O(m × |Σ|) where m is number of reachable DFA states',
                    explanation: 'If we build only reachable states, we process each reachable DFA state once, computing transitions for each symbol in the alphabet.',
                    hint: 'Consider only the states you actually build, not all possible states.'
                }
            ]
        },
        {
            id: 'nfa-ex-hands-on',
            title: 'Hands-On: Build Your Own NFAs',
            description: 'Practice building NFAs in the simulator with guided challenges',
            questions: [
                {
                    type: 'hands-on',
                    question: 'Build an NFA that accepts all strings over {0,1} ending with "01"',
                    simulatorType: 'NFA',
                    challenge: {
                        alphabet: ['0', '1'],
                        description: 'Your NFA should accept any string that ends with "01". Use nondeterminism to "guess" when you see the start of "01". Examples: "01", "001", "101" should be accepted. Examples: "0", "1", "10" should be rejected.',
                        testCases: [
                            { input: '01', expected: true, description: 'Exactly "01"' },
                            { input: '001', expected: true, description: 'Ends with 01' },
                            { input: '101', expected: true, description: 'Ends with 01' },
                            { input: '1101', expected: true, description: 'Ends with 01' },
                            { input: '', expected: false, description: 'Empty string' },
                            { input: '0', expected: false, description: 'Too short' },
                            { input: '1', expected: false, description: 'Too short' },
                            { input: '10', expected: false, description: 'Ends with 10' },
                            { input: '00', expected: false, description: 'Ends with 00' },
                            { input: '0101', expected: true, description: 'Ends with 01' }
                        ],
                        hints: [
                            'You need 3 states to track the pattern',
                            'Use nondeterminism: when you see 0, you can either stay in start OR guess this is the start of "01"',
                            'From the start state on input 0, transition to BOTH the start state AND a new state',
                            'The new state represents "just saw the first 0 of 01"',
                            'Make sure to handle staying in the start state for any input not matching the pattern'
                        ]
                    },
                    explanation: 'This NFA demonstrates the power of nondeterminism. When we see a 0, we non-deterministically guess whether it\'s the start of the final "01" pattern.'
                },
                {
                    type: 'hands-on',
                    question: 'Build an NFA that accepts strings over {0,1} containing "010" as a substring',
                    simulatorType: 'NFA',
                    challenge: {
                        alphabet: ['0', '1'],
                        description: 'Your NFA should accept any string that contains "010" anywhere within it. Once "010" is found, accept regardless of what follows.',
                        testCases: [
                            { input: '010', expected: true, description: 'Exactly "010"' },
                            { input: '0010', expected: true, description: 'Contains "010"' },
                            { input: '0100', expected: true, description: 'Contains "010"' },
                            { input: '1010', expected: true, description: 'Contains "010"' },
                            { input: '0101', expected: true, description: 'Contains "010"' },
                            { input: '00', expected: false, description: 'Too short' },
                            { input: '01', expected: false, description: 'Incomplete' },
                            { input: '111', expected: false, description: 'No "010"' },
                            { input: '011', expected: false, description: 'No "010"' },
                            { input: '0110', expected: false, description: 'No "010"' }
                        ],
                        hints: [
                            'You need 4 states: start, saw "0", saw "01", saw "010"',
                            'Use nondeterminism: at start, on seeing 0, go to both start AND "saw 0" state',
                            'Once you reach the "saw 010" state, stay there (accept state)',
                            'From "saw 0", on input 1, go to "saw 01"',
                            'From "saw 01", on input 0, go to "saw 010" (accept)'
                        ]
                    },
                    explanation: 'This NFA uses nondeterminism to track the pattern "010". It guesses when to start matching and continues until the pattern is found.'
                },
                {
                    type: 'hands-on',
                    question: 'Build an NFA with ε-transitions that accepts strings over {a,b} that are either "a", "b", or "ab"',
                    simulatorType: 'NFA',
                    challenge: {
                        alphabet: ['a', 'b'],
                        description: 'Your NFA should accept exactly three strings: "a", "b", or "ab". Use ε-transitions to create parallel paths from the start state.',
                        testCases: [
                            { input: 'a', expected: true, description: 'Single "a"' },
                            { input: 'b', expected: true, description: 'Single "b"' },
                            { input: 'ab', expected: true, description: 'String "ab"' },
                            { input: '', expected: false, description: 'Empty string' },
                            { input: 'aa', expected: false, description: 'Not in language' },
                            { input: 'ba', expected: false, description: 'Not in language' },
                            { input: 'aba', expected: false, description: 'Too long' },
                            { input: 'abb', expected: false, description: 'Too long' }
                        ],
                        hints: [
                            'Create three separate paths from the start using ε-transitions',
                            'Path 1: ε → state → a → accept state',
                            'Path 2: ε → state → b → accept state',
                            'Path 3: ε → state → a → state → b → accept state',
                            'The ε-transitions allow the NFA to "choose" which path to try'
                        ]
                    },
                    explanation: 'This NFA demonstrates ε-transitions, allowing the machine to non-deterministically choose between multiple paths without consuming input.'
                }
            ]
        }
    ]
};


