import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useCodeEditorStore } from '@/stores/codeEditorStore';
import { EditorHeader } from './EditorHeader';
import { EditorFileTree } from './EditorFileTree';
import { EditorFileTabs } from './EditorFileTabs';
import { EditorPane } from './EditorPane';
import { toast } from 'sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function CodeEditorModal() {
  const isOpen = useCodeEditorStore((s) => s.isOpen);
  const closeModal = useCodeEditorStore((s) => s.closeModal);

  // Ctrl+S handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const store = useCodeEditorStore.getState();
      if (store.activeTabPath) {
        store.saveActiveFile().then((ok) => {
          if (ok) toast.success('File saved');
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const hasUnsaved = useCodeEditorStore.getState().hasUnsavedChanges();
      if (hasUnsaved) {
        const confirmed = window.confirm('You have unsaved changes. Close anyway?');
        if (!confirmed) return;
      }
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Code Editor</DialogTitle>
        </VisuallyHidden>
        <EditorHeader />
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <EditorFileTree />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={80}>
              <div className="h-full flex flex-col">
                <EditorFileTabs />
                <div className="flex-1 overflow-hidden">
                  <EditorPane />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
