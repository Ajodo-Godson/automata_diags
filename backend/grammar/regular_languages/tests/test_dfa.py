from grammar.regular_languages.dfa.dfa_mod import DFA


dfa1 = DFA(Q={1, 2, 3}, Σ={"0", "1"}, δ={...}, q0=1, F={3})

# Using plain English names
dfa2 = DFA.create(
    states={1, 2, 3},
    alphabet={"0", "1"},
    transitions={...},
    start_state=1,
    accept_states={3},
)

# Using just a transition table
dfa3 = DFA.from_table(
    transition_table={1: {"0": 2, "1": 3}, 2: {"0": 2, "1": 3}, 3: {"0": 3, "1": 3}},
    start_state=1,
    accept_states={3},
)
