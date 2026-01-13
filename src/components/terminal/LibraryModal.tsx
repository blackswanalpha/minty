import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, FileText, Terminal, GitBranch, Package, Settings, Trash2, Copy, Play, Library as LibraryIcon, FolderOpen, Monitor, Maximize2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LibraryStorage, type LibraryItem } from "@/lib/libraryStorage";

interface LibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  commands: Terminal,
  templates: GitBranch,
  workflows: Package,
  sessions: Monitor,
  command: Terminal,
  script: FileText,
  snippet: Package,
  template: GitBranch,
  config: Settings,
  alias: Terminal
};

const typeColors = {
  commands: 'bg-blue-100 text-blue-800 border-blue-200',
  templates: 'bg-green-100 text-green-800 border-green-200',
  workflows: 'bg-purple-100 text-purple-800 border-purple-200',
  sessions: 'bg-orange-100 text-orange-800 border-orange-200',
  command: 'bg-blue-100 text-blue-800 border-blue-200',
  script: 'bg-green-100 text-green-800 border-green-200',
  snippet: 'bg-purple-100 text-purple-800 border-purple-200',
  template: 'bg-orange-100 text-orange-800 border-orange-200',
  config: 'bg-gray-100 text-gray-800 border-gray-200',
  alias: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export const LibraryModal = ({ open, onOpenChange }: LibraryModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [types, setTypes] = useState<string[]>(['All']);

  useEffect(() => {
    if (open) {
      loadLibrary();
    }
  }, [open]);

  const loadLibrary = async () => {
    const items = await LibraryStorage.getAll();
    setLibraryItems(items);
    const cats = await LibraryStorage.getCategories();
    setCategories(cats);
    const typs = await LibraryStorage.getTypes();
    setTypes(typs);
  };

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOpenInNewWindow = async (item: LibraryItem) => {
    console.log('[LibraryModal] handleOpenInNewWindow called for item:', item.name);
    if (item.type === 'sessions' && item.content?.tabs) {
      console.log('[LibraryModal] Calling create-window-with-tabs with tabs:', item.content.tabs);
      const result = await window.ipcRenderer.invoke('create-window-with-tabs', item.content.tabs) as { success?: boolean };
      console.log('[LibraryModal] create-window-with-tabs result:', result);
      if (result?.success) {
        LibraryStorage.save({ ...item, usage: (item.usage || 0) + 1 });
        onOpenChange(false);
      }
    } else {
      console.log('[LibraryModal] Item is not a session or has no tabs');
    }
  };

  const handleExecute = async (item: LibraryItem) => {
    console.log('[LibraryModal] handleExecute called for item:', item.name, 'type:', item.type);
    if (item.type === 'sessions' && item.content?.tabs) {
      console.log('[LibraryModal] Opening session in new window...');
      await handleOpenInNewWindow(item);
    } else {
      console.log('[LibraryModal] Executing in current terminal...');
      const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
      window.ipcRenderer.invoke('send-input', 'active', content + '\n');
      await LibraryStorage.save({ ...item, usage: (item.usage || 0) + 1 });
      onOpenChange(false);
    }
  };

  const handleCopy = (item: LibraryItem) => {
    const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2);
    navigator.clipboard.writeText(content);
  };

  const handleDelete = async (itemId: string) => {
    await LibraryStorage.delete(itemId);
    await loadLibrary();
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const renderSessionContent = (content: any) => {
    if (!content?.tabs) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FolderOpen className="w-4 h-4" />
          {content.tabs.length} Tab{content.tabs.length !== 1 ? 's' : ''}
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {content.tabs.map((tab: any, index: number) => (
            <div key={tab.id || index} className="flex items-center justify-between bg-muted/50 rounded p-2 text-xs">
              <div className="flex items-center gap-2 truncate flex-1">
                <Terminal className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{tab.title}</span>
              </div>
              <div className="font-mono text-muted-foreground truncate max-w-40">
                {tab.cwd}
              </div>
            </div>
          ))}
        </div>
        {content.savedAt && (
          <div className="text-xs text-muted-foreground pt-2">
            Saved: {new Date(content.savedAt).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LibraryIcon className="w-5 h-5" />
            Terminal Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search commands, templates, sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {types.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {filteredItems.map((item) => {
                const Icon = typeIcons[item.type] || Folder;
                const colorClass = typeColors[item.type];

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <Badge className={`text-xs ${colorClass}`}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item);
                          }}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute(item);
                          }}
                          title="Execute/Load"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm mb-2 truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                    <div className="mb-3 min-h-[60px] max-h-[80px] overflow-hidden">
                      {item.type === 'sessions' ? (
                        <div className="text-xs text-muted-foreground">
                          <Monitor className="w-4 h-4 mr-2" />
                          Open Saved Tabs
                        </div>
                      ) : (
                        <div className="text-xs font-mono bg-muted/30 rounded p-2 truncate">
                          {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <div className="flex items-center gap-2">
                        {item.usage !== undefined && (
                          <span>Used {item.usage}x</span>
                        )}
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters, or save some tabs to get started
                </p>
              </div>
            )}
          </div>

          {selectedItem && (
            <>
              <Separator />
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selectedItem.name}</h3>
                    <Badge className={typeColors[selectedItem.type]}>
                      {selectedItem.type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedItem.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {selectedItem.type === 'sessions' ? (
                  renderSessionContent(selectedItem.content)
                ) : (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                      {typeof selectedItem.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem.content, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedItem.type === 'sessions' ? (
                    <>
                      <Button
                        onClick={() => handleOpenInNewWindow(selectedItem)}
                        className="flex-1"
                      >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Open in New Window
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExecute(selectedItem)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Load Here
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleExecute(selectedItem)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Execute in Terminal
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(selectedItem)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
