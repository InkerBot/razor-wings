export default interface AbstractModule {
  init(): void;

  loadConfig(): void;

  saveConfig(): void;

  initAfterLogin?(): void;
}
