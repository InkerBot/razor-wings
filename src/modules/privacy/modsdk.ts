export interface ModSdkModsReplyPayload {
  Tag: 'ModSdkModsReplyPayload';
  RequestId?: string;
  Status?: string;
  ModsJson?: string;
  [key: string]: unknown;
}

export function isModSdkModsReplyPayload(value: unknown): value is ModSdkModsReplyPayload {
  return typeof value === 'object'
    && value !== null
    && 'Tag' in value
    && value.Tag === 'ModSdkModsReplyPayload';
}

export function filterModSdkModsReplyPayload(
  payload: ModSdkModsReplyPayload,
  hiddenMods: readonly string[],
  discloseMods: boolean,
): ModSdkModsReplyPayload {
  if (!discloseMods) {
    return {...payload, Status: 'declined', ModsJson: '[]'};
  }

  if (typeof payload.ModsJson !== 'string') {
    // The current BC sender omits ModsJson for declined replies, while its
    // receiver requires a string before it will accept the reply.
    return payload.Status === 'declined' ? {...payload, ModsJson: '[]'} : payload;
  }

  if (hiddenMods.length === 0) return payload;

  try {
    const mods: unknown = JSON.parse(payload.ModsJson);
    if (!Array.isArray(mods)) return payload;

    const hiddenModNames = new Set(hiddenMods);
    return {
      ...payload,
      ModsJson: JSON.stringify(mods.filter(mod => {
        return !(typeof mod === 'object'
          && mod !== null
          && 'name' in mod
          && typeof mod.name === 'string'
          && hiddenModNames.has(mod.name));
      })),
    };
  } catch {
    return payload;
  }
}
