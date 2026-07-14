import type {JSX} from "react";
import type AbstractModule from "@/modules/AbstractModule.ts";

export type ModuleCategory = 'auxiliary' | 'tools' | 'cheat';

export type ModuleConfig = {
  id: string;
  displayName: string;
  category?: ModuleCategory;
  module: (ModuleType | '*')[];
  screen: (RoomName | '*')[];
  moduleProvider?: () => Promise<AbstractModule>;
  precondition?: () => boolean;
  pageProvider: () => Promise<() => JSX.Element>;
};

const moduleDefinitions: { [key: string]: Omit<ModuleConfig, 'id'> } = {
  'translation': {
    'displayName': 'translation',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('@/modules/translation/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/translation/page.tsx')).default,
  },
  'privacy': {
    'displayName': 'privacy',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('@/modules/privacy/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/privacy/page.tsx')).default,
    'precondition': () => true,
  },
  'util_exit': {
    'displayName': 'util_exit',
    'category': 'auxiliary',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('@/modules/util_exit/page.tsx')).default,
  },
  'util_unlock': {
    'displayName': 'util_unlock',
    'category': 'auxiliary',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('@/modules/util_unlock/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/util_unlock/page.tsx')).default,
  },
  'util_lock': {
    'displayName': 'util_lock',
    'category': 'auxiliary',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('@/modules/util_lock/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/util_lock/page.tsx')).default,
  },
  'util_editor': {
    'displayName': 'util_editor',
    'category': 'auxiliary',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'pageProvider': async () => (await import('@/modules/util_editor/page.tsx')).default
  },
  'util_remove_limit': {
    'displayName': 'util_remove_limit',
    'category': 'auxiliary',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('@/modules/util_remove_limit/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/util_remove_limit/page.tsx')).default,
  },
  'util_remove_submissive': {
    'displayName': 'util_remove_submissive',
    'category': 'auxiliary',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('@/modules/util_remove_submissive/page.tsx')).default,
  },
  'util_trap': {
    'displayName': 'util_trap',
    'category': 'tools',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('@/modules/util_trap/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/util_trap/page.tsx')).default,
  },
  'chat_export': {
    'displayName': 'chat_export',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'pageProvider': async () => (await import('@/modules/chat_export/page.tsx')).default,
  },
  'map_script': {
    'displayName': 'map_script',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('@/modules/map_script/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/map_script/page.tsx')).default,
  },
  /*
  'util_packet': {
    'displayName': 'util_packet',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => util_packet_module,
    'pageProvider': async () => util_packet_page,
    'precondition': () => true,
  },//*/
  'history': {
    'displayName': 'history',
    'module': ['*'],
    'screen': ['*'],
    'moduleProvider': async () => (await import('@/modules/history/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/history/page.tsx')).default,
  },
  'dglab': {
    'displayName': 'dglab',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('@/modules/dglab/page.tsx')).default,
    'moduleProvider': async () => (await import('@/modules/dglab/module.ts')).default,
    'precondition': () => true,
  },
  'cheat_allthings': {
    'displayName': 'cheat_allthings',
    'category': 'cheat',
    'module': ['*'],
    'screen': ['*'],
    'pageProvider': async () => (await import('@/modules/cheat_allthings/page.tsx')).default,
  },
  'ungarbled_messages': {
    'displayName': 'ungarbled_messages',
    'module': ['Online'],
    'screen': ['ChatRoom'],
    'moduleProvider': async () => (await import('@/modules/ungarbled_messages/module.ts')).default,
    'pageProvider': async () => (await import('@/modules/ungarbled_messages/page.tsx')).default,
  }
}

const modules = Object.fromEntries(
  Object.entries(moduleDefinitions).map(([id, config]) => [id, {id, ...config}])
) as { [key: string]: ModuleConfig };

export default modules;
