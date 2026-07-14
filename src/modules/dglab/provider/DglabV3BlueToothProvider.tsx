import type DglabProvider from "@/modules/dglab/provider/DglabProvider.ts";
import {BrowserSupportStatus, ConnectionStatus} from "@/modules/dglab/provider/DglabProvider.ts";
import {type JSX} from "react";
import module from "@/modules/dglab/module.ts";
import Button from "@/components/Button";
import {InlineLabel, Select} from "@/components/FieldControls";
import i18n from "@/i18n";

// Bluetooth GATT identifiers (base UUID 0000xxxx-0000-1000-8000-00805f9b34fb).
const DG3_NAME_PREFIX = '47L121000';                                       // V3 pulse host advertised name.
const DG3_SERVICE_UUID = '0000180c-0000-1000-8000-00805f9b34fb';           // Primary service (0x180C).
const DG3_WRITE_UUID = '0000150a-0000-1000-8000-00805f9b34fb';             // Write characteristic (0x150A): all commands.
const DG3_NOTIFY_UUID = '0000150b-0000-1000-8000-00805f9b34fb';            // Notify characteristic (0x150B): all responses.
const DG3_BATTERY_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';   // Battery service (0x180A).
const DG3_BATTERY_UUID = '00001500-0000-1000-8000-00805f9b34fb';           // Battery characteristic (0x1500).

// Protocol constants.
const STRENGTH_MAX = 200;          // Absolute per-channel strength range is 0-200.
const SEQ_MAX = 15;                // Sequence number occupies 4 bits (0-15); 0 disables strength feedback.
const TRANSMIT_INTERVAL_MS = 100;  // The B0 command must be written every 100ms.
const STRENGTH_ACK_TIMEOUT_MS = 500; // If a B1 acknowledgement is lost, reopen the input gate after this long.

// BF balance parameters (0-255). Written once per connection; persisted across power cycles by the device.
const DG3_FREQ_BALANCE = 128;      // 频率平衡参数 1: relative feel of low/high frequency waveforms.
const DG3_STRENGTH_BALANCE = 128;  // 频率平衡参数 2: waveform pulse width.

// Strength interpretation modes for the high (channel A) / low (channel B) nibbles of the parsing byte.
const PARSE_NO_CHANGE = 0b00;
const PARSE_ABSOLUTE = 0b11;

interface DglabV3State {
  browserSupportStatus: BrowserSupportStatus;
  connectionStatus: ConnectionStatus;
  selectedWave: 'a' | 'b' | 'c';
  errorCount: number;
  transmitCount: number;
  batteryLevel: number;
  maxPowerA: number;       // Channel A soft limit (0-200).
  maxPowerB: number;       // Channel B soft limit (0-200).
  powerLevelA: number;     // Channel A target strength we want the device to reach.
  powerLevelB: number;     // Channel B target strength we want the device to reach.
  realPowerLevelA: number; // Channel A strength last reported by the device (B1).
  realPowerLevelB: number; // Channel B strength last reported by the device (B1).
}

// Each entry describes 100ms of output: 4 frequency/strength pairs, one per 25ms slice.
// Frequencies use the 10-1000 input scale (converted before transmission); strengths are 0-100.
type WaveFrame = {freq: [number, number, number, number]; strength: [number, number, number, number]};

const coyote3wave: Record<'a' | 'b' | 'c', WaveFrame[]> = {
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
  ],
};

export default class DglabV3BlueToothProvider implements DglabProvider {
  private stateChangeListeners: Array<() => void> = [];
  private state: DglabV3State;

  private gattServer: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private transmitInterval: number | null = null;

  // Strength flow control. A strength change carries a sequence number; the device echoes it back in a B1
  // response. We keep at most one change in flight at a time, as recommended by the protocol.
  private orderNo: number = 0;       // Rolling sequence counter (1-15).
  private inputOrderNo: number = 0;  // Sequence number of the in-flight strength change (0 when idle).
  private isInputAllowed: boolean = true;
  private strengthSentAt: number = 0; // Timestamp of the in-flight change, for the lost-ack timeout.
  private sentPowerA: number = 0;     // Last channel A target acknowledged/sent to the device.
  private sentPowerB: number = 0;     // Last channel B target acknowledged/sent to the device.

  private currentWaveIndex: number = 0;

  constructor() {
    this.state = {
      browserSupportStatus: BrowserSupportStatus.LOADING,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      selectedWave: 'a',
      errorCount: 0,
      transmitCount: 0,
      batteryLevel: 0,
      maxPowerA: STRENGTH_MAX,
      maxPowerB: STRENGTH_MAX,
      powerLevelA: 0,
      powerLevelB: 0,
      realPowerLevelA: 0,
      realPowerLevelB: 0,
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

    // Map the 0-1 fraction onto the per-channel soft limit; the B0 loop drives the device to this target.
    const targetPowerA = this.clampStrength(Math.round(powerA * this.state.maxPowerA));
    const targetPowerB = this.clampStrength(Math.round(powerB * this.state.maxPowerB));

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

  private clampStrength(value: number): number {
    return Math.max(0, Math.min(STRENGTH_MAX, value));
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
        filters: [{namePrefix: DG3_NAME_PREFIX}],
        optionalServices: [DG3_SERVICE_UUID, DG3_BATTERY_SERVICE_UUID],
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
        transmitCount: 0,
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

      module.infoLog(i18n.t('dglab.gettingWriteCharacteristic'));
      this.writeCharacteristic = await service.getCharacteristic(DG3_WRITE_UUID);

      module.infoLog(i18n.t('dglab.gettingNotifyCharacteristic'));
      this.notifyCharacteristic = await service.getCharacteristic(DG3_NOTIFY_UUID);
      this.notifyCharacteristic.addEventListener('characteristicvaluechanged', this.onNotifyReceived);
      await this.notifyCharacteristic.startNotifications();

      await this.initializeBatteryMonitoring();

      // Reset flow-control state, then push BF so the soft limit/balance parameters are known after reconnect.
      this.resetStrengthState();
      await this.sendBFCommand();

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
      this.setState({batteryLevel: batteryValue.getUint8(0)});
      module.debugLog(i18n.t('dglab.currentBattery', {level: batteryValue.getUint8(0)}));

      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryChanged);
      await this.batteryCharacteristic.startNotifications();
    } catch (error) {
      module.infoLog(i18n.t('dglab.batteryMonitoringFailed', {message: String(error)}));
    }
  }

  // BF command (7 bytes): 0xBF + AB soft limits (2) + AB frequency balance (2) + AB strength balance (2).
  // Note: it takes effect immediately, returns nothing, and the soft limit must be rewritten after every
  // reconnect, otherwise a stale persisted limit could clamp the output unexpectedly.
  private async sendBFCommand() {
    if (!this.writeCharacteristic) return;

    try {
      const buffer = new ArrayBuffer(7);
      const view = new DataView(buffer);

      view.setUint8(0, 0xBF);
      view.setUint8(1, this.clampStrength(this.state.maxPowerA)); // Channel A soft limit.
      view.setUint8(2, this.clampStrength(this.state.maxPowerB)); // Channel B soft limit.
      view.setUint8(3, DG3_FREQ_BALANCE);                         // Channel A frequency balance.
      view.setUint8(4, DG3_FREQ_BALANCE);                         // Channel B frequency balance.
      view.setUint8(5, DG3_STRENGTH_BALANCE);                     // Channel A strength balance.
      view.setUint8(6, DG3_STRENGTH_BALANCE);                     // Channel B strength balance.

      await this.writeCharacteristic.writeValue(buffer);
      module.debugLog(`BF sent: softLimit A=${this.state.maxPowerA}, B=${this.state.maxPowerB}`);
    } catch (error) {
      module.infoLog(i18n.t('dglab.failedBfCommand', {message: String(error)}));
    }
  }

  // Decide the strength portion of the next B0 command. We use absolute interpretation (0b11): each change
  // tells the device the exact target. At most one change is kept in flight, identified by its sequence
  // number; subsequent ticks send 0b00 (no change) until the matching B1 arrives or the ack times out.
  private resolveStrengthCommand(): {
    sequenceNo: number;
    parsingMethod: number;
    strengthValueA: number;
    strengthValueB: number;
  } {
    const idle = {sequenceNo: 0, parsingMethod: 0, strengthValueA: 0, strengthValueB: 0};

    if (!this.isInputAllowed) {
      // Recover from a dropped B1 acknowledgement so strength updates never deadlock.
      if (Date.now() - this.strengthSentAt >= STRENGTH_ACK_TIMEOUT_MS) {
        this.isInputAllowed = true;
        this.inputOrderNo = 0;
      } else {
        return idle;
      }
    }

    const needA = this.state.powerLevelA !== this.sentPowerA;
    const needB = this.state.powerLevelB !== this.sentPowerB;
    if (!needA && !needB) {
      return idle;
    }

    let parsingMethod = 0;
    let strengthValueA = 0;
    let strengthValueB = 0;

    if (needA) {
      parsingMethod |= PARSE_ABSOLUTE << 2; // High nibble controls channel A.
      strengthValueA = this.state.powerLevelA;
      this.sentPowerA = this.state.powerLevelA;
    } else {
      parsingMethod |= PARSE_NO_CHANGE << 2;
    }

    if (needB) {
      parsingMethod |= PARSE_ABSOLUTE;       // Low nibble controls channel B.
      strengthValueB = this.state.powerLevelB;
      this.sentPowerB = this.state.powerLevelB;
    } else {
      parsingMethod |= PARSE_NO_CHANGE;
    }

    this.orderNo = (this.orderNo % SEQ_MAX) + 1; // Sequence numbers cycle through 1-15.
    this.inputOrderNo = this.orderNo;
    this.isInputAllowed = false;
    this.strengthSentAt = Date.now();

    return {sequenceNo: this.orderNo, parsingMethod, strengthValueA, strengthValueB};
  }

  // Map a 10-1000 input frequency to the 10-240 value transmitted in the B0 command.
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

  // B0 command (20 bytes): 0xB0 + (seqNo<<4 | parsingMethod) + A target + B target
  //   + A frequencies (4) + A strengths (4) + B frequencies (4) + B strengths (4).
  private async sendB0Command() {
    if (!this.writeCharacteristic) return;

    try {
      const {sequenceNo, parsingMethod, strengthValueA, strengthValueB} = this.resolveStrengthCommand();

      const waveform = coyote3wave[this.state.selectedWave];
      const frame = waveform[this.currentWaveIndex % waveform.length];

      const buffer = new ArrayBuffer(20);
      const view = new DataView(buffer);

      view.setUint8(0, 0xB0);
      view.setUint8(1, (sequenceNo << 4) | parsingMethod);
      view.setUint8(2, strengthValueA);
      view.setUint8(3, strengthValueB);

      // Both channels play the same selected waveform; the per-channel strength gates whether it is felt.
      for (let i = 0; i < 4; i++) {
        view.setUint8(4 + i, this.convertFrequency(frame.freq[i]));  // Channel A frequencies.
        view.setUint8(8 + i, frame.strength[i]);                    // Channel A strengths.
        view.setUint8(12 + i, this.convertFrequency(frame.freq[i])); // Channel B frequencies.
        view.setUint8(16 + i, frame.strength[i]);                   // Channel B strengths.
      }

      await this.writeCharacteristic.writeValue(buffer);

      this.currentWaveIndex++;
      this.setState(prevState => ({transmitCount: prevState.transmitCount + 1}));
    } catch (error) {
      module.infoLog(i18n.t('dglab.failedB0Command', {message: String(error)}));
      this.setState(prevState => ({errorCount: prevState.errorCount + 1}));
    }
  }

  // B1 response (4 bytes): 0xB1 + sequenceNo + channel A actual strength + channel B actual strength.
  private onNotifyReceived = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value || value.byteLength < 4) return;

    if (value.getUint8(0) !== 0xB1) return;

    const returnOrderNo = value.getUint8(1);
    const realPowerA = value.getUint8(2);
    const realPowerB = value.getUint8(3);

    this.setState({
      realPowerLevelA: realPowerA,
      realPowerLevelB: realPowerB,
    });

    // A non-zero sequence number that matches our in-flight change clears the gate for the next update.
    if (returnOrderNo !== 0 && returnOrderNo === this.inputOrderNo) {
      this.isInputAllowed = true;
      this.inputOrderNo = 0;
    }

    module.debugLog(`B1 received: orderNo=${returnOrderNo}, powerA=${realPowerA}, powerB=${realPowerB}`);
  };

  private onBatteryChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    const batteryLevel = value.getUint8(0);
    this.setState({batteryLevel});
    module.debugLog(i18n.t('dglab.currentBattery', {level: batteryLevel}));
  };

  private resetStrengthState() {
    this.orderNo = 0;
    this.inputOrderNo = 0;
    this.isInputAllowed = true;
    this.strengthSentAt = 0;
    this.sentPowerA = 0;
    this.sentPowerB = 0;
    this.currentWaveIndex = 0;
    this.setState({
      powerLevelA: 0,
      powerLevelB: 0,
      realPowerLevelA: 0,
      realPowerLevelB: 0,
    });
  }

  private startTransmitting = () => {
    if (this.transmitInterval) return;

    this.transmitInterval = window.setInterval(() => {
      this.sendB0Command();
    }, TRANSMIT_INTERVAL_MS);

    module.infoLog(i18n.t('dglab.startedB0'));
  };

  private stopTransmitting = () => {
    if (this.transmitInterval) {
      clearInterval(this.transmitInterval);
      this.transmitInterval = null;
    }
    module.infoLog(i18n.t('dglab.stoppedTransmitting'));
  };

  private handleWaveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectedWave: event.target.value as 'a' | 'b' | 'c'});
    this.currentWaveIndex = 0;
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
