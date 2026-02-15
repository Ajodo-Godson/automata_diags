"""
Automata Diags - A package for working with and visualizing automata.
Supports DFAs, NFAs, CFGs, PDAs, and Turing machines (single-tape, multi-tape, multi-head).
"""

from automata.backend.grammar.regular_languages.dfa.dfa_mod_algo import (
    create_dfa_from_table,
)
from automata.backend.drawings.automata_drawer import AutomataDrawer
from automata.backend.grammar.context_free.cfg_mod import CFG, Production
from automata.backend.grammar.context_free.cfg_algo import (
    cyk_accept,
    accept_string,
    generate_strings,
    get_derivation,
    get_all_productions_used,
)
from automata.backend.grammar.turing_machines import (
    TuringMachine,
    MultiTapeTuringMachine,
    MultiHeadTuringMachine,
)
from automata.backend.drawings.tm_drawer import TMDrawer

__all__ = [
    "create_dfa_from_table",
    "AutomataDrawer",
    "CFG",
    "Production",
    "cyk_accept",
    "accept_string",
    "generate_strings",
    "get_derivation",
    "get_all_productions_used",
    "TuringMachine",
    "MultiTapeTuringMachine",
    "MultiHeadTuringMachine",
    "TMDrawer",
]
