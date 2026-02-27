import './bio-style.css?page'
import razorModSdk from "../../razor-wings";
import type module from "./module.ts";
type TranslationModule = typeof module;

const CONTAINER_ID = 'rw-bio-container';
const WCE_RICH_ID = 'bceRichOnlineProfile';
const BASE_FONT_SIZE = 36;

let container: HTMLDivElement | null = null;
let generation = 0;
let showTranslation = true;

function cleanup() {
  generation++;
  if (container) {
    container.remove();
    container = null;
  }
  // Restore WCE's rich div if we were hiding it
  const wceDiv = document.getElementById(WCE_RICH_ID);
  if (wceDiv) wceDiv.style.display = '';
}

function shouldActivate(module: TranslationModule): boolean {
  return module.bioEnable
    && typeof InformationSheetSelection !== 'undefined'
    && !InformationSheetSelection.IsPlayer()
    && OnlineProfileMode === 'Description';
}

function createContainer(module: TranslationModule) {
  const description = typeof InformationSheetSelection.Description === 'string'
    ? InformationSheetSelection.Description : '';
  const paragraphs = description.split('\n').filter(p => p.trim() !== '');
  if (paragraphs.length === 0) return;

  showTranslation = true;
  const gen = generation;

  container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.className = 'rw-bio-container' + (module.bioVerticalLayout ? ' rw-bio-vertical' : '');

  const table = document.createElement('div');
  table.className = 'rw-bio-table';
  container.appendChild(table);

  for (const paragraph of paragraphs) {
    const row = document.createElement('div');
    row.className = 'rw-bio-row';

    const originalCell = document.createElement('div');
    originalCell.className = 'rw-bio-cell rw-bio-original';
    originalCell.textContent = paragraph;

    const translatedCell = document.createElement('div');
    translatedCell.className = 'rw-bio-cell rw-bio-pending';
    translatedCell.textContent = '翻译中...';

    row.appendChild(originalCell);
    row.appendChild(translatedCell);
    table.appendChild(row);

    module.translate(module.receiveSourceLanguage, module.receiveTargetLanguage, paragraph)
      .then(result => {
        if (generation !== gen) return;
        translatedCell.className = 'rw-bio-cell rw-bio-success';
        translatedCell.textContent = result.text;
      })
      .catch(error => {
        if (generation !== gen) return;
        translatedCell.className = 'rw-bio-cell rw-bio-error';
        translatedCell.textContent = `翻译失败: ${error.message}`;
      });
  }

  document.body.appendChild(container);
}

export function initBioTranslationHooks(module: TranslationModule) {
  razorModSdk.hookFunction('OnlineProfileLoad', 10, (args, next) => {
    const result = next(args);
    cleanup();
    if (shouldActivate(module)) {
      createContainer(module);
    }
    return result;
  });

  razorModSdk.hookFunction('OnlineProfileRun', 10, (args, next) => {
    const result = next(args);

    if (container) {
      if (OnlineProfileMode !== 'Description') {
        cleanup();
      } else {
        const wceDiv = document.getElementById(WCE_RICH_ID);

        if (!wceDiv || showTranslation) {
          // No WCE, or in translation mode: show our container
          container.style.display = '';
          if (wceDiv) wceDiv.style.display = 'none';
          const descInput = document.getElementById('DescriptionInput');
          if (descInput) descInput.style.display = 'none';
          ElementPositionFix(container, BASE_FONT_SIZE, 100, 160, 1790, 750);
        } else {
          // WCE present and not in translation mode: show WCE's rich view
          container.style.display = 'none';
          wceDiv.style.display = '';
        }
      }
    } else if (shouldActivate(module) && OnlineProfileMode === 'Description') {
      createContainer(module);
    }

    return result;
  });

  razorModSdk.hookFunction('OnlineProfileClick', 10, (args, next) => {
    // Intercept WCE's toggle button to switch between translation and WCE rich view
    if (container && document.getElementById(WCE_RICH_ID) && MouseIn(90, 60, 90, 90)) {
      showTranslation = !showTranslation;
      return;
    }
    return next(args);
  });

  razorModSdk.hookFunction('OnlineProfileUnload', 10, (args, next) => {
    cleanup();
    return next(args);
  });
}