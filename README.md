# Cambridge Dictionary Scraper

A web scraper that retrieves word definitions, phonetics, and examples from the Cambridge Dictionary. Can be run as a web API server or deployed as an Apify Actor.

## Features

- Scrapes definitions, phonetics, and usage examples from Cambridge Dictionary
- Supports single word or batch lookups
- Can run as a REST API server or as an Apify Actor

## Usage as Web Server

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Or run the built version
bun run start
```

### API Endpoints

- `GET /` - Health check
- `GET /api/define/:word` - Get definition for a word
- `GET /api/health` - Health check

### Example

```bash
curl http://localhost:6030/api/define/hello
```

## Usage as Apify Actor

### Input Schema

```json
{
  "word": "hello",
  "words": ["hello", "world", "test"]
}
```

- `word` (optional): A single word to look up
- `words` (optional): An array of words to look up

### Running Locally

```bash
# Set Apify token (for local testing with Apify SDK)
export APIFY_TOKEN=your_token

# Run with input
apify run -p
```

### Deploying to Apify

1. Create a new Actor on Apify
2. Push this code to your Actor's source
3. Set the following environment variables in Apify:
   - `APIFY_TOKEN` (optional, for proxy support)
4. Use the `INPUT.json` file to provide input

### Output

Results are saved to the Apify default dataset with the following structure:

```json
{
  "word": "hello",
  "phonetic": "/həˈləʊ/",
  "definitions": [
    {
      "partOfSpeech": "exclamation",
      "definitions": [
        {
          "definition": "used as a greeting",
          "examples": ["Hello, how are you?"]
        }
      ]
    }
  ]
}
```

## Docker

```bash
# Build
docker build -t cambridge-api .

# Run
docker run -p 6030:6030 cambridge-api
```

## Tech Stack

- Bun
- Hono (web framework)
- Playwright (web scraping)
- Apify SDK (for actor mode)
