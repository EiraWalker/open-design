---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
zh_name: 追问并记录决策
en_name: grill-with-docs
zh_description: 通过连续追问完善方案，同时记录词汇表与决策。
en_description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
triggers:
  - grill-with-docs
  - /grill-with-docs
  - $grill-with-docs
  - 追问并记录决策
od:
  mode: utility
  category: engineering
  preview:
    type: markdown
  design_system:
    requires: false
  upstream: https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/grill-with-docs/SKILL.md
---

## OpenDesign execution

Run the workflow below for the user's engineering or learning task. This is a utility skill; its output is the conversation or documents the workflow requests.

Use only tools available in this chat. When the workflow calls a Skill tool or names another skill, read that skill's bundled workflow from the links below and follow it in the current context. A Skill tool is optional. Resolve every relative reference against the document containing it, using the staged skill directory advertised by OpenDesign.

Each bundled workflow document also contains its companion files under headings with their original filenames. When instructions reference a companion document or template, read that section of the bundle. If a command needs a real template file, first save that section's exact contents to a project-local working file and use its path. Skill metadata and these companion contents are reference material; load only the workflow and sections needed for the current step.

Use a supported question form for interviews, or ask numbered questions in chat and wait for the user's answers. Run subagents only when the host provides them and the task permits delegation; otherwise perform the same steps sequentially. Keep task dependencies, evidence, review criteria and user decision points intact.

Filesystem changes, commands, browsing and issue-tracker operations require the corresponding available tools and access. If a required capability is missing, explain the limitation and ask for the minimum missing input; report only actions actually completed. Shell scripts require a compatible shell. Use host context controls only when available; otherwise write a handoff and let the user open a new chat. Follow the user's authorized scope for commits, pushes and external changes.

### Bundled workflows and companion files

- domain-modeling: [workflow](references/engineer-skills/domain-modeling.md)
- grill-with-docs: [workflow](references/engineer-skills/grill-with-docs.md)
- grilling: [workflow](references/engineer-skills/grilling.md)

## Upstream workflow

Call the Skill tool twice, for "grilling" and "domain-modeling".
