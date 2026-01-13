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
  indicators: OperationalIndicators;  // New operational indicators from MEC
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
  avg_iez: number;
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
  avgIez: number;
  activeAlerts: number;
  categoryACount: number;
  categoryBCount: number;
  categoryCCount: number;
}
