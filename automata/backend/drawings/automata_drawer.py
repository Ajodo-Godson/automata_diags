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

    def multi_alphabets_transition(
        self, transitions: Dict[str, Dict[str, str]]
    ) -> Dict[str, Dict[str, str]]:
        """Handle multiple alphabets between states.

        Instead of drawing multiple edges, draw a single edge with multiple labels.

        Args:
            transitions: The transition function of the DFA

        Returns:
            Modified transition function with combined labels
        """
        combined_transitions = {}

        # For each source state
        for from_state, trans in transitions.items():
            combined_transitions[from_state] = {}
            target_states = {}

            # Group transitions by target state
            for symbol, to_state in trans.items():
                if to_state not in target_states:
                    target_states[to_state] = []
                target_states[to_state].append(symbol)

            # Combine symbols going to the same target state
            for to_state, symbols in target_states.items():
                label = ",".join(sorted(symbols))
                combined_transitions[from_state][label] = to_state

        return combined_transitions

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

        # Set graph attributes for better visualization
        dot.attr("graph", rankdir="LR", pad="0.5", nodesep="0.5", ranksep="0.5")

        # Set default node attributes
        dot.attr(
            "node",
            shape="circle",
            height="0.5",
            width="0.5",
            fontsize="12",
            margin="0.05",
        )

        # Set default edge attributes
        dot.attr("edge", fontsize="12", arrowsize="0.7", fontname="helvetica")

        # Convert all states to strings for visualization
        str_transitions = {
            str(state): {sym: str(target) for sym, target in trans.items()}
            for state, trans in transitions.items()
        }
        str_start_state = str(start_state)
        str_accept_states = {str(state) for state in accept_states}

        # Add all states
        all_states = set(str_transitions.keys())
        for state in all_states:
            # Double circle for accept states, single circle for others
            if state in str_accept_states:
                dot.node(state, state, shape="doublecircle")
            else:
                dot.node(state, state, shape="circle")

        # Add start state arrow with a special style
        dot.node("", "", shape="none")
        dot.edge("", str_start_state, arrowsize="1.0", penwidth="1.5")

        # Combine transitions with same source and target states
        combined_transitions = self.multi_alphabets_transition(str_transitions)

        # Add transitions with combined labels
        for from_state, trans in combined_transitions.items():
            for symbols, to_state in trans.items():
                # Self-loops need special handling
                if from_state == to_state:
                    dot.edge(
                        from_state,
                        to_state,
                        label=symbols,
                        dir="both",
                        arrowsize="0.7",
                        penwidth="0.8",
                        constraint="false",
                    )
                else:
                    dot.edge(
                        from_state,
                        to_state,
                        label=symbols,
                        arrowsize="0.7",
                        penwidth="0.8",
                    )

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
            accept_states=dfa._accept_states.states(),
            filename=filename,
            format=format,
        )

    def draw_nfa(
        self,
        transitions: Dict[str, Dict[str, Set[str]]],
        start_state: str,
        accept_states: Set[str],
        filename: str = "nfa",
        format: str = "png",
    ) -> str:
        """
        Draw an NFA using graphviz and save it to a file.
        """
        if not shutil.which("dot"):
            raise RuntimeError("Graphviz is not installed.")

        dot = graphviz.Digraph(comment="NFA Visualization")
        dot.attr(rankdir="LR")
        dot.attr("graph", pad="0.5", nodesep="0.5", ranksep="0.5")
        dot.attr("node", shape="circle", height="0.5", width="0.5", fontsize="12", margin="0.05")
        dot.attr("edge", fontsize="12", arrowsize="0.7")

        all_states = set(transitions.keys()) | {s for t in transitions.values() for u in t.values() for s in u}

        for state in all_states:
            if state in accept_states:
                dot.node(state, state, shape="doublecircle")
            else:
                dot.node(state, state, shape="circle")
        
        dot.node("", "", shape="none")
        dot.edge("", start_state)

        for from_state, trans in transitions.items():
            for symbol, to_states in trans.items():
                for to_state in to_states:
                    dot.edge(from_state, to_state, label=symbol)
        
        output_path = self.output_dir / filename
        dot.render(str(output_path), format=format, cleanup=True)
        return str(output_path) + f".{format}"

    def draw_nfa_from_object(
        self, nfa, filename: str = "nfa", format: str = "png"
    ) -> str:
        """
        Draw an NFA from an NFA object.
        """
        primitive_transitions: Dict[str, Dict[str, Set[str]]] = {
            str(state): {str(symbol): {str(s) for s in next_states.states()} for symbol, next_states in trans.items()}
            for state, trans in nfa.transitions.items()
        }

        return self.draw_nfa(
            transitions=primitive_transitions,
            start_state=str(nfa._start_state),
            accept_states={str(s) for s in nfa._accept_states.states()},
            filename=filename,
            format=format,
        )
