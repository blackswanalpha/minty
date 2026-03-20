import { FloppyDisk } from '@phosphor-icons/react';
import { useCodeEditorStore } from '@/stores/codeEditorStore';
import { toast } from 'sonner';

export function EditorHeader() {
  const rootPath = useCodeEditorStore((s) => s.rootPath);
  const openTabs = useCodeEditorStore((s) => s.openTabs);
  const rootName = rootPath.split('/').pop() || rootPath;
  const hasDirty = openTabs.some((t) => t.isDirty);

  const handleSaveAll = async () => {
    const dirtyTabs = openTabs.filter((t) => t.isDirty);
    let saved = 0;
    for (const tab of dirtyTabs) {
      const ok = await useCodeEditorStore.getState().saveFile(tab.filePath);
      if (ok) saved++;
    }
    if (saved > 0) {
      toast.success(`Saved ${saved} file${saved > 1 ? 's' : ''}`);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{rootName}</span>
        <span className="text-xs text-muted-foreground">Code Editor</span>
      </div>
      {hasDirty && (
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <FloppyDisk size={14} />
          Save All
        </button>
      )}
    </div>
  );
}
