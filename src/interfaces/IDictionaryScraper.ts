export interface DefinitionItem {
  definition: string;
  examples: string[];
}

export interface Definition {
  partOfSpeech: string;
  definitions: DefinitionItem[];
}

export interface WordResult {
  word: string;
  phonetic?: string;
  definitions: Definition[];
}

export interface IDictionaryScraper {
  lookup(word: string): Promise<WordResult | null>;
}
