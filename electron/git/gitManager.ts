import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { app } from 'electron';
import simpleGit, { type SimpleGit, type StatusResult, type LogResult, type BranchSummary, type DiffResult } from 'simple-git';
import { Octokit } from '@octokit/rest';

const SETTINGS_FILENAME = 'minty_github_settings.json';

interface GitHubSettings {
  token: string;
  method: 'pat' | 'oauth';
}

function mapStatus(code: string): 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'conflicted' {
  switch (code) {
    case 'M': return 'modified';
    case 'A': return 'added';
    case 'D': return 'deleted';
    case 'R': return 'renamed';
    case '?': return 'untracked';
    case 'U': return 'conflicted';
    default: return 'modified';
  }
}

class GitManager {
  private settingsPath: string;
  private octokit: Octokit | null = null;
  private githubMethod: 'pat' | 'oauth' = 'pat';
  private storedToken: string = '';
  private askPassScriptPath: string = '';

  constructor() {
    const userDataPath = process.env.USER_DATA_PATH || app.getPath('userData');
    this.settingsPath = path.join(userDataPath, SETTINGS_FILENAME);
    this.askPassScriptPath = path.join(os.tmpdir(), 'minty-git-askpass.sh');
  }

  private git(cwd: string): SimpleGit {
    return simpleGit({ baseDir: cwd });
  }

  /**
   * Returns a simple-git instance that injects the stored GitHub PAT
   * via GIT_ASKPASS so HTTPS push/pull/clone authenticate automatically.
   */
  private authGit(cwd: string): SimpleGit {
    if (!this.storedToken) {
      return this.git(cwd);
    }

    // Write a tiny askpass script that returns the token as the password.
    // GIT_ASKPASS is called twice: once for "Username" and once for "Password".
    // We return the PAT for both — GitHub accepts the PAT as the username
    // or the password (with any username).
    const scriptContent = process.platform === 'win32'
      ? `@echo off\necho ${this.storedToken}`
      : `#!/bin/sh\necho "${this.storedToken}"`;

    try {
      fsSync.writeFileSync(this.askPassScriptPath, scriptContent, { mode: 0o700 });
    } catch {
      return this.git(cwd);
    }

    return simpleGit({
      baseDir: cwd,
      config: [],
    }).env('GIT_ASKPASS', this.askPassScriptPath)
      .env('GIT_TERMINAL_PROMPT', '0');
  }

  // ── Repo Detection ────────────────────────────────────────────────

  async isGitRepo(cwd: string): Promise<{ success: boolean; data?: boolean; error?: string }> {
    try {
      const isRepo = await this.git(cwd).checkIsRepo();
      return { success: true, data: isRepo };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async initRepo(cwd: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.git(cwd).init();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Status ────────────────────────────────────────────────────────

  async getStatus(cwd: string) {
    try {
      const g = this.git(cwd);
      const isRepo = await g.checkIsRepo();
      if (!isRepo) {
        return { success: true, data: { isRepo: false, branch: '', ahead: 0, behind: 0, staged: [], unstaged: [], untracked: [], conflicted: [] } };
      }

      const status: StatusResult = await g.status();

      const staged = status.staged.map(f => ({
        path: f,
        status: mapStatus(status.files.find(ff => ff.path === f)?.index || 'M'),
        staged: true,
      }));

      const unstaged = status.modified.filter(f => !status.staged.includes(f)).map(f => ({
        path: f,
        status: 'modified' as const,
        staged: false,
      }));

      // Also include deleted files that aren't staged
      const deletedUnstaged = status.deleted.filter(f => !status.staged.includes(f)).map(f => ({
        path: f,
        status: 'deleted' as const,
        staged: false,
      }));

      const untracked = status.not_added.map(f => ({
        path: f,
        status: 'untracked' as const,
        staged: false,
      }));

      const conflicted = status.conflicted.map(f => ({
        path: f,
        status: 'conflicted' as const,
        staged: false,
      }));

      return {
        success: true,
        data: {
          isRepo: true,
          branch: status.current || '',
          ahead: status.ahead,
          behind: status.behind,
          staged,
          unstaged: [...unstaged, ...deletedUnstaged],
          untracked,
          conflicted,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Staging ───────────────────────────────────────────────────────

  async stageFiles(cwd: string, files: string[]) {
    try {
      await this.git(cwd).add(files);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async unstageFiles(cwd: string, files: string[]) {
    try {
      await this.git(cwd).reset(['HEAD', '--', ...files]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async stageAll(cwd: string) {
    try {
      await this.git(cwd).add('-A');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Commits ───────────────────────────────────────────────────────

  async commit(cwd: string, message: string) {
    try {
      const result = await this.git(cwd).commit(message);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getLog(cwd: string, limit: number = 50) {
    try {
      const log: LogResult = await this.git(cwd).log({ maxCount: limit });
      const commits = log.all.map(c => ({
        hash: c.hash,
        hashShort: c.hash.substring(0, 7),
        message: c.message,
        author: c.author_name,
        authorEmail: c.author_email,
        date: c.date,
        refs: c.refs,
      }));
      return { success: true, data: commits };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Diff ──────────────────────────────────────────────────────────

  async getDiff(cwd: string, staged: boolean = false) {
    try {
      const g = this.git(cwd);
      const args = staged ? ['--cached'] : [];
      const rawDiff = await g.diff(args);
      const diffSummary: DiffResult = await g.diffSummary(args);

      const files = diffSummary.files.map(f => ({
        file: f.file,
        insertions: 'insertions' in f ? f.insertions : 0,
        deletions: 'deletions' in f ? f.deletions : 0,
        binary: f.binary,
      }));

      return { success: true, data: { files, rawDiff } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getFileDiff(cwd: string, file: string, staged: boolean = false) {
    try {
      const g = this.git(cwd);
      const args = staged ? ['--cached', '--', file] : ['--', file];
      const rawDiff = await g.diff(args);
      return { success: true, data: { files: [], rawDiff } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Push / Pull ───────────────────────────────────────────────────

  async push(cwd: string, remote?: string, branch?: string) {
    try {
      const g = this.authGit(cwd);
      if (remote && branch) {
        await g.push(remote, branch);
      } else if (remote) {
        await g.push(remote);
      } else {
        await g.push();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async pull(cwd: string, remote?: string, branch?: string) {
    try {
      const g = this.authGit(cwd);
      if (remote && branch) {
        await g.pull(remote, branch);
      } else if (remote) {
        await g.pull(remote);
      } else {
        await g.pull();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Branches ──────────────────────────────────────────────────────

  async getBranches(cwd: string) {
    try {
      const summary: BranchSummary = await this.git(cwd).branch(['-a', '-v']);
      const branches = Object.values(summary.branches).map(b => ({
        name: b.name,
        current: b.current,
        commit: b.commit,
        tracking: b.label || '',
      }));
      return { success: true, data: branches };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createBranch(cwd: string, name: string) {
    try {
      await this.git(cwd).checkoutLocalBranch(name);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async switchBranch(cwd: string, name: string) {
    try {
      await this.git(cwd).checkout(name);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteBranch(cwd: string, name: string, force: boolean = false) {
    try {
      const flag = force ? '-D' : '-d';
      await this.git(cwd).branch([flag, name]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async mergeBranch(cwd: string, branch: string) {
    try {
      await this.git(cwd).merge([branch]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Remotes ───────────────────────────────────────────────────────

  async getRemotes(cwd: string) {
    try {
      const remotes = await this.git(cwd).getRemotes(true);
      const data = remotes.map(r => ({
        name: r.name,
        fetchUrl: r.refs.fetch || '',
        pushUrl: r.refs.push || '',
      }));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async addRemote(cwd: string, name: string, url: string) {
    try {
      await this.git(cwd).addRemote(name, url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async removeRemote(cwd: string, name: string) {
    try {
      await this.git(cwd).removeRemote(name);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async setRemoteUrl(cwd: string, name: string, url: string) {
    try {
      await this.git(cwd).remote(['set-url', name, url]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── Clone ─────────────────────────────────────────────────────────

  async clone(url: string, targetDir: string, options?: { depth?: number }) {
    try {
      const cloneOptions: string[] = [];
      if (options?.depth) {
        cloneOptions.push('--depth', String(options.depth));
      }
      // Use authGit for clone so PAT is available for private repos
      const g = this.storedToken ? this.authGit(targetDir).env('GIT_ASKPASS', this.askPassScriptPath) : simpleGit();
      await g.clone(url, targetDir, cloneOptions);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── GitHub Auth ───────────────────────────────────────────────────

  async loadGitHubAuth(): Promise<{ success: boolean; data?: { isConnected: boolean; user: any; token: string; method: string }; error?: string }> {
    try {
      const data = await fs.readFile(this.settingsPath, 'utf-8');
      const parsed: GitHubSettings = JSON.parse(data);
      if (parsed.token) {
        this.githubMethod = parsed.method || 'pat';
        this.storedToken = parsed.token;
        this.octokit = new Octokit({ auth: parsed.token });

        try {
          const { data: user } = await this.octokit.users.getAuthenticated();
          this.setupGitCredentialHelper(parsed.token, user.login);
          return {
            success: true,
            data: {
              isConnected: true,
              user: {
                login: user.login,
                name: user.name || '',
                avatarUrl: user.avatar_url,
                email: user.email || '',
              },
              token: parsed.token,
              method: this.githubMethod,
            },
          };
        } catch {
          // Token invalid
          this.octokit = null;
          this.storedToken = '';
          return {
            success: true,
            data: { isConnected: false, user: null, token: '', method: 'pat' },
          };
        }
      }
      return {
        success: true,
        data: { isConnected: false, user: null, token: '', method: 'pat' },
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          success: true,
          data: { isConnected: false, user: null, token: '', method: 'pat' },
        };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async saveGitHubAuth(token: string, method: 'pat' | 'oauth' = 'pat') {
    try {
      this.octokit = new Octokit({ auth: token });
      const { data: user } = await this.octokit.users.getAuthenticated();

      this.githubMethod = method;
      this.storedToken = token;
      this.setupGitCredentialHelper(token, user.login);
      await fs.writeFile(this.settingsPath, JSON.stringify({ token, method }, null, 2));

      return {
        success: true,
        data: {
          isConnected: true,
          user: {
            login: user.login,
            name: user.name || '',
            avatarUrl: user.avatar_url,
            email: user.email || '',
          },
          token,
          method,
        },
      };
    } catch (error) {
      this.octokit = null;
      return { success: false, error: error instanceof Error ? error.message : 'Invalid token or connection failed' };
    }
  }

  async disconnectGitHub() {
    try {
      this.octokit = null;
      this.storedToken = '';
      this.removeGitCredentialHelper();
      try {
        await fs.unlink(this.settingsPath);
      } catch {
        // File may not exist
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Writes the GitHub PAT into ~/.git-credentials and ensures git is
   * configured to use credential.helper=store so that ALL git processes
   * (including already-running terminals) authenticate automatically.
   */
  private setupGitCredentialHelper(token: string, username: string): void {
    try {
      const credentialLine = `https://${username}:${token}@github.com`;
      const credFilePath = path.join(os.homedir(), '.git-credentials');

      // Read existing credentials, filter out old github.com entries
      let existingLines: string[] = [];
      try {
        const existing = fsSync.readFileSync(credFilePath, 'utf-8');
        existingLines = existing.split('\n').filter(
          line => line.trim() && !line.includes('@github.com')
        );
      } catch {
        // File doesn't exist yet
      }

      existingLines.push(credentialLine);
      fsSync.writeFileSync(credFilePath, existingLines.join('\n') + '\n', { mode: 0o600 });

      // Configure git to use credential.helper=store if not already set
      const { execSync } = require('child_process');
      try {
        const currentHelper = execSync('git config --global credential.helper', { encoding: 'utf-8' }).trim();
        if (currentHelper !== 'store') {
          execSync('git config --global credential.helper store');
        }
      } catch {
        // No helper configured yet — set it
        execSync('git config --global credential.helper store');
      }
    } catch {
      // Non-critical — UI push/pull still works via authGit
    }
  }

  private removeGitCredentialHelper(): void {
    try {
      const credFilePath = path.join(os.homedir(), '.git-credentials');
      const existing = fsSync.readFileSync(credFilePath, 'utf-8');
      const filtered = existing.split('\n').filter(
        line => line.trim() && !line.includes('@github.com')
      );
      if (filtered.length > 0) {
        fsSync.writeFileSync(credFilePath, filtered.join('\n') + '\n', { mode: 0o600 });
      } else {
        fsSync.unlinkSync(credFilePath);
      }
    } catch {
      // File may not exist
    }
  }

  /** Returns the path to the askpass script (if a token is stored) for PTY env injection. */
  getAskPassEnv(): { GIT_ASKPASS?: string; GIT_TERMINAL_PROMPT?: string } {
    if (this.storedToken && fsSync.existsSync(this.askPassScriptPath)) {
      return {
        GIT_ASKPASS: this.askPassScriptPath,
        GIT_TERMINAL_PROMPT: '0',
      };
    }
    return {};
  }

  async getGitHubUser() {
    if (!this.octokit) {
      return { success: false, error: 'Not connected to GitHub' };
    }
    try {
      const { data: user } = await this.octokit.users.getAuthenticated();
      return {
        success: true,
        data: {
          login: user.login,
          name: user.name || '',
          avatarUrl: user.avatar_url,
          email: user.email || '',
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ── GitHub Repos ──────────────────────────────────────────────────

  async listGitHubRepos(page: number = 1, perPage: number = 30) {
    if (!this.octokit) {
      return { success: false, error: 'Not connected to GitHub' };
    }
    try {
      const { data: repos } = await this.octokit.repos.listForAuthenticatedUser({
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
      });
      const mapped = repos.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        private: r.private,
        cloneUrl: r.clone_url || '',
        sshUrl: r.ssh_url || '',
        defaultBranch: r.default_branch || 'main',
      }));
      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchGitHubRepos(query: string) {
    if (!this.octokit) {
      return { success: false, error: 'Not connected to GitHub' };
    }
    try {
      const { data } = await this.octokit.search.repos({
        q: query,
        per_page: 20,
      });
      const mapped = data.items.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        private: r.private,
        cloneUrl: r.clone_url || '',
        sshUrl: r.ssh_url || '',
        defaultBranch: r.default_branch || 'main',
      }));
      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const gitManager = new GitManager();
