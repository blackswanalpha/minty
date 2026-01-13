
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { useTerminalStore } from "@/stores/terminalStore";

export const WelcomePage = () => {
    const addTab = useTerminalStore(state => state.addTab);

    useEffect(() => {
        console.log("[WelcomePage] Mounted");
    }, []);

    const handleNewTerminal = async () => {
        const id = window.crypto.randomUUID();

        try {
            const cwd = (await window.ipcRenderer.invoke('init-tab', id)) as string;

            addTab({
                id,
                title: cwd.split('/').pop() || 'home',
                cwd: cwd,
                isReady: false,
                type: 'terminal'
            });

            const { tabs, removeTab } = useTerminalStore.getState();
            const welcomeTab = tabs.find(t => t.type === 'welcome');
            if (welcomeTab) {
                removeTab(welcomeTab.id);
            }
        } catch (error) {
            console.error('Failed to create terminal:', error);
        }
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full text-center space-y-8">

                {/* Hero Section */}
                <div className="space-y-4">
                    <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome to Minty
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your intelligent, agentic terminal workspace. Manage projects, execute commands, and track your codebase with AI-powered tools.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleNewTerminal}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <TerminalIcon className="w-5 h-5" />
                                New Terminal
                            </CardTitle>
                            <CardDescription>Open a standard terminal session</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group opacity-60">
                        {/* Placeholder for future functionality */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <FolderOpen className="w-5 h-5" />
                                Open Project
                            </CardTitle>
                            <CardDescription>Browse and open local projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <span className="text-sm text-muted-foreground">Coming Soon</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group opacity-60">
                        {/* Placeholder for future agent tools */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Sparkles className="w-5 h-5" />
                                Agent Tools
                            </CardTitle>
                            <CardDescription>Run automated codebase analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <span className="text-sm text-muted-foreground">Explore Tools</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    );
};
