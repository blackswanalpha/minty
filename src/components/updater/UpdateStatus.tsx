
import { useEffect, useState } from 'react';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Download } from 'lucide-react';

// Define types for IPC events if not available globally
interface UpdateInfo {
    version: string;
    files: { url: string; sha512: string; size: number }[];
    path: string;
    sha512: string;
    releaseName: string;
    releaseNotes: string;
    releaseDate: string;
}

interface ProgressInfo {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
}

export function UpdateStatus() {
    const { toast } = useToast();
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle');
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (!window.ipcRenderer) return;

        const handleChecking = () => {
            console.log('Checking for updates...');
            setStatus('checking');
        };

        const handleAvailable = (info: unknown) => {
            console.log('Update available:', info);
            setStatus('available');
            toast({
                title: "Update Available",
                description: `Version ${(info as UpdateInfo).version} is available. Downloading now...`,
            });
            // Auto download is false in main, so we trigger it
            window.ipcRenderer.invoke('download-update');
        };

        const handleNotAvailable = () => {
            console.log('Update not available');
            setStatus('idle');
        };

        const handleError = (err: unknown) => {
            console.error('Update error:', err);
            setStatus('error');
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: String(err),
            });
        };

        const handleProgress = (progressObj: unknown) => {
            setStatus('downloading');
            setProgress((progressObj as ProgressInfo).percent);
        };

        const handleDownloaded = (info: unknown) => {
            console.log('Update downloaded:', info);
            setStatus('downloaded');
            toast({
                title: "Update Ready",
                description: "Restart to install the new version.",
                action: (
                    <ToastAction altText="Restart" onClick={() => window.ipcRenderer.invoke('quit-and-install')}>
                        Restart
                    </ToastAction>
                ),
                duration: Infinity, // Keep open until clicked
            });
        };

        window.ipcRenderer.on('update-checking', handleChecking);
        window.ipcRenderer.on('update-available', handleAvailable);
        window.ipcRenderer.on('update-not-available', handleNotAvailable);
        window.ipcRenderer.on('update-error', handleError);
        window.ipcRenderer.on('download-progress', handleProgress);
        window.ipcRenderer.on('update-downloaded', handleDownloaded);

        return () => {
            window.ipcRenderer.off('update-checking', handleChecking);
            window.ipcRenderer.off('update-available', handleAvailable);
            window.ipcRenderer.off('update-not-available', handleNotAvailable);
            window.ipcRenderer.off('update-error', handleError);
            window.ipcRenderer.off('download-progress', handleProgress);
            window.ipcRenderer.off('update-downloaded', handleDownloaded);
        };
    }, [toast]);

    if (status === 'idle' || status === 'checking') return null;

    // We primarily use toasts, but can show a small status indicator if needed.
    // For now, the toast handles the "Update Ready" state effectively.
    // We can add a persistent small indicator for downloading progress if desired.

    if (status === 'downloading') {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 w-80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Download className="h-4 w-4 animate-bounce" />
                    <span>Downloading Update... {Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        );
    }

    return null;
}
