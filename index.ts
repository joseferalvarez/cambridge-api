import { Hono } from "hono";
import { cors } from "hono/cors";
import { Actor } from "apify";
import { CambridgeDictionaryScraper } from "./src/classes/CambridgeDictionaryScraper";
import type { IDictionaryScraper, WordResult } from "./src/interfaces/IDictionaryScraper";

interface ActorInput {
  word?: string;
  words?: string[];
}

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

const scraper: IDictionaryScraper = new CambridgeDictionaryScraper();

app.get("/", (c) => {
  return c.json({
    message: "Cambridge Dictionary API",
    usage: "GET /api/define/:word",
  });
});

app.get("/api/define/:word", async (c) => {
  const word = c.req.param("word");

  if (!word || word.trim().length === 0) {
    return c.json({ error: "Word parameter is required" }, 400);
  }

  const result = await scraper.lookup(word);

  if (!result) {
    return c.json({ error: `Word "${word}" not found` }, 404);
  }

  return c.json(result);
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function runActor() {
  await Actor.init();

  const input = await Actor.getInput<ActorInput>();

  if (!input) {
    console.error("No input provided");
    await Actor.exit(1);
    return;
  }

  const words = input.words || (input.word ? [input.word] : []);

  if (words.length === 0) {
    console.error("No words provided in input");
    await Actor.exit(1);
    return;
  }

  console.log(`Looking up ${words.length} word(s)...`);

  const results: WordResult[] = [];

  for (const word of words) {
    console.log(`Looking up: ${word}`);
    const result = await scraper.lookup(word);
    if (result) {
      results.push(result);
      await Actor.pushData(result);
    }
  }

  console.log(`Completed. Found ${results.length} result(s).`);

  await scraper.close();
  await Actor.exit(0);
}

const isApify = process.env.APIFY_TOKEN || process.env.APIFY_IS_AT_YOU;

if (isApify) {
  runActor();
} else {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 6030;

  console.log(`Backend server running on port ${port}`);

  export default {
    port,
    fetch: app.fetch,
  };
}
