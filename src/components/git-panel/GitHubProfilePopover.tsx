import { useState } from 'react';
import { GithubLogo } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function GitHubProfilePopover() {
  const githubAuth = useGitStore(s => s.githubAuth);
  const connectGitHub = useGitStore(s => s.connectGitHub);
  const disconnectGitHub = useGitStore(s => s.disconnectGitHub);
  const setActiveSection = useGitStore(s => s.setActiveSection);
  const open = useGitStore(s => s.open);
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const user = githubAuth.user;
  const isConnected = githubAuth.isConnected && !!user;

  const handleConnect = async () => {
    if (!token.trim()) return;
    setIsConnecting(true);
    await connectGitHub(token.trim());
    setIsConnecting(false);
    setToken('');
  };

  const handleViewRepos = () => {
    open();
    setActiveSection('clone');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
          title={isConnected ? `GitHub: @${user.login}` : 'GitHub'}
        >
          {isConnected ? (
            <Avatar className="h-5 w-5">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="text-[8px]">
                {(user.name || user.login).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <GithubLogo size={20} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-64 p-0">
        {isConnected ? (
          <div>
            <div className="p-4 flex flex-col items-center text-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatarUrl} alt={user.login} />
                <AvatarFallback className="text-lg">
                  {(user.name || user.login).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.name || user.login}
                </p>
                <p className="text-xs text-muted-foreground">@{user.login}</p>
                {user.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>
            <Separator />
            <div className="p-2 space-y-1">
              <button
                onClick={handleViewRepos}
                className="w-full px-3 py-1.5 text-xs text-left rounded hover:bg-accent transition-colors"
              >
                View Repositories
              </button>
              <button
                onClick={disconnectGitHub}
                className="w-full px-3 py-1.5 text-xs text-left rounded text-red-500 hover:bg-accent transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Connect to GitHub</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a Personal Access Token to connect.
              </p>
            </div>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              placeholder="GitHub Personal Access Token"
              className="w-full text-xs bg-secondary/50 border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <button
              onClick={handleConnect}
              disabled={!token.trim() || isConnecting}
              className="w-full px-2 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
