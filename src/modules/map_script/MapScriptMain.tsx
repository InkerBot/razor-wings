import React from "react";
import module from "./module.ts";
import ScriptEditor from "./component/ScriptEditor.tsx";
import Button from "../../components/Button";

interface MapScriptMainState {
  playerPos: ChatRoomMapPos
  scriptContent: string
}

export default class MapMainPage extends React.Component<object, MapScriptMainState> {
  state: MapScriptMainState = {
    playerPos: module.playerPos,
    scriptContent: ''
  }

  playerPosListener = () => {
    this.setState({playerPos: module.playerPos});
  }

  componentDidMount() {
    module.registerPlayerPosListener(this.playerPosListener);
  }

  componentWillUnmount() {
    module.removePlayerPosListener(this.playerPosListener);
  }

  loadScript = () => {
    this.setState({
      scriptContent: module.config.tiggers[this.state.playerPos.X * 1000 + this.state.playerPos.Y] || ''
    });
  }

  saveScript = () => {
    if (this.state.scriptContent == '') {
      delete module.config.tiggers[this.state.playerPos.X * 1000 + this.state.playerPos.Y];
    } else {
      module.config.tiggers[this.state.playerPos.X * 1000 + this.state.playerPos.Y] = this.state.scriptContent;
    }
    module.reloadScriptConfig()
  }

  render() {
    return (<>
      <div className="flex h-full min-h-[0] w-full flex-col">
        <div className="rw-inline-toolbar">
          Player Position: X: {this.state.playerPos.X}, Y: {this.state.playerPos.Y}
          <Button onClick={this.loadScript}>Load</Button>
          <Button onClick={this.saveScript}>Save</Button>
        </div>
        <div className="min-h-[0] flex-1 overflow-hidden">
          <ScriptEditor value={this.state.scriptContent} onChange={(scriptContent) => this.setState({scriptContent})}/>
        </div>
      </div>
    </>);
  }
}
