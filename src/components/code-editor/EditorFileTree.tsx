import { CaretRight, CaretDown } from '@phosphor-icons/react';
import { getFileIcon } from '@/components/file-explorer/fileIcons';
import { useCodeEditorStore, type EditorTreeNode } from '@/stores/codeEditorStore';
import { ScrollArea } from '@/components/ui/scroll-area';

function TreeNode({ node, depth }: { node: EditorTreeNode; depth: number }) {
  const toggleTreeNode = useCodeEditorStore((s) => s.toggleTreeNode);
  const openFile = useCodeEditorStore((s) => s.openFile);
  const activeTabPath = useCodeEditorStore((s) => s.activeTabPath);

  const { icon: IconComponent, className: iconClassName } = getFileIcon(
    node.name,
    node.isDirectory,
    false,
    node.isExpanded
  );

  const isActive = !node.isDirectory && node.path === activeTabPath;

  const handleClick = () => {
    if (node.isDirectory) {
      toggleTreeNode(node.path);
    } else {
      openFile(node.path);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-accent/50 rounded-sm transition-colors text-left cursor-pointer ${
          isActive ? 'bg-accent text-accent-foreground' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.isDirectory ? (
          node.isExpanded ? (
            <CaretDown weight="fill" size={12} className="shrink-0 text-muted-foreground" />
          ) : (
            <CaretRight weight="fill" size={12} className="shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <IconComponent weight="fill" size={16} className={`shrink-0 ${iconClassName}`} />
        <span className="truncate">{node.name}</span>
      </button>
      {node.isDirectory && node.isExpanded && node.children.map((child) => (
        <TreeNode key={child.path} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function EditorFileTree() {
  const treeNodes = useCodeEditorStore((s) => s.treeNodes);
  const rootPath = useCodeEditorStore((s) => s.rootPath);
  const rootName = rootPath.split('/').pop() || rootPath;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        {rootName}
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {treeNodes.map((node) => (
            <TreeNode key={node.path} node={node} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
