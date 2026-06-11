import React from "react";
import {withTranslation, type WithTranslation} from "react-i18next";
import module, {type HistoryEntry} from "@/modules/history/module.ts";
import ForceSyncSelfApplier from "@/util/applier/ForceSyncSelfApplier.ts";
import ServerAppearanceBundlePreview from "@/components/ServerAppearanceBundlePreview.tsx";
import Button from "@/components/Button";

interface HistoryEntryListState {
  previewEntry?: HistoryEntry;
}

class HistoryEntryList extends React.Component<WithTranslation, HistoryEntryListState> {
  state: HistoryEntryListState = {}

  componentDidMount() {
    module.addHistoryChangeListener(this.historyUpdateListener)
  }

  componentWillUnmount() {
    module.removeHistoryChangeListener(this.historyUpdateListener)
  }

  render() {
    const {t} = this.props;

    return (<div>
      <h2>{t('history.title')}</h2>
      <div className="flex">
        <ul className="flex-1">
          {module.history.map((entry, index) => (
            <li key={index}
                onMouseEnter={() => this.setState({previewEntry: entry})}
                onMouseLeave={() => this.state.previewEntry === entry && this.setState({previewEntry: undefined})}
            >
              <strong>{entry.reason.length > 0 ? entry.reason[0].text : t('history.unknownReason')} {new Date(entry.timestamp).toLocaleString()}</strong>
              <br/>
              {Object.entries(entry.added).length > 0 &&
                  <span className="rw-status-success">{Object.entries(entry.added).length}+</span>}
              {Object.entries(entry.removed).length > 0 &&
                  <span className="rw-status-error">{Object.entries(entry.removed).length}-</span>}
              {Object.entries(entry.changed).length > 0 &&
                  <span className="rw-status-warning">{Object.entries(entry.changed).length}±</span>}
              <br/>
              <Button size="small" onClick={() => this.reverntToHere(entry)}>{t('history.revert')}</Button>
              <Button size="small" onClick={() => this.undo(entry)}>{t('history.undo')}</Button>
              <Button size="small" onClick={() => this.redo(entry)}>{t('history.redo')}</Button>
            </li>
          ))}
        </ul>
        <div className="h-[200px] w-[100px]">
          <ServerAppearanceBundlePreview bundle={this.state.previewEntry?.fully}></ServerAppearanceBundlePreview>
          {this.state.previewEntry && <>
            {Object.entries(this.state.previewEntry.added).length > 0 &&
                <p>{t('history.added')}: {Object.entries(this.state.previewEntry.added).map(([, v]) => v.Name).join(", ")}</p>}
            {Object.entries(this.state.previewEntry.removed).length > 0 &&
                <p>{t('history.removed')}: {Object.entries(this.state.previewEntry.removed).map(([, v]) => v.Name).join(", ")}</p>}
            {Object.entries(this.state.previewEntry.changed).length > 0 &&
                <p>{t('history.changed')}: {Object.entries(this.state.previewEntry.changed).map(([, {
                  old,
                  new: _new
                }]) => `${old.Name} => ${_new.Name}`).join(", ")}</p>}
          </>}
        </div>
      </div>
    </div>)
  }

  private historyUpdateListener = () => {
    this.forceUpdate()
  }

  private reverntToHere(entry: HistoryEntry) {
    const {t} = this.props;

    if (!entry.fully) {
      console.warn("Cannot revert to an entry without full appearance data");
      return;
    }

    module.pushReasonAsync({text: t('history.revertReason')}, async () => {
      try {
        await ForceSyncSelfApplier.apply(Player, entry.fully!)
        ToastManager.success(t('history.reverted'));
      } catch (e) {
        console.error("Failed to revert appearance:", e);
        ToastManager.error(t('history.revertFailed', {message: e.message}));
      }
    })
  }

  private undo(entry: HistoryEntry) {
    const {t} = this.props;

    module.pushReasonAsync({text: t('history.undoReason')}, async () => {
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

        ToastManager.success(t('history.undone'));
      } catch (e) {
        console.error("Failed to undo appearance:", e);
        ToastManager.error(t('history.undoFailed', {message: e.message}));
      }
    })
  }

  private redo(entry: HistoryEntry) {
    const {t} = this.props;

    module.pushReasonAsync({text: t('history.redoReason')}, async () => {
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

        ToastManager.success(t('history.redone'));
      } catch (e) {
        console.error("Failed to redo appearance:", e);
        ToastManager.error(t('history.redoFailed', {message: e.message}));
      }
    })
  }
}

export default withTranslation()(HistoryEntryList);
