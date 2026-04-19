import type {
  GrowthMeasurement,
  GrowthVelocitySummary,
  MidParentalHeightResult,
  PatientSummary
} from "../types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateAgeInMonths(birthDate: string, measurementDate: string): number {
  const birth = new Date(birthDate);
  const measurement = new Date(measurementDate);
  return ((measurement.getTime() - birth.getTime()) / MS_PER_DAY) / 30.4375;
}

export function calculateCorrectedAgeInMonths(
  patient: PatientSummary,
  measurementDate: string,
  gestationalAgeWeeks: number | null
): number | null {
  if (!gestationalAgeWeeks || gestationalAgeWeeks >= 37) {
    return null;
  }

  const chronologicalAgeMonths = calculateAgeInMonths(patient.birthDate, measurementDate);
  const weeksPremature = 40 - gestationalAgeWeeks;
  const correctedMonths = chronologicalAgeMonths - weeksPremature / 4.345;
  return Math.max(0, correctedMonths);
}

export function calculateGrowthVelocity(
  measurements: GrowthMeasurement[],
  type: "height" | "weight"
): GrowthVelocitySummary {
  const series = measurements
    .filter((measurement) => measurement.type === type)
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  if (series.length < 2) {
    return {
      type,
      latestDelta: null,
      latestIntervalDays: null,
      annualizedRate: null,
      unitPerYear: type === "height" ? "cm/year" : "kg/year"
    };
  }

  const previous = series[series.length - 2];
  const latest = series[series.length - 1];
  const delta = latest.value - previous.value;
  const intervalDays = Math.max(
    1,
    Math.round((new Date(latest.date).getTime() - new Date(previous.date).getTime()) / MS_PER_DAY)
  );

  return {
    type,
    latestDelta: Number(delta.toFixed(2)),
    latestIntervalDays: intervalDays,
    annualizedRate: Number(((delta / intervalDays) * 365.25).toFixed(2)),
    unitPerYear: type === "height" ? "cm/year" : "kg/year"
  };
}

export function calculateMidParentalTargetHeight(
  sexAtBirth: PatientSummary["sexAtBirth"],
  motherHeightCm: number | null,
  fatherHeightCm: number | null
): MidParentalHeightResult {
  if (!motherHeightCm || !fatherHeightCm) {
    return {
      targetHeightCm: null,
      lowerBandCm: null,
      upperBandCm: null
    };
  }

  const adjustment = sexAtBirth === "male" ? 13 : sexAtBirth === "female" ? -13 : 0;
  const targetHeightCm = (motherHeightCm + fatherHeightCm + adjustment) / 2;
  const lowerBandCm = targetHeightCm - 8.5;
  const upperBandCm = targetHeightCm + 8.5;

  return {
    targetHeightCm: Number(targetHeightCm.toFixed(1)),
    lowerBandCm: Number(lowerBandCm.toFixed(1)),
    upperBandCm: Number(upperBandCm.toFixed(1))
  };
}

export function formatMonths(months: number | null): string {
  if (months === null) {
    return "Not applied";
  }

  if (months < 1) {
    return `${Math.round(months * 4.345)} weeks`;
  }

  return `${months.toFixed(1)} months`;
}
