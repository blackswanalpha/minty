
// Agent Tools Library for Minty

interface MintyConfig {
    version: string;
    lastScanned: string;
    projectId?: string;
    // potentially add file hash or other metadata here
}

/**
 * Tracks the codebase by creating or updating a .minty file in the specified directory.
 * @param directoryPath The absolute path to the directory to track.
 * @returns Object containing success status and message.
 */
export const trackCodebase = async (directoryPath: string): Promise<{ success: boolean; message: string; path?: string }> => {
    try {
        // We need to use IPC to perform file system operations from the renderer
        // Assuming 'write-file' and 'read-file' or similar exist, or we invoke a specific handler.
        // For now, I will assume we can use the existing 'write-file' IPC or similar if available,
        // or arguably this logic should be in the main process and exposed via a specific IPC channel.

        // However, looking at the codebase, it seems we might need to rely on the main process to do the actual writing 
        // if 'fs' is not available directly in the renderer (which it shouldn't be).

        // Let's assume we invoke a command on the main process.
        // Since I don't see a generic 'write-file' exposed in `window.ipcRenderer`, 
        // I should probably implement the logic to CALL the main process, 
        // OR this file is meant to run IN the main process. 

        // Given the request "tool call for an agent that will read files... have .minty file created",
        // This looks like it should be callable from the frontend (where the agent might "live" conceptually in the UI)
        // or backend. 

        // Let's implement the logic to invoke the main process to write the file.
        // I will check main.ts to see what is exposed.

        // WAIT: I should check main.ts first to see what IPC handlers are available.
        // I'll proceed with writing a draft that uses a hypothetical 'agent-track-codebase' IPC, then I will update main.ts to support it if needed.
        // Actually, looking at the plan: "Design logic for agent tool...".

        // Let's write the renderer-side logic here.

        const config: MintyConfig = {
            version: '1.0.0',
            lastScanned: new Date().toISOString(),
            projectId: window.crypto.randomUUID()
        };

        const filePath = `${directoryPath}/.minty`;
        const content = JSON.stringify(config, null, 2);

        // Invoke main process to write file
        // We'll need to ensure main.ts handles 'write-file' or similar.
        // Checking previous tools: I haven't seen main.ts content yet fully.

        // I'll write this to use a new IPC channel 'create-minty-file'.

        const result = await window.ipcRenderer.invoke('create-minty-file', { path: filePath, content }) as { success: boolean; message: string; path?: string };
        return result;

    } catch (error) {
        console.error('Failed to track codebase:', error);
        return { success: false, message: `Error: ${error}` };
    }
};

/**
 * Enhances a prompt by indexing the codebase and retrieving context.
 * @param prompt The original user prompt.
 * @param directoryPath The directory to index and read context from.
 * @returns The enhanced prompt string or error message.
 */
export const enhancePrompt = async (prompt: string, directoryPath: string): Promise<string> => {
    try {
        // 1. Run Indexing
        // We'll rely on the main process to execute the CLI
        const indexResult = await window.ipcRenderer.invoke('run-minty-index', directoryPath) as { success: boolean; output?: string; error?: string };

        if (!indexResult.success) {
            console.error('Indexing failed:', indexResult.error);
            return `Failed to enhance prompt: Error indexing codebase. ${indexResult.error}`;
        }

        // 2. Read Context
        const contextResult = await window.ipcRenderer.invoke('read-codebase-context', directoryPath) as { success: boolean; content?: string; error?: string };

        if (!contextResult.success || !contextResult.content) {
            console.error('Reading context failed:', contextResult.error);
            return `Failed to enhance prompt: Could not read codebase context. ${contextResult.error}`;
        }

        // 3. Construct Enhanced Prompt
        // Simple strategy: Append context to the prompt
        // We might want to truncate context if it's too massive, but let's trust the CLI to have done some filtering or the user to handle it.
        // For better UX, we'll wrap it nicely.

        const enhancedPrompt = `${prompt}\n\n---\n\n### Codebase Context\n\nThe following is a context dump of the current codebase to assist in answering the request:\n\n${contextResult.content}`;

        return enhancedPrompt;

    } catch (error) {
        console.error('Enhance prompt error:', error);
        return `Error enhancing prompt: ${error}`;
    }
};
