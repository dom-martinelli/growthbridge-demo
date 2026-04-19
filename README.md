# Personalized Growth Chart Companion

Patient-facing SMART on FHIR demo scaffold for Epic sandbox testing.

This app now supports two deployment modes:

- local HTTPS dev for fast iteration
- GitHub Pages for a stable public Epic launch URL

The app includes:

- `launch.html` as the SMART authorize entry point
- `index.html` as the app redirect target and patient view
- mock demo scenarios, including a Turner syndrome teaching case
- a combined interactive height/weight chart with hover tooltips
- a flagged interpretation banner for demo storytelling

## Best Recommendation

If your goal is to demo Epic sandbox launch without fighting `localhost`, GitHub Pages is a good fit for this app.

For Epic registration, a public Pages URL is simpler than local HTTPS because:

- Epic can redirect to a stable HTTPS domain
- you avoid local certificate warnings
- other people can test the same deployed URL

## Local HTTPS Dev

### 1. Install dependencies

```bash
npm install
```

### 2. Create your local env file

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
VITE_SMART_CLIENT_ID=your-epic-sandbox-client-id
VITE_FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/
VITE_SMART_SCOPES=launch/patient patient/Patient.read patient/Observation.read openid fhirUser
```

### 3. Start local HTTPS dev

```bash
npm run dev
```

Open:

```text
https://localhost:5173/?mock=true
```

Turner syndrome demo case:

```text
https://localhost:5173/?mock=true&case=turner-syndrome-demo
```

## GitHub Pages Deployment

This repo is now set up to deploy to GitHub Pages through GitHub Actions.

### What the workflow does

- builds the Vite app with the correct Pages base path
- publishes the contents of `dist/` to GitHub Pages
- supports project Pages URLs like:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/
```

### Files added for Pages

- [vite.config.ts](/Users/dominiero/Documents/Zaklab/notebooks/codex%20challenge/vite.config.ts)
- [.github/workflows/deploy-pages.yml](/Users/dominiero/Documents/Zaklab/notebooks/codex%20challenge/.github/workflows/deploy-pages.yml)
- [public/.nojekyll](/Users/dominiero/Documents/Zaklab/notebooks/codex%20challenge/public/.nojekyll)

### How to enable Pages

1. Push this project to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Set the source to `GitHub Actions`.
4. Push to your default branch.
5. Wait for the `Deploy to GitHub Pages` workflow to finish.

Your public base URL will usually be:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/
```

### Exact Epic URLs for GitHub Pages

If your repo is `growthbridge-demo` under `yourname`, the exact URLs are:

- Launch URL:
  `https://yourname.github.io/growthbridge-demo/launch.html`
- Redirect URI:
  `https://yourname.github.io/growthbridge-demo/index.html`

Mock mode on Pages:

```text
https://yourname.github.io/growthbridge-demo/?mock=true
```

Turner demo case on Pages:

```text
https://yourname.github.io/growthbridge-demo/?mock=true&case=turner-syndrome-demo
```

## Exact Epic Sandbox Registration Fields

### App record

- App type: browser/web SMART app
- Intended launch pattern: EHR launch with patient context
- FHIR version: R4
- Redirect URI:
  use your exact deployed `.../index.html`
- Launch URL:
  use your exact deployed `.../launch.html`
- Non-production client ID:
  use the value Epic assigns after app creation

### Scopes used by this app

```text
launch/patient patient/Patient.read patient/Observation.read openid fhirUser
```

### Runtime behavior

- `launch.html` calls `FHIR.oauth2.authorize(...)`
- `index.html` resolves the SMART session with `FHIR.oauth2.ready()`
- the app reads:
  - `Patient`
  - `Observation` for height and weight vital signs

## Important Pages Detail

This app is now base-path aware.

That matters because GitHub project Pages are usually deployed under a subpath like `/growthbridge-demo/`, not at the site root. The SMART redirect code now generates:

- `https://origin/repo-name/index.html`
- `https://origin/repo-name/launch.html`

instead of incorrectly assuming:

- `https://origin/index.html`

## Build Commands

Standard build:

```bash
npm run build
```

Pages build uses the same Vite build command, but the GitHub Actions workflow sets `PUBLIC_BASE_PATH` automatically to the repository subpath.

## Current Scope Limits

- No validated CDC/WHO percentile engine yet
- Percentile labels in mock mode are curated demo annotations
- No FHIR write-back
- No backend token handling or refresh-token server flow
- No condition-specific clinical recommendation engine
