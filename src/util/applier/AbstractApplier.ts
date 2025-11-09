import type {ApplyConfig} from "./config.ts";

export default interface AbstractApplier {
  apply(target: Character, appearance: AppearanceBundle, config?: ApplyConfig): Promise<void>;
}
