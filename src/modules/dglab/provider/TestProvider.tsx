import type DglabProvider from "./DglabProvider.ts";
import React, {type JSX} from "react";

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
      <p>Power A: {this.state.powerA}</p>
      <p>Power B: {this.state.powerB}</p>
    </>);
  }

}
