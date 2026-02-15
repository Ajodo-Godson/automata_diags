import graphviz

from automata.backend.drawings.tm_drawer import TMDrawer
from automata.backend.grammar.turing_machines import TuringMachine


def _build_simple_tm():
    transitions = {
        "q0": {
            "1": ("halt", "1", "N"),
            "_": ("halt", "_", "N"),
        }
    }
    return TuringMachine(
        states={"q0", "halt"},
        input_alphabet={"1"},
        tape_alphabet={"1", "_"},
        transitions=transitions,
        start_state="q0",
        blank_symbol="_",
        final_states={"halt"},
    )


def test_draw_turing_machine_returns_output_path(tmp_path, monkeypatch):
    tm = _build_simple_tm()
    rendered = {}

    def fake_render(self, filename, view=False, cleanup=True):
        rendered["filename"] = filename
        rendered["view"] = view
        rendered["cleanup"] = cleanup
        return str(filename)

    monkeypatch.setattr(graphviz.Digraph, "render", fake_render)
    drawer = TMDrawer(output_dir=str(tmp_path))

    output = drawer.draw_turing_machine(tm, "simple_tm")

    assert output == f"{tmp_path / 'simple_tm'}.png"
    assert rendered["filename"] == str(tmp_path / "simple_tm")
    assert rendered["view"] is False
    assert rendered["cleanup"] is True
