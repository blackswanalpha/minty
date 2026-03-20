import { X } from 'lucide-react';
import { getFileIcon } from '@/components/file-explorer/fileIcons';
import { useCodeEditorStore } from '@/stores/codeEditorStore';

export function EditorFileTabs() {
  const openTabs = useCodeEditorStore((s) => s.openTabs);
  const activeTabPath = useCodeEditorStore((s) => s.activeTabPath);
  const closeTab = useCodeEditorStore((s) => s.closeTab);

  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-center border-b border-border bg-background overflow-x-auto scrollbar-none">
      {openTabs.map((tab) => {
        const isActive = tab.filePath === activeTabPath;
        const { icon: IconComponent, className: iconClassName } = getFileIcon(tab.fileName, false, false);

        return (
          <button
            key={tab.filePath}
            onClick={() => useCodeEditorStore.getState().openFile(tab.filePath)}
            className={`group flex items-center gap-1.5 px-3 py-2 text-sm border-r border-border shrink-0 transition-colors ${
              isActive
                ? 'bg-background text-foreground border-b-2 border-b-primary'
                : 'bg-muted/30 text-muted-foreground hover:bg-accent/50'
            }`}
          >
            <IconComponent weight="fill" size={14} className={`shrink-0 ${iconClassName}`} />
            <span className="truncate max-w-[120px]">{tab.fileName}</span>
            {tab.isDirty && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.filePath);
              }}
              className="ml-1 p-0.5 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
