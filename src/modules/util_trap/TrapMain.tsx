import React from "react";
import module from "@/modules/util_trap/module.ts";
import type {TrapScript} from "@/modules/util_trap/TrapConfig.ts";
import ScriptEditor from "@/modules/map_script/component/ScriptEditor.tsx";
import PlayerSelector from "@/components/PlayerSelector.tsx";
import Button from "@/components/Button";
import {TextInput} from "@/components/FieldControls";
import ToggleRow from "@/components/ToggleRow";
import {cn} from "@/util/cn";

interface TrapMainState {
  scripts: TrapScript[];
  selectedScriptId: string | null;
  editingContent: string;
  editingName: string;
  trapRoomEnabled: boolean;
  selectedCharacter: Character | null;
}

export default class TrapMain extends React.Component<object, TrapMainState> {
  state: TrapMainState = {
    scripts: module.config.scripts,
    selectedScriptId: null,
    editingContent: '',
    editingName: '',
    trapRoomEnabled: module.trapRoomEnabled,
    selectedCharacter: null
  };

  configChangeListener = () => {
    this.setState({
      scripts: module.config.scripts,
      trapRoomEnabled: module.trapRoomEnabled
    });
  };

  componentDidMount() {
    module.registerConfigChangeListener(this.configChangeListener);
  }

  componentWillUnmount() {
    module.removeConfigChangeListener(this.configChangeListener);
  }

  handleNewScript = () => {
    const newScript: TrapScript = {
      id: Date.now().toString(),
      name: '新脚本',
      content: '',
      enabled: true
    };
    module.config.scripts.push(newScript);
    module.saveConfig();
    this.setState({
      selectedScriptId: newScript.id,
      editingContent: newScript.content,
      editingName: newScript.name
    });
  };

  handleDeleteScript = () => {
    if (!this.state.selectedScriptId) return;
    if (!confirm('确定要删除这个脚本吗？')) return;

    const index = module.config.scripts.findIndex(s => s.id === this.state.selectedScriptId);
    if (index >= 0) {
      module.config.scripts.splice(index, 1);
      module.saveConfig();
      this.setState({
        selectedScriptId: null,
        editingContent: '',
        editingName: ''
      });
    }
  };

  handleToggleEnabled = (scriptId: string) => {
    const script = module.config.scripts.find(s => s.id === scriptId);
    if (script) {
      script.enabled = !script.enabled;
      module.saveConfig();
    }
  };

  handleSelectScript = (scriptId: string) => {
    const script = module.config.scripts.find(s => s.id === scriptId);
    if (script) {
      this.setState({
        selectedScriptId: scriptId,
        editingContent: script.content,
        editingName: script.name
      });
    }
  };

  handleSaveScript = () => {
    if (!this.state.selectedScriptId) return;

    const script = module.config.scripts.find(s => s.id === this.state.selectedScriptId);
    if (script) {
      script.name = this.state.editingName;
      script.content = this.state.editingContent;
      module.saveConfig();
    }
  };

  handleToggleTrapRoom = () => {
    module.trapRoomEnabled = !module.trapRoomEnabled;
    this.setState({trapRoomEnabled: module.trapRoomEnabled});
  };

  render() {
    const selectedScript = this.state.selectedScriptId
      ? module.config.scripts.find(s => s.id === this.state.selectedScriptId)
      : null;

    return (
      <div className="flex h-full min-h-[0] w-full flex-col">
        {/* 顶部陷阱屋开关 */}
        <div className="rw-panel-toolbar border-b-2">
          <ToggleRow
            checked={this.state.trapRoomEnabled}
            onChange={this.handleToggleTrapRoom}
            padding="none"
          >
            <span className="text-[16px] font-bold">陷阱屋模式</span>
          </ToggleRow>
        </div>

        {/* 主内容区域 */}
        <div className="flex min-h-[0] flex-1 flex-row">
          {/* 左侧脚本列表 */}
          <div className="flex min-h-0 w-[250px] flex-col border-r border-r-[color:var(--rw-border-color)]">
            <div className="rw-panel-toolbar flex-col items-stretch">
              <Button onClick={this.handleNewScript} className="mb-[5px] w-full">
                新建脚本
              </Button>
              <Button
                onClick={this.handleDeleteScript}
                disabled={!this.state.selectedScriptId}
                variant="danger"
                className="w-full"
              >
                删除脚本
              </Button>
            </div>
            <div className="min-h-[0] flex-1 overflow-y-auto">
              {this.state.scripts.map(script => (
                <div
                  key={script.id}
                  onClick={() => this.handleSelectScript(script.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-[var(--rw-space-2)] border-b border-b-[color:var(--rw-border-color-subtle)] p-[var(--rw-space-3)] transition-colors hover:bg-[var(--rw-surface-hover)]",
                    this.state.selectedScriptId === script.id ? "bg-[var(--rw-surface-selected)]" : "bg-transparent",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={script.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      this.handleToggleEnabled(script.id);
                    }}
                    title={script.enabled ? '禁用' : '启用'}
                    className="absolute h-[0] w-[0] opacity-0"
                  />
                  <span
                    className={cn(
                      "flex-1 overflow-hidden text-ellipsis whitespace-nowrap",
                      script.enabled ? "opacity-100" : "opacity-50",
                    )}
                  >
                  {script.name}
                </span>
                </div>
              ))}
              {this.state.scripts.length === 0 && (
                <div className="p-[var(--rw-space-5)] text-center text-[color:var(--rw-text-muted)]">
                  暂无脚本
                </div>
              )}
            </div>
          </div>

          {/* 右侧编辑器 */}
          <div className="flex min-h-[0] flex-1 flex-col">
            {selectedScript ? (
              <>
                <div className="rw-panel-toolbar">
                  <span>脚本名称:</span>
                  <TextInput
                    type="text"
                    value={this.state.editingName}
                    onChange={(e) => this.setState({editingName: e.target.value})}
                    className="flex-1"
                  />
                  <Button onClick={this.handleSaveScript}>保存</Button>
                  <PlayerSelector characterId={this.state.selectedCharacter?.CharacterID}
                                  onChange={(character) => this.setState({selectedCharacter: character})}/>
                  <Button onClick={() => {
                    if (this.state.selectedCharacter) {
                      try {
                        module.runTrapOnCharacter(this.state.selectedCharacter, selectedScript, this.state.editingContent);
                      } catch (e) {
                        ToastManager.error('运行脚本时出错，详情请查看控制台');
                        console.error(e);
                      }
                    }
                  }}>
                    运行脚本
                  </Button>
                </div>
                <div className="min-h-[0] flex-1 overflow-hidden">
                  <ScriptEditor
                    value={this.state.editingContent}
                    onChange={(content) => this.setState({editingContent: content})}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-[color:var(--rw-text-muted)]">
                请选择或新建一个脚本
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
