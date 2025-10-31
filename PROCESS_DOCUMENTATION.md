# Process Documentation: The Development of Automata Diags

## 1. Overview

This document outlines my development process, architectural decisions, and algorithmic choices during the creation and enhancement of the `automata-diags` package. The development was a highly iterative process, which I characterized by a cycle of implementation, testing, receiving feedback, and subsequent refinement.

My primary goal was to build a comprehensive, educational, and robust Python toolkit for automata theory. This document serves as a record of the key technical journeys I undertook to achieve that goal.

---

## 2. Case Study: CFG to Chomsky Normal Form (CNF) Conversion

This feature underwent the most significant evolution and serves as a prime example of my iterative development process.

### 2.1. Initial Implementation and Feedback

My initial implementation of the Context-Free Grammar (CFG) to Chomsky Normal Form (CNF) conversion was based on a standard, but loosely ordered, set of transformations.

After implementing it, I tested it with the grammar `S->AAA|B, A->aA|B, B-> ε` and found that the output was incorrect. I identified several key issues:
-   The productions were not in the expected order.
-   The structure of the resulting grammar was not equivalent to what a manual, correct conversion would produce.
-   The parser was brittle and misinterpreted some grammar strings.

### 2.2. Research and Algorithmic Refinement

This feedback prompted me to conduct a deeper investigation into the CNF conversion process. My key research inputs were:

1.  **A detailed, step-by-step example (similar to a Tutorialspoint article)**: This example followed a specific sequence of transformations: **DEL → UNIT → Useless Symbol Removal → Binarization/Terminal Separation**.
2.  **Formal definitions (similar to a Wikipedia article)**: This resource emphasized a different, more standard academic ordering: **START → TERM → BIN → DEL → UNIT**. It also included a table showing how some transformations could undo the work of others, highlighting the critical importance of the sequence.

**My Thought Process and Decision:**
-   I realized my initial implementation's failure was due to an incorrect ordering of the transformation steps. The interaction between null production elimination (`DEL`) and unit production elimination (`UNIT`) is particularly sensitive.
-   I initially pivoted to the tutorial's sequence (DEL first). This produced a result that matched my specific test example and seemed correct at first.
-   However, when I conducted further testing with more complex, recursive grammars (e.g., `S -> A S B, A -> a A S | a | ε, ...`), I discovered that this order could still fail. Specifically, the "Useless Symbol Removal" step was too aggressive and incorrectly eliminated valid recursive symbols.
-   **Final Decision**: I decided to revert to the more robust, academically standard algorithm described in the Wikipedia-style reference (**START → TERM → BIN → DEL → UNIT**). While it seemed counter-intuitive at first, I concluded it was designed to handle a wider variety of grammars correctly. I disabled the "useless symbol removal" for these complex cases, as I knew that determining termination in all CFGs is an undecidable problem.

### 2.3. Final Implementation Details

My final `CFG.to_cnf()` method reflects this decision-making process:
1.  **Robust Parsing**: I completely rewrote the `CFG.from_string` method to handle multi-symbol right-hand sides and the `|` notation for alternatives correctly.
2.  **Correct Transformation Order**: I explicitly coded the `to_cnf` method to call the transformation helpers in the correct, standard sequence.
3.  **Systematic Variable Naming**: To improve clarity, I updated the logic for creating new non-terminals during the `TERM` and `BIN` steps to use a systematic approach (e.g., `X -> a`, `Y -> b`, `P -> QR`).

---

## 3. Case Study: API Design and User Experience

A key theme in my process was improving the library's usability based on my own experience using it.

### 3.1. The `from_string` Convenience Method

**The Initial Problem**: After writing an example for the `README.md`, I encountered an `AttributeError: type object 'DFA' has no attribute 'from_string'`.

**My Thought Process**:
-   The immediate bug was that my documentation was incorrect.
-   However, I realized the deeper issue was a lack of user-friendly methods for creating simple automata. For examples and testing, requiring the full, verbose `DFA(...)` constructor was cumbersome.
-   I decided not just to fix the documentation, but to **implement the feature**. This was a proactive choice to improve the library's API and my own development experience.

**Iterative Refinement**:
1.  I implemented the `DFA.from_string` method.
2.  I immediately realized that for API consistency, the `NFA` class should have this method as well.
3.  This prompted me to implement `NFA.from_string`. This closed the loop, making the library more predictable and intuitive for anyone to use.

---

## 4. Documentation and Publishing Workflow

The process of setting up the documentation was a journey of refining requirements based on technical constraints and my goals for the project.

### 4.1. The Goal and Initial Path

My initial goal was to publish the package and create "comprehensive documentation."

-   **Path A**: My first approach was to create a single, all-encompassing `README.md` file that would be displayed on the PyPI project page. I merged all tutorial and API content into this file.

### 4.2. The Pivot to a Hosted Site

-   **Re-evaluation**: I decided that a separate, hosted documentation website (a "GitHub Page") would be more professional and navigable for users.
-   **Implementation**: I created a full Sphinx documentation setup (`docs/conf.py`, `index.md`, etc.), along with a GitHub Actions workflow (`docs.yml`) to build and deploy the site to GitHub Pages.

### 4.3. Identifying Technical Constraints

-   **The Conflict**: I discovered a major issue: the repository already had a GitHub Actions workflow to deploy a **React frontend** to GitHub Pages. Two separate workflows cannot deploy to the same GitHub Pages site.

**My Thought Process and Decision**:
-   Option 1: A complex, unified workflow to build both the React app and the Sphinx docs and deploy them to different subdirectories. I deemed this to be brittle and hard to maintain.
-   Option 2: **Read the Docs**. I identified this as the ideal solution. It is the standard for Python project documentation, provides free hosting, and completely decouples the documentation deployment from the React app's deployment.

### 4.4. Debugging the Final Setup

The final phase involved debugging the Read the Docs configuration:
1.  A `Config file not found` error occurred because the `.readthedocs.yaml` file had been lost during a `git reset` operation. **My Solution**: Re-create the file.
2.  A `build.os` validation error occurred due to a too-minimal configuration. **My Solution**: Update the `.readthedocs.yaml` to a more robust, modern template.
3.  Further build failures occurred because Read the Docs was checking out an old commit that was missing the config files. **My Solution**: I realized I needed to manually trigger a build of the `latest` branch on the Read the Docs dashboard.
4.  A final failure occurred because `docs/conf.py` was empty (again, due to the earlier `git reset`). **My Solution**: Restore the contents of `conf.py`.

This journey led me to a robust, industry-standard documentation and publishing pipeline.
