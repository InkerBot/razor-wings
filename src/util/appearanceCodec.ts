export function serializeAppearance(target: Character): string {
  const bundle = ServerAppearanceBundle(target.Appearance);
  for (const it of bundle) {
    if (it.Craft && it.Craft.Description) {
      it.Craft.Description = CraftingDescription.Decode(it.Craft.Description)
    }
  }
  return JSON.stringify(bundle, null, 2)
}

export function deserializeAppearance(value: string): AppearanceBundle {
  const bundle = JSON.parse(value) as AppearanceBundle;
  for (const it of bundle) {
    if (it.Craft && it.Craft.Description) {
      const encodeResult = CraftingDescription.Encode(it.Craft.Description);
      it.Craft.Description = encodeResult.length > 0 ? encodeResult : it.Craft.Description;
    }
  }
  return bundle;
}
