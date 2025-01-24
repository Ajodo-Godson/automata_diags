# Linear Bounded Automaton Simulator

## Location
`automata/backend/grammar/context_sensitive/lba_simulator.py`

## Key Components
```python
class LBATape:
    """Enforced tape boundaries with input delimiters"""

class LBA:
    """Simulation core with step-through execution"""

def validate_csg(lba: LBA, grammar: CSGrammar) -> bool:
    """Verify LBA recognizes CSG language"""