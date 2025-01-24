# DFA Minimization Module

## Location
`automata/backend/grammar/regular_languages/dfa/minimization/`

## Algorithms
| File               | Algorithm          | Complexity  | Use Case                |
|--------------------|--------------------|-------------|-------------------------|
| `hopcroft.py`      | Hopcroft's         | O(n log n)  | Production minimization |
| `myhill_nerode.py` | Myhill-Nerode      | O(n²)       | Theoretical analysis    |

## API Reference
```python
def hopcroft_minimization(dfa: DFA) -> DFA:
    """Minimize DFA using Hopcroft's algorithm.
    
    Args:
        dfa: Input DFA to minimize
        
    Returns:
        Minimal DFA recognizing the same language
    """

class MyhillNerode:
    def build_equivalence_classes(self) -> List[Set[State]]:
        """Compute Myhill-Nerode equivalence classes."""