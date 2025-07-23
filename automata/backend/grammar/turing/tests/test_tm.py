from automata.backend.grammar.turing import TuringMachine


def test_tm_even_as():
    states = {"q0", "q1", "qa", "qr"}
    tape_symbols = {"a", "_"}
    blank = "_"
    transitions = {
        ("q0", "a"): ("q1", "a", "R"),
        ("q1", "a"): ("q0", "a", "R"),
        ("q0", "_"): ("qa", "_", "R"),
        ("q1", "_"): ("qr", "_", "R"),
    }
    tm = TuringMachine(
        states=states,
        tape_symbols=tape_symbols,
        blank=blank,
        transitions=transitions,
        start_state="q0",
        accept_states={"qa"},
        reject_states={"qr"},
    )

    assert tm.run("aa")
    assert tm.run("")
    assert not tm.run("a")
