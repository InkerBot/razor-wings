import type {JSX} from "react";
import type AbstractModule from "./modules/AbstractModule.ts";
import {razorIsPro} from "./util/pro.ts";

export type ModuleConfig = {
  displayName: string;
  module: (ModuleType | '*')[];
  screen: (RoomName | '*')[];
  moduleProvider?: () => Promise<AbstractModule>;
  precondition?: () => boolean;
  pageProvider: () => Promise<() => JSX.Element>;
};

const modules: { [key: string]: ModuleConfig } = {
  'translation': {
    'displayName': '翻译',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('./modules/translation/module.ts')).default,
    'pageProvider': async () => (await import('./modules/translation/page.tsx')).default,
  },
  'privacy': {
    'displayName': '隐私设置',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('./modules/privacy/module.ts')).default,
    'pageProvider': async () => (await import('./modules/privacy/page.tsx')).default,
    'precondition': () => true,
  },
  'util_exit': {
    'displayName': '辅助_退出房间',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('./modules/util_exit/page.tsx')).default,
  },
  'util_unlock': {
    'displayName': '辅助_解锁',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('./modules/util_unlock/module.ts')).default,
    'pageProvider': async () => (await import('./modules/util_unlock/page.tsx')).default,
  },
  'util_lock': {
    'displayName': '辅助_上锁',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('./modules/util_lock/module.ts')).default,
    'pageProvider': async () => (await import('./modules/util_lock/page.tsx')).default,
  },
  'util_editor': {
    'displayName': '辅助_外观编辑器',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'pageProvider': async () => (await import('./modules/util_editor/page.tsx')).default
  },
  'util_remove_limit': {
    'displayName': '辅助_解除限制',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('./modules/util_remove_limit/module.ts')).default,
    'pageProvider': async () => (await import('./modules/util_remove_limit/page.tsx')).default,
  },
  'util_remove_submissive': {
    'displayName': '辅助_移除奴隶',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('./modules/util_remove_submissive/page.tsx')).default,
  },
  /*
  'util_packet': {
    'displayName': '辅助_网络调试',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => util_packet_module,
    'pageProvider': async () => util_packet_page,
    'precondition': () => true,
  },//*/
  'history': {
    'displayName': '外观记录',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('./modules/history/module.ts')).default,
    'pageProvider': async () => (await import('./modules/history/page.tsx')).default,
  },
  'dglab': {
    'displayName': '郊狼',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('./modules/dglab/page.tsx')).default,
    'moduleProvider': async () => (await import('./modules/dglab/module.ts')).default,
    'precondition': () => true,
  },
  'cheat_allthings': {
    'displayName': '作弊_获得所有物品',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('./modules/cheat_allthings/page.tsx')).default,
  }
}

export default modules;
