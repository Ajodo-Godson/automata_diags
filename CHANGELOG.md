# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.4] - 2025-10-09

### 🎉 Major Regular Expression Enhancements

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

### 🔧 Algorithm Improvements

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

### 🧪 Testing & Validation

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

### 📚 Documentation & Examples

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

### 🎉 Major New Features

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

### 🔧 Algorithm Improvements

#### **String Algorithms**
- **Enhanced**: KMP algorithm with better type safety
- **Added**: NFA-based breadth-first search for non-deterministic acceptance
- **Added**: Epsilon closure computation for NFA operations

#### **Grammar Processing**
- **Added**: Multi-step CNF conversion (START → TERM → BIN → DEL → UNIT)
- **Added**: Null production elimination with proper symbol combination generation
- **Added**: Unit production elimination using transitive closure
- **Added**: Terminal separation and production binarization

### 🏗️ Architecture & Design

#### **Type System**
- **Enhanced**: Comprehensive custom type definitions (State, Symbol, NonTerminal, Terminal)
- **Added**: Type-safe operations across all automata implementations
- **Enhanced**: Better separation between different symbol types

#### **Code Organization**
- **Added**: Dedicated modules for each automata type and algorithm
- **Enhanced**: Clean separation between core logic and visualization
- **Added**: Comprehensive example scripts organized in dedicated directory

### 📚 Documentation & Examples

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

### 🧪 Testing & Quality

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

### 📦 Package Management

#### **Dependencies**
- **Updated**: Graphviz integration for enhanced visualizations
- **Added**: Development dependencies for testing and documentation
- **Enhanced**: Package metadata with comprehensive classifiers

#### **Build System**
- **Enhanced**: `pyproject.toml` configuration
- **Added**: Proper package exclusions for clean distributions
- **Enhanced**: Development and documentation dependency groups

### 🐛 Bug Fixes

#### **Algorithm Fixes**
- **Fixed**: State ordering in DFA visualizations
- **Fixed**: Epsilon transition handling in NFA operations
- **Fixed**: Memory efficiency in minimization algorithms
- **Fixed**: Edge cases in grammar parsing

#### **Visualization Fixes**
- **Fixed**: Proper epsilon symbol display (ε) in NFA graphs
- **Fixed**: State labeling consistency across different automata types
- **Fixed**: Graph layout optimization for complex automata

### 🔄 API Changes

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
