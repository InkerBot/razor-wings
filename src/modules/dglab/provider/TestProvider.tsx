import type DglabProvider from "@/modules/dglab/provider/DglabProvider.ts";
import React, {type JSX} from "react";
import i18n from "@/i18n";

interface TestProviderState {
  powerA: number;
  powerB: number;
}

export default class TestProvider implements DglabProvider {
  private state: TestProviderState;
  private stateChangeListeners: Array<() => void> = [];

  constructor() {
    this.state = {
      powerA: 0,
      powerB: 0,
    };
  }

  setState(state: Partial<TestProviderState> | ((prevState: TestProviderState) => Partial<TestProviderState>)) {
    if (typeof state === 'function') {
      this.state = {...this.state, ...state(this.state)};
    } else {
      this.state = {...this.state, ...state};
    }
    this.stateChangeListeners.forEach(listener => listener());
  }

  addStateChangeListener(action: () => void): void {
    this.stateChangeListeners.push(action);
  }

  removeStateChangeListener(action: () => void): void {
    this.stateChangeListeners = this.stateChangeListeners.filter(listener => listener !== action);
  }

  initial() {
  }

  destroy() {
  }

  setPower(powerA: number, powerB: number) {
    this.setState({powerA, powerB});
  }

  render(): JSX.Element {
    return (<>
      <p>{i18n.t('dglab.powerA')} {this.state.powerA}</p>
      <p>{i18n.t('dglab.powerB')} {this.state.powerB}</p>
    </>);
  }

}
