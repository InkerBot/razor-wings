import React from "react";
import module, {type HistoryEntry} from "./module.ts";
import ForceSyncSelfApplier from "../../util/applier/ForceSyncSelfApplier.ts";
import ServerAppearanceBundlePreview from "../../components/ServerAppearanceBundlePreview.tsx";

interface HistoryEntryListProps {

}

interface HistoryEntryListState {
  previewEntry?: HistoryEntry;
}

export default class HistoryEntryList extends React.Component<HistoryEntryListProps, HistoryEntryListState> {
  state: HistoryEntryListState = {}

  private historyUpdateListener = () => {
    this.forceUpdate()
  }

  componentDidMount() {
    module.addHistoryChangeListener(this.historyUpdateListener)
  }

  componentWillUnmount() {
    module.removeHistoryChangeListener(this.historyUpdateListener)
  }

  private reverntToHere(entry: HistoryEntry) {
    if (!entry.fully) {
      console.warn("Cannot revert to an entry without full appearance data");
      return;
    }

    module.pushReasonAsync({text: "Revert to history entry"}, async () => {
      try {
        await ForceSyncSelfApplier.apply(Player, entry.fully!)
        ToastManager.success("Reverted to selected history entry");
      } catch (e) {
        console.error("Failed to revert appearance:", e);
        ToastManager.error("[RazorWings] Failed to revert appearance: \n" + e.message);
      }
    })
  }

  private undo(entry: HistoryEntry) {
    module.pushReasonAsync({text: "Undo history entry"}, async () => {
      try {
        const currentFullyBundle = ServerAppearanceBundle(Player.Appearance);
        const currentFully = {};
        for (const item of currentFullyBundle) {
          currentFully[item.Group] = item;
        }
        Object.entries(entry.added).forEach(([key, value]) => {
          if (currentFully[key] && JSON.stringify(currentFully[key]) === JSON.stringify(value)) {
            delete currentFully[key];
          }
        })
        Object.entries(entry.removed).forEach(([key, value]) => {
          currentFully[key] = value;
        })
        Object.entries(entry.changed).forEach(([key, {old, new: _new}]) => {
          if (currentFully[key] && JSON.stringify(currentFully[key]) === JSON.stringify(_new)) {
            currentFully[key] = old;
          }
        })
        await ForceSyncSelfApplier.apply(Player, Object.values(currentFully))

        ToastManager.success("Undid selected history entry");
      } catch (e) {
        console.error("Failed to undo appearance:", e);
        ToastManager.error("[RazorWings] Failed to undo appearance: \n" + e.message);
      }
    })
  }

  private redo(entry: HistoryEntry) {
    module.pushReasonAsync({text: "Redo history entry"}, async () => {
      try {
        const currentFullyBundle = ServerAppearanceBundle(Player.Appearance);
        const currentFully = {};
        for (const item of currentFullyBundle) {
          currentFully[item.Group] = item;
        }
        Object.entries(entry.removed).forEach(([key, value]) => {
          if (currentFully[key] && JSON.stringify(currentFully[key]) === JSON.stringify(value)) {
            delete currentFully[key];
          }
        });
        Object.entries(entry.added).forEach(([key, value]) => {
          if (!currentFully[key]) {
            currentFully[key] = value;
          }
        });
        Object.entries(entry.changed).forEach(([key, {old: _old, new: _new}]) => {
          if (currentFully[key] && JSON.stringify(currentFully[key]) === JSON.stringify(_old)) {
            currentFully[key] = _new;
          }
        });
        await ForceSyncSelfApplier.apply(Player, Object.values(currentFully))

        ToastManager.success("Redid selected history entry");
      } catch (e) {
        console.error("Failed to redo appearance:", e);
        ToastManager.error("[RazorWings] Failed to redo appearance: \n" + e.message);
      }
    })
  }

  render() {
    return (<div>
      <h2>history</h2>
      <div style={{ display: "flex" }}>
        <ul style={{ flex: 1 }}>
          {module.history.map((entry, index) => (
            <li key={index}
                onMouseEnter={() => this.setState({previewEntry: entry})}
                onMouseLeave={() => this.state.previewEntry === entry && this.setState({previewEntry: undefined})}
            >
              <strong>{entry.reason.length > 0 ? entry.reason[0].text : 'unknown reason'} {new Date(entry.timestamp).toLocaleString()}</strong>
              <br />
              {Object.entries(entry.added).length > 0 && <span style={{color: "green"}}>{Object.entries(entry.added).length}+</span>}
              {Object.entries(entry.removed).length > 0 && <span style={{color: "red"}}>{Object.entries(entry.removed).length}-</span>}
              {Object.entries(entry.changed).length > 0 && <span style={{color: "orange"}}>{Object.entries(entry.changed).length}±</span>}
              <br />
              <button onClick={() => this.reverntToHere(entry)}>revert</button>
              <button onClick={() => this.undo(entry)}>undo</button>
              <button onClick={() => this.redo(entry)}>redo</button>
            </li>
          ))}
        </ul>
        <div style={{ width: 100, height: 200 }}>
          <ServerAppearanceBundlePreview bundle={this.state.previewEntry?.fully}></ServerAppearanceBundlePreview>
          {this.state.previewEntry && <>
            {Object.entries(this.state.previewEntry.added).length > 0 && <p>Added: {Object.entries(this.state.previewEntry.added).map(([, v]) => v.Name).join(", ")}</p>}
            {Object.entries(this.state.previewEntry.removed).length > 0 && <p>Removed: {Object.entries(this.state.previewEntry.removed).map(([, v]) => v.Name).join(", ")}</p>}
            {Object.entries(this.state.previewEntry.changed).length > 0 && <p>Changed: {Object.entries(this.state.previewEntry.changed).map(([, {old, new: _new}]) => `${old.Name} => ${_new.Name}`).join(", ")}</p>}
          </>}
        </div>
      </div>
    </div>)
  }
}
