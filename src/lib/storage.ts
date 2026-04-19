import type {
  DemoScenarioOption,
  GrowthMeasurement,
  ParentHeightsInput,
  PrematurityInput
} from "../types";

const HOME_MEASUREMENTS_KEY = "growth-companion-home-measurements";
const PARENT_HEIGHTS_KEY = "growth-companion-parent-heights";
const PREMATURITY_KEY = "growth-companion-prematurity";
const DEMO_SCENARIO_KEY = "growth-companion-demo-scenario";

function readJson<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadHomeMeasurements(): GrowthMeasurement[] {
  return readJson<GrowthMeasurement[]>(HOME_MEASUREMENTS_KEY, []);
}

export function saveHomeMeasurements(measurements: GrowthMeasurement[]): void {
  window.localStorage.setItem(HOME_MEASUREMENTS_KEY, JSON.stringify(measurements));
}

export function loadParentHeights(): ParentHeightsInput {
  return readJson<ParentHeightsInput>(PARENT_HEIGHTS_KEY, {
    motherHeightCm: null,
    fatherHeightCm: null
  });
}

export function saveParentHeights(input: ParentHeightsInput): void {
  window.localStorage.setItem(PARENT_HEIGHTS_KEY, JSON.stringify(input));
}

export function loadPrematurity(): PrematurityInput {
  return readJson<PrematurityInput>(PREMATURITY_KEY, {
    gestationalAgeWeeks: null
  });
}

export function savePrematurity(input: PrematurityInput): void {
  window.localStorage.setItem(PREMATURITY_KEY, JSON.stringify(input));
}

export function loadSelectedDemoScenarioId(): string | null {
  return readJson<string | null>(DEMO_SCENARIO_KEY, null);
}

export function saveSelectedDemoScenarioId(scenarioId: DemoScenarioOption["id"]): void {
  window.localStorage.setItem(DEMO_SCENARIO_KEY, JSON.stringify(scenarioId));
}
