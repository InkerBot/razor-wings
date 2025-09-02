import type AbstractModule from '../AbstractModule.ts';
import type DglabProvider from './provider/DglabProvider.ts';
import TestProvider from './provider/TestProvider.tsx';
import DglabV2Provider from './provider/DglabV2Provider.tsx';
import DglabV3WebsocketProvider from './provider/DglabV3WebsocketProvider.tsx';
import DglabV3BlueToothProvider from './provider/DglabV3BlueToothProvider.tsx';
import {ConfigRegistry} from "./controller/ConfigRegistry.ts";
import {ToyIntensitySystem} from "./controller/ToyIntensitySystem.ts";
import razorModSdk from "../../razor-wings";

interface DglabProviderEntry {
  name: string;
  provider: () => DglabProvider;
}

function extractDictionary(dictionary?: ChatMessageDictionary): { [key: string]: string | unknown } {
  if (!dictionary) {
    return {};
  } else if (!Array.isArray(dictionary)) {
    return dictionary;
  }

  const result: { [key: string]: unknown } = {};
  for (const entry of dictionary) {
    const tagKey = entry['Tag'];
    if (typeof tagKey === 'string') {
      const clonedEntry = {...entry};
      delete clonedEntry['Tag'];
      result[tagKey] = clonedEntry;
    } else {
      Object.assign(result, entry);
    }
  }
  return result;
}

class DglabModule implements AbstractModule {
  intensitySystem = new ToyIntensitySystem();
  configRegistry = new ConfigRegistry(this.intensitySystem);
  activityEffect = [];

  provider: DglabProvider = new TestProvider();
  providerName: string = '测试';
  providerList: DglabProviderEntry[] = [
    {
      name: '测试',
      provider: () => new TestProvider(),
    },
    {
      name: '郊狼v2 蓝牙协议',
      provider: () => new DglabV2Provider(),
    },
    {
      name: '郊狼v3 WebSocket协议',
      provider: () => new DglabV3WebsocketProvider(),
    },
    {
      name: '郊狼v3 蓝牙协议 [WIP]',
      provider: () => new DglabV3BlueToothProvider(),
    }
  ];

  powerA: number = 0;
  powerB: number = 0;
  private powerListeners: Array<(a: number, b: number) => void> = [];

  async init(): Promise<void> {
    (await import('./controller/config/0_base.js')).default(this.configRegistry);
  }

  initAfterLogin(): void {
    const tigger = (action, target, item) => {
      const intensity = this.intensitySystem.calculateIntensity(action, target, item);
      if (intensity > 0) {
        console.info(`Dglab 触发: action=${action}, target=${target}, item=${item}, intensity=${intensity}`);
        this.activityEffect.push({
          intensity: intensity,
          startTime: Date.now(),
          upTime: 1000,
          keepTime: 2000,
          downTime: 1000,
        });
      }
    }

    ServerSocket.on('ChatRoomMessage', (message) => {
      switch (message.Type) {
        case 'Activity': {
          const dictionary = extractDictionary(message.Dictionary);
          if (dictionary['TargetCharacter'] == Player.MemberNumber) {
            console.info('Dglab 收到Activity消息:', message, dictionary);

            tigger(
              dictionary['ActivityName'] as string,
              dictionary['FocusAssetGroup']?.['FocusGroupName'] ?? '' as string,
              dictionary['ActivityAsset']?.['AssetName'] ?? '' as string,
            );
          }
          break
        }
        case 'Action': {
          const dictionary = extractDictionary(message.Dictionary);
          if (
            dictionary['DestinationCharacterName']?.['MemberNumber'] == Player.MemberNumber
            || dictionary['DestinationCharacter']?.['MemberNumber'] == Player.MemberNumber
            || dictionary['TargetCharacterName']?.['MemberNumber'] == Player.MemberNumber
          ) {
            console.info('Dglab 收到Action消息:', message, dictionary);

            tigger(
              message.Content,
              dictionary['FocusAssetGroup']?.['FocusGroupName'] ?? '' as string,
              dictionary['AssetName']?.['AssetName'] ?? '' as string,
            );
          }
          break
        }
      }
    })

    razorModSdk.hookFunction("AssetsItemPelvisFuturisticChastityBeltScriptTrigger", 0, (args, next) => {
      tigger('TriggerShock2', args[1].Asset.Group.Name, args[1].Asset.Name);
      return next(args);
    })

    setInterval(() => {
      const now = Date.now();
      this.activityEffect = this.activityEffect.filter(effect => {
        const elapsed = now - effect.startTime;
        return elapsed < (effect.upTime + effect.keepTime + effect.downTime);
      });
      let totalIntensity = 0;
      for (const effect of this.activityEffect) {
        const elapsed = now - effect.startTime;
        if (elapsed < effect.upTime) {
          totalIntensity += effect.intensity * (elapsed / effect.upTime);
        } else if (elapsed < effect.upTime + effect.keepTime) {
          totalIntensity += effect.intensity;
        } else if (elapsed < effect.upTime + effect.keepTime + effect.downTime) {
          totalIntensity += effect.intensity * (1 - (elapsed - effect.upTime - effect.keepTime) / effect.downTime);
        }
      }
      totalIntensity = Math.min(1, totalIntensity);
      this.setPower(totalIntensity, totalIntensity);
    }, 300);
  }

  loadConfig(): void {

  }

  saveConfig(): void {

  }

  debugLog(...args: unknown[]) {
    console.debug('[Dglab]', ...args);
  }

  infoLog(...args: unknown[]) {
    console.info('[Dglab]', ...args);
  }

  setProvider(name: string, action?: (provider: DglabProvider) => void): void {
    if (name === this.providerName) {
      return;
    }
    const entry = this.providerList.find(p => p.name === name);
    if (entry) {
      const previousProvider = this.provider;

      this.provider = entry.provider();
      this.providerName = name;

      previousProvider.destroy()
      this.provider.initial();
      this.provider.setPower(this.powerA, this.powerB);

      action?.(this.provider);
    } else {
      throw new Error('未找到指定的提供者: ' + name);
    }
  }

  addPowerListener(listener: (a: number, b: number) => void) {
    this.powerListeners.push(listener);
  }

  removePowerListener(listener: (a: number, b: number) => void) {
    this.powerListeners = this.powerListeners.filter(l => l !== listener);
  }

  setPower(powerA: number, powerB: number) {
    this.powerA = powerA;
    this.powerB = powerB;
    this.provider.setPower(powerA, powerB);
    this.powerListeners.forEach(listener => listener(powerA, powerB));
  }
}

export default new DglabModule();
