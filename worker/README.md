# Turn on the AI chat (free, ~10 minutes)

The chat already works without this, using built-in answers. This step adds real AI for questions it doesn't know.

1. Sign up free at **dash.cloudflare.com** (no card needed for Workers).
2. **Workers & Pages → Create → Create Worker** → name it `ask-jack` → **Deploy**.
3. **Edit code** → delete everything → paste all of `worker.js` → **Deploy**.
4. Worker → **Settings → Bindings → Add → Workers AI** → variable name: `AI` → Save.
5. **Settings → Variables and Secrets → Add**: name `ALLOWED_ORIGINS`, value `https://jackwalker728.github.io` (add `,http://localhost:8000` too if you want to test locally) → Deploy.
6. Copy the worker URL (looks like `https://ask-jack.<you>.workers.dev`) and paste it into `data/content.js` → `chat.workerUrl`.

Done. The chat badge will say "AI-powered".

**Safety built in:** only your site may call it, 12 messages/minute per visitor, 25 AI replies per visitor session, short answers, and it may only use facts from your content file.
**If the free daily allowance runs out**, the site automatically falls back to built-in answers.
Optional: set a `MODEL` variable to change the AI model (default `@cf/meta/llama-3.1-8b-instruct`).
