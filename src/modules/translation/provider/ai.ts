import type {TranslationProvider, TranslationResult} from "./provider.ts";

export class AiTranslationProvider implements TranslationProvider {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly prompt: string;

  constructor(apiUrl: string, apiKey: string, model: string, prompt: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.prompt = prompt;
  }

  async translate(sourceLang: string, targetLang: string, text: string): Promise<TranslationResult> {
    const systemPrompt = this.prompt
      .replace('{sourceLang}', sourceLang)
      .replace('{targetLang}', targetLang);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [
          {role: 'system', content: systemPrompt},
          {role: 'user', content: text},
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI translation failed with status ${response.status}`);
    }

    const data = await response.json();
    const translated = data?.choices?.[0]?.message?.content;

    if (!translated) {
      throw new Error('Invalid response from AI translation API');
    }

    return {
      sourceLang,
      targetLang,
      text: translated.trim(),
    };
  }
}
