export default interface AbstractApplier {
  apply(target: Character, appearance: AppearanceBundle): Promise<void>;
}
