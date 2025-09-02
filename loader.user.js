// ==UserScript==
// @name Razor Wings Loader
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Razor Wings offer some unnormal cheatlike tools for Bondage Club.
// @author InkerBot
// @supportURL https://github.com/InkerBot/razor-wings
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://bondageprojects.com/*
// @match https://www.bondageprojects.com/*
// @grant none
// @run-at document-end
// ==/UserScript==

import(`https://inkerbot.github.io/razor-wings/assets/main.js?v=${(Date.now()/10000).toFixed(0)}`);
