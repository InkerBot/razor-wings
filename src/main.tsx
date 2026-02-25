import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import './Layer.css'
import {setShadowRoot} from './shadow-style.ts'
import Layer from './Layer.tsx'

const main: {
  shadowRoot?: ShadowRoot,
  resourceUrl: (path: string) => string,
  overlay?: HTMLElement,
  root?: HTMLElement
} = {
  resourceUrl: path => {
    const url = new URL(import.meta.url)
    url.pathname = url.pathname.substring(0, url.pathname.length - 'main.js'.length)
    url.pathname += path
    return url.toString()
  }
};

(async () => {
  main.overlay = document.createElement('div');
  document.body.appendChild(main.overlay);
  main.shadowRoot = main.overlay.attachShadow({mode: 'open'});
  setShadowRoot(main.shadowRoot);
  main.root = document.createElement('div');
  main.shadowRoot.appendChild(main.root);

  createRoot(main.root).render(
    <StrictMode>
      <Layer/>
    </StrictMode>,
  );
})().catch(console.error);

export default main;
