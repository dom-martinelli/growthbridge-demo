import type { fhirclient } from "fhirclient/lib/types";
import type { GrowthMeasurement, PatientSummary } from "../types";

const HEIGHT_CODES = new Set(["8302-2", "8306-3"]);
const WEIGHT_CODES = new Set(["29463-7", "3141-9"]);

type FhirObservation = fhirclient.FHIR.Observation;
type FhirPatient = fhirclient.FHIR.Patient;
type FhirBundle = fhirclient.FHIR.Bundle;

export function parsePatient(patient: FhirPatient): PatientSummary {
  const names = (patient as FhirPatient & {
    name?: Array<{ use?: string; given?: string[]; family?: string }>;
  }).name;
  const officialName = names?.find((name) => name.use === "official") ?? names?.[0];
  const givenName = officialName?.given?.[0] ?? "Unknown";
  const familyName = officialName?.family ?? "Patient";
  const sexAtBirth =
    patient.gender === "male" || patient.gender === "female" ? patient.gender : "unknown";

  return {
    id: patient.id ?? "unknown",
    givenName,
    familyName,
    birthDate: patient.birthDate ?? "2000-01-01",
    sexAtBirth
  };
}

export function parseGrowthObservations(bundle: FhirBundle | null | undefined): GrowthMeasurement[] {
  const entries = bundle?.entry ?? [];
  const measurements: GrowthMeasurement[] = [];

  for (const entry of entries) {
    const observation = entry.resource;
    if (!observation || observation.resourceType !== "Observation") {
      continue;
    }

    const coding = (
      observation as FhirObservation & {
        code?: { coding?: Array<{ code?: string | null }> };
      }
    ).code?.coding ?? [];
    const codes = new Set<string | undefined>(coding.map((item) => item.code ?? undefined));
    const type = detectMeasurementType(codes);
    const quantity = observation.valueQuantity;
    const effectiveDate = observation.effectiveDateTime ?? observation.issued;

    if (!type || quantity?.value === undefined || quantity?.value === null || !effectiveDate) {
      continue;
    }

    const normalized = normalizeQuantity(type, quantity.value, quantity.unit ?? quantity.code ?? "");
    if (!normalized) {
      continue;
    }

    measurements.push({
      id: observation.id ?? `${type}-${effectiveDate}`,
      type,
      date: effectiveDate.slice(0, 10),
      value: normalized.value,
      unit: normalized.unit,
      source: "EHR",
      note: observation.note?.[0]?.text
    });
  }

  return measurements.sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

function detectMeasurementType(codes: Set<string | undefined>): "height" | "weight" | null {
  for (const code of codes) {
    if (code && HEIGHT_CODES.has(code)) {
      return "height";
    }

    if (code && WEIGHT_CODES.has(code)) {
      return "weight";
    }
  }

  return null;
}

function normalizeQuantity(
  type: "height" | "weight",
  value: number,
  unit: string
): { value: number; unit: "cm" | "kg" } | null {
  const normalizedUnit = unit.toLowerCase();

  if (type === "height") {
    if (normalizedUnit.includes("cm")) {
      return { value: Number(value.toFixed(1)), unit: "cm" };
    }

    if (normalizedUnit === "m") {
      return { value: Number((value * 100).toFixed(1)), unit: "cm" };
    }

    if (normalizedUnit.includes("[in_i]") || normalizedUnit.includes("in")) {
      return { value: Number((value * 2.54).toFixed(1)), unit: "cm" };
    }
  }

  if (type === "weight") {
    if (normalizedUnit.includes("kg")) {
      return { value: Number(value.toFixed(2)), unit: "kg" };
    }

    if (normalizedUnit.includes("[lb_av]") || normalizedUnit.includes("lb")) {
      return { value: Number((value * 0.45359237).toFixed(2)), unit: "kg" };
    }

    if (normalizedUnit === "g") {
      return { value: Number((value / 1000).toFixed(2)), unit: "kg" };
    }
  }

  return null;
}
