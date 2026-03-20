import { useEffect, useRef } from 'react';
import { EditorView, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { useCodeEditorStore } from '@/stores/codeEditorStore';
import { getLanguageExtension } from './editorLanguages';

export function EditorPane() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const activeTabPath = useCodeEditorStore((s) => s.activeTabPath);
  const openTabs = useCodeEditorStore((s) => s.openTabs);
  const activeTab = openTabs.find((t) => t.filePath === activeTabPath);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up old view
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    if (!activeTab) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      highlightSpecialChars(),
      drawSelection(),
      bracketMatching(),
      foldGutter(),
      indentOnInput(),
      history(),
      highlightSelectionMatches(),
      oneDark,
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString();
          useCodeEditorStore.getState().updateContent(activeTab.filePath, content);
        }
      }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
      }),
    ];

    const langExt = getLanguageExtension(activeTab.filePath);
    if (langExt) {
      extensions.push(langExt);
    }

    const state = EditorState.create({
      doc: activeTab.content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Re-create the editor when the active tab changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabPath]);

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-1">No file open</p>
          <p className="text-sm">Select a file from the tree to start editing</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}
