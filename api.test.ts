import { describe, it, expect, beforeAll, afterAll } from "bun:test";
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

describe("Root Endpoint", () => {
  it("should return API info", async () => {
    const res = await app.request("/");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Cambridge Dictionary API");
    expect(body.usage).toBe("GET /define/:word");
  });
});

describe("Health Endpoint", () => {
  it("should return health status", async () => {
    const res = await app.request("/api/health");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });
});

describe("Define Endpoint", () => {
  it("should return 400 when word parameter is missing or empty", async () => {
    const res = await app.request("/api/define/%20");
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Word parameter is required");
  });

  it("should return 404 for non-existent word", async () => {
    const res = await app.request("/api/define/xyznonexistentword123");
    
    expect(res.status).toBe(404);
  }, 30000);
});
