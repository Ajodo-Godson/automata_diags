"""
A library of classic Turing machines, ready to run.

Each factory returns a fully-constructed machine. They serve three purposes:
worked examples for learners (each docstring explains the algorithm), test
fixtures (the test suite checks them against plain-Python oracles), and
demonstrations of the trace/compute APIs.
"""

from .standard import TuringMachine


def palindrome_checker() -> TuringMachine:
    """
    Decide {w ∈ {a,b}* : w is a palindrome} (Sipser-style marking machine).

    Algorithm: erase the first symbol, remembering it in the state; run to
    the right end; check the last symbol matches (erase it too); run back;
    repeat until the tape is empty (even length) or one symbol remains
    (odd length). Any mismatch halts with no transition, i.e. rejects.
    """
    return TuringMachine.from_string(
        # Empty (or fully consumed) input: accept.
        "q0,_,qacc,_,N;"
        # Erase the first symbol; remember whether it was a or b.
        "q0,a,ra,_,R;"
        "q0,b,rb,_,R;"
        # Run right to the end of the word.
        "ra,a,ra,a,R; ra,b,ra,b,R; ra,_,ca,_,L;"
        "rb,a,rb,a,R; rb,b,rb,b,R; rb,_,cb,_,L;"
        # Check the last symbol. Blank here means the erased symbol was the
        # only one left (odd-length middle): accept.
        "ca,a,back,_,L; ca,_,qacc,_,N;"
        "cb,b,back,_,L; cb,_,qacc,_,N;"
        # Run back to the left end and start over.
        "back,a,back,a,L; back,b,back,b,L; back,_,q0,_,R",
        start_state="q0",
        accept_states={"qacc"},
        input_symbols={"a", "b"},
    )


def anbncn() -> TuringMachine:
    """
    Decide {aⁿbⁿcⁿ : n ≥ 0} — the canonical language beyond context-free.

    Algorithm: repeatedly mark one a as X, one b as Y, one c as Z; when all
    a's are marked, verify only Y's and Z's remain.
    """
    return TuringMachine.from_string(
        # Mark the next a (or move to verification if none remain).
        "q0,_,qacc,_,N;"
        "q0,a,findb,X,R;"
        "q0,Y,verify,Y,R;"
        # Find and mark the next unmarked b.
        "findb,a,findb,a,R; findb,Y,findb,Y,R; findb,b,findc,Y,R;"
        # Find and mark the next unmarked c.
        "findc,b,findc,b,R; findc,Z,findc,Z,R; findc,c,rewind,Z,L;"
        # Rewind to just after the last X.
        "rewind,a,rewind,a,L; rewind,b,rewind,b,L;"
        "rewind,Y,rewind,Y,L; rewind,Z,rewind,Z,L;"
        "rewind,X,q0,X,R;"
        # All a's marked: everything remaining must be Y's then Z's.
        "verify,Y,verify,Y,R; verify,Z,verify,Z,R; verify,_,qacc,_,N",
        start_state="q0",
        accept_states={"qacc"},
        input_symbols={"a", "b", "c"},
    )


def binary_increment() -> TuringMachine:
    """
    Compute w ↦ binary(int(w) + 1) for w a binary numeral, MSB first.

    Algorithm: run to the rightmost digit, then carry leftward: 1s become
    0s until a 0 (or the blank left of the numeral) absorbs the carry as a 1.
    Use with `compute`: binary_increment().compute("1011") == "1100".
    """
    return TuringMachine.from_string(
        # Run right to the end of the numeral.
        "scan,0,scan,0,R; scan,1,scan,1,R; scan,_,carry,_,L;"
        # Propagate the carry leftward.
        "carry,1,carry,0,L;"
        "carry,0,qacc,1,N;"
        "carry,_,qacc,1,N",
        start_state="scan",
        accept_states={"qacc"},
        input_symbols={"0", "1"},
    )


def unary_addition() -> TuringMachine:
    """
    Compute "1^m+1^n" ↦ "1^(m+n)" (unary addition).

    Algorithm: overwrite the '+' with a 1, run to the right end, and erase
    the final 1 — leaving exactly m+n ones.
    Use with `compute`: unary_addition().compute("11+111") == "11111".
    """
    return TuringMachine.from_string(
        # Left summand, then replace '+' by 1.
        "left,1,left,1,R; left,+,right,1,R;"
        # Right summand, then step back onto the last 1 and erase it.
        "right,1,right,1,R; right,_,trim,_,L;"
        "trim,1,qacc,_,N",
        start_state="left",
        accept_states={"qacc"},
        input_symbols={"1", "+"},
    )
