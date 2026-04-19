import FHIR from "fhirclient";
import type Client from "fhirclient/lib/Client";
import type { fhirclient } from "fhirclient/lib/types";
import { demoScenarios, getDemoScenario } from "../mockData";
import { parseGrowthObservations, parsePatient } from "./fhir";
import type { AppState } from "../types";
import {
  loadHomeMeasurements,
  loadParentHeights,
  loadPrematurity,
  loadSelectedDemoScenarioId,
  saveSelectedDemoScenarioId
} from "./storage";

const DEFAULT_SCOPES =
  "launch/patient patient/Patient.read patient/Observation.read openid fhirUser";

export async function authorizeSmartLaunch(): Promise<void> {
  const clientId = import.meta.env.VITE_SMART_CLIENT_ID;
  const scopes = import.meta.env.VITE_SMART_SCOPES || DEFAULT_SCOPES;
  const url = new URL(window.location.href);
  const iss = url.searchParams.get("iss") ?? import.meta.env.VITE_FHIR_BASE_URL;
  const launch = url.searchParams.get("launch") ?? undefined;

  if (!clientId) {
    throw new Error("Missing VITE_SMART_CLIENT_ID. Add it to your .env file before Epic launch.");
  }

  if (!iss) {
    throw new Error("Missing Epic iss context. Launch from Epic or set VITE_FHIR_BASE_URL for standalone testing.");
  }

  const authorizeParams = {
    clientId,
    scope: scopes,
    redirectUri: getRedirectUri(),
    iss,
    launch,
    aud: iss
  };

  await FHIR.oauth2.authorize(authorizeParams as Parameters<typeof FHIR.oauth2.authorize>[0]);
}

export async function loadAppState(): Promise<AppState> {
  const url = new URL(window.location.href);
  const forceMockMode = url.searchParams.get("mock") === "true";
  const selectedScenarioId = url.searchParams.get("case") ?? loadSelectedDemoScenarioId();

  if (forceMockMode || !hasSmartLaunchParams(url)) {
    const scenario = getDemoScenario(selectedScenarioId);
    saveSelectedDemoScenarioId(scenario.id);
    const homeMeasurements = loadHomeMeasurements();
    const parentHeights = fallbackParentHeights(loadParentHeights(), scenario.parentHeights);
    const prematurity = fallbackPrematurity(loadPrematurity(), scenario.prematurity);

    return {
      patient: scenario.patient,
      measurements: [...scenario.measurements, ...homeMeasurements],
      parentHeights,
      prematurity,
      useMockData: true,
      dataSourceLabel: scenario.dataSourceLabel,
      demoScenario: {
        id: scenario.id,
        label: scenario.label,
        description: scenario.description
      },
      availableDemoScenarios: demoScenarios.map(({ id, label, description }) => ({
        id,
        label,
        description
      })),
      trendInsight: scenario.trendInsight
    };
  }

  try {
    const homeMeasurements = loadHomeMeasurements();
    const parentHeights = loadParentHeights();
    const prematurity = loadPrematurity();
    const client = await FHIR.oauth2.ready();
    const state = await loadFromFhir(client);
    return {
      ...state,
      measurements: [...state.measurements, ...homeMeasurements],
      parentHeights,
      prematurity,
      useMockData: false,
      dataSourceLabel: "Epic SMART patient import",
      demoScenario: null,
      availableDemoScenarios: demoScenarios.map(({ id, label, description }) => ({
        id,
        label,
        description
      })),
      trendInsight: null
    };
  } catch (error) {
    console.error("SMART launch failed. Falling back to mock data.", error);
    const scenario = getDemoScenario(selectedScenarioId);
    const homeMeasurements = loadHomeMeasurements();
    const parentHeights = fallbackParentHeights(loadParentHeights(), scenario.parentHeights);
    const prematurity = fallbackPrematurity(loadPrematurity(), scenario.prematurity);

    return {
      patient: scenario.patient,
      measurements: [...scenario.measurements, ...homeMeasurements],
      parentHeights,
      prematurity,
      useMockData: true,
      dataSourceLabel: `${scenario.dataSourceLabel} (SMART fallback)`,
      demoScenario: {
        id: scenario.id,
        label: scenario.label,
        description: scenario.description
      },
      availableDemoScenarios: demoScenarios.map(({ id, label, description }) => ({
        id,
        label,
        description
      })),
      trendInsight: scenario.trendInsight
    };
  }
}

async function loadFromFhir(client: Client): Promise<Pick<AppState, "patient" | "measurements">> {
  const patientId = client.patient.id;
  if (!patientId) {
    throw new Error("SMART launch did not provide a patient context.");
  }

  const patientResource = await client.patient.read();

  const observationBundle = await client.request<fhirclient.FHIR.Bundle>(
    `Observation?patient=${patientId}&category=vital-signs&_sort=date&_count=100&code=8302-2,8306-3,29463-7,3141-9`,
    {
      pageLimit: 0,
      flat: false
    }
  );

  return {
    patient: parsePatient(patientResource),
    measurements: parseGrowthObservations(observationBundle)
  };
}

function hasSmartLaunchParams(url: URL): boolean {
  return url.searchParams.has("iss") || url.searchParams.has("launch") || hasSmartState();
}

function hasSmartState(): boolean {
  return Object.keys(window.sessionStorage).some((key) => key.startsWith("SMART_KEY_"));
}

function getRedirectUri(): string {
  return getAppUrl("index.html");
}

export function getLaunchUri(): string {
  return getAppUrl("launch.html");
}

function getAppUrl(path: string): string {
  const normalizedBase = import.meta.env.BASE_URL || "/";
  return new URL(`${stripLeadingSlash(normalizedBase)}${path}`, window.location.origin).toString();
}

function stripLeadingSlash(value: string): string {
  return value.startsWith("/") ? value.slice(1) : value;
}

function fallbackParentHeights(
  value: AppState["parentHeights"],
  fallback: AppState["parentHeights"]
): AppState["parentHeights"] {
  return value.motherHeightCm !== null || value.fatherHeightCm !== null ? value : fallback;
}

function fallbackPrematurity(
  value: AppState["prematurity"],
  fallback: AppState["prematurity"]
): AppState["prematurity"] {
  return value.gestationalAgeWeeks !== null ? value : fallback;
}

export function clearSmartSession(): void {
  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith("SMART_KEY_"))
    .forEach((key) => window.sessionStorage.removeItem(key));
}
