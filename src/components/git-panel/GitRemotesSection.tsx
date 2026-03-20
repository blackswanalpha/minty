import { useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { GitRemoteItem } from './GitRemoteItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GitRemotesSection() {
  const remotes = useGitStore(s => s.remotes);
  const loadRemotes = useGitStore(s => s.loadRemotes);
  const addRemote = useGitStore(s => s.addRemote);
  const removeRemote = useGitStore(s => s.removeRemote);
  const setRemoteUrl = useGitStore(s => s.setRemoteUrl);
  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );
  const cwd = activeTab?.cwd || '';

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingRemote, setEditingRemote] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    if (cwd) {
      loadRemotes(cwd);
    }
  }, [cwd, loadRemotes]);

  const handleAdd = async () => {
    if (!newName.trim() || !newUrl.trim() || !cwd) return;
    await addRemote(cwd, newName.trim(), newUrl.trim());
    setNewName('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleEdit = (name: string) => {
    const remote = remotes.find(r => r.name === name);
    if (remote) {
      setEditingRemote(name);
      setEditUrl(remote.fetchUrl);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRemote || !editUrl.trim() || !cwd) return;
    await setRemoteUrl(cwd, editingRemote, editUrl.trim());
    setEditingRemote(null);
    setEditUrl('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-border/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Remotes ({remotes.length})
        </span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-0.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Add Remote"
        >
          <Plus size={14} />
        </button>
      </div>

      {showAddForm && (
        <div className="px-3 py-2 border-b border-border/50 space-y-1.5">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Remote name (e.g. origin)"
            className="w-full text-xs bg-secondary/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            autoFocus
          />
          <input
            type="text"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="URL"
            className="w-full text-xs bg-secondary/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newUrl.trim()}
            className="w-full px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Add Remote
          </button>
        </div>
      )}

      {/* Edit URL modal inline */}
      {editingRemote && (
        <div className="px-3 py-2 border-b border-border/50 bg-secondary/20 space-y-1.5">
          <p className="text-[10px] text-muted-foreground">Editing: {editingRemote}</p>
          <input
            type="text"
            value={editUrl}
            onChange={e => setEditUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
            className="w-full text-xs bg-secondary/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingRemote(null)}
              className="flex-1 px-2 py-1 text-xs rounded border border-border hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {remotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-xs text-muted-foreground text-center">No remotes configured</p>
          </div>
        ) : (
          remotes.map(remote => (
            <GitRemoteItem
              key={remote.name}
              remote={remote}
              onEdit={handleEdit}
              onRemove={name => { if (cwd) removeRemote(cwd, name); }}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
