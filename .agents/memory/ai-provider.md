---
name: AI Provider Setup
description: Why Groq is used instead of OpenAI or Gemini, and how the AI layer is wired.
---

# AI Provider: Groq

The app uses Groq's free API for AI chat responses.

**Model:** `llama-3.1-8b-instant`
**Endpoint:** `https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible)
**Secret:** `GROQ_API_KEY`
**Implementation:** `artifacts/api-server/src/lib/ai.ts` — plain `fetch`, no SDK (avoids esbuild bundling issues with `@google/*`).

**Why Groq and not OpenAI or Gemini:**
- OpenAI key had `insufficient_quota` (billing exhausted)
- Gemini key's Google Cloud project had free-tier `limit: 0` across all models (billing not enabled)
- Groq has a genuinely free tier with no credit card required

**How to apply:** If AI stops working, check `GROQ_API_KEY` is set and valid. Test with:
```bash
curl -s https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"hello"}],"max_tokens":20}'
```
