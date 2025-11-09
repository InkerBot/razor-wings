import React from "react";
import module from "./module.ts";
import type { TrapScript } from "./TrapConfig.ts";
import ScriptEditor from "../map_script/component/ScriptEditor.tsx";

interface TrapMainState {
  scripts: TrapScript[];
  selectedScriptId: string | null;
  editingContent: string;
  editingName: string;
}

export default class TrapMain extends React.Component<object, TrapMainState> {
  state: TrapMainState = {
    scripts: module.config.scripts,
    selectedScriptId: null,
    editingContent: '',
    editingName: ''
  };

  configChangeListener = () => {
    this.setState({ scripts: module.config.scripts });
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

  render() {
    const selectedScript = this.state.selectedScriptId
      ? module.config.scripts.find(s => s.id === this.state.selectedScriptId)
      : null;

    return (
      <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'row', minHeight: 0}}>
        {/* 左侧脚本列表 */}
        <div style={{width: '250px', borderRight: '1px solid #444', display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div style={{padding: '10px', borderBottom: '1px solid #444', flexShrink: 0}}>
            <button onClick={this.handleNewScript} style={{ width: '100%', marginBottom: '5px' }}>
              新建脚本
            </button>
            <button
              onClick={this.handleDeleteScript}
              disabled={!this.state.selectedScriptId}
              style={{ width: '100%' }}
            >
              删除脚本
            </button>
          </div>
          <div style={{flex: 1, overflowY: 'auto', minHeight: 0}}>
            {this.state.scripts.map(script => (
              <div
                key={script.id}
                onClick={() => this.handleSelectScript(script.id)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: this.state.selectedScriptId === script.id ? '#444' : 'transparent',
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <input
                  type="checkbox"
                  checked={script.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    this.handleToggleEnabled(script.id);
                  }}
                  title={script.enabled ? '禁用' : '启用'}
                />
                <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: script.enabled ? 1 : 0.5}}>
                  {script.name}
                </span>
              </div>
            ))}
            {this.state.scripts.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                暂无脚本
              </div>
            )}
          </div>
        </div>

        {/* 右侧编辑器 */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          {selectedScript ? (
            <>
              <div style={{
                padding: '10px',
                borderBottom: '1px solid #444',
                flexShrink: 0,
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <span>脚本名称:</span>
                <input
                  type="text"
                  value={this.state.editingName}
                  onChange={(e) => this.setState({ editingName: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '5px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '3px'
                  }}
                />
                <button onClick={this.handleSaveScript}>保存</button>
              </div>
              <div style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
                <ScriptEditor
                  value={this.state.editingContent}
                  onChange={(content) => this.setState({ editingContent: content })}
                />
              </div>
            </>
          ) : (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888'}}>
              请选择或新建一个脚本
            </div>
          )}
        </div>
      </div>
    );
  }
}
