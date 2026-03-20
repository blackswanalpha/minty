import { useEffect, useState } from 'react';
import { FolderSimple, MagnifyingGlass } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { GitHubConnectionCard } from './GitHubConnectionCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GitCloneSection() {
  const cloneUrl = useGitStore(s => s.cloneUrl);
  const setCloneUrl = useGitStore(s => s.setCloneUrl);
  const cloneTargetDir = useGitStore(s => s.cloneTargetDir);
  const setCloneTargetDir = useGitStore(s => s.setCloneTargetDir);
  const clone = useGitStore(s => s.clone);
  const isCloning = useGitStore(s => s.isCloning);
  const githubAuth = useGitStore(s => s.githubAuth);
  const githubRepos = useGitStore(s => s.githubRepos);
  const loadGitHubRepos = useGitStore(s => s.loadGitHubRepos);
  const loadGitHubAuth = useGitStore(s => s.loadGitHubAuth);
  const searchGitHubRepos = useGitStore(s => s.searchGitHubRepos);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGitHubAuth();
  }, [loadGitHubAuth]);

  useEffect(() => {
    if (githubAuth.isConnected) {
      loadGitHubRepos();
    }
  }, [githubAuth.isConnected, loadGitHubRepos]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchGitHubRepos(searchQuery.trim());
    } else if (githubAuth.isConnected) {
      loadGitHubRepos();
    }
  };

  const handleSelectRepo = (cloneUrlVal: string) => {
    setCloneUrl(cloneUrlVal);
  };

  const handleSelectDir = async () => {
    try {
      const result = await window.ipcRenderer.invoke('select-directory') as string | null;
      if (result) {
        setCloneTargetDir(result);
      }
    } catch {
      // Dialog may not be available; user can type manually
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border/50 space-y-2">
        <input
          type="text"
          value={cloneUrl}
          onChange={e => setCloneUrl(e.target.value)}
          placeholder="Repository URL (HTTPS or SSH)"
          className="w-full text-xs bg-secondary/50 border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
        />
        <div className="flex gap-1.5">
          <input
            type="text"
            value={cloneTargetDir}
            onChange={e => setCloneTargetDir(e.target.value)}
            placeholder="Target directory..."
            className="flex-1 text-xs bg-secondary/50 border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSelectDir}
            className="p-1.5 rounded border border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Browse"
          >
            <FolderSimple size={14} />
          </button>
        </div>
        <button
          onClick={clone}
          disabled={isCloning || !cloneUrl.trim() || !cloneTargetDir.trim()}
          className="w-full px-2 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCloning ? 'Cloning...' : 'Clone Repository'}
        </button>
      </div>

      {/* GitHub section */}
      <GitHubConnectionCard />

      {githubAuth.isConnected && (
        <>
          <div className="px-3 py-1.5 flex gap-1.5 border-b border-border/50">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search repos..."
              className="flex-1 text-xs bg-secondary/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSearch}
              className="p-1 rounded border border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MagnifyingGlass size={12} />
            </button>
          </div>
          <ScrollArea className="flex-1">
            {githubRepos.map(repo => (
              <button
                key={repo.id}
                onClick={() => handleSelectRepo(repo.cloneUrl)}
                className="w-full text-left px-3 py-2 hover:bg-accent/30 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground truncate">{repo.fullName}</span>
                  {repo.private && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500/10 text-yellow-500 shrink-0">
                      Private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {repo.description}
                  </p>
                )}
              </button>
            ))}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
