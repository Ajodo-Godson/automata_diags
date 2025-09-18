# 🤖 Automata Diags

[![PyPI version](https://badge.fury.io/py/automata-diags.svg)](https://pypi.org/project/automata-diags/)
[![Python versions](https://img.shields.io/pypi/pyversions/automata-diags.svg)](https://pypi.org/project/automata-diags/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation Status](https://readthedocs.org/projects/automata-diags/badge/?version=latest)](https://automata-diags.readthedocs.io/en/latest/?badge=latest)

A powerful, modern, and educational Python toolkit for automata theory. Visualize DFAs, NFAs, CFGs, minimize automata, and more with an elegant, type-safe API.

**For the full, comprehensive documentation including tutorials and the API reference, please visit our [Documentation Website](https://automata-diags.readthedocs.io/).**

## 🤔 Why Automata Diags?

| Feature                 | Why It Matters                                                                                                             |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Complete Toolset**    | From basic DFAs to complex CFG conversions, all the tools you need for a typical Theory of Computation course are in one place. |
| **Educational Focus**   | The API is designed to be intuitive and map closely to textbook concepts, making it an excellent companion for students.      |
| **Advanced Algorithms** | Includes research-grade implementations like Hopcroft's minimization, setting it apart from simpler libraries.                |
| **Instant Visualization**| Don't just build automata—see them. Instant visual feedback helps solidify complex concepts and makes debugging intuitive.    |
| **Modern & Maintained** | Built with modern Python (type hints, clean architecture) and actively maintained for correctness and new features.           |

## 📦 Installation

```bash
pip install automata-diags
```
Requires Python 3.8+ and Graphviz.

## 🚀 Quick Start

```python
from automata.backend.grammar.dist import State, Symbol
from automata.backend.grammar.regular_languages.dfa.dfa_mod import DFA
from automata.backend.drawings.automata_drawer import AutomataDrawer

# Create a simple DFA
# For more creation methods, see the full documentation.
dfa = DFA.from_string("q0,a,q1;q1,b,q2", start_state="q0", accept_states={"q2"})

# Test it
dfa.accepts([Symbol('a'), Symbol('b')]) # True

# Visualize it
drawer = AutomataDrawer()
drawer.draw_dfa_from_object(dfa, "my_first_dfa")
```
**For more examples and detailed guides, please visit the [Full Documentation Site](https://automata-diags.readthedocs.io/).**

## 🤝 Contributing

Contributions are welcome! Please feel free to open a pull request or submit an issue on our [GitHub repository](https://github.com/Ajodo-Godson/automata_diags).

## 📄 License

This project is licensed under the MIT License. 


