import sleep from "@/util/sleep.ts";

export default async function waitFor(func: () => boolean, cancelFunc: () => boolean = () => false): Promise<boolean> {
  while (!func()) {
    if (cancelFunc()) {
      return false;
    }
    await sleep(10);
  }
  return true;
}
