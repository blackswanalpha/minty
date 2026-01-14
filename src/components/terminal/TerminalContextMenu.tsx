import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, Plus, Clipboard, ExternalLink, Scissors } from "lucide-react";

interface TerminalContextMenuProps {
    children: React.ReactNode;
    onNewTab: () => void;
    onNewWindow: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onCut?: () => void; // Optional incase we want to support it later or justalias to copy
}

export function TerminalContextMenu({
    children,
    onNewTab,
    onNewWindow,
    onCopy,
    onPaste,
    onCut,
}: TerminalContextMenuProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={onNewTab}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New Tab</span>
                    <ContextMenuShortcut>Ctrl+T</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onNewWindow}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>New Window</span>
                    <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy</span>
                    <ContextMenuShortcut>Ctrl+Shift+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onPaste}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    <span>Paste</span>
                    <ContextMenuShortcut>Ctrl+Shift+V</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={onCut || onCopy}>
                    <Scissors className="mr-2 h-4 w-4" />
                    <span>Cut</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
