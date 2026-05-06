/** Shared lexer-style machines for the compiler / lexing tutorial (e.g. NUMBER ≈ [0-9]+). */

export const LEXER_DIGIT_SYMBOLS = '0123456789'.split('');

export function buildLexerDigitPlusDfaDefinition() {
  const transitions = {
    q0: Object.fromEntries(LEXER_DIGIT_SYMBOLS.map((d) => [d, 'q1'])),
    q1: Object.fromEntries(LEXER_DIGIT_SYMBOLS.map((d) => [d, 'q1'])),
  };
  return {
    name: '[0-9]+ (lexer NUMBER)',
    description:
      'Lexing demo: one or more digits. This is the DFA for regex [0-9]+ — the pattern many lexers use for integer literals. Try input 42 and step through.',
    states: ['q0', 'q1'],
    alphabet: [...LEXER_DIGIT_SYMBOLS],
    transitions,
    startState: 'q0',
    acceptStates: new Set(['q1']),
  };
}

export function buildLexerDigitPlusNfaDefinition() {
  const transitions = [];
  for (const d of LEXER_DIGIT_SYMBOLS) {
    transitions.push({ from: 'q0', to: 'q1', symbol: d });
    transitions.push({ from: 'q1', to: 'q1', symbol: d });
  }
  return {
    name: '[0-9]+ (lexer NUMBER)',
    description:
      'Same language as the DFA above; useful when teaching Thompson-style regex → NFA construction before determinization.',
    states: ['q0', 'q1'],
    alphabet: [...LEXER_DIGIT_SYMBOLS],
    transitions,
    startState: 'q0',
    acceptStates: ['q1'],
  };
}

export function buildLexerDigitOnceDfaDefinition() {
  const transitions = {
    q0: Object.fromEntries(LEXER_DIGIT_SYMBOLS.map((d) => [d, 'q1'])),
    q1: {},
  };
  return {
    name: '[0-9] (single digit)',
    description:
      'Lexing demo: exactly one digit (regex [0-9] without +). Compare to [0-9]+ — multi-digit numbers need the loop on the accept state.',
    states: ['q0', 'q1'],
    alphabet: [...LEXER_DIGIT_SYMBOLS],
    transitions,
    startState: 'q0',
    acceptStates: new Set(['q1']),
  };
}

export function buildLexerDigitOnceNfaDefinition() {
  const transitions = [];
  for (const d of LEXER_DIGIT_SYMBOLS) {
    transitions.push({ from: 'q0', to: 'q1', symbol: d });
  }
  return {
    name: '[0-9] (single digit)',
    description: 'NFA for a single digit character class.',
    states: ['q0', 'q1'],
    alphabet: [...LEXER_DIGIT_SYMBOLS],
    transitions,
    startState: 'q0',
    acceptStates: ['q1'],
  };
}

/**
 * Map a tiny set of lexer regex snippets to machine definitions.
 * Trims whitespace; returns { kind: 'dfa'|'nfa', definition } or null.
 */
export function tryBuildLexerPattern(pattern) {
  const p = (pattern || '').trim();
  if (p === '[0-9]+') {
    return { kind: 'dfa', definition: buildLexerDigitPlusDfaDefinition() };
  }
  if (p === '[0-9]') {
    return { kind: 'dfa', definition: buildLexerDigitOnceDfaDefinition() };
  }
  return null;
}

export function tryBuildLexerPatternNfa(pattern) {
  const p = (pattern || '').trim();
  if (p === '[0-9]+') {
    return { kind: 'nfa', definition: buildLexerDigitPlusNfaDefinition() };
  }
  if (p === '[0-9]') {
    return { kind: 'nfa', definition: buildLexerDigitOnceNfaDefinition() };
  }
  return null;
}
