# Engineer skills in OpenDesign

The functional Skills library includes the 27 stable engineering and productivity
workflows from [mattpocock/skills](https://github.com/mattpocock/skills), pinned to
`49dd158d1076134a641b33efb035946536778336`. Select a skill in Integrations → Skills
or mention it in a chat. Chinese titles and descriptions are available in the picker.

Use `ask-matt` to choose a workflow. `grill-me` runs an interview to sharpen a plan;
`grill-with-docs` also records domain terms and decisions. Other entries cover
research, specifications, tickets, implementation, testing, review and handoffs.
The complete inventory and dependency map are in
[`skills/engineer-skills-manifest.json`](../skills/engineer-skills-manifest.json).

Each folder is a complete utility package with the upstream workflow, companion
documents, MIT license and source attribution. Dependencies are bundled under
`references/engineer-skills/` because a chat stages only its selected skills.
Each workflow has one reference document with its companion files embedded under
their original filenames. This preserves indirect references while fitting OD Next's
32-file limit. Read a companion section when the workflow requests it; materialize
template contents into a project-local file if execution requires a real path.
These nested copies are references, so they do not create duplicate picker entries.
When the host has no native Skill tool, the agent reads the linked workflow instead.
When subagents are unavailable, it performs the steps sequentially. Commands, file
changes, browsing and tracker operations still need the corresponding tools and
access; the skill instructions do not add those capabilities.

## Updating the imported catalog

Keep the installed user's customized agent skills separate from these portable
bundles. The importer reads an unmodified upstream checkout and never synchronizes
global agent configuration or changes the running app.

1. Review the upstream revision, catalog, dependency references and license.
2. Update the pinned revision and localized metadata in
   [`scripts/vendor-engineer-skills.ts`](../scripts/vendor-engineer-skills.ts).
3. Generate: `node --experimental-strip-types scripts/vendor-engineer-skills.ts <upstream-checkout>`.
4. Review removed files when changing upstream revisions; generation writes files
   without deleting existing content.
5. Run the daemon's `engineer-skills-catalog.test.ts`, then the repository guard
   and type check. The test exercises registry discovery, frozen session delivery
   and desktop staging with the real dependency files.

In a source checkout, the scanner discovers changes on the next `/api/skills`
request. A packaged desktop app can use copies in its user-managed Skills root;
installing skill folders does not require reinstalling or restarting the app.
