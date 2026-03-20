import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  useKeyboardShortcutsStore,
  formatKeyCombo,
  type KeyboardShortcut,
} from '@/stores/keyboardShortcutsStore';

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  tabs: 'Tabs',
  terminal: 'Terminal',
  panels: 'Panels',
};

const ShortcutRow = ({ shortcut }: { shortcut: KeyboardShortcut }) => {
  const editingId = useKeyboardShortcutsStore(s => s.editingId);
  const setEditingId = useKeyboardShortcutsStore(s => s.setEditingId);
  const updateShortcut = useKeyboardShortcutsStore(s => s.updateShortcut);

  const isEditing = editingId === shortcut.id;
  const [recordedKeys, setRecordedKeys] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const combo = formatKeyCombo(e);
    if (combo) {
      setRecordedKeys(combo);
      updateShortcut(shortcut.id, combo);
    }
  }, [shortcut.id, updateShortcut]);

  useEffect(() => {
    if (isEditing) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, handleKeyDown]);

  useEffect(() => {
    if (!isEditing) {
      setRecordedKeys(null);
    }
  }, [isEditing]);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/30 transition-colors group">
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{shortcut.label}</span>
        <p className="text-xs text-muted-foreground">{shortcut.description}</p>
      </div>
      <button
        onClick={() => setEditingId(isEditing ? null : shortcut.id)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-mono transition-all ${
          isEditing
            ? 'border-primary bg-primary/10 text-primary animate-pulse'
            : 'border-border bg-secondary/50 text-foreground hover:border-primary/50'
        }`}
      >
        {isEditing ? (
          recordedKeys || 'Press keys...'
        ) : (
          shortcut.keys.split('+').map((key, i) => (
            <span key={i}>
              {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
              <kbd className="px-1 py-0.5 bg-background rounded border border-border text-[11px]">
                {key}
              </kbd>
            </span>
          ))
        )}
      </button>
    </div>
  );
};

export const KeyboardShortcutsModal = () => {
  const isModalOpen = useKeyboardShortcutsStore(s => s.isModalOpen);
  const closeModal = useKeyboardShortcutsStore(s => s.closeModal);
  const shortcuts = useKeyboardShortcutsStore(s => s.shortcuts);
  const resetToDefaults = useKeyboardShortcutsStore(s => s.resetToDefaults);

  // Group shortcuts by category
  const grouped = shortcuts.reduce<Record<string, KeyboardShortcut[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Click on a shortcut to reassign it. Press the new key combination to save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items], groupIdx) => (
            <div key={category}>
              {groupIdx > 0 && <Separator className="mb-3" />}
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="space-y-0.5">
                {items.map(shortcut => (
                  <ShortcutRow key={shortcut.id} shortcut={shortcut} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs text-muted-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Defaults
          </Button>
          <Button variant="outline" size="sm" onClick={closeModal}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
