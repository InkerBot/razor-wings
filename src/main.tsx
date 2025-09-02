import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import Layer from './Layer.tsx'

const main: { shadowRoot?: ShadowRoot, resourceUrl: (path: string) => string } = {
  resourceUrl: path => {
    const url = new URL(import.meta.url)
    url.pathname = url.pathname.substring(0, url.pathname.length - 'main.js'.length)
    url.pathname += path
    return url.toString()
  }
};

(async () => {
  const razorWingOverlay = document.createElement('div');
  document.body.appendChild(razorWingOverlay);
  main.shadowRoot = razorWingOverlay.attachShadow({mode: 'open'});
  const root = document.createElement('div');
  main.shadowRoot.appendChild(root);

  createRoot(root).render(
    <StrictMode>
      <link rel="stylesheet" type="text/css" href={main.resourceUrl('main.css')}/>
      <Layer/>
    </StrictMode>,
  );
})().catch(console.error);

export default main;
