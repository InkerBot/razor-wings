import type DglabProvider from "./DglabProvider.ts";
import {Component, type JSX} from "react";

interface DglabProviderContainerProps {
  provider: DglabProvider;
}

export default class DglabProviderContainer extends Component<DglabProviderContainerProps> {
  constructor(props: DglabProviderContainerProps) {
    super(props);
  }

  providerStateChangeListener = () => {
    this.forceUpdate();
  }

  componentDidMount() {
    this.props.provider.addStateChangeListener(this.providerStateChangeListener);
  }

  componentWillUnmount() {
    this.props.provider.removeStateChangeListener(this.providerStateChangeListener);
  }

  // props update listener
  componentDidUpdate(prevProps: DglabProviderContainerProps) {
    if (prevProps.provider !== this.props.provider) {
      prevProps.provider.removeStateChangeListener(this.providerStateChangeListener);
      this.props.provider.addStateChangeListener(this.providerStateChangeListener);
    }
  }

  render(): JSX.Element {
    return this.props.provider.render();
  }
}
