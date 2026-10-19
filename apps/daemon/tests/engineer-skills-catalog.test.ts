import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { listSkills, type SkillInfo } from '../src/skills.js';
import { stageActiveSkill } from '../src/cwd-aliases.js';
import { captureOdNextSessionSkillPackage } from '../src/strategies/od-next/session-skill-package.js';
import { materializeFrozenSkillPackage } from '../src/strategies/od-next/frozen-skill-package.js';

const skillsRoot = path.resolve(import.meta.dirname, '../../../skills');
const manifest = JSON.parse(await readFile(path.join(skillsRoot, 'engineer-skills-manifest.json'), 'utf8')) as {
  revision: string;
  skills: { name: string; group: string; dependencies: string[]; companions: string[] }[];
};
let catalog: SkillInfo[];

async function workflowFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...(await workflowFiles(path.join(root, entry.name))).map((name) => `${entry.name}/${name}`));
    } else if (entry.isFile()) files.push(entry.name);
  }
  return files;
}

beforeAll(async () => {
  catalog = await listSkills([path.join(skillsRoot, '.nonexistent-user-root'), skillsRoot]);
});

describe('self-contained engineer skills', () => {
  it('registers the complete stable engineering and productivity catalog', () => {
    expect(manifest.skills).toHaveLength(27);
    expect(new Set(manifest.skills.map((s) => s.name)).size).toBe(27);
    for (const { name, group } of manifest.skills) {
      const matches = catalog.filter((skill) => skill.id === name);
      expect(matches, name).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        mode: 'utility', category: group, source: 'built-in',
        previewType: 'markdown', designSystemRequired: false, aggregatesExamples: false,
      });
      expect(matches[0]!.upstream).toContain(manifest.revision);
      expect(matches[0]!.displayName?.['zh-CN']).toBeTruthy();
      expect(matches[0]!.descriptionI18n?.['zh-CN']).toBeTruthy();
      expect(matches[0]!.triggers).toContain('$' + name);
    }
  });

  it.each(manifest.skills)('$name keeps every linked workflow reachable in a frozen chat package', async ({ name, companions }) => {
    const frozen = await captureOdNextSessionSkillPackage({
      metadata: { kind: 'prototype' },
      getLocalPluginBySource: undefined,
      selection: { skillIds: [name] },
      listSkillCatalog: async () => catalog,
    });
    expect(frozen.selections.map((s) => s.canonicalId)).toEqual([name]);
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'engineer-skill-'));
    try {
      const [relativeRoot] = await materializeFrozenSkillPackage({ frozen, cwd });
      const root = path.join(cwd, relativeRoot!);
      // Validate the actual referenced paths after staging, including transitive
      // dependencies and local companion documents, rather than just the manifest.
      for (const file of frozen.selections[0]!.files) {
        expect(await readFile(path.join(root, file.path))).toEqual(
          await readFile(path.join(skillsRoot, name, file.path)),
        );
      }
      const bodies = [catalog.find((s) => s.id === name)!.body];
      const docs = (await workflowFiles(root)).filter((file) => file.endsWith('.md'));
      const roots = [root];
      for (const doc of docs) {
        bodies.push(await readFile(path.join(root, doc), 'utf8'));
        roots.push(path.dirname(path.join(root, doc)));
      }
      for (const [index, body] of bodies.entries()) {
        for (const match of body.matchAll(/\[workflow\]\(([^)]+)\)/g)) {
          const target = path.resolve(roots[index]!, match[1]!);
          expect(path.relative(root, target).startsWith('..'), target).toBe(false);
          expect(await readFile(target, 'utf8')).toContain('## Upstream workflow');
        }
      }
      const ownWorkflow = await readFile(path.join(root, 'references/engineer-skills', name + '.md'), 'utf8');
      for (const companion of companions) expect(ownWorkflow).toContain('## Companion file: ' + companion);
      // Root-level companion files must survive as well as references/ trees.
      for (const file of await workflowFiles(path.join(skillsRoot, name))) {
        if (['SKILL.md', 'LICENSE', 'UPSTREAM.md'].includes(file)) continue;
        expect(frozen.selections[0]!.files.map((f) => f.path), name).toContain(file);
      }
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('stages grill-me with its interview workflow using the installed desktop path', async () => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'engineer-desktop-'));
    try {
      const staged = await stageActiveSkill(cwd, 'grill-me', path.join(skillsRoot, 'grill-me'));
      expect(staged.staged).toBe(true);
      expect(await readFile(path.join(staged.stagedPath!, 'references/engineer-skills/grilling.md'), 'utf8'))
        .toContain('Then wait for the user');
      expect(await readFile(path.join(staged.stagedPath!, 'LICENSE'), 'utf8')).toContain('Copyright (c) 2026 Matt Pocock');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
