# Lambda Calculus Module

## Location
`automata/lambda_calculus/`

## Term Structure
```python
class Term(ABC):
    @abstractmethod
    def free_vars(self) -> Set[str]:
        pass

class Var(Term):
    def __init__(self, name: str):
        
class App(Term):
    def __init__(self, left: Term, right: Term):

class Abs(Term):
    def __init__(self, var: str, body: Term):