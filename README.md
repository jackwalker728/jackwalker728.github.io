# Jack.dev — portfolio

Plain HTML/CSS/JS. No build step, no frameworks, ~60 KB total. Works on any phone or PC.

## Pages
- `index.html` — landing: 3 doors (Resume / Portfolio / World), poke-able cartoon Jack, settings (music, SFX, volumes, animations)
- `portfolio.html` — classic 2D portfolio (projects with filters + detail popups, skills, hobbies, journey, contact)
- `resume.html` — clean printable resume (Print → Save as PDF)

## Edit your info
Everything is in **`data/content.js`**: name, tagline, projects, skills, hobbies, journey, socials, outfit colours, and Jack's jokes.
- Project screenshots: put images in `assets/img/` and set `image: "assets/img/sector404.jpg"` (16:9 looks best).
- Resume PDF: drop it in `assets/` and set `resumePdf`.
The management portal (coming later) will edit this same file for you.

## Put it online (free, forever)
1. Create a GitHub repo named **`<your-username>.github.io`**.
2. Upload all of these files to it (keep the folder structure). Use **Add file → Upload files**, or `git push`.
3. Repo **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
4. In about a minute it's live at `https://<your-username>.github.io`.

Every edit you commit goes live automatically.

## Ask Jack chat
- Floating **Ask Jack** button on the landing and portfolio pages.
- Works right away with built-in answers (FAQs in `content.js → chat.faqs`, plus answers generated from your projects, skills and hobbies).
- For real AI on any question, set up the free Cloudflare Worker: see `worker/README.md`, then paste its URL into `chat.workerUrl`.

## 3D Jack
- `assets/js/jack3d.js`: cute chibi Jack built from code (no model files), toon-shaded, ~170 KB gzipped incl. Three.js.
- Wardrobe (tops, hats, glasses, neck, held items, pants, shoes) lives in `content.js → wardrobe`. Change colours/names there.
- The 2D Jack shows instantly and the 3D one swaps in once loaded. On very old devices without WebGL, the 2D one stays.
- Rendering pauses when the tab is hidden or Jack is scrolled off screen (saves battery).

## Test locally
Run `python -m http.server` in this folder, then open http://localhost:8000.
(Double-clicking `index.html` works too, but browsers block the 3D module from disk, so you'll see the 2D Jack.)
