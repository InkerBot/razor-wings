import type {TranslationProvider} from "./provider.ts";

export class DeeplxTranslationProvider implements TranslationProvider {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async translate(sourceLang: string, targetLang: string, text: string): Promise<{
    sourceLang: string;
    targetLang: string;
    text: string;
    alternatives?: string[]
  }> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_lang: sourceLang,
        target_lang: targetLang,
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status ${response.status}`);
    }

    const responseBody = await response.json();

    if (responseBody.code !== 200) {
      throw new Error(`Translation failed with code ${responseBody.code}: ${responseBody.message}`);
    }

    return {
      sourceLang: responseBody.source_lang,
      targetLang: responseBody.target_lang,
      text: responseBody.data,
      alternatives: responseBody.alternatives,
    };
  }
}
