import { GithubLogo, SignOut } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';

export function GitHubConnectionCard() {
  const githubAuth = useGitStore(s => s.githubAuth);
  const disconnectGitHub = useGitStore(s => s.disconnectGitHub);

  if (githubAuth.isConnected && githubAuth.user) {
    return (
      <div className="px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img
            src={githubAuth.user.avatarUrl}
            alt={githubAuth.user.login}
            className="w-8 h-8 rounded-full border border-border"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {githubAuth.user.name || githubAuth.user.login}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              @{githubAuth.user.login}
            </p>
          </div>
          <button
            onClick={disconnectGitHub}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-red-500 transition-colors"
            title="Disconnect GitHub"
          >
            <SignOut size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <GithubLogo size={16} />
        <p className="text-[10px]">
          Connect via the GitHub button in the sidebar.
        </p>
      </div>
    </div>
  );
}
