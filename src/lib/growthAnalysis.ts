import type { GrowthMeasurement, TrendInsight } from "../types";

const HEIGHT_Z_SCORE_THRESHOLD = -2;

export function enrichMeasurementsWithDerivedZScores(
  measurements: GrowthMeasurement[]
): GrowthMeasurement[] {
  return measurements.map((measurement) => {
    if (measurement.type !== "height" || measurement.zScore !== undefined || measurement.percentile === undefined) {
      return measurement;
    }

    const zScore = percentileToZScore(measurement.percentile);
    return zScore === null ? measurement : { ...measurement, zScore };
  });
}

export function findFlaggedHeightInsights(measurements: GrowthMeasurement[]): TrendInsight[] {
  return measurements
    .filter((measurement) => measurement.type === "height")
    .map((measurement) => ({
      measurement,
      zScore: getHeightZScore(measurement)
    }))
    .filter((entry): entry is { measurement: GrowthMeasurement; zScore: number } => (
      entry.zScore !== null && entry.zScore < HEIGHT_Z_SCORE_THRESHOLD
    ))
    .sort((left, right) => new Date(left.measurement.date).getTime() - new Date(right.measurement.date).getTime())
    .map(({ measurement, zScore }) => ({
      date: measurement.date,
      title: `Flagged ${measurement.date}`,
      body: `Height z-score is ${zScore.toFixed(2)}, which is below the abnormal threshold of -2. This measurement should be reviewed for possible short stature or growth faltering.`,
      percentileLabel:
        measurement.percentile !== undefined
          ? `Height percentile: ${ordinal(measurement.percentile)}.`
          : "Flag is based on z-score data only.",
      zScore
    }));
}

export function getHeightZScore(measurement: GrowthMeasurement): number | null {
  if (measurement.type !== "height") {
    return null;
  }

  if (measurement.zScore !== undefined) {
    return measurement.zScore;
  }

  if (measurement.percentile === undefined) {
    return null;
  }

  return percentileToZScore(measurement.percentile);
}

function percentileToZScore(percentile: number): number | null {
  if (!Number.isFinite(percentile) || percentile <= 0 || percentile >= 100) {
    return null;
  }

  const p = percentile / 100;

  // Acklam inverse normal CDF approximation.
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let x: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return Number(x.toFixed(2));
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
