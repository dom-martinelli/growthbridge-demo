export type MeasurementType = "height" | "weight";
export type MeasurementSource = "EHR" | "Home";

export interface PatientSummary {
  id: string;
  givenName: string;
  familyName: string;
  birthDate: string;
  sexAtBirth: "male" | "female" | "unknown";
}

export interface GrowthMeasurement {
  id: string;
  type: MeasurementType;
  date: string;
  value: number;
  unit: "cm" | "kg";
  source: MeasurementSource;
  percentile?: number;
  note?: string;
}

export interface HomeMeasurementInput {
  type: MeasurementType;
  date: string;
  value: number;
  note?: string;
}

export interface ParentHeightsInput {
  motherHeightCm: number | null;
  fatherHeightCm: number | null;
}

export interface PrematurityInput {
  gestationalAgeWeeks: number | null;
}

export interface AppState {
  patient: PatientSummary;
  measurements: GrowthMeasurement[];
  parentHeights: ParentHeightsInput;
  prematurity: PrematurityInput;
  useMockData: boolean;
  dataSourceLabel: string;
  demoScenario: DemoScenarioOption | null;
  availableDemoScenarios: DemoScenarioOption[];
  trendInsight: TrendInsight | null;
}

export interface GrowthVelocitySummary {
  type: MeasurementType;
  latestDelta: number | null;
  latestIntervalDays: number | null;
  annualizedRate: number | null;
  unitPerYear: "cm/year" | "kg/year";
}

export interface MidParentalHeightResult {
  targetHeightCm: number | null;
  lowerBandCm: number | null;
  upperBandCm: number | null;
}

export interface TrendInsight {
  date: string;
  title: string;
  body: string;
  percentileLabel?: string;
}

export interface DemoScenarioOption {
  id: string;
  label: string;
  description: string;
}

export interface DemoScenario extends DemoScenarioOption {
  patient: PatientSummary;
  measurements: GrowthMeasurement[];
  parentHeights: ParentHeightsInput;
  prematurity: PrematurityInput;
  trendInsight: TrendInsight | null;
  dataSourceLabel: string;
}
