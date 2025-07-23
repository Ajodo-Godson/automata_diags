from automata.backend.grammar.context_free.pda.pda_mod import PDA


def test_pda_anbn():
    states = {"q0", "q1", "q2"}
    input_symbols = {"a", "b"}
    stack_symbols = {"A", "Z"}
    transitions = {
        ("q0", "a", "Z"): {("q0", ["Z", "A"])},
        ("q0", "a", "A"): {("q0", ["A", "A"])},
        ("q0", "b", "A"): {("q1", [])},
        ("q1", "b", "A"): {("q1", [])},
        ("q1", "", "Z"): {("q2", ["Z"])},
    }
    pda = PDA(
        states=states,
        input_symbols=input_symbols,
        stack_symbols=stack_symbols,
        transitions=transitions,
        start_state="q0",
        start_stack_symbol="Z",
        accept_states={"q2"},
    )

    assert pda.accepts("ab")
    assert pda.accepts("aaabbb")
    assert not pda.accepts("aabbb")
