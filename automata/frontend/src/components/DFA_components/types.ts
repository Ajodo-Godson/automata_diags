export type State = string;
export type Symbol = string;
export type TransitionFunction = Record<State, Record<Symbol, State>>;

export interface DFA {
    states: State[];
    alphabet: Symbol[];
    transitions: TransitionFunction;
    startState: State;
    acceptStates: Set<State>;
}

export interface DFAExample extends DFA {
    name: string;
    description: string;
} 