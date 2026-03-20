import { exec } from 'node:child_process'
import fs from 'node:fs/promises'

const AI_TOOL_BINARIES: Record<string, string> = {
    'claude': 'Claude Code',
    'claude-code': 'Claude Code',
    'gemini': 'Gemini CLI',
    'opencode': 'OpenCode',
    'kilocode': 'KiloCode',
    'kilo': 'KiloCode',
}

interface AiToolSession {
    tabId: string
    toolName: string
    displayName: string
    childPid: number
    startedAt: number
}

export interface AiToolCompletionEvent {
    tabId: string
    toolName: string
    displayName: string
    durationMs: number
}

type CompletionCallback = (event: AiToolCompletionEvent) => void

const POLL_INTERVAL_MS = 2000

export class AiToolMonitor {
    private monitoredTabs = new Map<string, number>() // tabId -> shellPid
    private activeSessions = new Map<string, AiToolSession>() // "tabId:childPid" -> session
    private pollTimer: ReturnType<typeof setInterval> | null = null
    private enabled = true
    private onComplete: CompletionCallback

    constructor(onComplete: CompletionCallback) {
        this.onComplete = onComplete
    }

    startMonitoring(tabId: string, shellPid: number): void {
        console.log(`[AiToolMonitor] startMonitoring tab=${tabId} shellPid=${shellPid}`)
        this.monitoredTabs.set(tabId, shellPid)
        this.ensurePolling()
    }

    stopMonitoring(tabId: string): void {
        this.monitoredTabs.delete(tabId)
        // Clean up any active sessions for this tab without firing notifications
        for (const [key, session] of this.activeSessions) {
            if (session.tabId === tabId) {
                this.activeSessions.delete(key)
            }
        }
        if (this.monitoredTabs.size === 0) {
            this.stopPolling()
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled
        if (!enabled) {
            this.stopPolling()
        } else if (this.monitoredTabs.size > 0) {
            this.ensurePolling()
        }
    }

    isEnabled(): boolean {
        return this.enabled
    }

    private ensurePolling(): void {
        if (this.pollTimer || !this.enabled) return
        this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS)
    }

    private stopPolling(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer)
            this.pollTimer = null
        }
    }

    private async poll(): Promise<void> {
        if (!this.enabled) return

        for (const [tabId, shellPid] of this.monitoredTabs) {
            try {
                const children = await getChildProcesses(shellPid)

                // Track new AI tool children
                for (const child of children) {
                    const displayName = AI_TOOL_BINARIES[child.comm]
                    if (displayName) {
                        const key = `${tabId}:${child.pid}`
                        if (!this.activeSessions.has(key)) {
                            console.log(`[AiToolMonitor] Detected ${displayName} (pid=${child.pid}) in tab=${tabId}`)
                            this.activeSessions.set(key, {
                                tabId,
                                toolName: child.comm,
                                displayName,
                                childPid: child.pid,
                                startedAt: Date.now(),
                            })
                        }
                    }
                }

                // Check for completed sessions
                const childPids = new Set(children.map(c => c.pid))
                for (const [key, session] of this.activeSessions) {
                    if (session.tabId !== tabId) continue
                    if (!childPids.has(session.childPid)) {
                        // Process is gone — it completed
                        console.log(`[AiToolMonitor] ${session.displayName} completed in tab=${session.tabId} (pid=${session.childPid})`)
                        this.activeSessions.delete(key)
                        this.onComplete({
                            tabId: session.tabId,
                            toolName: session.toolName,
                            displayName: session.displayName,
                            durationMs: Date.now() - session.startedAt,
                        })
                    }
                }
            } catch {
                // Shell PID may have exited; ignore
            }
        }
    }
}

interface ChildProcess {
    pid: number
    comm: string
}

async function getChildProcesses(shellPid: number): Promise<ChildProcess[]> {
    if (process.platform === 'linux') {
        return getChildProcessesLinux(shellPid)
    }
    if (process.platform === 'darwin') {
        return getChildProcessesMacOS(shellPid)
    }
    return []
}

async function getChildProcessesLinux(shellPid: number): Promise<ChildProcess[]> {
    const results: ChildProcess[] = []
    try {
        const childrenStr = await fs.readFile(
            `/proc/${shellPid}/task/${shellPid}/children`,
            'utf-8'
        )
        const childPids = childrenStr.trim().split(/\s+/).filter(Boolean).map(Number)

        for (const pid of childPids) {
            try {
                const comm = (await fs.readFile(`/proc/${pid}/comm`, 'utf-8')).trim()
                results.push({ pid, comm })
            } catch {
                // Child may have exited between reading children list and reading comm
            }
        }
    } catch {
        // Shell PID may have exited
    }
    return results
}

function getChildProcessesMacOS(shellPid: number): Promise<ChildProcess[]> {
    return new Promise((resolve) => {
        exec(
            `pgrep -P ${shellPid}`,
            { timeout: 2000 },
            (err, stdout) => {
                if (err || !stdout.trim()) {
                    resolve([])
                    return
                }
                const pids = stdout.trim().split('\n').map(Number).filter(Boolean)
                if (pids.length === 0) {
                    resolve([])
                    return
                }
                exec(
                    `ps -p ${pids.join(',')} -o pid=,comm=`,
                    { timeout: 2000 },
                    (err2, stdout2) => {
                        if (err2 || !stdout2.trim()) {
                            resolve([])
                            return
                        }
                        const results: ChildProcess[] = []
                        for (const line of stdout2.trim().split('\n')) {
                            const match = line.trim().match(/^(\d+)\s+(.+)$/)
                            if (match) {
                                const pid = Number(match[1])
                                // comm may be a full path; extract basename
                                const comm = match[2].split('/').pop()!.trim()
                                results.push({ pid, comm })
                            }
                        }
                        resolve(results)
                    }
                )
            }
        )
    })
}
