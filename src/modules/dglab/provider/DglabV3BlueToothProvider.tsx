import type DglabProvider from "./DglabProvider.ts";
import {BrowserSupportStatus, ConnectionStatus} from "./DglabProvider.ts";
import {type JSX} from "react";
import module from "../module.ts";

// V3协议常量定义
const DG3_PREFIX = '47L121000'; // V3设备蓝牙名称前缀
const DG3_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb'; // 主服务UUID
const DG3_WRITE_UUID = '0000150a-0000-1000-8000-00805f9b34fb'; // 写特性UUID
const DG3_NOTIFY_UUID = '0000150b-0000-1000-8000-00805f9b34fb'; // 通知特性UUID
const DG3_BATTERY_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb'; // 电池服务UUID
const DG3_BATTERY_UUID = '00001500-0000-1000-8000-00805f9b34fb'; // 电池特性UUID

interface DglabV3State {
  browserSupportStatus: BrowserSupportStatus;
  connectionStatus: ConnectionStatus;
  selectedWave: 'a' | 'b' | 'c';
  isTransmitting: boolean;
  errorCount: number;
  transmitCount: number;
  batteryLevel: number;
  maxPowerA: number;
  maxPowerB: number;
  powerLevelA: number;
  powerLevelB: number;
  realPowerLevelA: number;
  realPowerLevelB: number;
  frequencyBalance1A: number;
  frequencyBalance2A: number;
  frequencyBalance1B: number;
  frequencyBalance2B: number;
}

// 波形数据定义 - 根据V3协议格式调整
const coyote3wave = {
  'a': [
    {freq: [10, 10, 10, 10], strength: [0, 10, 20, 30]},
    {freq: [10, 10, 10, 10], strength: [20, 30, 40, 50]},
    {freq: [15, 15, 15, 15], strength: [40, 50, 60, 70]},
    {freq: [20, 20, 20, 20], strength: [60, 70, 80, 90]},
    {freq: [25, 25, 25, 25], strength: [80, 90, 100, 100]},
    {freq: [30, 30, 30, 30], strength: [100, 100, 100, 100]},
    {freq: [35, 35, 35, 35], strength: [90, 80, 70, 60]},
    {freq: [40, 40, 40, 40], strength: [50, 40, 30, 20]},
    {freq: [10, 10, 10, 10], strength: [0, 0, 0, 0]},
  ],
  'b': [
    {freq: [60, 60, 60, 60], strength: [100, 100, 100, 100]},
    {freq: [55, 55, 55, 55], strength: [100, 100, 100, 100]},
    {freq: [50, 50, 50, 50], strength: [100, 100, 100, 100]},
    {freq: [45, 45, 45, 45], strength: [100, 100, 100, 100]},
    {freq: [40, 40, 40, 40], strength: [100, 100, 100, 100]},
    {freq: [35, 35, 35, 35], strength: [100, 100, 100, 100]},
    {freq: [30, 30, 30, 30], strength: [100, 100, 100, 100]},
    {freq: [25, 25, 25, 25], strength: [100, 100, 100, 100]},
    {freq: [20, 20, 20, 20], strength: [100, 100, 100, 100]},
    {freq: [15, 15, 15, 15], strength: [100, 100, 100, 100]},
    {freq: [10, 10, 10, 10], strength: [100, 100, 100, 100]},
  ],
  'c': [
    {freq: [10, 10, 10, 10], strength: [0, 50, 100, 70]},
    {freq: [20, 20, 20, 20], strength: [0, 50, 100, 70]},
    {freq: [30, 30, 30, 30], strength: [0, 50, 100, 100]},
    {freq: [40, 40, 40, 40], strength: [0, 50, 100, 100]},
    {freq: [50, 50, 50, 50], strength: [0, 50, 100, 70]},
  ]
};

export default class DglabV3BlueToothProvider implements DglabProvider {
  private stateChangeListeners: Array<() => void> = [];
  private state: DglabV3State;
  private gattServer: BluetoothRemoteGATTServer | null = null;
  private transmitInterval: number | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // V3协议状态管理
  private orderNo: number = 0;
  private inputOrderNo: number = 0;
  private isInputAllowed: boolean = true;
  private accumulatedStrengthValueA: number = 0;
  private accumulatedStrengthValueB: number = 0;
  private currentWaveIndex: number = 0;

  constructor() {
    this.state = {
      browserSupportStatus: BrowserSupportStatus.LOADING,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      selectedWave: 'a',
      isTransmitting: false,
      errorCount: 0,
      transmitCount: 0,
      batteryLevel: 0,
      maxPowerA: 200, // V3协议最大值200
      maxPowerB: 200,
      powerLevelA: 0,
      powerLevelB: 0,
      realPowerLevelA: 0,
      realPowerLevelB: 0,
      frequencyBalance1A: 128,
      frequencyBalance2A: 128,
      frequencyBalance1B: 128,
      frequencyBalance2B: 128,
    };
  }

  setState(state: Partial<DglabV3State> | ((prevState: DglabV3State) => Partial<DglabV3State>)) {
    if (typeof state === 'function') {
      this.state = {...this.state, ...state(this.state)};
    } else {
      this.state = {...this.state, ...state};
    }
    this.stateChangeListeners.forEach(listener => listener());
  }

  initial() {
    this.testBrowserSupport().then(supported => {
      this.setState({
        browserSupportStatus: supported ? BrowserSupportStatus.SUPPORTED : BrowserSupportStatus.NOT_SUPPORTED,
      });
      module.infoLog('Device not connected yet');
    }).catch(() => {
      this.setState({
        browserSupportStatus: BrowserSupportStatus.NOT_SUPPORTED,
      });
      module.infoLog('Browser does not support Bluetooth');
    });
  }

  destroy() {
    this.disconnect();
  }

  render(): JSX.Element {
    return (
      <div>
        {this.state.browserSupportStatus === BrowserSupportStatus.LOADING && (
          <p>Checking browser support...</p>
        )}

        {this.state.browserSupportStatus === BrowserSupportStatus.NOT_SUPPORTED ? (
          <>
            <p>Your browser does not support Bluetooth protocol, please use a browser that supports Bluetooth.</p>
            <p>It is recommended to use Chrome or Edge browser.</p>
          </>
        ) : (
          <>
            {this.state.connectionStatus === ConnectionStatus.DISCONNECTED && (
              <button onClick={this.scanAndConnect}>Scan Coyote V3 Device</button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTING && (
              <button disabled>Connecting...</button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <button onClick={this.disconnect}>Disconnect Device</button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <>
                <p>Battery: {this.state.batteryLevel}% | Power Limits: A({this.state.maxPowerA})
                  B({this.state.maxPowerB})</p>
                <p>Strength: A <span style={{
                  color: (this.state.powerLevelA == this.state.realPowerLevelA) ? 'green' : 'red'
                }}>{this.state.powerLevelA}-{this.state.realPowerLevelA}</span> | B <span style={{
                  color: (this.state.powerLevelB == this.state.realPowerLevelB) ? 'green' : 'red'
                }}>{this.state.powerLevelB}-{this.state.realPowerLevelB}</span></p>
                <p>Transmit: <span style={{color: 'green'}}>{this.state.transmitCount}</span> | Errors: <span
                  style={{color: 'red'}}>{this.state.errorCount}</span></p>

                <div>
                  <label>Select waveform:</label>
                  <select value={this.state.selectedWave} onChange={this.handleWaveChange}>
                    <option value="a">Waveform A</option>
                    <option value="b">Waveform B</option>
                    <option value="c">Waveform C</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  setPower(powerA: number, powerB: number) {
    if (powerA > 1 || powerB > 1 || powerA < 0 || powerB < 0) {
      module.infoLog('Power value must be between 0 and 1');
      return;
    }

    // 转换为V3协议的强度值范围(0-200)
    const targetPowerA = Math.max(1, Math.round(powerA * 200));
    const targetPowerB = Math.max(1, Math.round(powerB * 200));

    // 计算强度变化累积值
    this.accumulatedStrengthValueA += targetPowerA - this.state.powerLevelA;
    this.accumulatedStrengthValueB += targetPowerB - this.state.powerLevelB;

    this.setState({
      powerLevelA: targetPowerA,
      powerLevelB: targetPowerB,
    });
  }

  addStateChangeListener(action: () => void) {
    this.stateChangeListeners.push(action);
  }

  removeStateChangeListener(action: () => void) {
    this.stateChangeListeners = this.stateChangeListeners.filter(listener => listener !== action);
  }

  private async testBrowserSupport(): Promise<boolean> {
    return 'bluetooth' in navigator;
  }

  private scanAndConnect = async () => {
    if (!navigator.bluetooth) {
      module.infoLog('Your browser does not support Bluetooth API, please use Chrome browser');
      return;
    }

    if (this.gattServer) {
      module.infoLog('Please disconnect the current device first');
      return;
    }

    this.setState({connectionStatus: ConnectionStatus.CONNECTING});
    module.infoLog('Scanning for Coyote V3 Device...');

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{
          namePrefix: DG3_PREFIX
        }],
        optionalServices: [DG3_SERVICE_UUID, DG3_BATTERY_SERVICE_UUID]
      });

      device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected);
      module.debugLog('Device Name: ' + device.name);
      module.debugLog('Device Id: ' + device.id);
      module.infoLog('Connecting to GATT Server...');

      this.gattServer = await device.gatt!.connect();
      await this.initializeDevice();

      this.setState({
        connectionStatus: ConnectionStatus.CONNECTED,
        errorCount: 0,
        transmitCount: 0
      });
      module.infoLog('Coyote V3 Device connected');

    } catch (error) {
      console.error('Connection Error: ' + error);
      module.infoLog('Failed to connect to device. error: ' + error);
      this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
    }
  };

  private async initializeDevice() {
    if (!this.gattServer) return;

    try {
      module.infoLog('Getting primary service...');
      const service = await this.gattServer.getPrimaryService(DG3_SERVICE_UUID);

      // 获取写特性
      module.infoLog('Getting write characteristic...');
      this.writeCharacteristic = await service.getCharacteristic(DG3_WRITE_UUID);

      // 获取通知特性
      module.infoLog('Getting notify characteristic...');
      this.notifyCharacteristic = await service.getCharacteristic(DG3_NOTIFY_UUID);

      // 监听B1回应消息
      this.notifyCharacteristic.addEventListener('characteristicvaluechanged', this.onNotifyReceived);
      await this.notifyCharacteristic.startNotifications();

      // 初始化电池监控
      await this.initializeBatteryMonitoring();

      // 发送BF指令设置软上限和平衡参数
      await this.sendBFCommand();

      // 开始B0指令传输
      this.startTransmitting();
    } catch (error) {
      module.infoLog('Device initialization failed: ' + error);
      throw error;
    }
  }

  private async initializeBatteryMonitoring() {
    if (!this.gattServer) return;

    try {
      module.infoLog('Initializing battery monitoring...');
      const batteryService = await this.gattServer.getPrimaryService(DG3_BATTERY_SERVICE_UUID);
      this.batteryCharacteristic = await batteryService.getCharacteristic(DG3_BATTERY_UUID);

      const batteryValue = await this.batteryCharacteristic.readValue();
      const batteryLevel = batteryValue.getUint8(0);
      this.setState({batteryLevel});
      module.debugLog(`Current battery level: ${batteryLevel}%`);

      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryChanged);
      await this.batteryCharacteristic.startNotifications();

    } catch (error) {
      module.infoLog('Battery monitoring initialization failed: ' + error);
    }
  }

  /**
   * 发送BF指令设置软上限和平衡参数
   */
  private async sendBFCommand() {
    if (!this.writeCharacteristic) return;

    try {
      const buffer = new ArrayBuffer(7);
      const view = new DataView(buffer);

      // BF指令格式: 0xBF + AB两通道强度软上限(2bytes) + AB两通道波形频率平衡参数(2bytes) + AB两通道波形强度平衡参数(2bytes)
      view.setUint8(0, 0xBF); // 指令头
      view.setUint8(1, this.state.maxPowerA); // A通道软上限
      view.setUint8(2, this.state.maxPowerB); // B通道软上限
      view.setUint8(3, this.state.frequencyBalance1A); // A通道频率平衡参数
      view.setUint8(4, this.state.frequencyBalance1B); // B通道频率平衡参数
      view.setUint8(5, this.state.frequencyBalance2A); // A通道强度平衡参数
      view.setUint8(6, this.state.frequencyBalance2B); // B通道强度平衡参数

      await this.writeCharacteristic.writeValue(buffer);
      module.debugLog(`BF command sent: maxPowerA=${this.state.maxPowerA}, maxPowerB=${this.state.maxPowerB}`);
    } catch (error) {
      module.infoLog('Failed to send BF command: ' + error);
    }
  }

  /**
   * 强度数据处理函数 - 根据V3协议示例实现
   */
  private strengthDataProcessing(): {
    sequenceNo: number,
    strengthParsingMethod: number,
    strengthValueA: number,
    strengthValueB: number
  } {
    let sequenceNo = 0;
    let strengthParsingMethod = 0;
    let strengthValueA = 0;
    let strengthValueB = 0;

    if (this.isInputAllowed) {
      // 处理A通道
      if (this.accumulatedStrengthValueA > 0) {
        strengthParsingMethod |= 0b0100; // A通道相对增加
      } else if (this.accumulatedStrengthValueA < 0) {
        strengthParsingMethod |= 0b1000; // A通道相对减少
      }

      // 处理B通道
      if (this.accumulatedStrengthValueB > 0) {
        strengthParsingMethod |= 0b0001; // B通道相对增加
      } else if (this.accumulatedStrengthValueB < 0) {
        strengthParsingMethod |= 0b0010; // B通道相对减少
      }

      if (strengthParsingMethod !== 0) {
        this.orderNo = (this.orderNo % 15) + 1; // 序列号范围1-15
        sequenceNo = this.orderNo;
        this.inputOrderNo = this.orderNo;
        this.isInputAllowed = false;

        strengthValueA = Math.abs(this.accumulatedStrengthValueA);
        strengthValueB = Math.abs(this.accumulatedStrengthValueB);

        this.accumulatedStrengthValueA = 0;
        this.accumulatedStrengthValueB = 0;
      }
    }

    return {sequenceNo, strengthParsingMethod, strengthValueA, strengthValueB};
  }

  /**
   * 频率转换算法 - 根据V3协议文档实现
   */
  private convertFrequency(inputFreq: number): number {
    if (inputFreq >= 10 && inputFreq <= 100) {
      return inputFreq;
    } else if (inputFreq >= 101 && inputFreq <= 600) {
      return Math.floor((inputFreq - 100) / 5) + 100;
    } else if (inputFreq >= 601 && inputFreq <= 1000) {
      return Math.floor((inputFreq - 600) / 10) + 200;
    } else {
      return 10;
    }
  }

  /**
   * 发送B0指令
   */
  private async sendB0Command() {
    if (!this.writeCharacteristic) return;

    try {
      const {sequenceNo, strengthParsingMethod, strengthValueA, strengthValueB} = this.strengthDataProcessing();

      // 获取当前波形数据
      const selectedWaveform = coyote3wave[this.state.selectedWave];
      const waveData = selectedWaveform[this.currentWaveIndex % selectedWaveform.length];

      const buffer = new ArrayBuffer(20);
      const view = new DataView(buffer);

      // B0指令格式: 0xB0(1byte) + 序列号(4bits) + 强度值解读方式(4bits) + A通道强度(1byte) + B通道强度(1byte)
      // + A通道波形频率(4bytes) + A通道波形强度(4bytes) + B通道波形频率(4bytes) + B通道波形强度(4bytes)
      view.setUint8(0, 0xB0); // 指令头
      view.setUint8(1, (sequenceNo << 4) | strengthParsingMethod); // 序列号+强度解读方式
      view.setUint8(2, strengthValueA); // A通道强度设定值
      view.setUint8(3, strengthValueB); // B通道强度设定值

      // A通道波形频率(4字节)
      view.setUint8(4, this.convertFrequency(waveData.freq[0]));
      view.setUint8(5, this.convertFrequency(waveData.freq[1]));
      view.setUint8(6, this.convertFrequency(waveData.freq[2]));
      view.setUint8(7, this.convertFrequency(waveData.freq[3]));

      // A通道波形强度(4字节)
      view.setUint8(8, waveData.strength[0]);
      view.setUint8(9, waveData.strength[1]);
      view.setUint8(10, waveData.strength[2]);
      view.setUint8(11, waveData.strength[3]);

      // B通道波形频率(4字节) - 使用相同的波形数据
      view.setUint8(12, this.convertFrequency(waveData.freq[0]));
      view.setUint8(13, this.convertFrequency(waveData.freq[1]));
      view.setUint8(14, this.convertFrequency(waveData.freq[2]));
      view.setUint8(15, this.convertFrequency(waveData.freq[3]));

      // B通道波形强度(4字节)
      view.setUint8(16, waveData.strength[0]);
      view.setUint8(17, waveData.strength[1]);
      view.setUint8(18, waveData.strength[2]);
      view.setUint8(19, waveData.strength[3]);

      await this.writeCharacteristic.writeValue(buffer);

      this.setState(prevState => ({
        transmitCount: prevState.transmitCount + 1
      }));

      this.currentWaveIndex++;

    } catch (error) {
      module.infoLog('Failed to send B0 command: ' + error);
      this.setState(prevState => ({
        errorCount: prevState.errorCount + 1
      }));
    }
  }

  /**
   * 处理B1回应消息
   */
  private onNotifyReceived = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const command = value.getUint8(0);

    if (command === 0xB1) {
      // B1消息格式: 0xB1 + 序列号(1byte) + A通道当前实际强度(1byte) + B通道当前实际强度(1byte)
      const returnOrderNo = value.getUint8(1);
      const realPowerA = value.getUint8(2);
      const realPowerB = value.getUint8(3);

      this.setState({
        realPowerLevelA: realPowerA,
        realPowerLevelB: realPowerB
      });

      // 如果序列号匹配，允许下次输入
      if (returnOrderNo === this.inputOrderNo) {
        this.isInputAllowed = true;
        this.inputOrderNo = 0;
      }

      module.debugLog(`B1 received: orderNo=${returnOrderNo}, powerA=${realPowerA}, powerB=${realPowerB}`);
    }
  };

  private onBatteryChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const batteryLevel = value.getUint8(0);
    this.setState({batteryLevel});
    module.debugLog(`Battery level changed: ${batteryLevel}%`);
  };

  private startTransmitting = () => {
    if (this.transmitInterval) return;

    this.setState({isTransmitting: true});

    // 根据V3协议，每100ms发送一次B0指令
    this.transmitInterval = window.setInterval(() => {
      this.sendB0Command();
    }, 100);

    module.infoLog('Started transmitting B0 commands every 100ms');
  };

  private stopTransmitting = () => {
    if (this.transmitInterval) {
      clearInterval(this.transmitInterval);
      this.transmitInterval = null;
    }
    this.setState({isTransmitting: false});
    module.infoLog('Stopped transmitting');
  };

  private handleWaveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectedWave: event.target.value as 'a' | 'b' | 'c'});
    this.currentWaveIndex = 0; // 重置波形索引
  };

  private disconnect = () => {
    this.stopTransmitting();

    if (this.gattServer) {
      this.gattServer.disconnect();
      this.gattServer = null;
    }

    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.batteryCharacteristic = null;

    this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
    module.infoLog('Device disconnected');
  };

  private onDeviceDisconnected = () => {
    module.infoLog('Device disconnected unexpectedly');
    this.disconnect();
  };
}
