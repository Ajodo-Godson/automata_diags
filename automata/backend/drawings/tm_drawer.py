import graphviz
from pathlib import Path
import shutil
import logging
from automata.backend.grammar.turing_machines.standard import TuringMachine
from automata.backend.grammar.turing_machines.multitape import MultiTapeTuringMachine
from automata.backend.grammar.turing_machines.multihead import MultiHeadTuringMachine

logger = logging.getLogger(__name__)

class TMDrawer:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        if not shutil.which("dot"):
            logger.warning(
                "Graphviz 'dot' command not found. Please install Graphviz."
            )

    def _create_graph(self, name: str) -> graphviz.Digraph:
        dot = graphviz.Digraph(name=name, format='png')
        dot.attr(rankdir='LR')
        return dot

    def _add_states(self, dot, tm):
        for state in tm._states:
            shape = 'circle'
            if state in tm._accept_states:
                shape = 'doublecircle'
            
            dot.node(str(state), str(state), shape=shape)
        
        # Start state arrow
        dot.node('fake_start', '', shape='none')
        dot.edge('fake_start', str(tm._start_state))

    def draw_turing_machine(self, tm: TuringMachine, filename: str):
        dot = self._create_graph(filename)
        self._add_states(dot, tm)

        edges = {}
        for src, trans in tm.transitions.items():
            for read, (dst, write, direction) in trans.items():
                label = f"{read} → {write}, {direction}"
                if (src, dst) not in edges:
                    edges[(src, dst)] = []
                edges[(src, dst)].append(label)

        for (src, dst), labels in edges.items():
            dot.edge(str(src), str(dst), label="\n".join(labels))

        try:
            output_path = self.output_dir / filename
            dot.render(str(output_path), view=False, cleanup=True)
            return f"{output_path}.png"
        except graphviz.ExecutableNotFound as e:
            raise RuntimeError(
                "Failed to generate graph. Please ensure Graphviz is properly installed."
            ) from e

    def draw_multitape_turing_machine(self, tm: MultiTapeTuringMachine, filename: str):
        dot = self._create_graph(filename)
        self._add_states(dot, tm)

        edges = {}
        for src, trans in tm.transitions.items():
            for read_tuple, (dst, actions) in trans.items():
                read_str = "(" + ", ".join(map(str, read_tuple)) + ")"
                action_parts = [f"{w}, {d}" for w, d in actions]
                action_str = "(" + "), (".join(action_parts) + ")"
                label = f"{read_str} → {action_str}"
                
                if (src, dst) not in edges:
                    edges[(src, dst)] = []
                edges[(src, dst)].append(label)

        for (src, dst), labels in edges.items():
            dot.edge(str(src), str(dst), label="\n".join(labels))

        try:
            output_path = self.output_dir / filename
            dot.render(str(output_path), view=False, cleanup=True)
            return f"{output_path}.png"
        except graphviz.ExecutableNotFound as e:
            raise RuntimeError(
                "Failed to generate graph. Please ensure Graphviz is properly installed."
            ) from e

    def draw_multihead_turing_machine(self, tm: MultiHeadTuringMachine, filename: str):
        # Logic is identical to multitape for visualization of transitions
        return self.draw_multitape_turing_machine(tm, filename)