#!/usr/bin/env node
// Usage: node --experimental-strip-types scripts/vendor-engineer-skills.ts <upstream-checkout>
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const revision = '49dd158d1076134a641b33efb035946536778336';
const upstream = 'https://github.com/mattpocock/skills';
const destination = fileURLToPath(new URL('../skills/', import.meta.url));
const source = process.argv[2];
if (!source) throw new Error('Provide a checkout of mattpocock/skills at ' + revision);
const head = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (head !== revision) throw new Error('Unexpected upstream revision: ' + head);
execFileSync('git', ['-C', source, 'diff', '--exit-code', revision, '--', 'skills/engineering', 'skills/productivity', 'LICENSE'], { stdio: 'pipe' });

// Localized picker metadata; the upstream workflow remains the source of truth.
const labels: Record<string, readonly [string, string]> = {
  'ask-matt': ['工程技能导航', '根据当前任务选择合适的工程技能与工作流。'],
  'code-review': ['代码审查', '依据项目规范和需求审查指定范围的代码变更。'],
  'codebase-design': ['代码模块设计', '设计清晰的模块接口、职责与可测试的边界。'],
  'diagnosing-bugs': ['故障诊断', '建立可重复的失败反馈，再定位并修复问题。'],
  'domain-modeling': ['领域建模', '澄清领域术语，维护词汇表与架构决策记录。'],
  'grill-with-docs': ['追问并记录决策', '通过连续追问完善方案，同时记录词汇表与决策。'],
  'implement': ['实现任务', '按任务要求实现行为，并进行测试与代码审查。'],
  'implement-spec': ['实现规格', '按依赖关系推进规格中的任务并整合验证。'],
  'improve-codebase-architecture': ['改善代码架构', '发现模块设计与测试边界的改进机会。'],
  'pr': ['编写 PR 描述', '用清晰的变更说明与验证证据编写 PR 描述。'],
  'prototype': ['验证性原型', '通过小型可运行原型验证一个设计问题。'],
  'research': ['技术研究', '依据可信的一手资料调查问题并保存有引用的研究结果。'],
  'retro': ['工程复盘', '复盘开发过程，提出规范、工具与工作环境的改进。'],
  'setup-matt-pocock-skills': ['工程流程配置', '配置工程技能所需的问题追踪、文档布局与标签。'],
  'tdd': ['测试驱动开发', '通过红灯、绿灯、重构逐步实现可验证的行为。'],
  'to-spec': ['整理实现规格', '将已经澄清的需求整理成可以实施的规格。'],
  'to-tickets': ['拆分工程任务', '将规格拆成具备依赖关系与验收条件的任务。'],
  'triage': ['问题分诊', '分析原始反馈并整理成代理可以执行的任务。'],
  'wayfinder': ['大型任务探索', '逐步解决大型工作的关键决策，形成实施所需的路线。'],
  'wizard': ['生成人工操作向导', '为需要人工完成的配置与操作生成交互式向导。'],
  'grill-me': ['方案追问', '通过连续追问澄清计划、设计与尚未确定的选择。'],
  'grilling': ['深度访谈', '逐轮梳理未知问题，区分可调查的事实和用户决策。'],
  'handoff': ['任务交接', '生成包含背景、证据与后续行动的交接文档。'],
  'teach': ['概念学习', '围绕概念制定学习任务并记录跨会话的学习进展。'],
  'to-questionnaire': ['编写调查问卷', '将需要向他人确认的信息整理成可回答的问卷。'],
  'wait-what': ['重新解释', '用直白语言补足上下文并重新解释刚才的内容。'],
  'writing-for-agents': ['编写代理指令', '编写与维护技能、代理指令及其引用文档。'],
};

async function filesUnder(dir: string, prefix = ''): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name === 'agents') continue; // Harness-specific UI metadata.
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      for (const [name, body] of await filesUnder(path.join(dir, entry.name), relative + '/')) out.set(name, body);
    } else if (entry.isFile()) out.set(relative, await readFile(path.join(dir, entry.name), 'utf8'));
    else throw new Error('Unexpected non-file in upstream: ' + relative);
  }
  return out;
}

interface UpstreamSkill {
  group: string;
  files: Map<string, string>;
  data: Record<string, unknown> & { name: string; description: string };
  body: string;
  dependencies: string[];
}

const catalog = new Map<string, UpstreamSkill>();
for (const group of ['engineering', 'productivity']) {
  for (const entry of (await readdir(path.join(source, 'skills', group), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (!entry.isDirectory()) continue;
    if (!labels[entry.name]) throw new Error('Unreviewed upstream skill: ' + entry.name);
    const files = await filesUnder(path.join(source, 'skills', group, entry.name));
    const raw = files.get('SKILL.md');
    const match = raw?.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error('Missing skill frontmatter: ' + entry.name);
    const data = parse(match[1]!) as UpstreamSkill['data'];
    if (data.name !== entry.name) throw new Error('Skill name differs from directory: ' + entry.name);
    catalog.set(entry.name, { group, files, data, body: match[2]!.trim(), dependencies: [] });
  }
}
if (catalog.size !== Object.keys(labels).length) throw new Error('Incomplete upstream catalog');

// Include even advisory references: the router and handoffs may load them later.
for (const [name, skill] of catalog) {
  const text = [...skill.files.values()].join('\n');
  skill.dependencies = [...catalog.keys()].filter((other) => other !== name &&
    new RegExp('(?:[`\x22\x27]/?' + other + '[`\x22\x27]|/' + other + '(?![a-z0-9-]))').test(text)).sort();
}

function closure(name: string): string[] {
  const found = new Set([name]);
  function visit(id: string) {
    for (const dep of catalog.get(id)!.dependencies) {
      if (found.has(dep)) continue;
      found.add(dep);
      visit(dep);
    }
  }
  visit(name);
  return [...found].sort();
}

function skillMarkdown(name: string): string {
  const skill = catalog.get(name)!;
  const [zhName, zhDescription] = labels[name]!;
  const manifest = {
    ...skill.data,
    zh_name: zhName,
    en_name: name,
    zh_description: zhDescription,
    en_description: skill.data.description,
    triggers: [name, '/' + name, '$' + name, zhName],
    od: {
      mode: 'utility',
      category: skill.group,
      preview: { type: 'markdown' },
      design_system: { requires: false },
      upstream: `${upstream}/blob/${revision}/skills/${skill.group}/${name}/SKILL.md`,
    },
  };
  const dependencyLinks = closure(name).map((dep) =>
    `- ${dep}: [workflow](references/engineer-skills/${dep}.md)`);
  const adapter = [
    '## OpenDesign execution',
    '',
    'Run the workflow below for the user\'s engineering or learning task. This is a utility skill; its output is the conversation or documents the workflow requests.',
    '',
    'Use only tools available in this chat. When the workflow calls a Skill tool or names another skill, read that skill\'s bundled workflow from the links below and follow it in the current context. A Skill tool is optional. Resolve every relative reference against the document containing it, using the staged skill directory advertised by OpenDesign.',
    '',
    'Each bundled workflow document also contains its companion files under headings with their original filenames. When instructions reference a companion document or template, read that section of the bundle. If a command needs a real template file, first save that section\'s exact contents to a project-local working file and use its path. Skill metadata and these companion contents are reference material; load only the workflow and sections needed for the current step.',
    '',
    'Use a supported question form for interviews, or ask numbered questions in chat and wait for the user\'s answers. Run subagents only when the host provides them and the task permits delegation; otherwise perform the same steps sequentially. Keep task dependencies, evidence, review criteria and user decision points intact.',
    '',
    'Filesystem changes, commands, browsing and issue-tracker operations require the corresponding available tools and access. If a required capability is missing, explain the limitation and ask for the minimum missing input; report only actions actually completed. Shell scripts require a compatible shell. Use host context controls only when available; otherwise write a handoff and let the user open a new chat. Follow the user\'s authorized scope for commits, pushes and external changes.',
    '', '### Bundled workflows and companion files', '', ...dependencyLinks,
  ].join('\n');
  return `---\n${stringify(manifest, { lineWidth: 0 }).trimEnd()}\n---\n\n${adapter}\n\n## Upstream workflow\n\n${skill.body}\n`;
}

const license = await readFile(path.join(source, 'LICENSE'), 'utf8');
function companionAnchor(relative: string): string {
  return 'file-' + relative.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function rewriteCompanionLinks(body: string, skill: UpstreamSkill, fromRoot = false): string {
  return body.replace(/\]\(([^)]+)\)/g, (match, target) => {
    const [relative] = target.split('#');
    const normalized = relative.replace(/^\.\//, '');
    if (!skill.files.has(normalized) || normalized === 'SKILL.md') return match;
    // The entire companion is in this section, including any internal heading.
    const prefix = fromRoot ? `references/engineer-skills/${skill.data.name}.md` : '';
    return `](${prefix}#${companionAnchor(normalized)})`;
  });
}

function workflowDocument(name: string): string {
  const skill = catalog.get(name)!;
  const links = skill.dependencies.map((dep) => `- ${dep}: [workflow](${dep}.md)`);
  const companions = [...skill.files].filter(([relative]) => relative !== 'SKILL.md');
  const sections = companions.map(([relative, text]) => {
    const extension = path.extname(relative).slice(1);
    // Use a fence longer than any upstream run, so embedded Markdown and shell
    // templates retain their exact contents without prematurely closing it.
    const longestFence = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
    const fence = '`'.repeat(longestFence + 1);
    return `<a id="${companionAnchor(relative)}"></a>\n\n## Companion file: ${relative}\n\n${fence}${extension === 'md' ? 'markdown' : extension}\n${text.trimEnd()}\n${fence}`;
  });
  return [
    `# ${name}`,
    'Follow the OpenDesign execution guidance in the selected SKILL.md. Companion files below are embedded source documents, not additional workflow steps. Read them when the workflow references their original filenames. Materialize a template into a project-local file only when execution requires one.',
    ...(links.length ? ['## Related workflows', links.join('\n')] : []),
    '## Upstream workflow', rewriteCompanionLinks(skill.body, skill),
    ...sections,
    '## License', license.trimEnd(),
  ].join('\n\n') + '\n';
}

// One document per dependency keeps progressive disclosure and stays within
// OD Next's 32-file limit. Inline companion files preserve indirect references
// that its direct-path scanner would otherwise omit from a frozen session.
for (const [name, skill] of catalog) {
  const root = path.join(destination, name);
  const referenceRoot = path.join(root, 'references', 'engineer-skills');
  await mkdir(referenceRoot, { recursive: true });
  await writeFile(path.join(root, 'SKILL.md'), rewriteCompanionLinks(skillMarkdown(name), skill, true), 'utf8');
  for (const dep of closure(name)) {
    await writeFile(path.join(referenceRoot, dep + '.md'), workflowDocument(dep), 'utf8');
  }
  await writeFile(path.join(root, 'LICENSE'), license, 'utf8');
  await writeFile(path.join(root, 'UPSTREAM.md'), `# Engineer skills\n\nAdapted from [Matt Pocock's skills](${upstream}/tree/${revision}/skills/${skill.group}/${name}) at commit \`${revision}\`. Upstream workflow and companion files are MIT licensed; see [LICENSE](LICENSE).\n\nOpenDesign additions: localized picker metadata, utility classification, tool availability guidance, and bundled workflow dependencies. Upstream agent-specific UI metadata is omitted. Bundled references are generated copies, not separately registered skills.\n`, 'utf8');
}
const manifest = {
  upstream,
  revision,
  license: 'MIT',
  skills: [...catalog].map(([name, skill]) => ({
    name, group: skill.group, dependencies: skill.dependencies,
    companions: [...skill.files.keys()].filter((relative) => relative !== 'SKILL.md'),
  })),
};
await writeFile(path.join(destination, 'engineer-skills-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Vendored ${catalog.size} self-contained engineer skills from ${revision}.`);
