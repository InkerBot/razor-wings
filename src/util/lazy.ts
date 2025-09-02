export function lazy<T>(fn: () => Promise<T>): () => Promise<T> {
  let result: Promise<T> | null = null;

  return () => {
    if (!result) {
      result = fn();
    }
    return result;
  };
}
