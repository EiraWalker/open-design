---
name: implement-spec
description: Implement the result of /to-spec and /to-tickets in code.
disable-model-invocation: true
zh_name: 实现规格
en_name: implement-spec
zh_description: 按依赖关系推进规格中的任务并整合验证。
en_description: Implement the result of /to-spec and /to-tickets in code.
triggers:
  - implement-spec
  - /implement-spec
  - $implement-spec
  - 实现规格
od:
  mode: utility
  category: engineering
  preview:
    type: markdown
  design_system:
    requires: false
  upstream: https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement-spec/SKILL.md
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
- implement-spec: [workflow](references/engineer-skills/implement-spec.md)
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

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 5 (a branch with no commits ahead of main can't open one), marked as closing the spec and tickets.

4. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, call the Skill tool with `code-review` on the integration branch. Fix all issues raised by the code review in a single **implementer subagent**.

8. If a draft PR exists, mark it ready for review. Otherwise, resolve each ticket the way the issue tracker closes work, and report the integration branch.

9. Clean up all **implementer subagent** worktrees.
