import { Hono } from "hono";
import { cors } from "hono/cors";
import { CambridgeDictionaryScraper } from "./src/classes/CambridgeDictionaryScraper";
import type { IDictionaryScraper } from "./src/interfaces/IDictionaryScraper";

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
    usage: "GET /define/:word",
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

const port = process.env.PORT ? parseInt(process.env.PORT) : 6030;

console.log(`Backend server running`);

export default {
  port,
  fetch: app.fetch,
};
