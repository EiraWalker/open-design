---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
zh_name: 测试驱动开发
en_name: tdd
zh_description: 通过红灯、绿灯、重构逐步实现可验证的行为。
en_description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
triggers:
  - tdd
  - /tdd
  - $tdd
  - 测试驱动开发
od:
  mode: utility
  category: engineering
  preview:
    type: markdown
  design_system:
    requires: false
  upstream: https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/tdd/SKILL.md
---

## OpenDesign execution

Run the workflow below for the user's engineering or learning task. This is a utility skill; its output is the conversation or documents the workflow requests.

Use only tools available in this chat. When the workflow calls a Skill tool or names another skill, read that skill's bundled workflow from the links below and follow it in the current context. A Skill tool is optional. Resolve every relative reference against the document containing it, using the staged skill directory advertised by OpenDesign.

Each bundled workflow document also contains its companion files under headings with their original filenames. When instructions reference a companion document or template, read that section of the bundle. If a command needs a real template file, first save that section's exact contents to a project-local working file and use its path. Skill metadata and these companion contents are reference material; load only the workflow and sections needed for the current step.

Use a supported question form for interviews, or ask numbered questions in chat and wait for the user's answers. Run subagents only when the host provides them and the task permits delegation; otherwise perform the same steps sequentially. Keep task dependencies, evidence, review criteria and user decision points intact.

Filesystem changes, commands, browsing and issue-tracker operations require the corresponding available tools and access. If a required capability is missing, explain the limitation and ask for the minimum missing input; report only actions actually completed. Shell scripts require a compatible shell. Use host context controls only when available; otherwise write a handoff and let the user open a new chat. Follow the user's authorized scope for commits, pushes and external changes.

### Bundled workflows and companion files

- code-review: [workflow](references/engineer-skills/code-review.md)
- codebase-design: [workflow](references/engineer-skills/codebase-design.md)
- domain-modeling: [workflow](references/engineer-skills/domain-modeling.md)
- grill-with-docs: [workflow](references/engineer-skills/grill-with-docs.md)
- grilling: [workflow](references/engineer-skills/grilling.md)
- improve-codebase-architecture: [workflow](references/engineer-skills/improve-codebase-architecture.md)
- pr: [workflow](references/engineer-skills/pr.md)
- prototype: [workflow](references/engineer-skills/prototype.md)
- research: [workflow](references/engineer-skills/research.md)
- setup-matt-pocock-skills: [workflow](references/engineer-skills/setup-matt-pocock-skills.md)
- tdd: [workflow](references/engineer-skills/tdd.md)
- to-spec: [workflow](references/engineer-skills/to-spec.md)
- to-tickets: [workflow](references/engineer-skills/to-tickets.md)
- triage: [workflow](references/engineer-skills/triage.md)
- wayfinder: [workflow](references/engineer-skills/wayfinder.md)

## Upstream workflow

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

When exploring the codebase, read `GLOSSARY.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](references/engineer-skills/tdd.md#file-tests-md) for examples and [mocking.md](references/engineer-skills/tdd.md#file-mocking-md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?" Give each proposed seam a one-line note on what it catches and what it misses.

When the shape of that interface is itself in question (how deep the module is, where the seam belongs, what the interface should expose), call the Skill tool with "codebase-design" for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter, leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a worked example, the spec.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
