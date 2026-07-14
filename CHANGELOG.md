# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Breaking:** regex engine rewritten as a recursive-descent parser over an AST (replacing string-preprocessing). `.` is now a wildcard matching any symbol of the automaton's alphabet (previously it was silently interpreted as concatenation); `?` and `{n,m}` are newly supported; malformed patterns raise `RegexSyntaxError` with the offending position instead of producing a wrong automaton. `ε` is accepted as an explicit empty-string atom. `regex_to_nfa` gains an optional `alphabet=` argument (required for patterns like `.*` with no literal characters).

### Added
- `DFA.to_regex()` — DFA to regular expression via GNFA state elimination, closing the Kleene's theorem loop (`regex -> NFA -> DFA -> regex`). Round-trip equivalence is enforced by a Hypothesis property test.
- Tutorial section "Comparing and Grading Automata" and API reference coverage for the language operations, completion helpers, and `to_regex`.
- Regular-language operations in `dfa_ops` (also as `DFA` methods): `complement`, `union`, `intersection`, `difference`, `symmetric_difference` via product construction over the union alphabet; `is_empty`, `shortest_accepted`; and `equivalent_to` / `find_distinguishing_string`, which returns a *shortest* word on which two DFAs disagree — usable as an autograding counterexample.
- Property-based test suite (Hypothesis) cross-validating regex→NFA against Python's `re`, NFA→DFA conversion, both minimizers, and the new language operations (involution, De Morgan, counterexample validity).
- GitHub Actions CI running the test suite on Python 3.9 and 3.12 for pushes and pull requests.

### Removed
- Empty placeholder modules that advertised unimplemented features: `backend/api/`, `backend/theory/` (kolmogorov, recursion theorem, lambda calculus, cellular automata, decidability), `backend/grammar/logic/`, `backend/grammar/context_sensitive/`, and `backend/utils/`.
- Empty documentation pages (`rest_api.md`, `python_api.md`, `CORE_MODULES.md`, `THEORY.md`) and component docs describing the removed empty modules.
- Generated diagrams under `outputs/` are no longer tracked (directory is gitignored).

---

## [0.4.0] - 2026-07-14

### Fixed
- Myhill-Nerode minimization merged inequivalent states on partial DFAs (missing transitions were skipped during table filling). Both minimizers now complete the DFA first, treating a missing transition as a transition to an implicit dead state, and prune the dead class from the result.
- `DFA.accepts` raised `KeyError` instead of rejecting when the run reached a state with no outgoing transitions.
- `StateSet.from_states` aliased the caller's collection, silently storing a list when passed one (breaking `add_state` and set semantics). It now copies into a set.
- Directly-constructed NFAs whose ε-transitions used a different marker than `epsilon_symbol` silently rejected valid strings; the constructor now raises `ValueError` on mismatched epsilon markers.
- KMP-based DFAs (`create_dfa_from_pattern`) used integer states and plain sets, which crashed `AutomataDrawer.draw_dfa_from_object`.
- pytest configuration lived in an ignored `[tool.pytest]` table; moved to `[tool.pytest.ini_options]` with collection limited to the package, so the test suite collects and runs again.

### Changed
- **Breaking:** the default NFA epsilon symbol is now `"ε"` (previously `""`). `regex_to_nfa` uses the same canonical marker. NFAs built with `""` epsilon transitions must pass `epsilon_symbol=""` explicitly.
- **Breaking:** `create_dfa_from_pattern` names states `q0..qm` instead of integers.
- Hopcroft minimization rewritten with block ids, an inverse-transition index, and the smaller-half worklist rule, achieving the textbook O(|Σ|·n log n) (previously effectively quadratic; ~125x faster at 1,000 states).
- `Automaton` base normalizes plain sets/lists into `StateSet`/`Alphabet`, removing set-vs-StateSet drift across modules.

### Added
- `DFA.is_complete()` and `DFA.completed()` for making partial transition functions total via an explicit dead state.
- Optional `metrics` instrumentation on NFA BFS acceptance and subset construction.
- Regression tests for partial-DFA minimization, completion, and NFA epsilon handling.

---

## [0.3.0] - 2026-02-19

### Added
- Pushdown Automaton (PDA) implementation with BFS-based acceptance, `from_string` factory method, and `from_cfg` conversion from any context-free grammar.
- PDA support for acceptance by final state and acceptance by empty stack.
- `PDA.get_configuration_trace()` for step-by-step execution traces.
- PDA visualization in `AutomataDrawer.draw_pda()` with edge labels in `input, stack_top -> push` format.
- `TuringMachine.from_string()` factory method for concise TM definition from a semicolon-separated string.
- PDA and Turing Machine sections in the ReadTheDocs tutorial with worked examples.
- PDA, TM, and CFG algorithm entries in the API reference documentation.
- 23 PDA tests covering a^n b^n, balanced parentheses, CFG-to-PDA, empty stack acceptance, configuration traces, and direct construction.

### Fixed
- `get_all_productions_used()` now returns actual `Production` objects instead of derivation strings.

### Changed
- `automata/__init__.py` now exports `PDA` alongside existing DFA, NFA, CFG, and TM classes.
- `context_free/__init__.py` exports CFG, PDA, and all CFG algorithm functions.

---

## [Unreleased] - 2025-10-10 to 2026-01-26

### Added
- Turing machine modules (single-tape, multi-tape, multi-head) with shared base and tape implementation.
- Turing machine test coverage and centralized backend test folders.
- Context-free grammar (CFG) functionality: CFG parsing from string, CNF conversion (start elimination, epsilon removal, unit removal, terminal separation, binarization), CYK membership testing, BFS-based acceptance, string generation, and derivation tracing, plus CFG tests.

### Changed
- Turing machine backend now accepts raw iterable alphabets and normalizes alphabet types internally.

### Fixed
- Turing machine backend validation and alphabet registration behaviors.

### Removed
- Legacy “Turing Machine Simulator UI” duplicate source tree.

## [0.2.4] - 2025-10-09

### Major Regular Expression Enhancements

#### **Enhanced Regex Preprocessing**
- **Added**: Character class expansion support (e.g., `[a-z]`, `[A-Z]`, `[0-9]`)
- **Added**: Plus quantifier (`+`) conversion to equivalent `aa*` pattern
- **Added**: Escaped character handling for literal dots, asterisks, plus signs, and pipes
- **Enhanced**: Comprehensive regex preprocessing pipeline for complex patterns

#### **Advanced Character Class Support**
- **Added**: Range-based character classes with automatic expansion
- **Added**: Mixed character classes combining ranges and individual characters
- **Added**: Support for character class unions (converted to regex union expressions)
- **Enhanced**: Character class parsing with proper boundary detection

#### **Improved Regex-to-NFA Conversion**
- **Enhanced**: Thompson's construction algorithm with better token handling
- **Added**: Placeholder system for literal character preservation during parsing
- **Enhanced**: Shunting-yard algorithm for complex expression parsing
- **Added**: Robust postfix conversion with operator precedence handling

#### **Symbol and Alphabet Management**
- **Enhanced**: Automatic alphabet inference from regex patterns
- **Added**: Proper symbol conversion for escaped and special characters
- **Enhanced**: State generation and management for complex regex patterns
- **Added**: Better handling of epsilon transitions in regex-generated NFAs

### Algorithm Improvements

#### **Regex Processing Pipeline**
- **Enhanced**: Multi-stage preprocessing (character classes → plus expansion → escaping)
- **Added**: Explicit concatenation operator insertion for proper parsing
- **Enhanced**: Token-based regex parsing with comprehensive operator support
- **Added**: Proper precedence handling for nested regex operations

#### **NFA Fragment Construction**
- **Enhanced**: Fragment-based NFA construction for modular regex building
- **Added**: Improved concatenation, union, and Kleene star fragment operations
- **Enhanced**: State counter management for unique state generation
- **Added**: Better epsilon transition handling in complex regex patterns

### Testing & Validation

#### **Comprehensive Regex Testing**
- **Added**: Test suite for character class expansion
- **Added**: Plus quantifier conversion validation
- **Added**: Escaped character handling tests
- **Enhanced**: Complex regex pattern acceptance testing

#### **Edge Case Coverage**
- **Added**: Empty regex handling
- **Added**: Nested parentheses and complex grouping tests
- **Enhanced**: Special character and operator precedence validation
- **Added**: Character range boundary testing

### Documentation & Examples

#### **Regex Usage Examples**
- **Enhanced**: Comprehensive regex pattern demonstrations
- **Added**: Character class usage examples in tutorials
- **Added**: Plus quantifier examples and explanations
- **Enhanced**: Complex regex-to-NFA conversion workflows

#### **Educational Content**
- **Added**: Step-by-step regex preprocessing explanations
- **Enhanced**: Thompson's construction algorithm documentation
- **Added**: Character class expansion algorithm details
- **Enhanced**: Regex parsing and tokenization guides

---

## [0.2.0] - 2024-12-19

### Major New Features

#### **Non-deterministic Finite Automata (NFA)**
- **Added**: Complete NFA implementation with ε-transitions support
- **Added**: `NFA.accepts()` method using breadth-first search algorithm
- **Added**: `NFA.to_dfa()` conversion using subset construction algorithm
- **Added**: Comprehensive NFA visualization capabilities

#### **Regular Expression Support**
- **Added**: `NFA.from_regex()` class method for regex to NFA conversion
- **Added**: Thompson's construction algorithm implementation
- **Added**: Support for concatenation (.), union (|), Kleene star (*), and grouping ()
- **Added**: Regex parsing with operator precedence handling

#### **DFA Minimization Algorithms**
- **Added**: Hopcroft's algorithm for O(n log n) DFA minimization
- **Added**: Myhill-Nerode theorem-based minimization approach
- **Added**: Equivalence class analysis and distinguishability table generation
- **Added**: Comprehensive comparison between minimization algorithms

#### **Context-Free Grammars (CFG)**
- **Added**: Complete CFG implementation with parsing from string notation
- **Added**: Chomsky Normal Form (CNF) conversion following standard algorithm
- **Added**: Support for ε-productions, unit productions, and complex recursive grammars
- **Added**: Grammar parsing with multiple production alternatives (| notation)

#### **Finite-State Transducers**
- **Added**: Abstract base class for finite transducers
- **Added**: Mealy Machine implementation with state-based output functions
- **Added**: Transduction capabilities for input-output string mapping

#### **Enhanced Visualization**
- **Added**: NFA visualization with explicit ε-transition display
- **Added**: Mealy machine visualization support
- **Added**: Improved state ordering and layout in graph visualizations
- **Added**: Multiple output format support for all automata types

### Algorithm Improvements

#### **String Algorithms**
- **Enhanced**: KMP algorithm with better type safety
- **Added**: NFA-based breadth-first search for non-deterministic acceptance
- **Added**: Epsilon closure computation for NFA operations

#### **Grammar Processing**
- **Added**: Multi-step CNF conversion (START → TERM → BIN → DEL → UNIT)
- **Added**: Null production elimination with proper symbol combination generation
- **Added**: Unit production elimination using transitive closure
- **Added**: Terminal separation and production binarization

### Architecture & Design

#### **Type System**
- **Enhanced**: Comprehensive custom type definitions (State, Symbol, NonTerminal, Terminal)
- **Added**: Type-safe operations across all automata implementations
- **Enhanced**: Better separation between different symbol types

#### **Code Organization**
- **Added**: Dedicated modules for each automata type and algorithm
- **Enhanced**: Clean separation between core logic and visualization
- **Added**: Comprehensive example scripts organized in dedicated directory

### Documentation & Examples

#### **Comprehensive Examples**
- **Added**: `dfa_minimization_example.py` - Complete minimization algorithm comparison
- **Added**: `cfg_to_cnf_example.py` - CFG to CNF conversion demonstration
- **Added**: `mealy_machine_example.py` - Finite-state transducer examples
- **Added**: `nfa_to_dfa_example.py` - NFA conversion and analysis
- **Added**: `regex_to_nfa_example.py` - Regular expression processing

#### **Educational Content**
- **Added**: Step-by-step algorithm explanations
- **Added**: Detailed comments explaining theoretical concepts
- **Added**: Comprehensive test cases demonstrating edge cases
- **Added**: Visual outputs for better understanding

### Testing & Quality

#### **Test Coverage**
- **Added**: Comprehensive test suites for all new algorithms
- **Added**: Edge case testing for minimization algorithms
- **Added**: Grammar parsing and CNF conversion tests
- **Added**: NFA to DFA conversion validation tests

#### **Code Quality**
- **Enhanced**: Type hints throughout the codebase
- **Added**: Comprehensive error handling
- **Enhanced**: Documentation strings for all public methods
- **Added**: Input validation and sanitization

### Package Management

#### **Dependencies**
- **Updated**: Graphviz integration for enhanced visualizations
- **Added**: Development dependencies for testing and documentation
- **Enhanced**: Package metadata with comprehensive classifiers

#### **Build System**
- **Enhanced**: `pyproject.toml` configuration
- **Added**: Proper package exclusions for clean distributions
- **Enhanced**: Development and documentation dependency groups

### Bug Fixes

#### **Algorithm Fixes**
- **Fixed**: State ordering in DFA visualizations
- **Fixed**: Epsilon transition handling in NFA operations
- **Fixed**: Memory efficiency in minimization algorithms
- **Fixed**: Edge cases in grammar parsing

#### **Visualization Fixes**
- **Fixed**: Proper epsilon symbol display (ε) in NFA graphs
- **Fixed**: State labeling consistency across different automata types
- **Fixed**: Graph layout optimization for complex automata

### API Changes

#### **Breaking Changes**
- **Changed**: NFA constructor now uses protected members for consistency
- **Changed**: Grammar parsing now requires explicit symbol separation
- **Enhanced**: More consistent method naming across automata types

#### **New APIs**
- **Added**: `analyze_equivalence_classes()` for DFA minimization analysis
- **Added**: `get_distinguishability_table()` for Myhill-Nerode analysis
- **Added**: `CFG.from_string()` class method for grammar parsing
- **Added**: `CFG.to_cnf()` method for Chomsky Normal Form conversion

### 🚀 Performance Improvements

#### **Algorithm Optimization**
- **Optimized**: Hopcroft's algorithm implementation for better time complexity
- **Enhanced**: Memory usage in NFA to DFA conversion
- **Improved**: Grammar parsing efficiency with better string processing

#### **Visualization Performance**
- **Enhanced**: Faster graph generation for large automata
- **Optimized**: Memory usage in visualization rendering

### 📖 Documentation Enhancements

#### **API Documentation**
- **Enhanced**: Comprehensive docstrings for all new methods
- **Added**: Type annotations for better IDE support
- **Enhanced**: Example code in documentation

#### **User Guides**
- **Added**: Detailed algorithm explanation guides
- **Enhanced**: Installation and setup instructions
- **Added**: Troubleshooting section for common issues

---

## [0.1.2] - 2024-11-XX

### ✨ Initial Features

#### **Basic Automata Support**
- **Added**: Deterministic Finite Automata (DFA) implementation
- **Added**: Basic DFA operations (accept/reject strings)
- **Added**: DFA visualization using Graphviz

#### **Pattern Matching**
- **Added**: Knuth-Morris-Pratt (KMP) string matching algorithm
- **Added**: Efficient pattern search capabilities

#### **Visualization Tools**
- **Added**: AutomataDrawer class for graph generation
- **Added**: PNG output support for automata diagrams
- **Added**: Basic state and transition visualization

#### **Core Infrastructure**
- **Added**: Base automaton classes and type definitions
- **Added**: State and symbol management
- **Added**: Basic testing framework

### 📦 Package Foundation

#### **Project Setup**
- **Added**: Initial package structure and configuration
- **Added**: MIT license and basic documentation
- **Added**: PyPI package configuration
- **Added**: Basic dependency management

---

## Development Guidelines

### Version Numbering
- **Major** (X.0.0): Breaking API changes or major feature additions
- **Minor** (0.X.0): New features, algorithms, or significant enhancements
- **Patch** (0.0.X): Bug fixes, documentation updates, minor improvements

### Changelog Categories
- **🎉 Major New Features**: Significant new functionality
- **🔧 Algorithm Improvements**: Performance and correctness enhancements
- **🏗️ Architecture & Design**: Code structure and design improvements
- **📚 Documentation & Examples**: Educational content and examples
- **🧪 Testing & Quality**: Test coverage and code quality
- **📦 Package Management**: Dependencies and build system
- **🐛 Bug Fixes**: Issue resolutions
- **🔄 API Changes**: Breaking and non-breaking API modifications
- **🚀 Performance Improvements**: Speed and memory optimizations
- **📖 Documentation Enhancements**: API docs and user guides

### Contributing
When adding new features, please:
1. Update this changelog with detailed descriptions
2. Add comprehensive examples demonstrating the functionality
3. Include appropriate tests and documentation
4. Follow the established code style and type annotations

---

*This changelog is maintained to help users and contributors understand the evolution of the automata_diags package.*
