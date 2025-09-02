export default function sleep(ms: number): Promise<number> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}
