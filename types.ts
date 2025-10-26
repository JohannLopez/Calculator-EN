
export interface Country {
  name: string;
  code: string;
  currencySymbol: string;
  usdRate: number;
  locale: string;
}

export interface FormData {
  companyName: string;
  industry: string;
  otherIndustry?: string;
  sector: string;
  otherSector?: string;
  countryCode: string;
  engineers: string;
  newProducts: string;
  reworks: string;
  delays: string;
  industryInput?: string;
  sectorInput?: string;
  numSites: string;
  numCountries: string;
  infoLocation: 'corporate' | 'personal_pc';
}

export interface CostBreakdownItem {
  category: string;
  cost: number;
  explanation: string;
  methodologyFormula: string;
  calculationNarrative: string;
  metricKey: string;
  metricValue: number;
  metricLabel: string;
  metricSource: string;
  isMetricOverridden?: boolean;
}

export interface CalculationResult {
  totalCost: number;
  costBreakdown: CostBreakdownItem[];
  summary: string;
  methodologyNotes: string;
  chartInterpretations: {
    bar: string;
    pie: string;
    radar: string;
  };
}

export type ChartType = 'bar' | 'pie' | 'radar';

export interface HistoryEntry {
  id: number;
  formData: FormData;
  result: CalculationResult;
  country: Country;
  metricOverrides?: MetricOverrides;
}

export type MetricOverrides = Partial<Record<string, number>>;

export type LocalizedMetrics = Record<string, number>;

export interface IndustryMetrics {
    averageEngineerSalary: LocalizedMetrics;
    reworkCost: LocalizedMetrics;
    newProductRevenue: LocalizedMetrics;
    baseWastedHours: number; // Base weekly hours wasted per engineer
    hoursPerSite: number; // Additional weekly hours wasted per extra site
    hoursPerCountry: number; // Additional weekly hours wasted per extra country
    siloCostMultiplier: number; // e.g., 0.25 for a 25% cost increase
}

// FIX: Added missing IndustryData interface.
export interface IndustryData {
  baseMetrics: IndustryMetrics;
  sectors?: Record<string, IndustryMetrics>;
}
