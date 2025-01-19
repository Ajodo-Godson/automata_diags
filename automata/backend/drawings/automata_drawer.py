from typing import Dict, Set
import graphviz
from pathlib import Path
import shutil
import logging

logger = logging.getLogger(__name__)


class AutomataDrawer:
    def __init__(self, output_dir: str = "outputs"):
        """
        Initialize the automata drawer with an output directory.

        Args:
            output_dir: Directory where the generated graphs will be saved
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Check if graphviz is installed
        if not shutil.which("dot"):
            logger.warning(
                "Graphviz 'dot' command not found. Please install Graphviz:\n"
                "  - MacOS: brew install graphviz\n"
                "  - Ubuntu/Debian: sudo apt-get install graphviz\n"
                "  - Windows: Download from https://graphviz.org/download/"
            )

    def multi_alphabets_transition():
        """
        This handles cases when there are multiple alphabets from one states to another same direction.
        Instead of drawing multiple edges, we draw a single edge with multiple labels.
        """
        pass

    def draw_dfa(
        self,
        transitions: Dict[str, Dict[str, str]],
        start_state: str,
        accept_states: Set[str],
        filename: str = "dfa",
        format: str = "png",
    ) -> str:
        """
        Draw a DFA using graphviz and save it to a file.

        Args:
            transitions: Transition function of the DFA
            start_state: Initial state of the DFA
            accept_states: Set of accepting states
            filename: Name of the output file (without extension)
            format: Output format (png, pdf, svg, etc.)

        Returns:
            Path to the generated file

        Raises:
            RuntimeError: If Graphviz is not installed
        """
        if not shutil.which("dot"):
            raise RuntimeError(
                "Graphviz is not installed. Please install it first:\n"
                "  - MacOS: brew install graphviz\n"
                "  - Ubuntu/Debian: sudo apt-get install graphviz\n"
                "  - Windows: Download from https://graphviz.org/download/"
            )

        # Create a new directed graph
        dot = graphviz.Digraph(comment="DFA Visualization")
        dot.attr(rankdir="LR")  # Left to right layout

        # Add all states
        all_states = set(transitions.keys())
        for state in all_states:
            # Double circle for accept states, single circle for others
            if state in accept_states:
                dot.node(state, state, shape="doublecircle")
            else:
                dot.node(state, state, shape="circle")

        # Add start state arrow
        dot.node("", "", shape="none")
        dot.edge("", start_state)

        # Add transitions
        for from_state, trans in transitions.items():
            for symbol, to_state in trans.items():
                dot.edge(from_state, to_state, label=symbol)

        try:
            # Save the graph
            output_path = self.output_dir / filename
            dot.render(str(output_path), format=format, cleanup=True)
            return str(output_path) + f".{format}"
        except graphviz.ExecutableNotFound as e:
            raise RuntimeError(
                "Failed to generate graph. Please ensure Graphviz is properly installed."
            ) from e

    def draw_dfa_from_object(
        self, dfa, filename: str = "dfa", format: str = "png"
    ) -> str:
        """
        Draw a DFA from a DFA object.

        Args:
            dfa: DFA object with appropriate attributes
            filename: Name of the output file (without extension)
            format: Output format (png, pdf, svg, etc.)

        Returns:
            Path to the generated file
        """
        return self.draw_dfa(
            transitions=dfa._transitions,
            start_state=dfa._start_state,
            accept_states=dfa._accept_states,
            filename=filename,
            format=format,
        )
