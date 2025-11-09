export interface ApplyConfig {
  disableItem: boolean;
  disableCloth: boolean;
  disableUnderwear: boolean;
  disableCosplay: boolean;
  disableRemove: boolean;
}

export function configDisabledGroup(config: ApplyConfig | undefined, group: AssetGroup | string): boolean {
  if (!config) return false;
  if (typeof group === "string") {
    const filtered = AssetGroup.filter(it => it.Name === group);
    if (filtered.length === 0) return false;
    group = filtered[0];
  }

  if (config.disableItem && group.IsItem()) return true;
  if (config.disableCloth && group.Clothing) return true;
  if (config.disableUnderwear && group.Underwear) return true;
  if (config.disableCosplay && group.BodyCosplay) return true;

  if (config.disableCloth && !group.BodyCosplay && !group.IsItem()) return true;
  return false;
}
