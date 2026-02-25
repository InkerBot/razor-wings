import type {Plugin, ResolvedConfig} from 'vite';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const PAGE_SUFFIX = '?page';

type CssTarget = 'page' | 'shadow';

export default function pageCssPlugin(): Plugin {
  let shadowStylePath: string;
  const meta = new Map<string, {target: CssTarget; filePath: string}>();

  return {
    name: 'page-css',
    enforce: 'pre',

    configResolved(config: ResolvedConfig) {
      shadowStylePath = join(config.root, 'src/shadow-style.ts');
    },

    async resolveId(source, importer) {
      let target: CssTarget;

      if (source.endsWith(PAGE_SUFFIX)) {
        target = 'page';
        source = source.slice(0, -PAGE_SUFFIX.length);
      } else if (source.endsWith('.css')) {
        target = 'shadow';
      } else {
        return;
      }

      const resolved = await this.resolve(source, importer, {skipSelf: true});
      if (!resolved) return;

      const id = `\0${resolved.id}.js`;
      meta.set(id, {target, filePath: resolved.id});
      return id;
    },

    async load(id) {
      const entry = meta.get(id);
      if (!entry) return;

      const {target, filePath} = entry;
      this.addWatchFile(filePath);
      const css = JSON.stringify(await readFile(filePath, 'utf-8'));

      if (target === 'shadow') {
        return `import { injectShadowCss } from '${shadowStylePath}';injectShadowCss(${css});export default ${css};`;
      }

      return `const s = document.createElement('style');s.textContent = ${css};document.head.appendChild(s);export default ${css};`;
    },
  };
}
