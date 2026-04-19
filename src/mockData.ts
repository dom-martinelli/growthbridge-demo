import type { DemoScenario } from "./types";

export const demoScenarios: DemoScenario[] = [
  {
    id: "steady-growth",
    label: "Steady Growth",
    description: "Baseline demo with stable upward height and weight trends.",
    patient: {
      id: "mock-child-001",
      givenName: "Avery",
      familyName: "Rivera",
      birthDate: "2020-01-15",
      sexAtBirth: "female"
    },
    parentHeights: {
      motherHeightCm: 165.1,
      fatherHeightCm: 178.6
    },
    prematurity: {
      gestationalAgeWeeks: null
    },
    dataSourceLabel: "Mock EHR demo scenario",
    trendInsight: null,
    measurements: [
      { id: "steady-h-1", type: "height", date: "2020-03-20", value: 55.1, unit: "cm", source: "EHR", percentile: 42 },
      { id: "steady-w-1", type: "weight", date: "2020-03-20", value: 4.6, unit: "kg", source: "EHR" },
      { id: "steady-h-2", type: "height", date: "2020-06-18", value: 63.4, unit: "cm", source: "EHR", percentile: 47 },
      { id: "steady-w-2", type: "weight", date: "2020-06-18", value: 6.3, unit: "kg", source: "EHR" },
      { id: "steady-h-3", type: "height", date: "2020-09-15", value: 69.8, unit: "cm", source: "EHR", percentile: 51 },
      { id: "steady-w-3", type: "weight", date: "2020-09-15", value: 7.9, unit: "kg", source: "EHR" },
      { id: "steady-h-4", type: "height", date: "2021-03-15", value: 78.2, unit: "cm", source: "EHR", percentile: 53 },
      { id: "steady-w-4", type: "weight", date: "2021-03-15", value: 9.8, unit: "kg", source: "EHR" },
      { id: "steady-h-5", type: "height", date: "2021-09-15", value: 85.9, unit: "cm", source: "EHR", percentile: 55 },
      { id: "steady-w-5", type: "weight", date: "2021-09-15", value: 11.4, unit: "kg", source: "EHR" },
      { id: "steady-h-6", type: "height", date: "2022-03-15", value: 91.3, unit: "cm", source: "EHR", percentile: 56 },
      { id: "steady-w-6", type: "weight", date: "2022-03-15", value: 12.8, unit: "kg", source: "EHR" },
      { id: "steady-h-7", type: "height", date: "2022-09-15", value: 97.4, unit: "cm", source: "EHR", percentile: 57 },
      { id: "steady-w-7", type: "weight", date: "2022-09-15", value: 14.1, unit: "kg", source: "EHR" },
      { id: "steady-h-8", type: "height", date: "2023-03-15", value: 102.6, unit: "cm", source: "EHR", percentile: 58 },
      { id: "steady-w-8", type: "weight", date: "2023-03-15", value: 15.7, unit: "kg", source: "EHR" },
      { id: "steady-h-9", type: "height", date: "2023-09-15", value: 108.5, unit: "cm", source: "EHR", percentile: 60 },
      { id: "steady-w-9", type: "weight", date: "2023-09-15", value: 17.1, unit: "kg", source: "EHR" },
      { id: "steady-h-10", type: "height", date: "2024-03-15", value: 114.4, unit: "cm", source: "EHR", percentile: 61 },
      { id: "steady-w-10", type: "weight", date: "2024-03-15", value: 18.7, unit: "kg", source: "EHR" }
    ]
  },
  {
    id: "turner-syndrome-demo",
    label: "Turner Syndrome Demo",
    description: "Polished demo case with a downward height percentile inflection and flagged interpretation.",
    patient: {
      id: "mock-child-002",
      givenName: "Maya",
      familyName: "Chen",
      birthDate: "2019-09-10",
      sexAtBirth: "female"
    },
    parentHeights: {
      motherHeightCm: 160.2,
      fatherHeightCm: 176.5
    },
    prematurity: {
      gestationalAgeWeeks: null
    },
    dataSourceLabel: "Mock EHR import with Turner syndrome teaching case",
    trendInsight: {
      date: "2022-09-15",
      title: "Flagged 2022-09-15",
      body: "Height dropped from about the 38th to the 18th percentile between 2022-03-15 and 2022-09-15. Consider evaluation for growth faltering.",
      percentileLabel: "Height percentile fell from ~38th to ~18th."
    },
    measurements: [
      { id: "turner-h-1", type: "height", date: "2020-03-20", value: 50.2, unit: "cm", source: "EHR", percentile: 41 },
      { id: "turner-w-1", type: "weight", date: "2020-03-20", value: 3.5, unit: "kg", source: "EHR" },
      { id: "turner-h-2", type: "height", date: "2020-06-18", value: 62.1, unit: "cm", source: "EHR", percentile: 45 },
      { id: "turner-w-2", type: "weight", date: "2020-06-18", value: 6.1, unit: "kg", source: "EHR" },
      { id: "turner-h-3", type: "height", date: "2020-09-15", value: 67.8, unit: "cm", source: "EHR", percentile: 43 },
      { id: "turner-w-3", type: "weight", date: "2020-09-15", value: 7.7, unit: "kg", source: "EHR" },
      { id: "turner-h-4", type: "height", date: "2021-03-15", value: 75.4, unit: "cm", source: "EHR", percentile: 39 },
      { id: "turner-w-4", type: "weight", date: "2021-03-15", value: 9.5, unit: "kg", source: "EHR" },
      { id: "turner-h-5", type: "height", date: "2021-09-15", value: 81.2, unit: "cm", source: "EHR", percentile: 39 },
      { id: "turner-w-5", type: "weight", date: "2021-09-15", value: 10.9, unit: "kg", source: "EHR" },
      { id: "turner-h-6", type: "height", date: "2022-03-15", value: 86.5, unit: "cm", source: "EHR", percentile: 38 },
      { id: "turner-w-6", type: "weight", date: "2022-03-15", value: 11.7, unit: "kg", source: "EHR" },
      { id: "turner-h-7", type: "height", date: "2022-09-15", value: 89.4, unit: "cm", source: "EHR", percentile: 18 },
      { id: "turner-w-7", type: "weight", date: "2022-09-15", value: 12.6, unit: "kg", source: "EHR" },
      { id: "turner-h-8", type: "height", date: "2023-03-15", value: 91.8, unit: "cm", source: "EHR", percentile: 9 },
      { id: "turner-w-8", type: "weight", date: "2023-03-15", value: 13.2, unit: "kg", source: "EHR" },
      { id: "turner-h-9", type: "height", date: "2023-09-15", value: 96.2, unit: "cm", source: "EHR", percentile: 20 },
      { id: "turner-w-9", type: "weight", date: "2023-09-15", value: 14.1, unit: "kg", source: "EHR" },
      { id: "turner-h-10", type: "height", date: "2024-03-15", value: 102.8, unit: "cm", source: "EHR", percentile: 46 },
      { id: "turner-w-10", type: "weight", date: "2024-03-15", value: 15.9, unit: "kg", source: "EHR" },
      { id: "turner-h-11", type: "height", date: "2024-09-15", value: 108.1, unit: "cm", source: "EHR", percentile: 61 },
      { id: "turner-w-11", type: "weight", date: "2024-09-15", value: 17.2, unit: "kg", source: "EHR" }
    ]
  },
  {
    id: "preterm-catchup",
    label: "Preterm Catch-Up",
    description: "Demonstrates corrected-age context and reassuring catch-up growth.",
    patient: {
      id: "mock-child-003",
      givenName: "Noah",
      familyName: "Martinez",
      birthDate: "2022-02-02",
      sexAtBirth: "male"
    },
    parentHeights: {
      motherHeightCm: 162.4,
      fatherHeightCm: 181.0
    },
    prematurity: {
      gestationalAgeWeeks: 31
    },
    dataSourceLabel: "Mock EHR import with preterm catch-up example",
    trendInsight: {
      date: "2023-05-30",
      title: "Reassuring catch-up trend",
      body: "Corrected age places the post-discharge growth trend closer to the expected trajectory. This is included as context only, not as a diagnosis.",
      percentileLabel: "Corrected age remains relevant for the first two years."
    },
    measurements: [
      { id: "preterm-h-1", type: "height", date: "2022-03-12", value: 44.0, unit: "cm", source: "EHR", percentile: 7 },
      { id: "preterm-w-1", type: "weight", date: "2022-03-12", value: 2.2, unit: "kg", source: "EHR" },
      { id: "preterm-h-2", type: "height", date: "2022-05-01", value: 50.1, unit: "cm", source: "EHR", percentile: 11 },
      { id: "preterm-w-2", type: "weight", date: "2022-05-01", value: 3.3, unit: "kg", source: "EHR" },
      { id: "preterm-h-3", type: "height", date: "2022-08-15", value: 61.4, unit: "cm", source: "EHR", percentile: 18 },
      { id: "preterm-w-3", type: "weight", date: "2022-08-15", value: 5.8, unit: "kg", source: "EHR" },
      { id: "preterm-h-4", type: "height", date: "2022-11-30", value: 69.6, unit: "cm", source: "EHR", percentile: 24 },
      { id: "preterm-w-4", type: "weight", date: "2022-11-30", value: 7.4, unit: "kg", source: "EHR" },
      { id: "preterm-h-5", type: "height", date: "2023-05-30", value: 78.8, unit: "cm", source: "EHR", percentile: 33 },
      { id: "preterm-w-5", type: "weight", date: "2023-05-30", value: 9.6, unit: "kg", source: "EHR" },
      { id: "preterm-h-6", type: "height", date: "2023-11-30", value: 86.4, unit: "cm", source: "EHR", percentile: 42 },
      { id: "preterm-w-6", type: "weight", date: "2023-11-30", value: 11.4, unit: "kg", source: "EHR" },
      { id: "preterm-h-7", type: "height", date: "2024-05-30", value: 93.2, unit: "cm", source: "EHR", percentile: 49 },
      { id: "preterm-w-7", type: "weight", date: "2024-05-30", value: 13.2, unit: "kg", source: "EHR" }
    ]
  }
];

export function getDemoScenario(id?: string | null): DemoScenario {
  return demoScenarios.find((scenario) => scenario.id === id) ?? demoScenarios[1];
}
