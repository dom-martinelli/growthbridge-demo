import type { GrowthMeasurement, TrendInsight } from "../types";

interface CombinedDatum {
  date: string;
  height?: GrowthMeasurement;
  weight?: GrowthMeasurement;
}

export function renderCombinedGrowthChart(
  measurements: GrowthMeasurement[],
  trendInsight: TrendInsight | null
): string {
  const data = buildCombinedData(measurements);

  if (data.length === 0) {
    return `<div class="empty-state">No growth measurements yet.</div>`;
  }

  const width = 920;
  const height = 420;
  const padding = { top: 28, right: 74, bottom: 58, left: 74 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const heightSeries = data.filter((point) => point.height).map((point) => point.height as GrowthMeasurement);
  const weightSeries = data.filter((point) => point.weight).map((point) => point.weight as GrowthMeasurement);

  const minHeight = Math.min(...heightSeries.map((point) => point.value));
  const maxHeight = Math.max(...heightSeries.map((point) => point.value));
  const minWeight = Math.min(...weightSeries.map((point) => point.value));
  const maxWeight = Math.max(...weightSeries.map((point) => point.value));

  const heightRange = padRange(minHeight, maxHeight, 4);
  const weightRange = padRange(minWeight, maxWeight, 1.2);

  const xForIndex = (index: number): number => (
    padding.left + (data.length === 1 ? chartWidth / 2 : (chartWidth * index) / (data.length - 1))
  );
  const yForHeight = (value: number): number => scale(value, heightRange.min, heightRange.max, height - padding.bottom, padding.top);
  const yForWeight = (value: number): number => scale(value, weightRange.min, weightRange.max, height - padding.bottom, padding.top);

  const heightPath = data
    .map((point, index) => {
      if (!point.height) {
        return "";
      }

      return `${index === firstIndexWith(data, "height") ? "M" : "L"} ${xForIndex(index).toFixed(1)} ${yForHeight(point.height.value).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  const weightPath = data
    .map((point, index) => {
      if (!point.weight) {
        return "";
      }

      return `${index === firstIndexWith(data, "weight") ? "M" : "L"} ${xForIndex(index).toFixed(1)} ${yForWeight(point.weight.value).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  const xGrid = data
    .map((_, index) => {
      const x = xForIndex(index);
      return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" class="chart-grid"></line>`;
    })
    .join("");

  const leftTicks = buildTicks(heightRange.min, heightRange.max, 5)
    .map((tick) => {
      const y = yForHeight(tick);
      return `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid"></line>
        <text x="${padding.left - 16}" y="${y + 4}" text-anchor="end" class="chart-axis-label left">${formatTick(tick)}</text>
      `;
    })
    .join("");

  const rightTicks = buildTicks(weightRange.min, weightRange.max, 5)
    .map((tick) => {
      const y = yForWeight(tick);
      return `<text x="${width - padding.right + 16}" y="${y + 4}" class="chart-axis-label right">${formatTick(tick)}</text>`;
    })
    .join("");

  const pointMarkup = data
    .map((point, index) => {
      const x = xForIndex(index);
      const hoverWidth = data.length === 1 ? 48 : Math.max(36, chartWidth / data.length);
      const flagClass = point.date === trendInsight?.date ? "chart-flag-zone" : "";
      const tooltipDataset = buildTooltipDataset(point, trendInsight);
      const hoverZone = `
        <rect
          x="${Math.max(padding.left, x - hoverWidth / 2)}"
          y="${padding.top}"
          width="${hoverWidth}"
          height="${chartHeight}"
          class="chart-hover-zone ${flagClass}"
          data-date="${point.date}"
          ${tooltipDataset}
        ></rect>
      `;

      const heightPoint = point.height
        ? `<circle class="chart-point chart-point-height" cx="${x}" cy="${yForHeight(point.height.value)}" r="7"></circle>`
        : "";
      const weightPoint = point.weight
        ? `<circle class="chart-point chart-point-weight" cx="${x}" cy="${yForWeight(point.weight.value)}" r="7"></circle>`
        : "";

      return `${hoverZone}${heightPoint}${weightPoint}`;
    })
    .join("");

  const xLabels = data
    .map((point, index) => {
      const x = xForIndex(index);
      return `<text x="${x}" y="${height - padding.bottom + 30}" text-anchor="end" transform="rotate(-22 ${x} ${height - padding.bottom + 30})" class="chart-date-label">${point.date}</text>`;
    })
    .join("");

  const flagMarkup = trendInsight
    ? renderFlagMarkup(data, trendInsight, xForIndex, yForHeight, height, padding.bottom)
    : "";

  return `
    <section class="analytics-card">
      <div class="analytics-head">
        <div>
          <p class="eyebrow">Growth Analytics</p>
          <h2>Combined Height and Weight Trend</h2>
        </div>
        <div class="chart-legend">
          <span><span class="legend-swatch height"></span>Height (cm)</span>
          <span><span class="legend-swatch weight"></span>Weight (kg)</span>
          ${trendInsight ? `<span><span class="legend-swatch flagged"></span>Flagged</span>` : ""}
        </div>
      </div>
      <div class="chart-shell" data-chart-root>
        <svg viewBox="0 0 ${width} ${height}" class="combined-growth-chart" role="img" aria-label="Combined height and weight trend">
          ${xGrid}
          ${leftTicks}
          ${rightTicks}
          <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-axis"></line>
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" class="chart-axis left"></line>
          <line x1="${width - padding.right}" y1="${padding.top}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-axis right"></line>
          <path d="${heightPath}" class="chart-line chart-line-height"></path>
          <path d="${weightPath}" class="chart-line chart-line-weight"></path>
          ${flagMarkup}
          ${pointMarkup}
          <text x="22" y="${height / 2}" class="chart-axis-title left" transform="rotate(-90 22 ${height / 2})">Height (cm)</text>
          <text x="${width - 14}" y="${height / 2}" class="chart-axis-title right" transform="rotate(90 ${width - 14} ${height / 2})">Weight (kg)</text>
          ${xLabels}
        </svg>
        <div class="chart-tooltip" hidden></div>
      </div>
    </section>
  `;
}

export function buildTooltipHtml(target: HTMLElement): string {
  const date = target.dataset.date ?? "";
  const height = target.dataset.height;
  const weight = target.dataset.weight;
  const percentile = target.dataset.percentile;

  return `
    <div class="tooltip-date">${date}</div>
    ${height ? `<div><span class="tooltip-key height"></span>Height (cm): <strong>${height}</strong></div>` : ""}
    ${weight ? `<div><span class="tooltip-key weight"></span>Weight (kg): <strong>${weight}</strong></div>` : ""}
    ${percentile ? `<div>Height percentile: <strong>${percentile}</strong></div>` : ""}
  `;
}

function buildCombinedData(measurements: GrowthMeasurement[]): CombinedDatum[] {
  const sorted = [...measurements].sort((left, right) => {
    const timeDelta = new Date(left.date).getTime() - new Date(right.date).getTime();
    return timeDelta !== 0 ? timeDelta : left.type.localeCompare(right.type);
  });

  const grouped = new Map<string, CombinedDatum>();

  for (const measurement of sorted) {
    const current = grouped.get(measurement.date) ?? { date: measurement.date };
    if (measurement.type === "height") {
      current.height = measurement;
    }

    if (measurement.type === "weight") {
      current.weight = measurement;
    }

    grouped.set(measurement.date, current);
  }

  return Array.from(grouped.values());
}

function firstIndexWith(data: CombinedDatum[], key: "height" | "weight"): number {
  return data.findIndex((point) => Boolean(point[key]));
}

function buildTicks(min: number, max: number, count: number): number[] {
  if (count < 2) {
    return [min];
  }

  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => Number((min + step * index).toFixed(2)));
}

function formatTick(value: number): string {
  const rounded = value >= 20 ? Math.round(value) : Number(value.toFixed(1));
  return String(rounded);
}

function scale(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) {
    return (outMin + outMax) / 2;
  }

  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function padRange(min: number, max: number, pad: number): { min: number; max: number } {
  if (min === max) {
    return { min: min - pad, max: max + pad };
  }

  return {
    min: Math.max(0, Number((min - pad).toFixed(1))),
    max: Number((max + pad).toFixed(1))
  };
}

function buildTooltipDataset(point: CombinedDatum, trendInsight: TrendInsight | null): string {
  const attributes = [
    point.height ? `data-height="${point.height.value.toFixed(1)}"` : "",
    point.weight ? `data-weight="${point.weight.value.toFixed(1)}"` : "",
    point.height?.percentile !== undefined ? `data-percentile="${ordinal(point.height.percentile)}"` : "",
    point.date === trendInsight?.date ? `data-flag-title="${escapeHtml(trendInsight.title)}"` : ""
  ];

  return attributes.filter(Boolean).join(" ");
}

function renderFlagMarkup(
  data: CombinedDatum[],
  trendInsight: TrendInsight,
  xForIndex: (index: number) => number,
  yForHeight: (value: number) => number,
  height: number,
  bottomPadding: number
): string {
  const flagIndex = data.findIndex((point) => point.date === trendInsight.date && point.height);
  if (flagIndex < 0 || !data[flagIndex].height) {
    return "";
  }

  const x = xForIndex(flagIndex);
  const y = yForHeight((data[flagIndex].height as GrowthMeasurement).value);

  return `
    <line x1="${x}" y1="${y - 24}" x2="${x}" y2="${height - bottomPadding}" class="chart-flag-line"></line>
    <circle cx="${x}" cy="${y}" r="9" class="chart-flag-point"></circle>
  `;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
