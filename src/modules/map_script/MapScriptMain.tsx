import React from "react";
import module from "./module.ts";
import ScriptEditor from "./component/ScriptEditor.tsx";

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
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <div className="editor-page-buttons" style={{
          display: 'flex',
          flexShrink: 0
        }}>
          Player Position: X: {this.state.playerPos.X}, Y: {this.state.playerPos.Y}
          <button onClick={this.loadScript}>Load</button>
          <button onClick={this.saveScript}>Save</button>
        </div>
        <div className="editor-page-editor" style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          <ScriptEditor value={this.state.scriptContent} onChange={(scriptContent) => this.setState({scriptContent})}/>
        </div>
      </div>
    </>);
  }
}
