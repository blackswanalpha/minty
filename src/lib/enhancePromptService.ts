import { useAiSettingsStore } from '@/stores/aiSettingsStore';

export async function enhanceCommand(command: string): Promise<string> {
  const { enabled } = useAiSettingsStore.getState();

  if (enabled) {
    const response = await window.ipcRenderer.invoke('ai-enhance-command', { command }) as { success: boolean; enhanced: string; error?: string };
    if (response.success && response.enhanced) {
      return response.enhanced;
    }
    throw new Error(response.error || 'AI enhancement failed');
  }

  // Mock only when AI is disabled
  await new Promise(resolve => setTimeout(resolve, 800));
  const trimmed = command.trim();

  if (trimmed.startsWith('rm ')) {
    return `# Enhanced: added interactive flag for safety\n${trimmed.replace('rm ', 'rm -i ')}`;
  }
  if (trimmed.startsWith('find ')) {
    return `# Enhanced: added -print for explicit output\n${trimmed} -print`;
  }
  if (trimmed.startsWith('git ')) {
    return `# Enhanced: added verbose flag\n${trimmed.replace('git ', 'git --verbose ')}`;
  }
  return `# Enhanced: ${trimmed}\n${trimmed}`;
}
