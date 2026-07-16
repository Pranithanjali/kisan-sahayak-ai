---
name: Vision AI setup
description: How image analysis is implemented using Groq's vision model
---

**Model:** `meta-llama/llama-4-scout-17b-16e-instruct` (vision-capable, Groq API)

**Endpoint:** `POST /api/chat/analyze-image`
- Accepts `imageBase64` (data URL) or `imageUrl` (https://)
- For imageUrl: backend fetches and converts to base64 before sending to Groq
- Body limit on Express is already 10mb — sufficient for base64 images
- Returns `{ content: string, language: string }`

**Frontend pattern:**
- File upload + camera capture via hidden `<input type="file">` elements
- Paste support via `window.addEventListener("paste", ...)` in `useEffect`
- URL input inside the image upload popover menu
- Guest chat: image Q&A stored in local `messages` state with `imagePreview` field
- Authenticated chat: image Q&A in separate `localMessages` state (not persisted to DB), shown after DB messages with a divider

**Why separate local state for auth chat:** The regular sendMessage endpoint uses text-only Groq (llama-3.1-8b-instant), not vision. Rather than double-calling or modifying the DB schema, image analyses are kept in local overlay state — clean UX, no schema changes needed.
