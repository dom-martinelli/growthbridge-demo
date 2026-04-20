# GrowthBridge Demo

GrowthBridge is a patient-facing SMART on FHIR demo for the Epic sandbox. It is built as a small Vite app that can run locally over HTTPS or be deployed to GitHub Pages for a stable public launch URL.

The current demo focuses on a polished growth-review experience:

- SMART launch entry at `launch.html`
- patient view at `index.html`
- combined interactive height and weight chart
- hover tooltips for each measurement date
- mock demo scenarios, including a Turner syndrome teaching case
- conservative flagged interpretation text for demo storytelling

## What This Repo Is

This is a browser-based demo app, not a production clinical product. It reads patient and observation data from the Epic sandbox and overlays a lightweight presentation layer for demo purposes.

Current scope:

- read-only SMART on FHIR app
- Epic sandbox-compatible launch flow
- GitHub Pages deployment support
- local browser storage for home-entered measurements

Out of scope right now:

- FHIR write-back
- production auth/backend services
- validated CDC/WHO percentile engine
- condition-specific clinical decision support

## Stack

- Vite
- TypeScript
- [`fhirclient`](https://github.com/smart-on-fhir/client-js)
- GitHub Pages
- Epic SMART on FHIR sandbox

## Repo Structure

```text
.
├── .github/workflows/deploy-pages.yml
├── public/
├── src/
│   ├── lib/
│   ├── launch.ts
│   ├── main.ts
│   ├── mockData.ts
│   ├── styles.css
│   └── types.ts
├── .env.example
├── index.html
├── launch.html
├── package.json
└── vite.config.ts
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Edit `.env`:

```dotenv
VITE_SMART_CLIENT_ID=your-epic-sandbox-client-id
VITE_FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/
VITE_SMART_SCOPES=launch/patient patient/Patient.read patient/Observation.read openid fhirUser
```

4. Start the local HTTPS dev server:

```bash
npm run dev
```

5. Open mock mode:

```text
https://localhost:5173/?mock=true
```

Turner syndrome demo case:

```text
https://localhost:5173/?mock=true&case=turner-syndrome-demo
```

## GitHub Pages

This repo includes a GitHub Actions workflow for GitHub Pages deployment:

- workflow: `.github/workflows/deploy-pages.yml`
- target repo: `dom-martinelli/growthbridge-demo`
- expected public URL:
  `https://dom-martinelli.github.io/growthbridge-demo/`

After Pages is enabled in repository settings, the app URLs should be:

- App root:
  `https://dom-martinelli.github.io/growthbridge-demo/`
- Launch URL:
  `https://dom-martinelli.github.io/growthbridge-demo/launch.html`
- Redirect URI:
  `https://dom-martinelli.github.io/growthbridge-demo/index.html`

Mock mode on Pages:

```text
https://dom-martinelli.github.io/growthbridge-demo/?mock=true
```

Turner syndrome demo case on Pages:

```text
https://dom-martinelli.github.io/growthbridge-demo/?mock=true&case=turner-syndrome-demo
```

## Epic Sandbox Registration

For Epic sandbox registration, use these values:

- Application audience: `Patients`
- App type: browser/web SMART app
- FHIR version: `R4`
- Launch URL:
  `https://dom-martinelli.github.io/growthbridge-demo/launch.html`
- Redirect URI / Endpoint URI:
  `https://dom-martinelli.github.io/growthbridge-demo/index.html`
- Scopes:
  `launch/patient patient/Patient.read patient/Observation.read openid fhirUser`
- Confidential client: `No`
- Dynamic client registration: `No`

Important details:

- Epic requires exact redirect URI matching.
- `/index.html` is different from `/`.
- Because this is a GitHub Pages project site, the repo subpath `/growthbridge-demo/` matters.

## Build

Standard build:

```bash
npm run build
```

The Pages workflow uses the same build, but injects the repo base path automatically so generated asset URLs work under `/growthbridge-demo/`.

## Notes

- `.env` is intentionally ignored.
- `node_modules/` and `dist/` are intentionally ignored.
- `.env.example` is safe to commit because it contains placeholders only.

## Medical / Demo Safety

This repo is for demonstration and prototyping only. It does not provide medical advice, does not replace clinician judgment, and should not be interpreted as a validated diagnostic or treatment tool.
