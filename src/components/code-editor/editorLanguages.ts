import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

const extensionLanguageMap: Record<string, () => Extension> = {
  '.ts': () => javascript({ typescript: true }),
  '.tsx': () => javascript({ typescript: true, jsx: true }),
  '.js': () => javascript(),
  '.jsx': () => javascript({ jsx: true }),
  '.mjs': () => javascript(),
  '.cjs': () => javascript(),
  '.py': () => python(),
  '.html': () => html(),
  '.htm': () => html(),
  '.css': () => css(),
  '.scss': () => css(),
  '.json': () => json(),
  '.md': () => markdown(),
  '.mdx': () => markdown(),
};

export function getLanguageExtension(filePath: string): Extension | null {
  const ext = filePath.includes('.') ? '.' + filePath.split('.').pop()!.toLowerCase() : '';
  const factory = extensionLanguageMap[ext];
  return factory ? factory() : null;
}
