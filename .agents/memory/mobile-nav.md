---
name: Mobile nav pattern
description: How the bottom navigation is integrated without breaking the chat layout
---

**Component:** `artifacts/agri-assistant/src/components/layout/MobileNav.tsx`
- `md:hidden` — desktop sees the header nav only
- Hidden on `/chat` routes (those have their own sticky input)
- Icons: Home, Chat, Market, FAQ
- Safe area: `safe-bottom` CSS class uses `env(safe-area-inset-bottom)` for iPhone notch

**App.tsx layout:**
- Non-chat routes: `pb-16 md:pb-0` on wrapper div + `<MobileNav />` at bottom
- Chat routes: no pb-16, no MobileNav (chat input is sticky within flex layout)
- HomePage extracted from catch-all Route into its own Route to get proper pb-16

**CSS in index.css:**
- `.safe-bottom { padding-bottom: max(0px, env(safe-area-inset-bottom)); }`
- `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on interactive elements
