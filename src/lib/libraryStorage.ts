interface LibraryItem {
  id: string;
  name: string;
  description: string;
  type: 'commands' | 'templates' | 'workflows' | 'sessions';
  content: any;
  category: string;
  tags: string[];
  usage?: number;
  createdAt: string;
}

class LibraryStorage {
  private static useIPC = true;

  private static async ipcInvoke(channel: string, ...args: any[]): Promise<any> {
    if ((window as any).ipcRenderer) {
      return (window as any).ipcRenderer.invoke(channel, ...args);
    }
    return null;
  }

  static async getAll(): Promise<LibraryItem[]> {
    console.log('[LibraryStorage] Loading all items...');
    try {
      if (this.useIPC) {
        const result = await this.ipcInvoke('library-load-all');
        console.log('[LibraryStorage] Load result:', result);
        if (result?.success) {
          return result.items || [];
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('minty-library');
      console.log('[LibraryStorage] Loaded from localStorage:', stored);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[LibraryStorage] Error loading library:', error);
      return [];
    }
  }

  static async save(item: LibraryItem): Promise<void> {
    console.log('[LibraryStorage] Saving item:', item.name, 'type:', item.type);
    try {
      if (this.useIPC) {
        const result = await this.ipcInvoke('library-save', item);
        console.log('[LibraryStorage] Save result:', result);
        if (result?.success) {
          return;
        }
      }
      
      // Fallback to localStorage
      const items = await this.getAll();
      const existingIndex = items.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        items[existingIndex] = { ...item, usage: (items[existingIndex].usage || 0) + 1 };
      } else {
        items.push({ ...item, usage: 0 });
      }
      
      localStorage.setItem('minty-library', JSON.stringify(items));
    } catch (error) {
      console.error('[LibraryStorage] Error saving to library:', error);
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      if (this.useIPC) {
        const result = await this.ipcInvoke('library-delete', id);
        if (result?.success) {
          return;
        }
      }
      
      // Fallback to localStorage
      const items = await this.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem('minty-library', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from library:', error);
    }
  }

  static async search(query: string, category: string = 'All'): Promise<LibraryItem[]> {
    const items = await this.getAll();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => {
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      const matchesCategory = category === 'All' || item.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }

  static async getCategories(): Promise<string[]> {
    const items = await this.getAll();
    return ['All', ...Array.from(new Set(items.map(item => item.category)))];
  }

  static async getTypes(): Promise<string[]> {
    const items = await this.getAll();
    return ['All', ...Array.from(new Set(items.map(item => item.type)))];
  }

  static async load(id: string): Promise<LibraryItem | null> {
    try {
      if (this.useIPC) {
        const result = await this.ipcInvoke('library-load', id);
        if (result?.success) {
          return result.item;
        }
      }
      
      // Fallback to localStorage
      const items = await this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error loading library item:', error);
      return null;
    }
  }
}

export { LibraryStorage, type LibraryItem };
