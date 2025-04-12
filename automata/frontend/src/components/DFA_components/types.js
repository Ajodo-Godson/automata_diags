export const State = String;
export const Symbol = String;

/**
 * @typedef {Object.<string, Object.<string, string>>} TransitionFunction
 */

/**
 * @typedef {Object} DFA
 * @property {string[]} states
 * @property {string[]} alphabet
 * @property {TransitionFunction} transitions
 * @property {string} startState
 * @property {Set<string>} acceptStates
 */

/**
 * @typedef {Object} DFAExample
 * @property {string} name
 * @property {string} description
 * @property {string[]} states
 * @property {string[]} alphabet
 * @property {TransitionFunction} transitions
 * @property {string} startState
 * @property {Set<string>} acceptStates
 */ 