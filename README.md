# Bloxd-DevRef

A complete, honest, and structured documentation of the **Bloxd JavaScript execution environment**.

This project documents **what actually exists and works in Bloxd**, from basic JavaScript support to engine quirks, hard limits, and unknown behaviors. Where knowledge is incomplete, it is explicitly marked.

Bloxd-DevRef is inspired by MDN, but differs in one key way:

> **The documentation mirrors the Bloxd runtime itself, not an ideal JavaScript specification.**

---

## Design Principles

### Completeness

No part of the environment is intentionally omitted.

* If something is known, it is documented.
* If something is partially understood, it is marked as such.
* If something is unknown, it is explicitly listed as unknown.

There are no silent gaps.

### Consistency

All pages follow strict templates depending on their type.

* Identical structure
* Predictable sections
* No stylistic drift

This ensures long-term maintainability and prevents documentation decay.

### Containment

Documentation structure mirrors **runtime containment**.

If, in Bloxd:

* `globalThis` contains `Object`
* `World` contains `Entities`

Then the documentation reflects the same hierarchy.

---

## Documentation Structure

### Bloxd JS Support

Documents **what JavaScript is supported at all**.

This section answers:

> *Can this syntax or behavior be relied on in Bloxd?*

Includes:

* Syntax support matrix
* Behavioral deviations from ECMAScript
* Missing or disabled features

---

### Runtime Semantics

Documents **how code actually executes**.

This section explains:

* Tick and execution model
* Callback defining and execution
* Runtime model and steps

This is about *behavior*, not APIs.

---

### Global Environment

Documents **what exists in code**.

This section mirrors the runtime object graph, rooted at `globalThis`.

Includes:

* Standard globals
* Bloxd-specific globals
* Engine-provided APIs

Nothing is duplicated elsewhere.

---

### Execution Scopes

Documents **where code runs and what rules apply**.

Each scope defines:

* Lifetime
* Privileges
* Interruption rules
* Execution limits

Includes:

* Board Code
* Code Block
* World Code

---

### Constraints & Failure Modes

Documents **what stops execution**.

This section answers:

> *Why did this fail?*

Includes:

* Interruptions
* Rate limits
* Memory limits
* Argument size limits

These are treated as first-class behavior, not edge cases.

---

### Knowledge Status

Documents **how certain each claim is**.

Every page declares its highest supported status:

* **Law** – Observed invariant across all tested contexts
* **Theory** – Explains behavior and makes correct predictions
* **Conjecture** – Plausible but not fully verified
* **Hypothesis** – Educated guess with little or no evidence

This prevents overclaiming and preserves honesty.

---

## Scope of This Documentation

Bloxd-DevRef documents:

* The Bloxd JavaScript environment
* Engine quirks and constraints
* Observable runtime behavior

It does **not** attempt to:

* Teach JavaScript basics
* Replace the ECMAScript specification
* Hide unknowns behind assumptions

---

## Status

This documentation is a living project.
Pages may evolve as new behavior is discovered, tested, or falsified.

Unknowns are not failures — they are tracked problems waiting to be solved.
