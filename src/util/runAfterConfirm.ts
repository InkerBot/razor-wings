export default async function runAfterConfirm<T>(message: string, action: () => T): Promise<T> {
  const confirmed = window.confirm(message);
  if (confirmed) {
    return action();
  } else {
    throw new Error("Action was not confirmed");
  }
}
