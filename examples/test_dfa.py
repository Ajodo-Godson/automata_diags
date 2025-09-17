from automata import create_dfa_from_table, AutomataDrawer

# Create a DFA that accepts strings containing 'aa'
dfa = create_dfa_from_table(
    table={
        "q0": {"a": "q1", "b": "q0"},
        "q1": {"a": "q2", "b": "q0"},
        "q2": {"a": "q2", "b": "q2"},
    },
    start_state="q0",
    accept_states={"q2"},
    alphabet={"a", "b"},
)

# Test and visualize
drawer = AutomataDrawer()
output_path = drawer.draw_dfa_from_object(dfa, "dfa_aa")
