---
name: Image context for chat follow-ups
description: How image analysis results are preserved so text follow-up questions reference the same image
---

## The pattern

`ImageContext { question, analysis, thumbnail? }` is stored in state after any image analysis. `buildEnrichedHistory()` prepends two synthetic history turns (user question + AI analysis, analysis truncated to 1200 chars) before recent text messages, then passes this enriched history to the guest endpoint.

**Why:** Groq's text model has no memory of the vision call. Injecting image context into history is the only way for text follow-ups ("is this treatable?" / "what spray should I use?") to stay coherent with the image analysis.

**How to apply:**
- GuestChat: uses regular guest endpoint with enriched history for text follow-ups
- AuthenticatedChat: uses raw fetch to `/api/chat/guest` with enriched history (avoids DB schema changes — image analyses stay in localMessages, not DB)
- Uploading a new image resets context (`setImageContext(null)`)
- Banner (`ImageContextBanner`) appears above ChatInput when context is active, shows thumbnail + question, has a clear button
- When imageContext is null the banner is hidden and ChatInput behaves normally
- `buildEnrichedHistory` slices last 6 messages to keep token budget reasonable
