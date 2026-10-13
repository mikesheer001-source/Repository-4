# ModelScope — AI Benchmark Explorer

A standalone, mobile-friendly interactive comparison of 39 model configurations across 11 Artificial Analysis-derived benchmarks.

## Features

- Select Intelligence Index, AA-Briefcase, GDPval-AA, AutomationBench, Terminal-Bench, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, Omniscience, and Long Context benchmarks.
- Switch between linear and logarithmic cost axes.
- Switch the Y-axis baseline between **Zero** and **Lowest model** (fits the currently enabled models with padding; negative data remains visible).
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

## Optional once-daily Artificial Analysis API updates

The default website remains **fully functional from the original `data.js` snapshot**.
A daily workflow in `.github/workflows/daily-update.yml` is ready and runs once
per day. It uses the supported Free API endpoint
`https://artificialanalysis.ai/api/v2/language/models/free`.

**What can update:** only the overall Intelligence Index and the **Intelligence Index
cost per task**, for uniquely and safely matched models in the existing 39-model list.
The ten detailed benchmark scores are unchanged because the Free API does not provide them.
New models are not added automatically. This is an intentionally conservative integration.

### Prerequisites to activate public updates

Artificial Analysis states Free API use is *internal only*, without permission
for redistribution. A public GitHub Pages website must **not** republish Free API
data unless you have suitable redistribution permission or a commercial agreement.

1. Create an API key at https://artificialanalysis.ai/data-api.
2. In GitHub [Actions secrets](https://github.com/mikesheer001-source/Repository-4/settings/secrets/actions),
   add a **repository secret** named `AA_API_KEY`. Never put API keys in browser code
   or commit them.
3. **Only after confirming redistribution rights**, in
   [Actions variables](https://github.com/mikesheer001-source/Repository-4/settings/variables/actions),
   add a **repository variable** called `AA_PUBLIC_SHARING_ALLOWED` set to `true`.
4. Optionally test in **Actions → Daily Artificial Analysis Update → Run workflow**.

The workflow runs daily around **03:17 UTC** (GitHub may delay scheduled jobs),
and skips safely unless *both* the secret and permission flag are configured.
A failed request or uncertain model name leaves the previous website unchanged.
If scores are unchanged, it does not commit or redeploy.

When refreshed values exist, `updates.js` contains only that small overlay, and
the site's footer shows how many models received refreshed values and the UTC date.
The API key remains server-side in GitHub Actions. The existing site publication
workflow still works independently.

To **disable** automatic publishing, delete the variable
`AA_PUBLIC_SHARING_ALLOWED` or set it to `false`. The current published data remains
until deliberately changed; disabling future refreshes does not erase previously
published values.
