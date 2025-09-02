export interface TranslationResult {
  sourceLang: string;
  targetLang: string;
  text: string;
  alternatives?: string[];
}

export interface TranslationProvider {
  translate(sourceLang: string, targetLang: string, text: string): Promise<TranslationResult>;
}
