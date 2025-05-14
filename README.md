
# Heylingo Client (Embeddable Snippet)

This repository contains the **Heylingo client snippet**, published on npm as [`heylingo`](https://www.npmjs.com/package/heylingo).

It allows you to make your website multilingual with just a few lines of code — without touching your existing backend or adding i18n tokens.

---

## ✨ Key Features

- 🌍 30+ languages included by default
- 🧠 AI-powered translations fetched dynamically
- 🧩 No code refactoring (no tokens, no backend changes)
- 🖥️ Built-in language switcher
- 🛡️ Fully GDPR-compliant (EU servers, no tracking, AVV possible)
- 🪶 Lightweight & easy to embed (via CDN or npm)

---

## 🚀 Installation & Usage

### Via CDN (recommended for most websites)
```html
<script src="https://cdn.jsdelivr.net/npm/heylingo@latest/dist/heylingo.umd.js"></script>
<script>
  const heylingo = new Heylingo({
    apiKey: 'YOUR_API_KEY'
  });

  heylingo.init();
</script>
```

### Via npm (for advanced integrations)
```bash
npm install heylingo
```

Usage in your frontend app:
```typescript
import { Heylingo } from 'heylingo';

const heylingo = new Heylingo({
  apiKey: 'YOUR_API_KEY'
});

heylingo.init();
```
---

## 📝 Configuration

| Option   | Type     | Required | Description                              |
|----------|----------|----------|------------------------------------------|
| `apiKey` | `string` | ✅        | Your personal API key from the Heylingo dashboard. |

---

## 📦 Development

Clone the repo and run:
```bash
npm install
npm run dev
```

To build the distributable files (UMD & ESM):
```bash
npm run build
```

---

## 🔒 Privacy & GDPR Compliance

- Hosted on servers located in Germany (EU)
- No cookies or tracking scripts used
- Optional Data Processing Agreement (AVV) for B2B customers
- Fully compliant with GDPR requirements
