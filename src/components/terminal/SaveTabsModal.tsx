import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";

interface TabData {
  id: string;
  title: string;
  cwd: string;
}

interface SaveTabsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveTabsModal = ({ open, onOpenChange }: SaveTabsModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'commands' | 'templates' | 'workflows' | 'sessions'>('sessions');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Get current tabs from IPC
  const [currentTabs, setCurrentTabs] = useState<TabData[]>([]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      const tabs = await window.ipcRenderer.invoke('get-current-tabs') as TabData[];
      console.log('[SaveTabsModal] Current tabs:', tabs);

      const libraryItem = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        type,
        tags,
        content: {
          tabs: tabs || currentTabs,
          savedAt: new Date().toISOString(),
          version: '1.0'
        },
        category: type,
        usage: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      console.log('[SaveTabsModal] Saving library item:', libraryItem);
      await (await import('@/lib/libraryStorage')).LibraryStorage.save(libraryItem);
      console.log('[SaveTabsModal] Library item saved');

      setName('');
      setDescription('');
      setType('sessions');
      setTags([]);
      setCurrentTag('');

      onOpenChange(false);
    } catch (error) {
      console.error('[SaveTabsModal] Failed to save tabs:', error);
    }
  };

  const loadCurrentTabs = async () => {
    try {
      const tabs = await window.ipcRenderer.invoke('get-current-tabs') as TabData[];
      setCurrentTabs(tabs);
    } catch (error) {
      console.error('Failed to load current tabs:', error);
    }
  };

  // Load tabs when modal opens
  useEffect(() => {
    if (open) {
      loadCurrentTabs();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Current Tabs to Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Current Tabs Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <Label className="text-sm font-medium mb-3 block">Current Tabs ({currentTabs.length})</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentTabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center justify-between bg-background rounded p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{tab.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate max-w-40">
                    {tab.cwd}
                  </div>
                </div>
              ))}
              {currentTabs.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No active tabs found
                </div>
              )}
            </div>
          </div>

          {/* Save Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Development Setup, Database Management"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this tab collection is for..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Sessions - Saved Tab Collections</SelectItem>
                  <SelectItem value="workflows">Workflows - Multi-step Processes</SelectItem>
                  <SelectItem value="templates">Templates - Reusable Setups</SelectItem>
                  <SelectItem value="commands">Commands - Quick Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || currentTabs.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Library
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};