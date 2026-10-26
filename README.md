# ModelScope — AI Benchmark Explorer

A standalone, mobile-friendly interactive comparison of 44 model configurations across 11 Artificial Analysis-derived benchmarks.

## Features

- Select Intelligence Index, AA-Briefcase, GDPval-AA, AutomationBench, Terminal-Bench, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, Omniscience, and Long Context benchmarks.
- Press a single **X-axis scale** button to cycle between Linear and Logarithmic.
- Press a single **Y-axis start** button to cycle between Zero and Lowest model (with padding; negative values still shown).
- Press the **Pareto frontier** button to show/hide the efficient frontier.
- Zoom slider immediately below the chart (1×–60×), horizontal drag-pan, and pinch/wheel zoom.
- Hide or restore model families individually; **Flip all** reverses every selection.
- Dynamic visible-model Pareto frontier, point inspection, searchable model data table, CSV export, and sharable URL settings.
- Works without a server, build step, account, API key, or external JavaScript dependency.

## Files

- `index.html` — Site markup
- `style.css` — Responsive dark dashboard styles
- `app.js` — All chart rendering and UI interaction
- `data.js` — Rounded snapshot data (44 models, 11 metrics)
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow

## Publishing

**Repository:** https://github.com/mikesheer001-source/Repository-4

**Expected GitHub Pages URL once enabled:** https://mikesheer001-source.github.io/Repository-4/

If deployment has not started, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
The workflow deploys automatically on push to `main`, or it can be run manually in **Actions → Publish ModelScope to GitHub Pages → Run workflow**.

## Data accuracy and limitations

Data is a **static snapshot** from the prior ChatGPT comparison and Artificial Analysis-referenced values, not a live API connection. Model costs and scores are rounded. Some benchmark fields are unavailable; unavailable values are excluded from those plots, never replaced with fabricated measurements. The frontier is computed over **visible models with reported values**, not the global model ecosystem.

For latest original model measurements, check https://artificialanalysis.ai/.

## October 26, 2026 full source review and Qwen additions

Updated the existing 38 active API model configurations against currently indexed **Artificial Analysis v4.3.2** model-comparison tables and added five Qwen configurations. The dataset now contains **44 plotted configurations across 13 families and 11 Y-axis metrics**.

- Source-backed updates changed 60 benchmark or cost figures across 36 of the existing models. The other two active rows retained their displayed values; GPT-6 Luna Medium's individual component scores are carried forward from the earlier snapshot because the current public source only confirmed its overall score and cost.
- Added Qwen3.8-Flash-Next, Qwen3.8 Max (0902), Qwen3.8 27B (Xhigh), Qwen3.8 2.4T A95B, and Qwen3.7 Plus, with independently sourced values for all 11 metrics.
- The 44th row, GPT-6 Sol non-reasoning, is a **deprecated historical result** and is not presented as newly remeasured.
- Each newly reviewed row links to an individual Artificial Analysis comparison page through `model_sources`. Individual provider measurements can fluctuate slightly as evaluations are repeated.
- The site remains a manually reviewed static dataset. The optional daily API automation stays gated, and **nothing here claims live continuous refresh or API authorization**.
- Some source pages can differ by a few Elo points between crawls; the values reflect published results collected for this review, not permanently fixed scores.

## October 21, 2026 source spot-check

Checked current Artificial Analysis model comparison pages across OpenAI, Anthropic, Meta and other providers on October 21, 2026. Applied **7 changes** to source-verified AA-Briefcase scores, including GPT-6.1 Sol High (1465), GPT-6 Sol High (1266), Claude Opus 5.5 High (1686), and others. The complete list and individual comparison-page URLs are in the `review.latest_changes` entries inside `data.js`.

This is a **targeted spot-check**, not a full re-evaluation of all 429 potential data cells. Scores not specifically checked on October 21 retain the October 16 snapshot. No API update or new benchmark data were invented.

## October 16, 2026 manual benchmark audit

The website's **39 plotted model configurations / 11 measurements** were reviewed against the publicly displayed Artificial Analysis model-comparison data on October 16, 2026. The dataset in `data.js` has an `as_of` timestamp, original metric units, benchmark version, model-family sources and a numeric change summary.

- **29 model rows** received **40 numerical corrections** from the review.
- Most revisions are small AA-Briefcase/GDPval-AA fluctuations; GLM-5.3-Flash's displayed cost per task is now **$0.28**.
- GPT-6 Sol non-reasoning is **deprecated** and retains its last published historical values (not an actively maintained current benchmark).
- The user-facing ChatGPT GPT-6 **Instant, Medium, High** settings are powered by GPT-6 Sol on eligible paid plans (see [OpenAI model help](https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt)). Their exact scores and costs are **not published separately** by Artificial Analysis; do not equate them to particular API reasoning settings.
- Artificial Analysis data is rounded and can change as evaluations are repeated. This is a reviewed **snapshot**, not proof of continuously live numbers. See [Artificial Analysis](https://artificialanalysis.ai/models/releases) for future changes.

## Optional once-daily Artificial Analysis API updates

The default website remains **fully functional from the original `data.js` snapshot**.
A daily workflow in `.github/workflows/daily-update.yml` is ready and runs once
per day. It uses the supported Free API endpoint
`https://artificialanalysis.ai/api/v2/language/models/free`.

**What can update:** only the overall Intelligence Index and the **Intelligence Index
cost per task**, for uniquely and safely matched models in the existing 44-model list.
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
