<!-- # Automata Diags

A computational tool for working with and visualizing various types of automata, including:
- Deterministic Finite Automata (DFA)
- Non-deterministic Finite Automata (NFA)
- Pushdown Automata (PDA)
- Context-Free Grammars (CFG)

## Installation

```bash
pip install automata-diags
```

## Requirements

- Python 3.8 or higher
- Graphviz (system package)

### Installing Graphviz

- MacOS: `brew install graphviz`
- Ubuntu/Debian: `sudo apt-get install graphviz`
- Windows: Download from [Graphviz website](https://graphviz.org/download/)

## Quick Start

```python
from automata.backend.grammar.regular_languages.dfa.dfa_mod_algo import create_dfa_from_table
from automata.backend.drawings.automata_drawer import AutomataDrawer

# Create a simple DFA
dfa = create_dfa_from_table(
    table={
        "q0": {"a": "q1", "b": "q0"},
        "q1": {"a": "q1", "b": "q2"},
        "q2": {"a": "q1", "b": "q0"},
    },
    start_state="q0",
    accept_states={"q2"},
    alphabet={"a", "b"}
)

# Draw the DFA
drawer = AutomataDrawer()
output_path = drawer.draw_dfa_from_object(dfa, "my_dfa")
print(f"DFA visualization saved to: {output_path}")

# Test the DFA
assert dfa.accepts("abb")  # Should be True
assert not dfa.accepts("aa")  # Should be False
```

## Features

- Create and manipulate DFAs, NFAs, and other automata
- Visualize automata using Graphviz
- Pattern matching using KMP algorithm
- Automata operations (union, intersection, etc.)
- Clean and intuitive API

## Documentation

For more examples and detailed documentation, visit our [GitHub repository](https://github.com/Ajodo-Godson/automata_diags).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## To be worked upon