# Personal Portfolio

A single-page personal portfolio site — personal statement, skills, and projects —
built with plain HTML, CSS, and JavaScript. No build step, no dependencies.

**Live site:** _add your GitHub Pages URL here after step 3 below_

---

## Editing your content

**Everything on the page comes from one file: [`assets/data.js`](assets/data.js).**
You never need to touch the HTML or CSS.

### Option A — the form editor (easiest)

1. Open the site and add `?edit=1` to the end of the URL, or click
   **Edit content** in the footer, or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd>.
2. A panel opens on the right with a labeled text box for every field.
   The page updates live as you type.
3. Use **↑ ↓** to reorder cards, **✕** to delete one, and **+ Add** for a new one.
4. Click **Export data.js**, then replace `assets/data.js` in this folder with the
   downloaded file and push (step 4 below).

> Edits are stored in your own browser until you export them. Visitors always
> see whatever is committed in `assets/data.js`, so the export-and-push step is
> what actually publishes a change.

### Option B — edit the file directly

Open `assets/data.js` in any text editor. It is commented section by section.
Change the text between the quotes, save, and refresh the page.

A few conventions worth knowing:

| Field | Notes |
| --- | --- |
| `personal.statement` | Your one-sentence intro. `<strong>` and `<em>` are allowed. |
| `skillGroups` | Each group renders as one card. Add or remove groups freely. |
| `projects` | Each entry renders as one project card. |
| any `...Url` | Leave it `""` and the button is **hidden** rather than broken. |
| `linkNote` | Shown on a project only when it has no links at all. |
| `contact.resumeUrl` | Drop a `resume.pdf` in this folder, then set this to `"resume.pdf"`. |

---

## Publishing to GitHub Pages

### 1. Create the repository

On [github.com](https://github.com), click **New repository**:

- **Name:** `portfolio` (or `YOUR-USERNAME.github.io` to host it at the root of
  your GitHub domain)
- **Visibility:** **Public** — GitHub Pages needs this on a free account
- Do **not** add a README, .gitignore, or license (this folder already has them)

### 2. Push this folder

Run these from inside the project folder, replacing the two placeholders:

```bash
git init -b main
git add .
git commit -m "Initial portfolio site"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 3. Turn on GitHub Pages

In the repository: **Settings** → **Pages** (left sidebar) →
under **Build and deployment**, set

- **Source:** `Deploy from a branch`
- **Branch:** `main` and folder `/ (root)` → **Save**

Give it about a minute, then refresh the page — GitHub shows the live URL:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

(If you named the repo `YOUR-USERNAME.github.io`, the URL has no repo suffix.)

Paste that URL at the top of this README so anyone opening the repo can find it.

### 4. Publishing later changes

```bash
git add .
git commit -m "Update portfolio content"
git push
```

Pages redeploys automatically, usually within a minute. Hard-refresh
(<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>) if you still see the old version.

---

## Running it locally

Just double-click `index.html` — there is no build step and everything works
from the filesystem.

---

## Project structure

```
index.html          page structure and section markup
assets/
  data.js           >>> ALL YOUR CONTENT LIVES HERE <<<
  styles.css        design tokens, layout, light/dark themes
  app.js            renders data.js into the page
  editor.js         the ?edit=1 form editor
.nojekyll           tells GitHub Pages to serve the files as-is
```

## Features

- Light/dark theme that follows your OS and remembers a manual override
- Responsive down to small phones
- Keyboard accessible, with a skip link, focus rings, and semantic landmarks
- Respects `prefers-reduced-motion`
- No dead links: every link button hides itself when its URL is empty
