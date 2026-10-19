import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { spawnAgentProcess } from '../../src/runtimes/agent-process.js';

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return { ...actual, spawn: vi.fn(actual.spawn) };
});

afterEach(() => vi.clearAllMocks());

describe('background chat agent startup', () => {
  it.each(['pipe', 'staged'] as const)('hides the console while preserving %s stdin and output pipes', async (stdinMode) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'od-agent-spawn-'));
    const prompt = 'background chat prompt';
    const env = { ...process.env, OD_AGENT_SPAWN_TEST: 'inherited' };
    const script = `
      let prompt = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => { prompt += chunk; });
      process.stdin.on('end', () => {
        process.stdout.write(JSON.stringify({ prompt, cwd: process.cwd(), env: process.env.OD_AGENT_SPAWN_TEST }));
        process.stderr.write('agent diagnostic');
      });
    `;
    const { child, processGroupId } = spawnAgentProcess({
      command: process.execPath,
      args: ['-e', script],
      cwd: root,
      env,
      stdin: stdinMode === 'staged' ? { prompt } : 'pipe',
      runDir: path.join(root, 'run'),
      runId: 'run-background-chat',
    });
    const closed = once(child, 'close');
    let stdout = '';
    let stderr = '';
    child.stdout!.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr!.on('data', (chunk) => { stderr += chunk.toString(); });
    try {
      const options = vi.mocked(spawn).mock.calls[0]?.[2];
      expect(options?.windowsHide).toBe(true);
      expect(options?.shell).toBe(false);
      expect(options?.detached).toBe(process.platform !== 'win32');
      expect(options?.cwd).toBe(root);
      expect(options?.env === env).toBe(true);
      expect(processGroupId).toBe(process.platform === 'win32' ? null : child.pid);
      if (stdinMode === 'pipe') child.stdin!.end(prompt);
      const [code] = await closed;
      expect(code).toBe(0);
      expect(JSON.parse(stdout)).toEqual({ prompt, cwd: root, env: 'inherited' });
      expect(stderr).toBe('agent diagnostic');
    } finally {
      if (child.exitCode === null && child.signalCode === null) child.kill();
      await closed;
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
