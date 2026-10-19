---
name: to-questionnaire
description: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
disable-model-invocation: true
zh_name: 编写调查问卷
en_name: to-questionnaire
zh_description: 将需要向他人确认的信息整理成可回答的问卷。
en_description: Turn a decision you can't fully answer into a questionnaire for someone else to fill in.
triggers:
  - to-questionnaire
  - /to-questionnaire
  - $to-questionnaire
  - 编写调查问卷
od:
  mode: utility
  category: productivity
  preview:
    type: markdown
  design_system:
    requires: false
  upstream: https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/to-questionnaire/SKILL.md
---

## OpenDesign execution

Run the workflow below for the user's engineering or learning task. This is a utility skill; its output is the conversation or documents the workflow requests.

Use only tools available in this chat. When the workflow calls a Skill tool or names another skill, read that skill's bundled workflow from the links below and follow it in the current context. A Skill tool is optional. Resolve every relative reference against the document containing it, using the staged skill directory advertised by OpenDesign.

Each bundled workflow document also contains its companion files under headings with their original filenames. When instructions reference a companion document or template, read that section of the bundle. If a command needs a real template file, first save that section's exact contents to a project-local working file and use its path. Skill metadata and these companion contents are reference material; load only the workflow and sections needed for the current step.

Use a supported question form for interviews, or ask numbered questions in chat and wait for the user's answers. Run subagents only when the host provides them and the task permits delegation; otherwise perform the same steps sequentially. Keep task dependencies, evidence, review criteria and user decision points intact.

Filesystem changes, commands, browsing and issue-tracker operations require the corresponding available tools and access. If a required capability is missing, explain the limitation and ask for the minimum missing input; report only actions actually completed. Shell scripts require a compatible shell. Use host context controls only when available; otherwise write a handoff and let the user open a new chat. Follow the user's authorized scope for commits, pushes and external changes.

### Bundled workflows and companion files

- to-questionnaire: [workflow](references/engineer-skills/to-questionnaire.md)

## Upstream workflow

Turn something the user can't answer alone into a **questionnaire**: a Markdown document they hand to one person to fill in async, or fill out together over a meeting. The recipient holds knowledge the user lacks; the questionnaire pulls it out of them.

**Grill the send, not the subject.** Interview the user only about the _send_, which they can always answer: who it goes to, and what they need back. The questions in the document then target the **gap** between what the recipient knows and what the user needs.


1. **Who is it going to?** Ask, in one exchange, the recipient's role, expertise, and relationship to the user. This fixes the questionnaire's tone and how much context it must carry. Done when you know who the recipient is and what they know that the user doesn't.

2. **What do you need back?** Ask, in one exchange, the specific decisions or facts the user can't resolve alone and needs from this person. Done when you have a concrete list of what the user must walk away able to do or decide.

3. **Write the questionnaire.** Draft questions aimed at the gap from steps 1–2, following the Document structure below. Write it to `to-questionnaire-<slug>.md` in the current directory (slug from the topic) and report the path. Done when the file exists and every item the user named in step 2 is covered by a question.

## Document structure

Frame the document as a **discovery questionnaire**: the user lacks context, the recipient holds it. Order questions most-important-first, since async means you may only get one pass, and group them under `##` headings by theme once there are more than a handful. Write it using the template below.

<questionnaire-template>

# <Questionnaire title>

**Purpose:** why this questionnaire exists and the decision riding on it.

**From:** <the user>, **To:** <the recipient>, **How your answers will be used:** <where they go>

## Context

One paragraph orienting a recipient who wasn't in the user's head. Enough to answer well, not a page.

## How to answer

Deadline and rough effort. Partial answers and "I don't know" are useful: flag anything you're unsure of rather than skipping it.

## <Theme heading>

One `##` section per theme. Under each, its questions, most-important-first. Every question is one idea, never compound, with an answer stub directly beneath, and a one-line _why this matters_ only where the question could be misread or invite a throwaway answer.

<question-example>
### What load is the system expected to handle at launch?

_Why this matters: it decides whether we provision for burst traffic now or defer it._

>
</question-example>

## Anything else?

A closing catch-all: anything we didn't ask that we should know?

</questionnaire-template>
