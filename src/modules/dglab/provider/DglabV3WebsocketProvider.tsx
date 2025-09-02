import type DglabProvider from "./DglabProvider.ts";
import {ConnectionStatus} from "./DglabProvider.ts";
import type {JSX} from "react";
import React from "react";
import module from "../module.ts";
import {QRCodeSVG} from 'qrcode.react';

const waveData = {
  'a': `["0A0A0A0A00000000","0A0A0A0A0A0A0A0A","0A0A0A0A14141414","0A0A0A0A1E1E1E1E","0A0A0A0A28282828","0A0A0A0A32323232","0A0A0A0A3C3C3C3C","0A0A0A0A46464646","0A0A0A0A50505050","0A0A0A0A5A5A5A5A","0A0A0A0A64646464"]`,
  'b': `["0A0A0A0A00000000","0D0D0D0D0F0F0F0F","101010101E1E1E1E","1313131332323232","1616161641414141","1A1A1A1A50505050","1D1D1D1D64646464","202020205A5A5A5A","2323232350505050","262626264B4B4B4B","2A2A2A2A41414141"]`,
  'c': `["4A4A4A4A64646464","4545454564646464","4040404064646464","3B3B3B3B64646464","3636363664646464","3232323264646464","2D2D2D2D64646464","2828282864646464","2323232364646464","1E1E1E1E64646464","1A1A1A1A64646464"]`
}

interface DglabV3WebsocketState {
  connectionStatus: ConnectionStatus;
  serverUrl: string;
  connectionId?: string;
  targetId?: string;
  selectedWave: 'a' | 'b' | 'c';
  powerLevelA: number;
  powerLevelB: number;
  realPowerLevelA: number,
  realPowerLevelB: number,
  maxPowerA: number;
  maxPowerB: number;
  qrCodeData: string;
  feedbackMessage: string;
  errorCount: number;
  transmitCount: number;
}

interface WebSocketMessage {
  type: string | number;
  clientId: string;
  targetId: string;
  message: string;
  message2?: string;
  time1?: number;
  time2?: number;
}

// Feedback message mapping
const feedbackMessages: Record<string, string> = {
  'feedback-0': 'Channel A - Button 1',
  'feedback-1': 'Channel A - Button 2',
  'feedback-2': 'Channel A - Button 3',
  'feedback-3': 'Channel A - Button 4',
  'feedback-4': 'Channel A - Button 5',
  'feedback-5': 'Channel B - Button 1',
  'feedback-6': 'Channel B - Button 2',
  'feedback-7': 'Channel B - Button 3',
  'feedback-8': 'Channel B - Button 4',
  'feedback-9': 'Channel B - Button 5',
};

export default class DglabV3WebsocketProvider implements DglabProvider {
  private stateChangeListeners: Array<() => void> = [];
  private state: DglabV3WebsocketState;
  private ws: WebSocket | null = null;
  private transmitInterval: number | null = null;
  private reconnectTimeout: number | null = null;

  constructor() {
    this.state = {
      connectionStatus: ConnectionStatus.DISCONNECTED,
      serverUrl: 'wss://coyote.babyfang.cn/',
      selectedWave: 'a',
      powerLevelA: 0,
      powerLevelB: 0,
      realPowerLevelA: 0,
      realPowerLevelB: 0,
      maxPowerA: 200,
      maxPowerB: 200,
      qrCodeData: '',
      feedbackMessage: '',
      errorCount: 0,
      transmitCount: 0,
    };
  }

  setState(state: Partial<DglabV3WebsocketState> | ((prevState: DglabV3WebsocketState) => Partial<DglabV3WebsocketState>)) {
    if (typeof state === 'function') {
      this.state = {...this.state, ...state(this.state)};
    } else {
      this.state = {...this.state, ...state};
    }
    this.stateChangeListeners.forEach(listener => listener());
  }

  initial() {
    this.transmitInterval = setInterval(this.transmitWaveform, 100);
  }

  destroy() {
    if (this.transmitInterval) {
      clearInterval(this.transmitInterval);
      this.transmitInterval = null;
    }
    this.disconnect();
  }

  render(): JSX.Element {
    return (<>
      {/* Server address configuration */}
      <label>WebSocket Server Address:</label>
      <input
        type="text"
        value={this.state.serverUrl}
        onChange={this.handleServerUrlChange}
        disabled={this.state.connectionStatus !== ConnectionStatus.DISCONNECTED}
        style={{marginLeft: '10px', width: '300px'}}
      />

      {/* Connection control buttons */}
      {this.state.connectionStatus === ConnectionStatus.DISCONNECTED && (
        <button onClick={this.connect}>Connect to WebSocket Server</button>
      )}

      {this.state.connectionStatus === ConnectionStatus.CONNECTING && (
        <button disabled>Connecting...</button>
      )}

      {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
        <button onClick={this.disconnect}>Disconnect</button>
      )}

      {/* Connection status info */}
      {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
        <>
          <p>Connection ID: {this.state.connectionId}</p>
          {this.state.targetId && (
            <p>Target ID: {this.state.targetId}</p>
          )}

          {/* QR code display */}
          {this.state.qrCodeData && !this.state.targetId && (
            <>
              <p>Please scan the QR code with DG-Lab APP to connect:</p>
              <div style={{border: '5px solid #ccc', background: '#fff'}}>
                <QRCodeSVG value={this.state.qrCodeData}/>,
              </div>
            </>
          )}

          {/* Device status info */}
          {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
            <>
              <p>Strength: <span style={{
                color: (this.state.powerLevelA == this.state.realPowerLevelA) ? 'green' : 'red'
              }}>{this.state.powerLevelA}-{this.state.realPowerLevelA}</span> {this.state.maxPowerA} | <span style={{
                color: (this.state.powerLevelB == this.state.realPowerLevelB) ? 'green' : 'red'
              }}>{this.state.powerLevelB}-{this.state.realPowerLevelB}</span> {this.state.maxPowerB} Transmit: <span
                style={{color: 'green'}}>{this.state.transmitCount}</span> | <span
                style={{color: 'red'}}>{this.state.errorCount}</span></p>
            </>
          )}

          {/* Waveform selection and transmit control */}
          {this.state.connectionStatus === ConnectionStatus.CONNECTED && (
            <div>
              <label>Select waveform to send to AB channel:</label>
              <select value={this.state.selectedWave} onChange={this.handleWaveChange}>
                <option value="a">Waveform A</option>
                <option value="b">Waveform B</option>
                <option value="c">Waveform C</option>
              </select>
            </div>
          )}
        </>
      )}
    </>);
  }

  setPower(powerA: number, powerB: number) {
    if (powerA > 1 || powerB > 1 || powerA < 0 || powerB < 0) {
      module.infoLog('Power value must be between 0 and 1');
      return;
    }

    const targetPowerA = Math.round(powerA * this.state.maxPowerA);
    const targetPowerB = Math.round(powerB * this.state.maxPowerB);

    this.setPowerDirect('A', targetPowerA);
    this.setPowerDirect('B', targetPowerB);
  }

  addStateChangeListener(action: () => void) {
    this.stateChangeListeners.push(action);
  }

  removeStateChangeListener(action: () => void) {
    this.stateChangeListeners = this.stateChangeListeners.filter(listener => listener !== action);
  }

  private handleServerUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({serverUrl: event.target.value});
  };

  private transmitWaveform = () => {
    this.play(1)
  }

  private send = (message: WebSocketMessage) => {
    if (this.ws && this.state.connectionStatus === ConnectionStatus.CONNECTED) {
      try {
        this.ws.send(JSON.stringify(message));
        this.setState(prev => ({transmitCount: prev.transmitCount + 1}));
        module.debugLog('Message sent:', JSON.stringify(message));
      } catch (error) {
        module.infoLog('Failed to send message: ' + error);
        this.setState(prev => ({errorCount: prev.errorCount + 1}));
      }
    } else {
      module.infoLog('WebSocket not connected');
    }
  }

  private play = (duration: number) => {
    if (this.state.connectionStatus === ConnectionStatus.CONNECTED && this.state.targetId) {
      const shouldSendA = this.state.powerLevelA != 0; // && this.state.realPowerLevelA != 0;
      const shouldSendB = this.state.powerLevelB != 0; // && this.state.realPowerLevelB != 0;

      if (shouldSendA || shouldSendB) {
        this.send({
          type: "clientMsg",
          clientId: this.state.connectionId,
          targetId: this.state.targetId,
          message: shouldSendA ? ('A:' + waveData[this.state.selectedWave]) : 'None',
          message2: shouldSendB ? ('B:' + waveData[this.state.selectedWave]) : 'None',
          time1: duration,
          time2: duration
        })
      }
    }
  }

  private handlePowerChange = (channel: 'A' | 'B', value: number) => {
    this.setPowerDirect(channel, value);
  };

  private connect = () => {
    if (!this.state.serverUrl) {
      module.infoLog('Please enter the WebSocket server address');
      return;
    }

    this.setState({connectionStatus: ConnectionStatus.CONNECTING});
    module.infoLog('Connecting to WebSocket server...');

    try {
      this.ws = new WebSocket(this.state.serverUrl);

      this.ws.onopen = this.onWebSocketOpen;
      this.ws.onmessage = this.onWebSocketMessage;
      this.ws.onerror = this.onWebSocketError;
      this.ws.onclose = this.onWebSocketClose;
    } catch (error) {
      module.infoLog('Connection failed: ' + error);
      this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
    }
  };

  private disconnect = () => {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setState({
      connectionStatus: ConnectionStatus.DISCONNECTED,
      connectionId: '',
      targetId: '',
      qrCodeData: '',
      feedbackMessage: '',
    });
    module.infoLog('Disconnected');
  };

  private onWebSocketOpen = () => {
    module.infoLog('WebSocket connection established');
  };

  private onWebSocketMessage = (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    } catch {
      module.infoLog('Received non-JSON message: ' + event.data);
    }
  };

  private onWebSocketError = () => {
    module.infoLog('WebSocket connection error');
    this.setState(prev => ({errorCount: prev.errorCount + 1}));
  };

  private onWebSocketClose = () => {
    module.infoLog('WebSocket connection closed');
    this.setState({connectionStatus: ConnectionStatus.DISCONNECTED});
  };

  private handleWebSocketMessage = (message: WebSocketMessage) => {
    module.debugLog('Message received:', JSON.stringify(message));

    switch (message.type) {
      case 'bind':
        this.handleBindMessage(message);
        break;
      case 'msg':
        this.handleDataMessage(message);
        break;
      case 'break':
        this.handleBreakMessage();
        break;
      case 'error':
        this.handleErrorMessage(message);
        break;
      case 'heartbeat':
        this.handleHeartbeatMessage();
        break;
      default:
        module.debugLog('Unknown message type: ' + message.type);
    }
  };

  private handleBindMessage = (message: WebSocketMessage) => {
    if (!message.targetId) {
      // Server returns connection ID
      this.setState({
        connectionStatus: ConnectionStatus.CONNECTED,
        connectionId: message.clientId,
        qrCodeData: `https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#${this.state.serverUrl}${message.clientId}`,
      });
      module.infoLog('Received connection ID: ' + message.clientId);
    } else {
      // Binding complete
      if (message.message === '200') {
        this.setState({
          targetId: message.targetId,
          qrCodeData: '',
        });
        module.infoLog('Device binding successful');
        this.startHeartbeat();
      } else {
        module.infoLog('Binding failed, error code: ' + message.message);
      }
    }
  };

  private handleDataMessage = (message: WebSocketMessage) => {
    if (message.message.includes('strength')) {
      // Parse strength data: strength-A channel strength+B channel strength+A max strength+B max strength
      const matches = message.message.match(/strength-(\d+)\+(\d+)\+(\d+)\+(\d+)/);
      if (matches) {
        const [, powerA, powerB, maxA, maxB] = matches.map(Number);
        this.setState({
          realPowerLevelA: powerA,
          realPowerLevelB: powerB,
          maxPowerA: maxA,
          maxPowerB: maxB,
        });
        module.debugLog(`Received strength data: A=${powerA}/${maxA}, B=${powerB}/${maxB}`);
      }
    } else if (message.message.includes('feedback')) {
      // Parse feedback data
      const feedbackMsg = feedbackMessages[message.message] || message.message;
      this.setState({feedbackMessage: feedbackMsg});
      module.infoLog('Received feedback: ' + feedbackMsg);

      // Clear feedback message after 3 seconds
      setTimeout(() => {
        this.setState({feedbackMessage: ''});
      }, 3000);
    }
  };

  private handleBreakMessage = () => {
    module.infoLog('The other party has disconnected');
    this.disconnect();
  };

  private handleErrorMessage = (message: WebSocketMessage) => {
    module.infoLog('Server error: ' + message.message);
    this.setState(prev => ({errorCount: prev.errorCount + 1}));
  };

  private handleHeartbeatMessage = () => {
    //
  };

  private startHeartbeat = () => {
    //
  };

  private handleWaveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectedWave: event.target.value as 'a' | 'b' | 'c'});
  };

  private setPowerDirect = (channel: 'A' | 'B', power: number) => {
    if (!this.ws || !this.state.targetId) {
      // module.infoLog('Device not connected');
      return;
    }

    const channelNum = channel === 'A' ? 1 : 2;
    const message = `strength-${channelNum}+2+${power}`; // Mode 2 means set to specified value

    const data: WebSocketMessage = {
      type: 4,
      clientId: this.state.connectionId,
      targetId: this.state.targetId,
      message: message,
    };

    try {
      this.send(data);
      this.setState(prev => ({
        transmitCount: prev.transmitCount + 1,
        [`powerLevel${channel}`]: power
      } as Partial<DglabV3WebsocketState>));
      module.debugLog(`Set channel ${channel} strength: ${power}`);
    } catch (error) {
      module.infoLog('Failed to send message: ' + error);
      this.setState(prev => ({errorCount: prev.errorCount + 1}));
    }
  };
}
