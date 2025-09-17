import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from automata.backend.grammar.dist import State, Alphabet, StateSet, Symbol, OutputAlphabet
from automata.backend.grammar.transducers.mealy_machine import MealyMachine
from automata.backend.drawings.automata_drawer import AutomataDrawer

def main():
    """
    Shows an example of a Mealy Machine and visualizes it.
    """
    # 1. Create a Mealy machine that inverts a binary string
    mealy = MealyMachine(
        states=StateSet({'q0'}),
        input_alphabet=Alphabet({'0', '1'}),
        output_alphabet=OutputAlphabet({'0', '1'}),
        transitions={
            State('q0'): {Symbol('0'): State('q0'), Symbol('1'): State('q0')}
        },
        output_function={
            State('q0'): {Symbol('0'): Symbol('1'), Symbol('1'): Symbol('0')}
        },
        start_state=State('q0')
    )

    print("Mealy Machine:")
    print(mealy)
    
    # 2. Transduce an example string
    input_string = "0110"
    output_string = "".join(mealy.transduce(input_string))
    print(f"\nInput:  {input_string}")
    print(f"Output: {output_string}")

    # 3. Visualize the Mealy machine
    drawer = AutomataDrawer()
    mealy_path = drawer.draw_mealy_machine_from_object(mealy, "mealy_machine_example")
    print(f"\nMealy Machine visualization saved to: {mealy_path}")


if __name__ == "__main__":
    main()
