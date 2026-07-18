import React from "react";
import {withTranslation, type WithTranslation} from "react-i18next";
import module from "@/modules/map_script/module.ts";
import ScriptEditor from "@/modules/map_script/component/ScriptEditor.tsx";
import Button from "@/components/Button";

interface MapScriptMainState {
  playerPos: ChatRoomMapPos
  scriptContent: string
}

class MapMainPage extends React.Component<WithTranslation, MapScriptMainState> {
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
    const {t} = this.props;

    return (<>
      <div className="flex h-full min-h-[0] w-full flex-col">
        <div className="rw-inline-toolbar">
          {t('mapScript.playerPosition', {x: this.state.playerPos.X, y: this.state.playerPos.Y})}
          <Button onClick={this.loadScript}>{t('common.load')}</Button>
          <Button onClick={this.saveScript}>{t('common.save')}</Button>
        </div>
        <div className="min-h-[0] flex-1 overflow-hidden">
          <ScriptEditor value={this.state.scriptContent} onChange={(scriptContent) => this.setState({scriptContent})}/>
        </div>
      </div>
    </>);
  }
}

const MapMainPageWithTranslation = withTranslation()(MapMainPage);
export default MapMainPageWithTranslation;
