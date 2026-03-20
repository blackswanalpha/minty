import { useEffect } from 'react';
import { Robot, Plugs, CircleNotch, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useAiSettingsStore, type AiProvider } from '@/stores/aiSettingsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AISettingsModal = () => {
  const {
    isModalOpen,
    closeModal,
    provider,
    endpoint,
    apiKey,
    model,
    enabled,
    isLoading,
    connectionStatus,
    connectionMessage,
    availableModels,
    setProvider,
    setEndpoint,
    setApiKey,
    setModel,
    setEnabled,
    loadSettings,
    saveSettings,
    testConnection,
  } = useAiSettingsStore();

  useEffect(() => {
    if (isModalOpen) {
      loadSettings();
    }
  }, [isModalOpen, loadSettings]);

  const handleSave = async () => {
    await saveSettings();
    closeModal();
  };

  const showApiKey = provider !== 'ollama';

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot size={20} weight="duotone" />
            AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI-powered command enhancement using Llama models.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-enabled" className="text-sm font-medium">
                Enable AI Enhancement
              </Label>
              <p className="text-xs text-muted-foreground">
                Use a real AI model instead of mock enhancements
              </p>
            </div>
            <Switch
              id="ai-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <Separator />

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as AiProvider)}
            >
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="llama-api">Llama API</SelectItem>
                <SelectItem value="custom">Custom Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="ai-endpoint">API Endpoint</Label>
            <Input
              id="ai-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </div>

          {/* API Key (hidden for Ollama) */}
          {showApiKey && (
            <div className="space-y-2">
              <Label htmlFor="ai-apikey">API Key</Label>
              <Input
                id="ai-apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
          )}

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="ai-model">Model</Label>
            {availableModels.length > 0 ? (
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="ai-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="qwen3.5:4b"
              />
            )}
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={connectionStatus === 'testing' || !endpoint}
              className="gap-2"
            >
              {connectionStatus === 'testing' ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Plugs size={16} />
              )}
              Test Connection
            </Button>

            {connectionStatus === 'success' && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600 gap-1">
                  <CheckCircle size={12} weight="bold" />
                  Connected
                </Badge>
                <span className="text-xs text-muted-foreground">{connectionMessage}</span>
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1">
                  <XCircle size={12} weight="bold" />
                  Error
                </Badge>
                <span className="text-xs text-muted-foreground">{connectionMessage}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
