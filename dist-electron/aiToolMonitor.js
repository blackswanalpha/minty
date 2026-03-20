"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiToolMonitor = void 0;
const node_child_process_1 = require("node:child_process");
const promises_1 = __importDefault(require("node:fs/promises"));
const AI_TOOL_BINARIES = {
    'claude': 'Claude Code',
    'claude-code': 'Claude Code',
    'gemini': 'Gemini CLI',
    'opencode': 'OpenCode',
    'kilocode': 'KiloCode',
    'kilo': 'KiloCode',
};
const POLL_INTERVAL_MS = 2000;
class AiToolMonitor {
    monitoredTabs = new Map(); // tabId -> shellPid
    activeSessions = new Map(); // "tabId:childPid" -> session
    pollTimer = null;
    enabled = true;
    onComplete;
    constructor(onComplete) {
        this.onComplete = onComplete;
    }
    startMonitoring(tabId, shellPid) {
        console.log(`[AiToolMonitor] startMonitoring tab=${tabId} shellPid=${shellPid}`);
        this.monitoredTabs.set(tabId, shellPid);
        this.ensurePolling();
    }
    stopMonitoring(tabId) {
        this.monitoredTabs.delete(tabId);
        // Clean up any active sessions for this tab without firing notifications
        for (const [key, session] of this.activeSessions) {
            if (session.tabId === tabId) {
                this.activeSessions.delete(key);
            }
        }
        if (this.monitoredTabs.size === 0) {
            this.stopPolling();
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopPolling();
        }
        else if (this.monitoredTabs.size > 0) {
            this.ensurePolling();
        }
    }
    isEnabled() {
        return this.enabled;
    }
    ensurePolling() {
        if (this.pollTimer || !this.enabled)
            return;
        this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    }
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
    async poll() {
        if (!this.enabled)
            return;
        for (const [tabId, shellPid] of this.monitoredTabs) {
            try {
                const children = await getChildProcesses(shellPid);
                // Track new AI tool children
                for (const child of children) {
                    const displayName = AI_TOOL_BINARIES[child.comm];
                    if (displayName) {
                        const key = `${tabId}:${child.pid}`;
                        if (!this.activeSessions.has(key)) {
                            console.log(`[AiToolMonitor] Detected ${displayName} (pid=${child.pid}) in tab=${tabId}`);
                            this.activeSessions.set(key, {
                                tabId,
                                toolName: child.comm,
                                displayName,
                                childPid: child.pid,
                                startedAt: Date.now(),
                            });
                        }
                    }
                }
                // Check for completed sessions
                const childPids = new Set(children.map(c => c.pid));
                for (const [key, session] of this.activeSessions) {
                    if (session.tabId !== tabId)
                        continue;
                    if (!childPids.has(session.childPid)) {
                        // Process is gone — it completed
                        console.log(`[AiToolMonitor] ${session.displayName} completed in tab=${session.tabId} (pid=${session.childPid})`);
                        this.activeSessions.delete(key);
                        this.onComplete({
                            tabId: session.tabId,
                            toolName: session.toolName,
                            displayName: session.displayName,
                            durationMs: Date.now() - session.startedAt,
                        });
                    }
                }
            }
            catch {
                // Shell PID may have exited; ignore
            }
        }
    }
}
exports.AiToolMonitor = AiToolMonitor;
async function getChildProcesses(shellPid) {
    if (process.platform === 'linux') {
        return getChildProcessesLinux(shellPid);
    }
    if (process.platform === 'darwin') {
        return getChildProcessesMacOS(shellPid);
    }
    return [];
}
async function getChildProcessesLinux(shellPid) {
    const results = [];
    try {
        const childrenStr = await promises_1.default.readFile(`/proc/${shellPid}/task/${shellPid}/children`, 'utf-8');
        const childPids = childrenStr.trim().split(/\s+/).filter(Boolean).map(Number);
        for (const pid of childPids) {
            try {
                const comm = (await promises_1.default.readFile(`/proc/${pid}/comm`, 'utf-8')).trim();
                results.push({ pid, comm });
            }
            catch {
                // Child may have exited between reading children list and reading comm
            }
        }
    }
    catch {
        // Shell PID may have exited
    }
    return results;
}
function getChildProcessesMacOS(shellPid) {
    return new Promise((resolve) => {
        (0, node_child_process_1.exec)(`pgrep -P ${shellPid}`, { timeout: 2000 }, (err, stdout) => {
            if (err || !stdout.trim()) {
                resolve([]);
                return;
            }
            const pids = stdout.trim().split('\n').map(Number).filter(Boolean);
            if (pids.length === 0) {
                resolve([]);
                return;
            }
            (0, node_child_process_1.exec)(`ps -p ${pids.join(',')} -o pid=,comm=`, { timeout: 2000 }, (err2, stdout2) => {
                if (err2 || !stdout2.trim()) {
                    resolve([]);
                    return;
                }
                const results = [];
                for (const line of stdout2.trim().split('\n')) {
                    const match = line.trim().match(/^(\d+)\s+(.+)$/);
                    if (match) {
                        const pid = Number(match[1]);
                        // comm may be a full path; extract basename
                        const comm = match[2].split('/').pop().trim();
                        results.push({ pid, comm });
                    }
                }
                resolve(results);
            });
        });
    });
}
//# sourceMappingURL=aiToolMonitor.js.map