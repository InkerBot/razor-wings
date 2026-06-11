import type DglabProvider from "@/modules/dglab/provider/DglabProvider.ts";
import {BrowserSupportStatus, ConnectionStatus} from "@/modules/dglab/provider/DglabProvider.ts";
import {type JSX} from "react";
import module from "@/modules/dglab/module.ts";
import Button from "@/components/Button";
import {InlineLabel, Select} from "@/components/FieldControls";
import i18n from "@/i18n";

// V3 protocol constants.
const DG3_PREFIX = '47L121000'; // V3 device Bluetooth name prefix.
const DG3_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb'; // Primary service UUID.
const DG3_WRITE_UUID = '0000150a-0000-1000-8000-00805f9b34fb'; // Write characteristic UUID.
const DG3_NOTIFY_UUID = '0000150b-0000-1000-8000-00805f9b34fb'; // Notify characteristic UUID.
const DG3_BATTERY_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb'; // Battery service UUID.
const DG3_BATTERY_UUID = '00001500-0000-1000-8000-00805f9b34fb'; // Battery characteristic UUID.

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

// Waveform data adapted for the V3 protocol format.
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

  // V3 protocol state.
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
      maxPowerA: 200, // V3 protocol maximum.
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
      module.infoLog(i18n.t('dglab.deviceNotConnected'));
    }).catch(() => {
      this.setState({
        browserSupportStatus: BrowserSupportStatus.NOT_SUPPORTED,
      });
      module.infoLog(i18n.t('dglab.browserNoBluetooth'));
    });
  }

  destroy() {
    this.disconnect();
  }

  render(): JSX.Element {
    return (
      <div>
        {this.state.browserSupportStatus === BrowserSupportStatus.LOADING && (
          <p>{i18n.t('dglab.checkingBrowserSupport')}</p>
        )}

        {this.state.browserSupportStatus === BrowserSupportStatus.NOT_SUPPORTED ? (
          <>
            <p>{i18n.t('dglab.bluetoothUnsupported')}</p>
            <p>{i18n.t('dglab.browserRecommendation')}</p>
          </>
        ) : (
          <>
            {this.state.connectionStatus === ConnectionStatus.DISCONNECTED && (
              <Button onClick={this.scanAndConnect}>{i18n.t('dglab.scanCoyoteV3')}</Button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTING && (
              <Button disabled>{i18n.t('dglab.connecting')}</Button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <Button variant="danger" onClick={this.disconnect}>{i18n.t('dglab.disconnectDevice')}</Button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <>
                <p>{i18n.t('dglab.battery')}: {this.state.batteryLevel}% | {i18n.t('dglab.powerLimits')}: A({this.state.maxPowerA})
                  B({this.state.maxPowerB})</p>
                <p>{i18n.t('dglab.strength')}: A <span
                  className={(this.state.powerLevelA == this.state.realPowerLevelA) ? "rw-status-success" : "rw-status-error"}>{this.state.powerLevelA}-{this.state.realPowerLevelA}</span> |
                  B <span
                    className={(this.state.powerLevelB == this.state.realPowerLevelB) ? "rw-status-success" : "rw-status-error"}>{this.state.powerLevelB}-{this.state.realPowerLevelB}</span>
                </p>
                <p>{i18n.t('dglab.transmit')}: <span className="rw-status-success">{this.state.transmitCount}</span> |
                  {i18n.t('dglab.errors')}: <span
                    className="rw-status-error">{this.state.errorCount}</span></p>

                <div>
                  <InlineLabel>
                    <span>{i18n.t('dglab.selectWaveform')}</span>
                    <Select value={this.state.selectedWave} onChange={this.handleWaveChange}>
                      <option value="a">{i18n.t('dglab.waveformA')}</option>
                      <option value="b">{i18n.t('dglab.waveformB')}</option>
                      <option value="c">{i18n.t('dglab.waveformC')}</option>
                    </Select>
                  </InlineLabel>
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
      module.infoLog(i18n.t('dglab.powerRangeError'));
      return;
    }

    // Convert into the V3 protocol strength range (0-200).
    const targetPowerA = Math.max(1, Math.round(powerA * 200));
    const targetPowerB = Math.max(1, Math.round(powerB * 200));

    // Accumulate strength deltas.
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
      module.infoLog(i18n.t('dglab.bluetoothApiUnsupported'));
      return;
    }

    if (this.gattServer) {
      module.infoLog(i18n.t('dglab.pleaseDisconnectFirst'));
      return;
    }

    this.setState({connectionStatus: ConnectionStatus.CONNECTING});
    module.infoLog(i18n.t('dglab.scanCoyoteV3Status'));

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
      module.infoLog(i18n.t('dglab.connectingGatt'));

      this.gattServer = await device.gatt!.connect();
      await this.initializeDevice();

      this.setState({
        connectionStatus: ConnectionStatus.CONNECTED,
        errorCount: 0,
        transmitCount: 0
      });
      module.infoLog(i18n.t('dglab.coyoteV3Connected'));

    } catch (error) {
      console.error('Connection Error: ' + error);
      module.infoLog(i18n.t('dglab.connectionFailed', {message: String(error)}));
      this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
    }
  };

  private async initializeDevice() {
    if (!this.gattServer) return;

    try {
      module.infoLog(i18n.t('dglab.gettingPrimaryService'));
      const service = await this.gattServer.getPrimaryService(DG3_SERVICE_UUID);

      // Get the write characteristic.
      module.infoLog(i18n.t('dglab.gettingWriteCharacteristic'));
      this.writeCharacteristic = await service.getCharacteristic(DG3_WRITE_UUID);

      // Get the notify characteristic.
      module.infoLog(i18n.t('dglab.gettingNotifyCharacteristic'));
      this.notifyCharacteristic = await service.getCharacteristic(DG3_NOTIFY_UUID);

      // Listen for B1 response messages.
      this.notifyCharacteristic.addEventListener('characteristicvaluechanged', this.onNotifyReceived);
      await this.notifyCharacteristic.startNotifications();

      // Initialize battery monitoring.
      await this.initializeBatteryMonitoring();

      // Send BF command to set soft limits and balance parameters.
      await this.sendBFCommand();

      // Start B0 command transmission.
      this.startTransmitting();
    } catch (error) {
      module.infoLog(i18n.t('dglab.deviceInitializationFailed', {message: String(error)}));
      throw error;
    }
  }

  private async initializeBatteryMonitoring() {
    if (!this.gattServer) return;

    try {
      module.infoLog(i18n.t('dglab.initializingBatteryMonitoring'));
      const batteryService = await this.gattServer.getPrimaryService(DG3_BATTERY_SERVICE_UUID);
      this.batteryCharacteristic = await batteryService.getCharacteristic(DG3_BATTERY_UUID);

      const batteryValue = await this.batteryCharacteristic.readValue();
      const batteryLevel = batteryValue.getUint8(0);
      this.setState({batteryLevel});
      module.debugLog(i18n.t('dglab.currentBattery', {level: batteryLevel}));

      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryChanged);
      await this.batteryCharacteristic.startNotifications();

    } catch (error) {
      module.infoLog(i18n.t('dglab.batteryMonitoringFailed', {message: String(error)}));
    }
  }

  private async sendBFCommand() {
    if (!this.writeCharacteristic) return;

    try {
      const buffer = new ArrayBuffer(7);
      const view = new DataView(buffer);

      // BF format: 0xBF + AB soft strength limits (2 bytes) + AB frequency balance (2 bytes) + AB strength balance (2 bytes).
      view.setUint8(0, 0xBF); // Command header.
      view.setUint8(1, this.state.maxPowerA); // Channel A soft limit.
      view.setUint8(2, this.state.maxPowerB); // Channel B soft limit.
      view.setUint8(3, this.state.frequencyBalance1A); // Channel A frequency balance.
      view.setUint8(4, this.state.frequencyBalance1B); // Channel B frequency balance.
      view.setUint8(5, this.state.frequencyBalance2A); // Channel A strength balance.
      view.setUint8(6, this.state.frequencyBalance2B); // Channel B strength balance.

      await this.writeCharacteristic.writeValue(buffer);
      module.debugLog(`BF command sent: maxPowerA=${this.state.maxPowerA}, maxPowerB=${this.state.maxPowerB}`);
    } catch (error) {
      module.infoLog(i18n.t('dglab.failedBfCommand', {message: String(error)}));
    }
  }

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
      // Handle channel A.
      if (this.accumulatedStrengthValueA > 0) {
        strengthParsingMethod |= 0b0100; // Channel A relative increase.
      } else if (this.accumulatedStrengthValueA < 0) {
        strengthParsingMethod |= 0b1000; // Channel A relative decrease.
      }

      // Handle channel B.
      if (this.accumulatedStrengthValueB > 0) {
        strengthParsingMethod |= 0b0001; // Channel B relative increase.
      } else if (this.accumulatedStrengthValueB < 0) {
        strengthParsingMethod |= 0b0010; // Channel B relative decrease.
      }

      if (strengthParsingMethod !== 0) {
        this.orderNo = (this.orderNo % 15) + 1; // Sequence range: 1-15.
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

  private async sendB0Command() {
    if (!this.writeCharacteristic) return;

    try {
      const {sequenceNo, strengthParsingMethod, strengthValueA, strengthValueB} = this.strengthDataProcessing();

      // Get the current waveform data.
      const selectedWaveform = coyote3wave[this.state.selectedWave];
      const waveData = selectedWaveform[this.currentWaveIndex % selectedWaveform.length];

      const buffer = new ArrayBuffer(20);
      const view = new DataView(buffer);

      // B0 format: 0xB0 (1 byte) + sequence (4 bits) + strength parsing method (4 bits) + channel strengths.
      // Followed by A frequency/strength waveform bytes and B frequency/strength waveform bytes.
      view.setUint8(0, 0xB0); // Command header.
      view.setUint8(1, (sequenceNo << 4) | strengthParsingMethod); // Sequence and strength parsing method.
      view.setUint8(2, strengthValueA); // Channel A target strength.
      view.setUint8(3, strengthValueB); // Channel B target strength.

      // Channel A waveform frequency (4 bytes).
      view.setUint8(4, this.convertFrequency(waveData.freq[0]));
      view.setUint8(5, this.convertFrequency(waveData.freq[1]));
      view.setUint8(6, this.convertFrequency(waveData.freq[2]));
      view.setUint8(7, this.convertFrequency(waveData.freq[3]));

      // Channel A waveform strength (4 bytes).
      view.setUint8(8, waveData.strength[0]);
      view.setUint8(9, waveData.strength[1]);
      view.setUint8(10, waveData.strength[2]);
      view.setUint8(11, waveData.strength[3]);

      // Channel B waveform frequency (4 bytes), using the same waveform data.
      view.setUint8(12, this.convertFrequency(waveData.freq[0]));
      view.setUint8(13, this.convertFrequency(waveData.freq[1]));
      view.setUint8(14, this.convertFrequency(waveData.freq[2]));
      view.setUint8(15, this.convertFrequency(waveData.freq[3]));

      // Channel B waveform strength (4 bytes).
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
      module.infoLog(i18n.t('dglab.failedB0Command', {message: String(error)}));
      this.setState(prevState => ({
        errorCount: prevState.errorCount + 1
      }));
    }
  }

  private onNotifyReceived = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const command = value.getUint8(0);

    if (command === 0xB1) {
      // B1 format: 0xB1 + sequence (1 byte) + current channel A/B strength.
      const returnOrderNo = value.getUint8(1);
      const realPowerA = value.getUint8(2);
      const realPowerB = value.getUint8(3);

      this.setState({
        realPowerLevelA: realPowerA,
        realPowerLevelB: realPowerB
      });

      // Allow the next input when the sequence matches.
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
    module.debugLog(i18n.t('dglab.currentBattery', {level: batteryLevel}));
  };

  private startTransmitting = () => {
    if (this.transmitInterval) return;

    this.setState({isTransmitting: true});

    // The V3 protocol sends one B0 command every 100ms.
    this.transmitInterval = window.setInterval(() => {
      this.sendB0Command();
    }, 100);

    module.infoLog(i18n.t('dglab.startedB0'));
  };

  private stopTransmitting = () => {
    if (this.transmitInterval) {
      clearInterval(this.transmitInterval);
      this.transmitInterval = null;
    }
    this.setState({isTransmitting: false});
    module.infoLog(i18n.t('dglab.stoppedTransmitting'));
  };

  private handleWaveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectedWave: event.target.value as 'a' | 'b' | 'c'});
    this.currentWaveIndex = 0; // Reset waveform index.
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
    module.infoLog(i18n.t('dglab.deviceDisconnected'));
  };

  private onDeviceDisconnected = () => {
    module.infoLog(i18n.t('dglab.deviceDisconnectedUnexpectedly'));
    this.disconnect();
  };
}
