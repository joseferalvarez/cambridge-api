import { chromium } from "playwright";
import type { Browser, BrowserContext } from "playwright";
import type { IDictionaryScraper, WordResult, Definition, DefinitionItem } from "../interfaces/IDictionaryScraper";

export class CambridgeDictionaryScraper implements IDictionaryScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor() { }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
  }

  async lookup(word: string): Promise<WordResult | null> {
    if (!this.browser || !this.context) {
      await this.initialize();
    }

    if (!this.context) {
      throw new Error("Failed to initialize browser context");
    }

    const page = await this.context.newPage();

    try {
      const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.toLowerCase())}`;

      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(".entry-body", { timeout: 10000 });

      const result = await this.extractData(page);
      return result;
    } catch (error) {
      console.error("Error scraping Cambridge Dictionary:", error);
      return null;
    } finally {
      await page.close();
    }
  }

  private async extractData(page: any): Promise<WordResult | null> {
    return page.evaluate(() => {
      const entryBody = document.querySelector(".entry-body");
      if (!entryBody) return null;

      const wordElement = entryBody.querySelector(".headword");
      const phoneticElement = entryBody.querySelector(".ipa");

      const word = wordElement?.textContent?.trim() || "";
      const phonetic = phoneticElement?.textContent?.trim() || undefined;

      const definitions: Definition[] = [];

      const blocks = entryBody.querySelectorAll(".pr.entry-body__el, .entry-body__el");

      blocks.forEach((block: any) => {
        const posElement = block.querySelector(".pos");
        const partOfSpeech = posElement?.textContent?.trim() || "unknown";

        const defElements = block.querySelectorAll(".def-block");
        const definitionItems: DefinitionItem[] = [];

        defElements.forEach((defEl: any) => {
          const defText = defEl.querySelector(".def")?.textContent?.trim();
          if (defText) {
            const examples: string[] = [];
            const exampleEls = defEl.querySelectorAll(".examp");
            exampleEls.forEach((exEl: any) => {
              const exText = exEl.textContent?.trim();
              if (exText) {
                examples.push(exText);
              }
            });

            definitionItems.push({
              definition: defText,
              examples: examples.slice(0, 3),
            });
          }
        });

        if (definitionItems.length > 0) {
          definitions.push({
            partOfSpeech,
            definitions: definitionItems,
          });
        }
      });

      return {
        word,
        phonetic,
        definitions,
      };
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}
