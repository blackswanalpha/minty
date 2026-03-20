import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/stores/terminalStore";

interface SortableTabProps {
  tab: Tab;
  isActive: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string, e: React.MouseEvent) => void;
}

export const SortableTab = ({ tab, isActive, onActivate, onClose }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onActivate(tab.id)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-t border-t border-x cursor-pointer group min-w-[96px] max-w-[160px] shrink-0",
        isActive
          ? "bg-card border-border"
          : "bg-transparent border-transparent hover:bg-card/50"
      )}
    >
      <Terminal className={cn("w-3 h-3 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
      <span className={cn(
        "text-xs font-mono truncate flex-1",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {tab.title}
      </span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onClose(tab.id, e)}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-sm hover:bg-secondary",
          isActive ? "opacity-100" : ""
        )}
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
};
