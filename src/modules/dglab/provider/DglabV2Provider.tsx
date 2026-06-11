import type DglabProvider from "@/modules/dglab/provider/DglabProvider.ts";
import {BrowserSupportStatus, ConnectionStatus} from "@/modules/dglab/provider/DglabProvider.ts";
import {type JSX} from "react";
import module from "@/modules/dglab/module.ts";
import Button from "@/components/Button";
import {InlineLabel, RangeInput, Select} from "@/components/FieldControls";
import i18n from "@/i18n";

const DG2_PREFIX = 'D-LAB'; // Scan prefix
const DG2_SERVICE_ID = '955a180b-0fe2-f5aa-a094-84b8d4f3e8ad'; // Service ID
const DG2_CONFIG_ID = '955a1507-0fe2-f5aa-a094-84b8d4f3e8ad'; // Config characteristic ID
const DG2_POWER_ID = '955a1504-0fe2-f5aa-a094-84b8d4f3e8ad'; // Power characteristic ID
const DG2_CHANNEL_A_ID = '955a1506-0fe2-f5aa-a094-84b8d4f3e8ad'; // Channel A characteristic ID
const DG2_CHANNEL_B_ID = '955a1505-0fe2-f5aa-a094-84b8d4f3e8ad'; // Channel B characteristic ID
const DG2_BATTERY_SERVICE_ID = '955a180a-0fe2-f5aa-a094-84b8d4f3e8ad'; // Battery service ID
const DG2_BATTERY_ID = '955a1500-0fe2-f5aa-a094-84b8d4f3e8ad'; // Battery characteristic ID

interface DglabV2State {
  browserSupportStatus: BrowserSupportStatus;
  connectionStatus: ConnectionStatus;
  selectedWave: 'a' | 'b' | 'c';
  isTransmitting: boolean;
  errorCount: number;
  transmitCount: number;
  batteryLevel: number;
  maxPower: number;
  powerLevelA: number;
  powerLevelB: number;
  realPowerLevelA: number;
  realPowerLevelB: number;
  maxPowerA: number;
  maxPowerB: number;
}

// Waveform data definition
const coyote2wave = {
  'a': [
    '210100',
    '210102',
    '210104',
    '210106',
    '210108',
    '21010A',
    '21010A',
    '21010A',
    '000000',
    '000000',
    '000000',
    '000000'
  ],
  'b': [
    'C4080A',
    '24080A',
    '84070A',
    '03070A',
    '63060A',
    'E3050A',
    '43050A',
    'A3040A',
    '22040A',
    '82030A',
    '02030A',
    '21010A',
    '21010A',
    '21010A',
    '21010A',
    '21010A',
    '21010A',
    '21010A',
    '21010A'
  ],
  'c': [
    '210100',
    '618102',
    'A10105',
    'E18107',
    '21020A',
    '81020A',
    'C1020A',
    '010300',
    '410300',
    'A10300',
    '210100',
    '618102',
    'A10105',
    'E18107',
    '21020A',
    '81020A',
    'C1020A',
    '010300',
    '410300',
    'A10300'
  ]
};

export default class DglabV2Provider implements DglabProvider {
  private stateChangeListeners: Array<() => void> = [];

  private state: DglabV2State;

  private gattServer: BluetoothRemoteGATTServer | null = null;
  private transmitInterval: number | null = null;
  private powerCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private patternACharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private patternBCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor() {
    this.state = {
      browserSupportStatus: BrowserSupportStatus.LOADING,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      selectedWave: 'a',
      isTransmitting: false,
      errorCount: 0,
      transmitCount: 0,
      batteryLevel: 0,
      maxPower: 2000,
      powerLevelA: 0,
      powerLevelB: 0,
      realPowerLevelA: 0,
      realPowerLevelB: 0,
      maxPowerA: 0,
      maxPowerB: 0,
      // patternA: { ax: 0, ay: 0, az: 0 },
      // patternB: { bx: 0, by: 0, bz: 0 },
    };
  }

  setState(state: Partial<DglabV2State> | ((prevState: DglabV2State) => Partial<DglabV2State>)) {
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
            {/* Connection control buttons */}
            {this.state.connectionStatus === ConnectionStatus.DISCONNECTED && (
              <Button onClick={this.scanAndConnect}>{i18n.t('dglab.scanCoyote')}</Button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTING && (
              <Button disabled>{i18n.t('dglab.connecting')}</Button>
            )}

            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <Button variant="danger" onClick={this.disconnect}>{i18n.t('dglab.disconnectDevice')}</Button>
            )}

            {/* Device status info */}
            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <>
                <p>{i18n.t('dglab.battery')}: {this.state.batteryLevel}% {i18n.t('dglab.strength')}: <span
                  className={(this.state.powerLevelA == this.state.realPowerLevelA) ? "rw-status-success" : "rw-status-error"}>{this.state.powerLevelA}-{this.state.realPowerLevelA}</span> | <span
                  className={(this.state.powerLevelB == this.state.realPowerLevelB) ? "rw-status-success" : "rw-status-error"}>{this.state.powerLevelB}-{this.state.realPowerLevelB}</span> {i18n.t('dglab.transmit')}: <span
                  className="rw-status-success">{this.state.transmitCount}</span> | <span
                  className="rw-status-error">{this.state.errorCount}</span></p>
              </>
            )}

            {/* Power level controls */}
            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <div className="flex flex-col gap-[var(--rw-space-2)]">
                <InlineLabel className="w-full">
                  <span className="w-[64px]">{i18n.t('dglab.powerA')}</span>
                  <RangeInput min={0} max={this.state.maxPower} step={1} value={this.state.maxPowerA}
                              onChange={e => this.setState({maxPowerA: Number(e.target.value)})}
                              placeholder={i18n.t('dglab.maxPowerA')} className="flex-1"/>
                  <span className="rw-value w-[48px]">{this.state.maxPowerA}</span>
                </InlineLabel>
                <InlineLabel className="w-full">
                  <span className="w-[64px]">{i18n.t('dglab.powerB')}</span>
                  <RangeInput min={0} max={this.state.maxPower} step={1} value={this.state.maxPowerB}
                              onChange={e => this.setState({maxPowerB: Number(e.target.value)})}
                              placeholder={i18n.t('dglab.maxPowerB')} className="flex-1"/>
                  <span className="rw-value w-[48px]">{this.state.maxPowerB}</span>
                </InlineLabel>
              </div>
            )}

            {/* Waveform selection and transmit control */}
            {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
              <div className="mt-[var(--rw-space-2)]">
                <InlineLabel>
                  <span>{i18n.t('dglab.selectWaveformAb')}</span>
                  <Select value={this.state.selectedWave} onChange={this.handleWaveChange}>
                    <option value="a">{i18n.t('dglab.waveformA')}</option>
                    <option value="b">{i18n.t('dglab.waveformB')}</option>
                    <option value="c">{i18n.t('dglab.waveformC')}</option>
                  </Select>
                </InlineLabel>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  setPower(powerA: number, powerB: number) {
    if (powerA > 1 || powerB > 1 || powerA < 0 || powerB < 0) {
      module.infoLog(i18n.t('dglab.powerRangeError'));
    }
    this.setState({
      powerLevelA: Math.round(powerA * Math.min(this.state.maxPowerA, this.state.maxPower)),
      powerLevelB: Math.round(powerB * Math.min(this.state.maxPowerB, this.state.maxPower)),
    });
    this.updatePower(powerA, powerB)
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
      module.infoLog(i18n.t('dglab.pleaseDisconnectAndRescan'));
      return;
    }

    this.setState({connectionStatus: ConnectionStatus.CONNECTING});
    module.infoLog(i18n.t('dglab.scanBluetooth'));

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{
          namePrefix: DG2_PREFIX
        }],
        optionalServices: [DG2_SERVICE_ID, DG2_BATTERY_SERVICE_ID]
      });

      device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected);
      module.debugLog('Device Name: ' + device.name);
      module.debugLog('Device Id: ' + device.id);
      module.infoLog(i18n.t('dglab.connectingGatt'));

      this.gattServer = await device.gatt!.connect();

      // Initialize all protocol features
      await this.initializeDevice();

      this.setState({
        connectionStatus: ConnectionStatus.CONNECTED,
        errorCount: 0,
        transmitCount: 0
      });
      module.infoLog(i18n.t('dglab.deviceConnected'));

    } catch (error) {
      console.error('Error: ' + error);
      module.infoLog(i18n.t('dglab.connectionFailed', {message: String(error)}));
      this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
    }
  };

  private async initializeDevice() {
    if (!this.gattServer) return;

    try {
      // Get primary service
      module.infoLog(i18n.t('dglab.gettingPrimaryService'));
      const service = await this.gattServer.getPrimaryService(DG2_SERVICE_ID);

      // Read config info
      module.infoLog(i18n.t('dglab.readingDeviceConfig'));
      const configCharacteristic = await service.getCharacteristic(DG2_CONFIG_ID);
      const configValue = await configCharacteristic.readValue();
      const {maxPower, powerStep} = this.parseConfig(configValue);

      this.setState({maxPower});
      module.debugLog(`Device config: maxPower=${maxPower}, powerStep=${powerStep}`);

      // Get power characteristic
      module.infoLog(i18n.t('dglab.initializingPowerControl'));
      this.powerCharacteristic = await service.getCharacteristic(DG2_POWER_ID);

      // Read current power setting
      const powerValue = await this.powerCharacteristic.readValue();
      const [powerA, powerB] = this.parsePower(powerValue);
      this.setState({
        realPowerLevelA: powerA, realPowerLevelB: powerB,
      });
      if (powerA != 0 || powerB != 0) {
        this.updatePower(0, 0)
      }

      // Listen for power changes
      this.powerCharacteristic.addEventListener('characteristicvaluechanged', this.onPowerChanged);
      await this.powerCharacteristic.startNotifications();

      // Get pattern characteristics
      module.infoLog(i18n.t('dglab.initializingPatternControl'));
      this.patternACharacteristic = await service.getCharacteristic(DG2_CHANNEL_A_ID);
      this.patternBCharacteristic = await service.getCharacteristic(DG2_CHANNEL_B_ID);

      // Read current pattern settings
      // const patternAValue = await this.patternACharacteristic.readValue();
      // const [ax, ay, az] = this.parsePattern(patternAValue);
      // this.setState({ patternA: { ax, ay, az } });

      // const patternBValue = await this.patternBCharacteristic.readValue();
      // const [bx, by, bz] = this.parsePattern(patternBValue);
      // this.setState({ patternB: { bx, by, bz } });

      // this.addLog(`Channel A pattern: ax=${ax}, ay=${ay}, az=${az}`);
      // this.addLog(`Channel B pattern: bx=${bx}, by=${by}, bz=${bz}`);

      // Initialize battery monitoring
      await this.initializeBatteryMonitoring();

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
      const batteryService = await this.gattServer.getPrimaryService(DG2_BATTERY_SERVICE_ID);
      this.batteryCharacteristic = await batteryService.getCharacteristic(DG2_BATTERY_ID);

      // Read current battery level
      const batteryValue = await this.batteryCharacteristic.readValue();
      const batteryLevel = batteryValue.getUint8(0);
      this.setState({batteryLevel});
      module.infoLog(i18n.t('dglab.currentBattery', {level: batteryLevel}));

      // Listen for battery level changes
      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryChanged);
      await this.batteryCharacteristic.startNotifications();

    } catch (error) {
      module.infoLog(i18n.t('dglab.batteryMonitoringFailed', {message: String(error)}));
    }
  }

  private parseConfig(dataView: DataView): { maxPower: number; powerStep: number } {
    // Swap the first and third bytes.
    this.flipFirstAndThirdByte(dataView.buffer);
    const maxPower = dataView.getUint16(0);
    const powerStep = dataView.getUint8(2);
    return {maxPower, powerStep};
  }

  private encodePower(powerA: number, powerB: number): ArrayBuffer {
    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, (powerA >>> 5) & 0b00111111);
    view.setUint8(1, ((powerA & 0b00011111) << 3) | ((powerB & 0b11111111111) >>> 8));
    view.setUint8(2, powerB & 0b11111111);

    this.flipFirstAndThirdByte(buffer);
    return buffer;
  }

  private parsePower(dataView: DataView): [number, number] {
    this.flipFirstAndThirdByte(dataView.buffer);
    const powerA = dataView.getUint16(0) >> 3;
    const powerB = dataView.getUint16(1) & 0b0000011111111111;
    return [powerA, powerB];
  }

  private encodePattern(ax: number, ay: number, az: number): ArrayBuffer {
    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, ((az & 0b00011110) >>> 1));
    view.setUint16(1, ((az & 0b00000001) << 15) | ((ay & 0b00000011_11111111) << 5) | (ax & 0b00011111));

    this.flipFirstAndThirdByte(buffer);
    return buffer;
  }

  private parsePattern(dataView: DataView): [number, number, number] {
    this.flipFirstAndThirdByte(dataView.buffer);
    const az = (dataView.getUint16(0) & 0b00001111_10000000) >>> 7;
    const ay = ((dataView.getUint16(0) & 0b00000000_01111111)) << 3 | ((dataView.getUint8(2) & 0b11100000) >>> 5);
    const ax = (dataView.getUint8(2) & 0b00011111);
    return [ax, ay, az];
  }

  private flipFirstAndThirdByte(buffer: ArrayBuffer): void {
    const bufferBytes = new Uint8Array(buffer);
    const b = bufferBytes[0];
    bufferBytes[0] = bufferBytes[2];
    bufferBytes[2] = b;
  }

  private onPowerChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const [powerA, powerB] = this.parsePower(target.value!);
    this.setState({
      realPowerLevelA: powerA,
      realPowerLevelB: powerB,
    });
  };

  private onBatteryChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const batteryLevel = target.value!.getUint8(0);
    this.setState({batteryLevel});
    module.debugLog(i18n.t('dglab.currentBattery', {level: batteryLevel}));
  };

  private handleWaveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWave = event.target.value as 'a' | 'b' | 'c';
    this.setState({selectedWave});
    module.infoLog(i18n.t('dglab.switchedWaveform', {wave: selectedWave}));
  };

  private async updatePower(powerA: number, powerB: number) {
    if (!this.powerCharacteristic) return;

    try {
      const powerBuffer = this.encodePower(powerA, powerB);
      await this.powerCharacteristic.writeValue(powerBuffer);
    } catch (error) {
      module.infoLog(i18n.t('dglab.powerUpdateFailed', {message: String(error)}));
    }
  }

  private startTransmitting = () => {
    if (!this.gattServer) {
      module.infoLog(i18n.t('dglab.pleaseConnectFirst'));
      return;
    }

    this.setState({
      isTransmitting: true,
      errorCount: 0,
      transmitCount: 0
    });
    module.infoLog(i18n.t('dglab.startWritingWaveform'));

    this.transmitInterval = setInterval(this.transmitWaveform, 100);
  };

  private transmitWaveform = async () => {
    if (this.state.errorCount > 5) {
      this.stopTransmitting();
      module.infoLog(i18n.t('dglab.tooManyErrors'));
      return;
    }

    if (!this.patternACharacteristic || !this.patternBCharacteristic) {
      this.setState(prev => ({errorCount: prev.errorCount + 1}));
      module.infoLog(i18n.t('dglab.characteristicsNotInitialized'));
      return;
    }

    try {
      const currentIndex = this.state.transmitCount % coyote2wave[this.state.selectedWave].length;
      const valueA = coyote2wave[this.state.selectedWave][currentIndex];
      const valueB = coyote2wave[this.state.selectedWave][currentIndex];

      // Directly use the obtained characteristic references
      await this.patternACharacteristic.writeValue(this.hexStringToUint8Array(valueA));
      await this.patternBCharacteristic.writeValue(this.hexStringToUint8Array(valueB));

      // Simultaneously update power settings
      const selectedPowerA = this.state.powerLevelA;
      const selectedPowerB = this.state.powerLevelB;
      if (this.powerCharacteristic) {
        await this.powerCharacteristic.writeValue(this.encodePower(selectedPowerA, selectedPowerB));
      }

      const newCount = this.state.transmitCount + 1;
      this.setState({transmitCount: newCount});
    } catch (error) {
      this.setState(prev => ({errorCount: prev.errorCount + 1}));
      module.infoLog(i18n.t('dglab.writeException', {message: String(error)}));
    }
  };

  private stopTransmitting = () => {
    if (this.transmitInterval) {
      clearInterval(this.transmitInterval);
      this.transmitInterval = null;
    }

    this.setState({
      isTransmitting: false,
      transmitCount: 0
    });
    module.infoLog(i18n.t('dglab.stopWritingWaveform'));
  };

  private disconnect = () => {
    this.stopTransmitting();

    if (this.gattServer) {
      this.gattServer.disconnect();
      this.gattServer = null;
      this.powerCharacteristic = null;
      this.patternACharacteristic = null;
      this.patternBCharacteristic = null;
      this.batteryCharacteristic = null;
      this.stopTransmitting();
      this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
      module.infoLog(i18n.t('dglab.manualDisconnect'));
    }
  };

  private onDeviceDisconnected = (event: Event) => {
    const device = event.target as BluetoothDevice;
    module.infoLog(i18n.t('dglab.deviceDisconnectedNamed', {name: device.name ?? ''}));
    this.gattServer = null;
    this.powerCharacteristic = null;
    this.patternACharacteristic = null;
    this.patternBCharacteristic = null;
    this.batteryCharacteristic = null;
    this.stopTransmitting();
    this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
  };

  private hexStringToUint8Array = (hexString: string): Uint8Array => {
    if (hexString.length % 2 !== 0) {
      throw new Error(i18n.t('dglab.hexLengthEven'));
    }

    const array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      array[i / 2] = parseInt(hexString.substring(i, 2), 16);
    }
    return array;
  };
}
