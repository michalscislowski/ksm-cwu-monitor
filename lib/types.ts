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

export type DeviationStatus = 'ok' | 'warning' | 'critical';

export interface Deviation {
  percent_of_optimal: number;
  status: DeviationStatus;
}

export interface Deviations {
  delta_t: Deviation;
  return_temp: Deviation;
  flow_balance: Deviation;
}

export interface Losses {
  vs_optimal_percent: number;
  vs_last_week_percent: number;
  vs_last_year_percent: number;
}

export type Category = 'A' | 'B' | 'C';

export interface Benchmark {
  percentile: number;
  category: Category;
}

export interface EfficiencyData {
  timestamp: string;
  iez: IEZ;
  deviations: Deviations;
  losses: Losses;
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
