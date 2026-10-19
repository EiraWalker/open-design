---
name: implement
description: Implement a piece of work based on a spec or set of tickets.
disable-model-invocation: true
zh_name: 实现任务
en_name: implement
zh_description: 按任务要求实现行为，并进行测试与代码审查。
en_description: Implement a piece of work based on a spec or set of tickets.
triggers:
  - implement
  - /implement
  - $implement
  - 实现任务
od:
  mode: utility
  category: engineering
  preview:
    type: markdown
  design_system:
    requires: false
  upstream: https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement/SKILL.md
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
- implement: [workflow](references/engineer-skills/implement.md)
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

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
