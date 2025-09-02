import sleep from "./sleep.ts";

export default async function waitFor(func: () => boolean, cancelFunc: () => boolean = () => false): Promise<boolean> {
  while (!func()) {
    if (cancelFunc()) {
      return false;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(10);
  }
  return true;
}
