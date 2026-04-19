import "./styles.css";
import { buildTooltipHtml, renderCombinedGrowthChart } from "./lib/chart";
import {
  calculateAgeInMonths,
  calculateCorrectedAgeInMonths,
  calculateGrowthVelocity,
  calculateMidParentalTargetHeight,
  formatMonths
} from "./lib/personalization";
import {
  loadHomeMeasurements,
  saveHomeMeasurements,
  saveParentHeights,
  savePrematurity,
  saveSelectedDemoScenarioId
} from "./lib/storage";
import { loadAppState } from "./lib/smart";
import type { AppState, GrowthMeasurement, HomeMeasurementInput } from "./types";

const appElement = document.querySelector<HTMLDivElement>("#app");

void initialize();

async function initialize(): Promise<void> {
  if (!appElement) {
    return;
  }

  appElement.innerHTML = `<div class="loading-shell">Loading Personalized Growth Chart Companion...</div>`;

  const state = await loadAppState();
  renderApp(state);
}

function renderApp(state: AppState): void {
  if (!appElement) {
    return;
  }

  const measurements = [...state.measurements].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
  );
  const latestMeasurementDate = measurements[measurements.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const heightVelocity = calculateGrowthVelocity(measurements, "height");
  const weightVelocity = calculateGrowthVelocity(measurements, "weight");
  const midParentalHeight = calculateMidParentalTargetHeight(
    state.patient.sexAtBirth,
    state.parentHeights.motherHeightCm,
    state.parentHeights.fatherHeightCm
  );
  const correctedAge = calculateCorrectedAgeInMonths(
    state.patient,
    latestMeasurementDate,
    state.prematurity.gestationalAgeWeeks
  );
  const chronologicalAge = calculateAgeInMonths(state.patient.birthDate, latestMeasurementDate);

  appElement.innerHTML = `
    <main class="page-shell">
      <section class="hero-card hero-polished">
        <div class="hero-topline">
          <div>
            <p class="eyebrow">SMART on FHIR Growth Demo</p>
            <h1>Personalized Growth Chart Companion</h1>
            <p class="hero-copy">
              A more polished demo view that combines SMART-imported growth data, interactive trend review,
              and conservative interpretation that families can discuss with a clinician.
            </p>
          </div>
          <div class="pill-row">
            <span class="pill">${state.useMockData ? "Mock demo mode" : "Epic SMART-connected"}</span>
            <span class="pill">Interactive combined chart</span>
            <span class="pill">${state.dataSourceLabel}</span>
          </div>
        </div>

        ${
          state.useMockData
            ? `
              <div class="scenario-switcher">
                <label for="demo-scenario-select">Demo case</label>
                <select id="demo-scenario-select" name="demoScenario">
                  ${state.availableDemoScenarios
                    .map(
                      (scenario) => `
                        <option value="${scenario.id}" ${state.demoScenario?.id === scenario.id ? "selected" : ""}>
                          ${scenario.label}
                        </option>
                      `
                    )
                    .join("")}
                </select>
                <p class="scenario-copy">${state.demoScenario?.description ?? ""}</p>
              </div>
            `
            : `
              <div class="scenario-switcher live-note">
                <div>
                  <label>Live data mode</label>
                  <p class="scenario-copy">
                    This screen is now ready to swap mock demo cases for Epic sandbox patient profiles launched through SMART.
                  </p>
                </div>
              </div>
            `
        }
      </section>

      <section class="warning-card">
        <strong>Important:</strong> This companion does not replace clinician judgment, does not diagnose
        a condition, and does not change validated growth standards. If something seems concerning,
        it may be useful to discuss it with your clinician.
      </section>

      <section class="grid two-up">
        <article class="card">
          <h2>Child Profile</h2>
          <dl class="data-list">
            <div><dt>Name</dt><dd>${state.patient.givenName} ${state.patient.familyName}</dd></div>
            <div><dt>Date of birth</dt><dd>${formatDate(state.patient.birthDate)}</dd></div>
            <div><dt>Sex recorded in EHR</dt><dd>${capitalize(state.patient.sexAtBirth)}</dd></div>
            <div><dt>Age at latest measurement</dt><dd>${chronologicalAge.toFixed(1)} months</dd></div>
            <div><dt>Data source</dt><dd>${state.dataSourceLabel}</dd></div>
          </dl>
        </article>

        <article class="card">
          <h2>Personalization Snapshot</h2>
          <div class="mini-stat-list">
            <div class="mini-stat">
              <span class="mini-stat-label">Corrected age</span>
              <strong>${formatMonths(correctedAge)}</strong>
              <p>Used only when gestational age at birth was under 37 weeks.</p>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-label">Mid-parental target height</span>
              <strong>${midParentalHeight.targetHeightCm ? `${midParentalHeight.targetHeightCm} cm` : "Add parent heights"}</strong>
              <p>
                ${
                  midParentalHeight.targetHeightCm
                    ? `Estimated adult target height band: ${midParentalHeight.lowerBandCm} to ${midParentalHeight.upperBandCm} cm.`
                    : "A family-height estimate can provide context, but it does not predict an exact outcome."
                }
              </p>
            </div>
          </div>
        </article>
      </section>

      <section class="grid">
        <article class="card chart-card">
          ${renderCombinedGrowthChart(measurements, state.trendInsight)}
          ${
            state.trendInsight
              ? `
                <div class="insight-banner">
                  <strong>${state.trendInsight.title}:</strong> ${state.trendInsight.body}
                </div>
                <p class="reference-copy">
                  ${state.trendInsight.percentileLabel ?? "Percentile labels in mock mode are demo annotations for presentation only."}
                </p>
              `
              : `
                <p class="reference-copy">
                  Hover over each date to inspect the corresponding height and weight values together.
                </p>
              `
          }
        </article>
      </section>

      <section class="grid two-up">
        <article class="card">
          <h2>Trend Interpretation</h2>
          <div class="mini-stat-list">
            <div class="mini-stat">
              <span class="mini-stat-label">Height velocity</span>
              <strong>${formatVelocity(heightVelocity.latestDelta, heightVelocity.latestIntervalDays, heightVelocity.annualizedRate, heightVelocity.unitPerYear)}</strong>
              <p>Calculated from the latest two height observations in the current dataset.</p>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-label">Weight velocity</span>
              <strong>${formatVelocity(weightVelocity.latestDelta, weightVelocity.latestIntervalDays, weightVelocity.annualizedRate, weightVelocity.unitPerYear)}</strong>
              <p>Calculated from the latest two weight observations in the current dataset.</p>
            </div>
          </div>
        </article>

        <article class="card">
          <h2>Measurements</h2>
          <p class="section-copy">
            EHR and home measurements are shown separately so trend review remains explicit about source.
          </p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Percentile</th>
                  <th>Source</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${measurements.map((measurement) => renderMeasurementRow(measurement)).join("")}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="grid two-up print-hidden">
        <article class="card">
          <h2>Add Home Measurement</h2>
          <p class="section-copy">
            Home measurements can be useful for tracking between visits. They are stored only in this browser for now.
          </p>
          <form id="home-measurement-form" class="stack-form">
            <label>
              Measurement type
              <select name="type">
                <option value="height">Height / length</option>
                <option value="weight">Weight</option>
              </select>
            </label>
            <label>
              Date
              <input type="date" name="date" required value="${latestMeasurementDate}" />
            </label>
            <label>
              Value
              <input type="number" name="value" min="0" step="0.1" required placeholder="Enter cm or kg" />
            </label>
            <label>
              Note
              <input type="text" name="note" maxlength="120" placeholder="Optional context" />
            </label>
            <button type="submit">Save Home Measurement</button>
          </form>
        </article>

        <article class="card">
          <h2>Context Inputs</h2>
          <form id="context-form" class="stack-form">
            <label>
              Mother height (cm)
              <input type="number" name="motherHeightCm" min="100" max="230" step="0.1" value="${state.parentHeights.motherHeightCm ?? ""}" />
            </label>
            <label>
              Father height (cm)
              <input type="number" name="fatherHeightCm" min="100" max="230" step="0.1" value="${state.parentHeights.fatherHeightCm ?? ""}" />
            </label>
            <label>
              Gestational age at birth (weeks)
              <input type="number" name="gestationalAgeWeeks" min="22" max="42" step="1" value="${state.prematurity.gestationalAgeWeeks ?? ""}" />
            </label>
            <button type="submit">Save Context</button>
          </form>
        </article>
      </section>
    </main>
  `;

  attachScenarioHandlers();
  attachChartInteractions();
  attachFormHandlers(state);
}

function attachScenarioHandlers(): void {
  const select = document.querySelector<HTMLSelectElement>("#demo-scenario-select");
  select?.addEventListener("change", () => {
    saveSelectedDemoScenarioId(select.value);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("mock", "true");
    nextUrl.searchParams.set("case", select.value);
    window.location.href = nextUrl.toString();
  });
}

function attachChartInteractions(): void {
  const chartRoot = document.querySelector<HTMLElement>("[data-chart-root]");
  const tooltip = chartRoot?.querySelector<HTMLElement>(".chart-tooltip");
  const hoverZones = chartRoot?.querySelectorAll<HTMLElement>(".chart-hover-zone");

  if (!chartRoot || !tooltip || !hoverZones?.length) {
    return;
  }

  const showTooltip = (event: MouseEvent): void => {
    const target = event.currentTarget as HTMLElement;
    tooltip.innerHTML = buildTooltipHtml(target);
    tooltip.hidden = false;

    const rootBounds = chartRoot.getBoundingClientRect();
    const x = event.clientX - rootBounds.left + 18;
    const y = event.clientY - rootBounds.top - 18;

    tooltip.style.left = `${Math.min(x, rootBounds.width - 190)}px`;
    tooltip.style.top = `${Math.max(18, y)}px`;
  };

  const hideTooltip = (): void => {
    tooltip.hidden = true;
  };

  hoverZones.forEach((zone) => {
    zone.addEventListener("mouseenter", showTooltip);
    zone.addEventListener("mousemove", showTooltip);
    zone.addEventListener("mouseleave", hideTooltip);
  });
}

function attachFormHandlers(state: AppState): void {
  const homeForm = document.querySelector<HTMLFormElement>("#home-measurement-form");
  const contextForm = document.querySelector<HTMLFormElement>("#context-form");

  homeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(homeForm);
    const input: HomeMeasurementInput = {
      type: String(formData.get("type")) as HomeMeasurementInput["type"],
      date: String(formData.get("date")),
      value: Number(formData.get("value")),
      note: String(formData.get("note") || "").trim() || undefined
    };

    const unit = input.type === "height" ? "cm" : "kg";
    const homeMeasurements = loadHomeMeasurements();
    const nextMeasurement: GrowthMeasurement = {
      id: `home-${crypto.randomUUID()}`,
      type: input.type,
      date: input.date,
      value: input.value,
      unit,
      source: "Home",
      note: input.note
    };

    saveHomeMeasurements([...homeMeasurements, nextMeasurement]);
    renderApp({
      ...state,
      measurements: [...state.measurements, nextMeasurement]
    });
  });

  contextForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contextForm);
    const parentHeights = {
      motherHeightCm: readOptionalNumber(formData.get("motherHeightCm")),
      fatherHeightCm: readOptionalNumber(formData.get("fatherHeightCm"))
    };
    const prematurity = {
      gestationalAgeWeeks: readOptionalNumber(formData.get("gestationalAgeWeeks"))
    };

    saveParentHeights(parentHeights);
    savePrematurity(prematurity);

    renderApp({
      ...state,
      parentHeights,
      prematurity
    });
  });
}

function readOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function renderMeasurementRow(measurement: GrowthMeasurement): string {
  return `
    <tr>
      <td>${formatDate(measurement.date)}</td>
      <td>${capitalize(measurement.type)}</td>
      <td>${measurement.value} ${measurement.unit}</td>
      <td>${measurement.percentile !== undefined ? `${ordinal(measurement.percentile)}` : "—"}</td>
      <td><span class="source-badge ${measurement.source.toLowerCase()}">${measurement.source}</span></td>
      <td>${measurement.note ?? "—"}</td>
    </tr>
  `;
}

function formatVelocity(
  delta: number | null,
  intervalDays: number | null,
  annualizedRate: number | null,
  unitPerYear: string
): string {
  if (delta === null || intervalDays === null || annualizedRate === null) {
    return "Not available yet";
  }

  return `${delta} over ${intervalDays} days (${annualizedRate} ${unitPerYear})`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ordinal(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${value}st`;
  }

  if (mod10 === 2 && mod100 !== 12) {
    return `${value}nd`;
  }

  if (mod10 === 3 && mod100 !== 13) {
    return `${value}rd`;
  }

  return `${value}th`;
}
