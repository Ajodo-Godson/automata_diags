class TuringMachineError(Exception):
    """Base class for Turing machine exceptions."""


class StepLimitExceeded(TuringMachineError):
    """Raised when a machine does not halt within the allowed step budget.

    This says nothing about acceptance: the computation was cut off, not
    finished. Prefer `TuringMachine.run()`, which reports this case as
    `Outcome.TIMEOUT` instead of raising.
    """


class RejectionException(TuringMachineError):
    """Raised when a Turing machine halts and rejects."""


# Backward-compatible alias: the old name was misleading (it fired when the
# machine did NOT halt) and RejectionException wrongly subclassed it.
HaltingException = StepLimitExceeded
