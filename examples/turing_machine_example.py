import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from automata.backend.grammar.turing_machines import TuringMachine, MultiTapeTuringMachine, MultiHeadTuringMachine
from automata.backend.drawings.tm_drawer import TMDrawer

def test_single_tape():
    # Example: Increment binary number
    # State q0: finding end of string
    # State q1: carry logic
    
    # transitions: {state: {read: (next, write, dir)}}
    transitions = {
        'q0': {
            '0': ('q0', '0', 'R'),
            '1': ('q0', '1', 'R'),
            '_': ('q1', '_', 'L'), # Hit blank at end
        },
        'q1': {
            '0': ('halt', '1', 'N'), # Flip 0 to 1, done
            '1': ('q1', '0', 'L'),   # Flip 1 to 0, carry over
            '_': ('halt', '1', 'N'), # Carry overflow
        }
    }
    
    tm = TuringMachine(
        states={'q0', 'q1', 'halt'},
        input_alphabet={'0', '1'},
        tape_alphabet={'0', '1', '_'},
        transitions=transitions,
        start_state='q0',
        blank_symbol='_',
        final_states={'halt'}
    )
    
    input_str = "1011"
    accepted = tm.accepts(input_str)
    print(f"Single Tape: Input {input_str} -> Accepted? {accepted}")
    # Note: accepts returns True if it halts in final state.
    # To see the result we would inspect the tape, but the current API just returns bool.
    
    drawer = TMDrawer()
    drawer.draw_turing_machine(tm, "single_tape_tm")

def test_multi_tape():
    # Example: Copy string from tape 1 to tape 2
    # q0: read tape 1, write tape 2, move both R
    
    transitions = {
        'q0': {
            # (read1, read2) -> (next_state, [(write1, dir1), (write2, dir2)])
            ('a', '_'): ('q0', [('a', 'R'), ('a', 'R')]),
            ('b', '_'): ('q0', [('b', 'R'), ('b', 'R')]),
            ('_', '_'): ('halt', [('_', 'N'), ('_', 'N')])
        }
    }
    
    tm = MultiTapeTuringMachine(
        states={'q0', 'halt'},
        input_alphabet={'a', 'b'},
        tape_alphabet={'a', 'b', '_'},
        transitions=transitions,
        start_state='q0',
        blank_symbol='_',
        final_states={'halt'},
        num_tapes=2
    )
    
    input_str = "aba"
    accepted = tm.accepts(input_str)
    print(f"Multi Tape: Input {input_str} -> Accepted? {accepted}")

    drawer = TMDrawer()
    drawer.draw_multitape_turing_machine(tm, "multi_tape_tm")

def test_multi_head():
    # Example: Check if string is palindrome with 2 heads?
    # Actually simpler: Move head 1 to end, leave head 2 at start.
    # Then compare moving head 1 Left and head 2 Right.
    
    # States:
    # q0: move head 1 to end (look for blank)
    # q1: compare symbols under head 1 and head 2
    
    transitions = {
        'q0': {
            # (h1, h2)
            ('a', 'a'): ('q0', [('a', 'R'), ('a', 'N')]), # Move h1 R
            ('b', 'a'): ('q0', [('b', 'R'), ('a', 'N')]),
            ('a', 'b'): ('q0', [('a', 'R'), ('b', 'N')]),
            ('b', 'b'): ('q0', [('b', 'R'), ('b', 'N')]),
            ('_', 'a'): ('q1', [('_', 'L'), ('a', 'N')]), # End reached, step back h1, go to q1
            ('_', 'b'): ('q1', [('_', 'L'), ('b', 'N')]),
        },
        'q1': {
            ('a', 'a'): ('q1', [('a', 'L'), ('a', 'R')]), # Match, move inwards
            ('b', 'b'): ('q1', [('b', 'L'), ('b', 'R')]),
            # If heads cross or meet? Simplified for even/odd length
            # For this example let's just accept if we hit blank?
            # Or if h1 sees blank (start) and h2 sees blank (end) - wait, blank is outside.
            # Simplified check:
            # If we see blanks?
            # Assuming strictly 'a', 'b' input.
        }
    }
    
    # This logic is complex to write manually for generic palindrome without cross-check.
    # Let's do a simpler "Multi Head" test: Swap first and last character? 
    # Or just simple walker.
    
    # Let's do: Head 1 reads 'a', Head 2 writes 'b' at same position? No that's same head pos.
    # Let's just traverse with two heads.
    
    transitions_simple = {
        'start': {
            ('a', 'a'): ('move', [('a', 'R'), ('a', 'R')]),
            ('b', 'b'): ('move', [('b', 'R'), ('b', 'R')]),
        },
        'move': {
            ('a', 'a'): ('move', [('a', 'R'), ('a', 'R')]),
            ('b', 'b'): ('move', [('b', 'R'), ('b', 'R')]),
            ('a', 'b'): ('move', [('a', 'R'), ('b', 'R')]),
            ('b', 'a'): ('move', [('b', 'R'), ('a', 'R')]),
            ('_', '_'): ('halt', [('_', 'N'), ('_', 'N')])
        }
    }

    tm = MultiHeadTuringMachine(
        states={'start', 'move', 'halt'},
        input_alphabet={'a', 'b'},
        tape_alphabet={'a', 'b', '_'},
        transitions=transitions_simple,
        start_state='start',
        blank_symbol='_',
        final_states={'halt'},
        num_heads=2
    )
    
    input_str = "aa"
    accepted = tm.accepts(input_str)
    print(f"Multi Head: Input {input_str} -> Accepted? {accepted}")

    drawer = TMDrawer()
    drawer.draw_multihead_turing_machine(tm, "multi_head_tm")

if __name__ == "__main__":
    test_single_tape()
    test_multi_tape()
    test_multi_head()
