"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitManager = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const electron_1 = require("electron");
const simple_git_1 = __importDefault(require("simple-git"));
const rest_1 = require("@octokit/rest");
const SETTINGS_FILENAME = 'minty_github_settings.json';
function mapStatus(code) {
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
    settingsPath;
    octokit = null;
    githubMethod = 'pat';
    storedToken = '';
    askPassScriptPath = '';
    constructor() {
        const userDataPath = process.env.USER_DATA_PATH || electron_1.app.getPath('userData');
        this.settingsPath = node_path_1.default.join(userDataPath, SETTINGS_FILENAME);
        this.askPassScriptPath = node_path_1.default.join(node_os_1.default.tmpdir(), 'minty-git-askpass.sh');
    }
    git(cwd) {
        return (0, simple_git_1.default)({ baseDir: cwd });
    }
    /**
     * Returns a simple-git instance that injects the stored GitHub PAT
     * via GIT_ASKPASS so HTTPS push/pull/clone authenticate automatically.
     */
    authGit(cwd) {
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
            node_fs_1.default.writeFileSync(this.askPassScriptPath, scriptContent, { mode: 0o700 });
        }
        catch {
            return this.git(cwd);
        }
        return (0, simple_git_1.default)({
            baseDir: cwd,
            config: [],
        }).env('GIT_ASKPASS', this.askPassScriptPath)
            .env('GIT_TERMINAL_PROMPT', '0');
    }
    // ── Repo Detection ────────────────────────────────────────────────
    async isGitRepo(cwd) {
        try {
            const isRepo = await this.git(cwd).checkIsRepo();
            return { success: true, data: isRepo };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async initRepo(cwd) {
        try {
            await this.git(cwd).init();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Status ────────────────────────────────────────────────────────
    async getStatus(cwd) {
        try {
            const g = this.git(cwd);
            const isRepo = await g.checkIsRepo();
            if (!isRepo) {
                return { success: true, data: { isRepo: false, branch: '', ahead: 0, behind: 0, staged: [], unstaged: [], untracked: [], conflicted: [] } };
            }
            const status = await g.status();
            const staged = status.staged.map(f => ({
                path: f,
                status: mapStatus(status.files.find(ff => ff.path === f)?.index || 'M'),
                staged: true,
            }));
            const unstaged = status.modified.filter(f => !status.staged.includes(f)).map(f => ({
                path: f,
                status: 'modified',
                staged: false,
            }));
            // Also include deleted files that aren't staged
            const deletedUnstaged = status.deleted.filter(f => !status.staged.includes(f)).map(f => ({
                path: f,
                status: 'deleted',
                staged: false,
            }));
            const untracked = status.not_added.map(f => ({
                path: f,
                status: 'untracked',
                staged: false,
            }));
            const conflicted = status.conflicted.map(f => ({
                path: f,
                status: 'conflicted',
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Staging ───────────────────────────────────────────────────────
    async stageFiles(cwd, files) {
        try {
            await this.git(cwd).add(files);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async unstageFiles(cwd, files) {
        try {
            await this.git(cwd).reset(['HEAD', '--', ...files]);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async stageAll(cwd) {
        try {
            await this.git(cwd).add('-A');
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Commits ───────────────────────────────────────────────────────
    async commit(cwd, message) {
        try {
            const result = await this.git(cwd).commit(message);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getLog(cwd, limit = 50) {
        try {
            const log = await this.git(cwd).log({ maxCount: limit });
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Diff ──────────────────────────────────────────────────────────
    async getDiff(cwd, staged = false) {
        try {
            const g = this.git(cwd);
            const args = staged ? ['--cached'] : [];
            const rawDiff = await g.diff(args);
            const diffSummary = await g.diffSummary(args);
            const files = diffSummary.files.map(f => ({
                file: f.file,
                insertions: 'insertions' in f ? f.insertions : 0,
                deletions: 'deletions' in f ? f.deletions : 0,
                binary: f.binary,
            }));
            return { success: true, data: { files, rawDiff } };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getFileDiff(cwd, file, staged = false) {
        try {
            const g = this.git(cwd);
            const args = staged ? ['--cached', '--', file] : ['--', file];
            const rawDiff = await g.diff(args);
            return { success: true, data: { files: [], rawDiff } };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Push / Pull ───────────────────────────────────────────────────
    async push(cwd, remote, branch) {
        try {
            const g = this.authGit(cwd);
            if (remote && branch) {
                await g.push(remote, branch);
            }
            else if (remote) {
                await g.push(remote);
            }
            else {
                await g.push();
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async pull(cwd, remote, branch) {
        try {
            const g = this.authGit(cwd);
            if (remote && branch) {
                await g.pull(remote, branch);
            }
            else if (remote) {
                await g.pull(remote);
            }
            else {
                await g.pull();
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Branches ──────────────────────────────────────────────────────
    async getBranches(cwd) {
        try {
            const summary = await this.git(cwd).branch(['-a', '-v']);
            const branches = Object.values(summary.branches).map(b => ({
                name: b.name,
                current: b.current,
                commit: b.commit,
                tracking: b.label || '',
            }));
            return { success: true, data: branches };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async createBranch(cwd, name) {
        try {
            await this.git(cwd).checkoutLocalBranch(name);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async switchBranch(cwd, name) {
        try {
            await this.git(cwd).checkout(name);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async deleteBranch(cwd, name, force = false) {
        try {
            const flag = force ? '-D' : '-d';
            await this.git(cwd).branch([flag, name]);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async mergeBranch(cwd, branch) {
        try {
            await this.git(cwd).merge([branch]);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Remotes ───────────────────────────────────────────────────────
    async getRemotes(cwd) {
        try {
            const remotes = await this.git(cwd).getRemotes(true);
            const data = remotes.map(r => ({
                name: r.name,
                fetchUrl: r.refs.fetch || '',
                pushUrl: r.refs.push || '',
            }));
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async addRemote(cwd, name, url) {
        try {
            await this.git(cwd).addRemote(name, url);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async removeRemote(cwd, name) {
        try {
            await this.git(cwd).removeRemote(name);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async setRemoteUrl(cwd, name, url) {
        try {
            await this.git(cwd).remote(['set-url', name, url]);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── Clone ─────────────────────────────────────────────────────────
    async clone(url, targetDir, options) {
        try {
            const cloneOptions = [];
            if (options?.depth) {
                cloneOptions.push('--depth', String(options.depth));
            }
            // Use authGit for clone so PAT is available for private repos
            const g = this.storedToken ? this.authGit(targetDir).env('GIT_ASKPASS', this.askPassScriptPath) : (0, simple_git_1.default)();
            await g.clone(url, targetDir, cloneOptions);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── GitHub Auth ───────────────────────────────────────────────────
    async loadGitHubAuth() {
        try {
            const data = await promises_1.default.readFile(this.settingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (parsed.token) {
                this.githubMethod = parsed.method || 'pat';
                this.storedToken = parsed.token;
                this.octokit = new rest_1.Octokit({ auth: parsed.token });
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
                }
                catch {
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
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return {
                    success: true,
                    data: { isConnected: false, user: null, token: '', method: 'pat' },
                };
            }
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async saveGitHubAuth(token, method = 'pat') {
        try {
            this.octokit = new rest_1.Octokit({ auth: token });
            const { data: user } = await this.octokit.users.getAuthenticated();
            this.githubMethod = method;
            this.storedToken = token;
            this.setupGitCredentialHelper(token, user.login);
            await promises_1.default.writeFile(this.settingsPath, JSON.stringify({ token, method }, null, 2));
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
        }
        catch (error) {
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
                await promises_1.default.unlink(this.settingsPath);
            }
            catch {
                // File may not exist
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    /**
     * Writes the GitHub PAT into ~/.git-credentials and ensures git is
     * configured to use credential.helper=store so that ALL git processes
     * (including already-running terminals) authenticate automatically.
     */
    setupGitCredentialHelper(token, username) {
        try {
            const credentialLine = `https://${username}:${token}@github.com`;
            const credFilePath = node_path_1.default.join(node_os_1.default.homedir(), '.git-credentials');
            // Read existing credentials, filter out old github.com entries
            let existingLines = [];
            try {
                const existing = node_fs_1.default.readFileSync(credFilePath, 'utf-8');
                existingLines = existing.split('\n').filter(line => line.trim() && !line.includes('@github.com'));
            }
            catch {
                // File doesn't exist yet
            }
            existingLines.push(credentialLine);
            node_fs_1.default.writeFileSync(credFilePath, existingLines.join('\n') + '\n', { mode: 0o600 });
            // Configure git to use credential.helper=store if not already set
            const { execSync } = require('child_process');
            try {
                const currentHelper = execSync('git config --global credential.helper', { encoding: 'utf-8' }).trim();
                if (currentHelper !== 'store') {
                    execSync('git config --global credential.helper store');
                }
            }
            catch {
                // No helper configured yet — set it
                execSync('git config --global credential.helper store');
            }
        }
        catch {
            // Non-critical — UI push/pull still works via authGit
        }
    }
    removeGitCredentialHelper() {
        try {
            const credFilePath = node_path_1.default.join(node_os_1.default.homedir(), '.git-credentials');
            const existing = node_fs_1.default.readFileSync(credFilePath, 'utf-8');
            const filtered = existing.split('\n').filter(line => line.trim() && !line.includes('@github.com'));
            if (filtered.length > 0) {
                node_fs_1.default.writeFileSync(credFilePath, filtered.join('\n') + '\n', { mode: 0o600 });
            }
            else {
                node_fs_1.default.unlinkSync(credFilePath);
            }
        }
        catch {
            // File may not exist
        }
    }
    /** Returns the path to the askpass script (if a token is stored) for PTY env injection. */
    getAskPassEnv() {
        if (this.storedToken && node_fs_1.default.existsSync(this.askPassScriptPath)) {
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    // ── GitHub Repos ──────────────────────────────────────────────────
    async listGitHubRepos(page = 1, perPage = 30) {
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async searchGitHubRepos(query) {
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.gitManager = new GitManager();
//# sourceMappingURL=gitManager.js.map