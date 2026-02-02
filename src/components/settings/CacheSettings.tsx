import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const CacheSettings = () => {
  const { cacheEnabled, setCacheEnabled, loadSettings, isLoading } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Session Cache Settings</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-medium">Enable Session Caching</p>
          <p className="text-sm text-muted-foreground">
            Save and restore tabs with their directories when reopening windows
          </p>
        </div>
        
        <button
          onClick={() => setCacheEnabled(!cacheEnabled)}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            cacheEnabled ? 'bg-primary' : 'bg-muted'
          }`}
          role="switch"
          aria-checked={cacheEnabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform shadow-sm ${
              cacheEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {cacheEnabled && (
        <div className="mt-4 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
          <p>Tabs and their working directories will be automatically saved and restored when you open or close the application.</p>
        </div>
      )}
    </div>
  );
};
