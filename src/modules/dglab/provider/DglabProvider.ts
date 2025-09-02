import {type JSX} from "react";

export enum BrowserSupportStatus {
  LOADING,
  SUPPORTED,
  NOT_SUPPORTED,
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
}

export default interface DglabProvider {
  addStateChangeListener(action: () => void): void;

  removeStateChangeListener(action: () => void): void;

  initial(): void;

  destroy(): void;

  setPower(powerA: number, powerB: number): void;

  render(): JSX.Element;
}
