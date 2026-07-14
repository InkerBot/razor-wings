import type {ApplyConfig} from "@/util/applier/config.ts";

export default interface AbstractApplier {
  apply(target: Character, appearance: AppearanceBundle, config?: ApplyConfig): Promise<void>;
}
