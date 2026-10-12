# ModelScope — AI Benchmark Explorer

A standalone, mobile-friendly interactive comparison of 39 model configurations across 11 Artificial Analysis-derived benchmarks.

## Features

- Select Intelligence Index, AA-Briefcase, GDPval-AA, AutomationBench, Terminal-Bench, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, Omniscience, and Long Context benchmarks.
- Switch between linear and logarithmic cost axes.
- Zoom slider immediately below the chart (1×–60×), horizontal drag-pan, and pinch/wheel zoom.
- Hide or restore model families individually; **Flip all** reverses every selection.
- Dynamic visible-model Pareto frontier, point inspection, searchable model data table, CSV export, and sharable URL settings.
- Works without a server, build step, account, API key, or external JavaScript dependency.

## Files

- `index.html` — Site markup
- `style.css` — Responsive dark dashboard styles
- `app.js` — All chart rendering and UI interaction
- `data.js` — Rounded snapshot data (39 models, 11 metrics)
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow

## Publishing

**Repository:** https://github.com/mikesheer001-source/Repository-4

**Expected GitHub Pages URL once enabled:** https://mikesheer001-source.github.io/Repository-4/

If deployment has not started, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
The workflow deploys automatically on push to `main`, or it can be run manually in **Actions → Publish ModelScope to GitHub Pages → Run workflow**.

## Data accuracy and limitations

Data is a **static snapshot** from the prior ChatGPT comparison and Artificial Analysis-referenced values, not a live API connection. Model costs and scores are rounded. Some benchmark fields are unavailable; unavailable values are excluded from those plots, never replaced with fabricated measurements. The frontier is computed over **visible models with reported values**, not the global model ecosystem.

For latest original model measurements, check https://artificialanalysis.ai/.
