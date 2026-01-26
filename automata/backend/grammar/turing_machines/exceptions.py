class TuringMachineError(Exception):
    """Base class for Turing machine exceptions."""
    pass

class HaltingException(TuringMachineError):
    """Raised when a Turing machine halts."""
    pass

class RejectionException(HaltingException):
    """Raised when a Turing machine halts and rejects."""
    pass
