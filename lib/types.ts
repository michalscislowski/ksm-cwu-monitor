// Monthly reading from real data
export interface MonthlyReading {
  year: number;
  month: number;
  gj: number;
  m3: number;
  wskaznik: number;  // GJ/m3 efficiency indicator
}

// Node stats computed from readings
export interface NodeStats {
  avg_wskaznik: number;
  avg_iez: number;
  category: Category;
  trend: 'improving' | 'declining' | 'stable';
  trend_change: number;
  total_readings: number;
  years_covered: number[];
}

// Node (heating point) types
export interface Node {
  id: string;
  name: string;
  address: string;
  apartments_count: number;
  mtcv_type: string;
  mtcv_count: number;
  building_volume_m3: number;
  readings?: MonthlyReading[];
  stats?: NodeStats;
}

// IEZ (Efficiency Index) types
export interface IEZ {
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  trend_change: number;
}

export type IndicatorStatus = 'optimal' | 'good' | 'warning' | 'critical';

// WWC - Wskaźnik Wymiany Ciepła (Heat Exchange Index)
// Shows how well the heat exchanger is performing vs design
export interface HeatExchangeIndex {
  value: number;  // 0-120%, where 100% = design performance
  status: IndicatorStatus;
  interpretation: string;  // Polish description for engineer
  action?: string;  // Recommended action if needed
}

// SH - Stabilność Hydrauliczna (Hydraulic Stability)
// Shows how stable ΔT is throughout the day
export interface HydraulicStability {
  value: number;  // 0-100%, higher = more stable
  status: IndicatorStatus;
  interpretation: string;
  action?: string;
}

// ES - Efektywność Szczytowa (Peak Efficiency)
// Shows how well the system handles peak hours vs baseline
export interface PeakEfficiency {
  value: number;  // 0-100%, higher = better peak handling
  status: IndicatorStatus;
  interpretation: string;
  action?: string;
  worst_hours: number[];  // Hours with worst efficiency
}

// Combined operational indicators from MEC
export interface OperationalIndicators {
  wwc: HeatExchangeIndex;      // Wskaźnik Wymiany Ciepła
  sh: HydraulicStability;       // Stabilność Hydrauliczna
  es: PeakEfficiency;           // Efektywność Szczytowa
  weekly_trend: number;         // % change vs last week
}

// ============================================================================
// HIERARCHIA WSKAŹNIKÓW EFEKTYWNOŚCI
// ============================================================================

// SE - Sprawność Energetyczna (Energy Efficiency) - MAIN INDICATOR
// Shows what fraction of purchased energy reaches residents as useful hot water
export interface EnergyEfficiency {
  value: number;              // 0-100%, higher = better
  status: IndicatorStatus;
  losses_percent: number;     // 100 - value = total losses
  q_theoretical: number;      // GJ theoretical (calculated)
  q_actual: number;           // GJ actual (from meter)
  t_cold_estimated: number;   // Estimated cold water inlet temp
  interpretation: string;
}

// KW - Kondycja Wymiennika (Heat Exchanger Condition)
// Geometric mean of WWC, SH, ES - shows exchanger performance
export interface ExchangerCondition {
  value: number;              // 0-100%, geometric mean of WWC×SH×ES
  status: IndicatorStatus;
  limiting_factor: 'wwc' | 'sh' | 'es';  // Which component is weakest
  interpretation: string;
}

// SS - Straty Systemowe (System Losses)
// Losses outside the heat exchanger - circulation, pipes, etc.
export interface SystemLosses {
  value: number;              // 0-100%, percentage of energy lost
  status: IndicatorStatus;
  estimated_circulation: number;  // Estimated % from circulation
  estimated_pipes: number;        // Estimated % from pipe losses
  night_ratio: number;            // Q_night / Q_day ratio (indicator of circulation)
  interpretation: string;
  action?: string;
}

// Combined efficiency hierarchy
export interface EfficiencyHierarchy {
  // Level 1 - Main indicator
  se: EnergyEfficiency;           // Sprawność Energetyczna

  // Level 2 - Components
  kw: ExchangerCondition;         // Kondycja Wymiennika (from WWC/SH/ES)
  ss: SystemLosses;               // Straty Systemowe

  // Level 3 - Details (in OperationalIndicators)
  // wwc, sh, es are already there

  // Diagnostic
  primary_issue: 'exchanger' | 'circulation' | 'balanced' | 'unknown';
  savings_potential_percent: number;  // Estimated savings if optimized
  savings_potential_gj: number;       // Annual GJ savings potential
}

// Monthly forecast based on current indicators
export interface MonthlyForecast {
  predicted_wskaznik: number;   // Predicted GJ/m³ for current month
  predicted_category: Category;
  confidence: 'high' | 'medium' | 'low';
  vs_last_month: number;        // % change from last month
  potential_improvement: number; // How much wskaźnik could improve with regulation
}

export type Category = 'A' | 'B' | 'C';

export interface Benchmark {
  percentile: number;
  category: Category;
}

export interface EfficiencyData {
  timestamp: string;
  iez: IEZ;
  indicators: OperationalIndicators;  // WWC, SH, ES details
  hierarchy: EfficiencyHierarchy;     // SE → KW + SS hierarchy
  forecast: MonthlyForecast;          // Predicted monthly wskaźnik
  benchmark: Benchmark;
}

// Daily profile types
export type LoadLevel = 'low' | 'medium' | 'high' | 'peak';

export interface HourlyData {
  hour: number;
  iez: number;
  load: LoadLevel;
  deviation_delta_t: number;
  deviation_return_temp: number;
}

export interface DailyProfileSummary {
  best_hours: number[];
  worst_hours: number[];
  avg_iez: number;
  min_iez: number;
  max_iez: number;
}

export interface DailyProfile {
  date: string;
  hours: HourlyData[];
  summary: DailyProfileSummary;
}

// History types
export interface HistoryEntry {
  date: string;
  iez: number;
  category: Category;
}

// Alert types
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'deviation_critical' | 'efficiency_drop' | 'trend_negative';
export type AlertStatus = 'active' | 'acknowledged';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  created_at: string;
  message: string;
  status: AlertStatus;
  node_id?: string;
  node_name?: string;
}

// Recommendation types
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'mtcv_adjustment' | 'hydraulic_balance' | 'maintenance' | 'circulation_pump' | 'insulation';

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
  expected_improvement: {
    iez_points: number;
  };
  affected_hours: number[];
}

// Ranking types
export interface RankingEntry {
  position: number;
  node_id: string;
  name: string;
  category: Category;
  avg_iez: number;      // Legacy
  avg_se: number;       // Sprawność Energetyczna
  trend: 'improving' | 'declining' | 'stable';
}

// Combined node data for detail view
export interface NodeWithEfficiency extends Node {
  efficiency: EfficiencyData;
  dailyProfile?: DailyProfile;
  history?: HistoryEntry[];
  alerts?: Alert[];
  recommendations?: Recommendation[];
}

// Dashboard stats
export interface DashboardStats {
  totalNodes: number;
  avgIez: number;       // Legacy - kept for compatibility
  avgSe: number;        // New: average Sprawność Energetyczna
  activeAlerts: number;
  categoryACount: number;
  categoryBCount: number;
  categoryCCount: number;
}
