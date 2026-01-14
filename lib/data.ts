import nodesData from '@/data/nodes-data.json';
import type {
  Node,
  MonthlyReading,
  NodeStats,
  EfficiencyData,
  DailyProfile,
  HourlyData,
  HistoryEntry,
  Alert,
  Recommendation,
  RankingEntry,
  NodeWithEfficiency,
  DashboardStats,
  Category,
  IndicatorStatus,
  OperationalIndicators,
  MonthlyForecast,
  EfficiencyHierarchy,
  EnergyEfficiency,
  ExchangerCondition,
  SystemLosses,
} from './types';

// Constants
const OPTIMAL_WSKAZNIK = 0.22; // Optimal GJ/m3 indicator
const T_CWU = 55; // Target hot water temperature (°C)
const SPECIFIC_HEAT = 0.004186; // GJ/(m³·K) - water specific heat
const MIN_LOSSES_FACTOR = 1.05; // 5% minimum unavoidable losses

// Seasonal cold water temperature table for Koszalin region
const SEASONAL_T_COLD: Record<number, number> = {
  1: 5,   // January
  2: 5,   // February
  3: 7,   // March
  4: 10,  // April
  5: 13,  // May
  6: 16,  // June
  7: 18,  // July
  8: 18,  // August
  9: 15,  // September
  10: 12, // October
  11: 9,  // November
  12: 6,  // December
};

// Get current month's estimated cold water temperature
function getEstimatedTCold(): number {
  const month = new Date().getMonth() + 1;
  return SEASONAL_T_COLD[month] || 10;
}

// Type for raw node data from JSON
interface RawNode {
  id: string;
  name: string;
  address: string;
  apartments_count: number;
  building_volume_m3: number;
  mtcv_type: string;
  mtcv_count: number;
  readings: MonthlyReading[];
  stats: NodeStats;
}

const rawNodes = nodesData as RawNode[];

// Calculate IEZ from wskaznik
function calculateIEZ(wskaznik: number): number {
  return Math.round((OPTIMAL_WSKAZNIK / wskaznik) * 100);
}

// Get category from IEZ
function getCategory(iez: number): Category {
  if (iez >= 90) return 'A';
  if (iez >= 75) return 'B';
  return 'C';
}

// Get indicator status based on percentage
function getIndicatorStatus(percent: number): IndicatorStatus {
  if (percent >= 95) return 'optimal';
  if (percent >= 85) return 'good';
  if (percent >= 70) return 'warning';
  return 'critical';
}

// Get interpretation and action for WWC (Heat Exchange Index)
function getWWCInterpretation(value: number): { interpretation: string; action?: string } {
  if (value >= 95) {
    return { interpretation: 'Wymiana ciepła zgodna z projektem' };
  } else if (value >= 85) {
    return {
      interpretation: 'Dobra wymiana ciepła, możliwa drobna optymalizacja',
      action: 'Sprawdź nastawy MTCV przy okazji przeglądu'
    };
  } else if (value >= 70) {
    return {
      interpretation: 'ΔT poniżej normy - woda wraca za ciepła',
      action: 'Sprawdź nastawy MTCV - mogą być zbyt przymknięte'
    };
  } else {
    return {
      interpretation: 'Znacząco obniżona wymiana ciepła',
      action: 'Pilna regulacja MTCV lub kontrola wymiennika'
    };
  }
}

// Get interpretation and action for SH (Hydraulic Stability)
function getSHInterpretation(value: number): { interpretation: string; action?: string } {
  if (value >= 90) {
    return { interpretation: 'Stabilna praca hydrauliczna' };
  } else if (value >= 80) {
    return {
      interpretation: 'Lekkie wahania ΔT w ciągu doby',
      action: 'Monitoruj - może wymagać równoważenia'
    };
  } else if (value >= 70) {
    return {
      interpretation: 'Znaczne wahania ΔT - nierównomierne obciążenie pionów',
      action: 'Sprawdź równoważenie MTCV między pionami'
    };
  } else {
    return {
      interpretation: 'Niestabilna praca - problem hydrauliczny',
      action: 'Pilna diagnostyka: pompa cyrkulacyjna lub MTCV'
    };
  }
}

// Get interpretation and action for ES (Peak Efficiency)
function getESInterpretation(value: number, worstHours: number[]): { interpretation: string; action?: string } {
  const hoursStr = worstHours.map(h => `${h}:00`).join(', ');

  if (value >= 90) {
    return { interpretation: 'System dobrze radzi sobie ze szczytami' };
  } else if (value >= 80) {
    return {
      interpretation: `Lekki spadek w szczycie (${hoursStr})`,
      action: 'Rozważ optymalizację harmonogramu pompy'
    };
  } else if (value >= 70) {
    return {
      interpretation: `Słaba efektywność w szczycie (${hoursStr})`,
      action: 'Zwiększ wydajność pompy w godzinach szczytu lub otwórz MTCV'
    };
  } else {
    return {
      interpretation: `System przeciążony w szczycie (${hoursStr})`,
      action: 'Pilne: sprawdź wydajność pompy cyrkulacyjnej'
    };
  }
}

// ============================================================================
// EFFICIENCY HIERARCHY CALCULATIONS (SE → KW + SS)
// ============================================================================

// Calculate KW (Kondycja Wymiennika) - geometric mean of WWC, SH, ES
function calculateExchangerCondition(wwc: number, sh: number, es: number): ExchangerCondition {
  const value = Math.round(Math.pow(wwc * sh * es, 1/3));

  // Determine limiting factor
  const min = Math.min(wwc, sh, es);
  const limiting_factor: 'wwc' | 'sh' | 'es' =
    min === wwc ? 'wwc' : min === sh ? 'sh' : 'es';

  const limitingNames = {
    wwc: 'wymiana ciepła',
    sh: 'stabilność hydrauliczna',
    es: 'efektywność szczytowa'
  };

  let interpretation: string;
  if (value >= 90) {
    interpretation = 'Wymiennik pracuje bardzo dobrze';
  } else if (value >= 80) {
    interpretation = `Wymiennik sprawny, ogranicza: ${limitingNames[limiting_factor]}`;
  } else if (value >= 70) {
    interpretation = `Wymiennik wymaga uwagi — słaba ${limitingNames[limiting_factor]}`;
  } else {
    interpretation = `Wymiennik w stanie krytycznym — ${limitingNames[limiting_factor]} na niskim poziomie`;
  }

  return {
    value,
    status: getIndicatorStatus(value),
    limiting_factor,
    interpretation,
  };
}

// Calculate SS (Straty Systemowe) - losses outside heat exchanger
function calculateSystemLosses(
  seValue: number,
  kwValue: number,
  nightRatio: number
): SystemLosses {
  // SS = losses not explained by exchanger condition
  // If SE = 70% and KW = 85%, then system loses additional 15% beyond exchanger
  const exchangerEfficiency = kwValue / 100;
  const totalEfficiency = seValue / 100;

  // System losses = 1 - (SE / KW) when KW > SE
  // This represents losses happening after the exchanger
  const systemLossRatio = kwValue > 0 ? Math.max(0, 1 - (seValue / kwValue)) : 0;
  const value = Math.round(systemLossRatio * 100);

  // Estimate breakdown (circulation typically 60-80% of system losses)
  const circulationShare = 0.7 + (nightRatio - 0.15) * 0.5; // Higher night ratio = more circulation
  const estimated_circulation = Math.round(value * Math.min(0.9, Math.max(0.5, circulationShare)));
  const estimated_pipes = value - estimated_circulation;

  let interpretation: string;
  let action: string | undefined;

  if (value <= 10) {
    interpretation = 'Minimalne straty systemowe';
  } else if (value <= 20) {
    interpretation = 'Umiarkowane straty w cyrkulacji i rurach';
    action = 'Monitoruj zużycie nocne';
  } else if (value <= 30) {
    interpretation = 'Znaczące straty cyrkulacyjne';
    action = 'Sprawdź harmonogram pompy i izolację rur';
  } else {
    interpretation = 'Bardzo wysokie straty systemowe';
    action = 'Pilna optymalizacja cyrkulacji i izolacji';
  }

  return {
    value,
    status: value <= 10 ? 'optimal' : value <= 20 ? 'good' : value <= 30 ? 'warning' : 'critical',
    estimated_circulation,
    estimated_pipes,
    night_ratio: nightRatio,
    interpretation,
    action,
  };
}

// Calculate SE (Sprawność Energetyczna) - main indicator
function calculateEnergyEfficiency(
  node: RawNode,
  kwValue: number
): EnergyEfficiency {
  // Get recent readings for calculation
  const recentReadings = node.readings.slice(-6);
  if (recentReadings.length === 0) {
    return {
      value: 0,
      status: 'critical',
      losses_percent: 100,
      q_theoretical: 0,
      q_actual: 0,
      t_cold_estimated: getEstimatedTCold(),
      interpretation: 'Brak danych do obliczeń',
    };
  }

  // Calculate average actual energy and consumption
  const avgGJ = recentReadings.reduce((s, r) => s + r.gj, 0) / recentReadings.length;
  const avgM3 = recentReadings.reduce((s, r) => s + r.m3, 0) / recentReadings.length;

  // Estimated cold water temperature
  const t_cold = getEstimatedTCold();

  // Theoretical minimum energy: Q = V × c × ΔT × (1 + min_losses)
  const deltaT = T_CWU - t_cold;
  const q_theoretical_per_m3 = SPECIFIC_HEAT * deltaT * MIN_LOSSES_FACTOR;
  const q_theoretical = avgM3 * q_theoretical_per_m3;

  // Actual energy
  const q_actual = avgGJ;

  // Energy efficiency: what fraction of purchased energy is useful
  const value = Math.round((q_theoretical / q_actual) * 100);
  const losses_percent = 100 - value;

  let interpretation: string;
  if (value >= 80) {
    interpretation = `${value}% energii trafia do mieszkańców — bardzo dobra sprawność`;
  } else if (value >= 70) {
    interpretation = `${value}% energii wykorzystane, ${losses_percent}% strat w systemie`;
  } else if (value >= 60) {
    interpretation = `Tylko ${value}% energii dociera do odbiorców — znaczne straty`;
  } else {
    interpretation = `Krytycznie niska sprawność — ${losses_percent}% energii tracone`;
  }

  return {
    value: Math.min(100, Math.max(0, value)),
    status: getIndicatorStatus(value),
    losses_percent: Math.max(0, losses_percent),
    q_theoretical: Math.round(q_theoretical * 100) / 100,
    q_actual: Math.round(q_actual * 100) / 100,
    t_cold_estimated: t_cold,
    interpretation,
  };
}

// Generate complete efficiency hierarchy
function generateEfficiencyHierarchy(
  node: RawNode,
  indicators: OperationalIndicators
): EfficiencyHierarchy {
  const seed = parseInt(node.id.replace('WC-', ''), 10);

  // Level 2: KW from WWC, SH, ES
  const kw = calculateExchangerCondition(
    indicators.wwc.value,
    indicators.sh.value,
    indicators.es.value
  );

  // Level 1: SE (main indicator)
  const se = calculateEnergyEfficiency(node, kw.value);

  // Simulated night ratio (Q_night / Q_day) - in real system this would come from MEC
  // Typical range: 0.10 (good) to 0.40 (bad)
  const baseNightRatio = 0.15 + (100 - se.value) / 200; // Worse efficiency = higher night ratio
  const nightRatio = Math.min(0.45, Math.max(0.08, baseNightRatio + (seededRandom(seed * 10) * 0.1 - 0.05)));

  // Level 2: SS (system losses)
  const ss = calculateSystemLosses(se.value, kw.value, nightRatio);

  // Diagnostic: determine primary issue
  let primary_issue: 'exchanger' | 'circulation' | 'balanced' | 'unknown';
  if (se.value >= 75 && kw.value >= 80) {
    primary_issue = 'balanced'; // Both OK
  } else if (kw.value < 75) {
    primary_issue = 'exchanger'; // Exchanger is main problem
  } else if (ss.value > 20) {
    primary_issue = 'circulation'; // Circulation is main problem
  } else {
    primary_issue = 'unknown';
  }

  // Calculate savings potential
  // If optimized to SE=80%, how much could be saved?
  const targetEfficiency = 80;
  const currentLosses = se.losses_percent;
  const targetLosses = 100 - targetEfficiency;
  const savings_potential_percent = Math.max(0, currentLosses - targetLosses);

  // Estimate annual GJ savings
  const avgAnnualGJ = node.readings.slice(-12).reduce((s, r) => s + r.gj, 0);
  const savings_potential_gj = Math.round((savings_potential_percent / 100) * avgAnnualGJ);

  return {
    se,
    kw,
    ss,
    primary_issue,
    savings_potential_percent: Math.round(savings_potential_percent),
    savings_potential_gj,
  };
}

// Generate pseudo-random number from seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate operational indicators from node readings
function generateOperationalIndicators(node: RawNode): OperationalIndicators {
  const seed = parseInt(node.id.replace('WC-', ''), 10);
  const iez = node.stats.avg_iez;

  // WWC (Heat Exchange Index) - based on IEZ with some variation
  // Simulates: ΔT_actual / ΔT_design × 100%
  const wwcValue = Math.round(Math.min(115, Math.max(50, iez + (seededRandom(seed * 1) * 15 - 5))));
  const wwcInterp = getWWCInterpretation(wwcValue);

  // SH (Hydraulic Stability) - how consistent ΔT is
  // Higher IEZ nodes tend to have more stable systems
  const shValue = Math.round(Math.min(100, Math.max(55, iez + 5 + (seededRandom(seed * 2) * 20 - 10))));
  const shInterp = getSHInterpretation(shValue);

  // ES (Peak Efficiency) - ratio of peak performance to baseline
  // Morning (6-9) and evening (17-20) peaks
  const esValue = Math.round(Math.min(100, Math.max(50, iez - 5 + (seededRandom(seed * 3) * 20 - 10))));
  const worstHours = esValue < 85 ? [7, 8, 18, 19] : esValue < 90 ? [7, 18] : [];
  const esInterp = getESInterpretation(esValue, worstHours);

  // Weekly trend (% change)
  const weeklyTrend = Math.round((seededRandom(seed * 4) * 10) - 5);

  return {
    wwc: {
      value: wwcValue,
      status: getIndicatorStatus(wwcValue),
      interpretation: wwcInterp.interpretation,
      action: wwcInterp.action,
    },
    sh: {
      value: shValue,
      status: getIndicatorStatus(shValue),
      interpretation: shInterp.interpretation,
      action: shInterp.action,
    },
    es: {
      value: esValue,
      status: getIndicatorStatus(esValue),
      interpretation: esInterp.interpretation,
      action: esInterp.action,
      worst_hours: worstHours,
    },
    weekly_trend: weeklyTrend,
  };
}

// Generate monthly forecast based on indicators
function generateMonthlyForecast(node: RawNode, indicators: OperationalIndicators): MonthlyForecast {
  const recentReadings = node.readings.slice(-6);
  const avgWskaznik = recentReadings.reduce((s, r) => s + r.wskaznik, 0) / recentReadings.length;
  const lastMonthWskaznik = recentReadings[recentReadings.length - 1]?.wskaznik || avgWskaznik;

  // Predict wskaźnik based on indicators
  // Lower indicators = higher wskaźnik (worse efficiency)
  const avgIndicator = (indicators.wwc.value + indicators.sh.value + indicators.es.value) / 3;
  const indicatorFactor = avgIndicator / 100;

  // Predicted wskaźnik: base on historical average, adjusted by current indicators
  const predictedWskaznik = Math.round((avgWskaznik / indicatorFactor) * 1000) / 1000;

  // Determine category
  const predictedCategory: Category =
    predictedWskaznik <= 0.22 ? 'A' :
    predictedWskaznik <= 0.27 ? 'B' : 'C';

  // Calculate potential improvement (if all indicators were at 95%)
  const optimalWskaznik = avgWskaznik * (avgIndicator / 95);
  const potentialImprovement = Math.round((predictedWskaznik - optimalWskaznik) * 1000) / 1000;

  return {
    predicted_wskaznik: Math.min(0.45, Math.max(0.18, predictedWskaznik)),
    predicted_category: predictedCategory,
    confidence: indicators.sh.value >= 85 ? 'high' : indicators.sh.value >= 70 ? 'medium' : 'low',
    vs_last_month: Math.round(((predictedWskaznik / lastMonthWskaznik) - 1) * 100),
    potential_improvement: Math.max(0, potentialImprovement),
  };
}

// Generate efficiency data from node readings
function generateEfficiencyData(node: RawNode): EfficiencyData {
  const iez = node.stats.avg_iez;

  // Calculate percentile (rank among all nodes)
  const allIez = rawNodes.map(n => n.stats.avg_iez).sort((a, b) => b - a);
  const position = allIez.findIndex(v => v <= iez);
  const percentile = Math.round(((rawNodes.length - position) / rawNodes.length) * 100);

  // Generate operational indicators (WWC, SH, ES)
  const indicators = generateOperationalIndicators(node);

  // Generate efficiency hierarchy (SE → KW + SS)
  const hierarchy = generateEfficiencyHierarchy(node, indicators);

  // Generate monthly forecast
  const forecast = generateMonthlyForecast(node, indicators);

  return {
    timestamp: new Date().toISOString(),
    iez: {
      value: iez,
      trend: node.stats.trend,
      trend_change: node.stats.trend_change,
    },
    indicators,
    hierarchy,
    forecast,
    benchmark: {
      percentile,
      category: node.stats.category,
    },
  };
}

// Generate daily profile
function generateDailyProfile(node: RawNode): DailyProfile {
  const seed = parseInt(node.id.replace('WC-', ''), 10);
  const baseIez = node.stats.avg_iez;

  const hours: HourlyData[] = [];
  let minIez = 999, maxIez = 0;
  const bestHours: number[] = [];
  const worstHours: number[] = [];

  for (let h = 0; h < 24; h++) {
    // Morning peak (6-9), evening peak (17-21)
    let modifier = 0;
    if (h >= 6 && h <= 9) modifier = -5 - seededRandom(seed + h) * 8;
    else if (h >= 17 && h <= 21) modifier = -8 - seededRandom(seed + h) * 10;
    else if (h >= 1 && h <= 5) modifier = 5 + seededRandom(seed + h) * 5;
    else modifier = seededRandom(seed + h) * 6 - 3;

    const iez = Math.round(baseIez + modifier);
    minIez = Math.min(minIez, iez);
    maxIez = Math.max(maxIez, iez);

    const load = h >= 6 && h <= 9 ? 'peak' :
                 h >= 17 && h <= 21 ? 'high' :
                 h >= 10 && h <= 16 ? 'medium' : 'low';

    hours.push({
      hour: h,
      iez,
      load: load as 'low' | 'medium' | 'high' | 'peak',
      deviation_delta_t: Math.round(seededRandom(seed + h * 2) * 20 - 10),
      deviation_return_temp: Math.round(seededRandom(seed + h * 3) * 15 - 5),
    });

    if (iez >= baseIez + 3) bestHours.push(h);
    if (iez <= baseIez - 5) worstHours.push(h);
  }

  return {
    date: new Date().toISOString().split('T')[0],
    hours,
    summary: {
      best_hours: bestHours.slice(0, 4),
      worst_hours: worstHours.slice(0, 4),
      avg_iez: baseIez,
      min_iez: minIez,
      max_iez: maxIez,
    },
  };
}

// Generate history from readings
function generateHistory(node: RawNode): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  // Use last 30 readings or generate daily data
  const recentReadings = node.readings.slice(-12);

  recentReadings.forEach((reading, i) => {
    const monthStr = String(reading.month).padStart(2, '0');
    const date = `${reading.year}-${monthStr}-15`;
    const iez = calculateIEZ(reading.wskaznik);

    entries.push({
      date,
      iez,
      category: getCategory(iez),
    });
  });

  // Add some daily variation for the current month
  const seed = parseInt(node.id.replace('WC-', ''), 10);
  const now = new Date();
  const baseIez = node.stats.avg_iez;

  for (let d = 30; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const variation = Math.round((seededRandom(seed + d) * 10) - 5);
    const iez = Math.max(50, Math.min(110, baseIez + variation));

    entries.push({
      date: dateStr,
      iez,
      category: getCategory(iez),
    });
  }

  return entries.slice(-60); // Last 60 entries
}

// Generate alerts based on efficiency
function generateAlerts(node: RawNode): Alert[] {
  const alerts: Alert[] = [];
  const iez = node.stats.avg_iez;
  const now = new Date();

  if (iez < 70) {
    alerts.push({
      id: `${node.id}-alert-1`,
      type: 'efficiency_drop',
      severity: 'critical',
      created_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
      message: `Krytycznie niski IEZ (${iez}) - wymagana pilna interwencja`,
      status: 'active',
      node_id: node.id,
      node_name: node.name,
    });
  }

  if (node.stats.trend === 'declining' && node.stats.trend_change < -3) {
    alerts.push({
      id: `${node.id}-alert-2`,
      type: 'trend_negative',
      severity: 'warning',
      created_at: new Date(now.getTime() - 24 * 3600000).toISOString(),
      message: `Spadkowy trend efektywności (${node.stats.trend_change} pkt)`,
      status: 'active',
      node_id: node.id,
      node_name: node.name,
    });
  }

  if (iez < 80 && iez >= 70) {
    alerts.push({
      id: `${node.id}-alert-3`,
      type: 'deviation_critical',
      severity: 'warning',
      created_at: new Date(now.getTime() - 48 * 3600000).toISOString(),
      message: `Wskaźnik GJ/m³ powyżej normy - sprawdź nastawy MTCV`,
      status: 'active',
      node_id: node.id,
      node_name: node.name,
    });
  }

  return alerts;
}

// Generate recommendations
function generateRecommendations(node: RawNode): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const iez = node.stats.avg_iez;

  if (iez < 85) {
    recommendations.push({
      id: `${node.id}-rec-1`,
      priority: iez < 70 ? 'high' : 'medium',
      category: 'mtcv_adjustment',
      title: 'Regulacja zaworów MTCV',
      description: `Sprawdź nastawy zaworów ${node.mtcv_type} na wszystkich pionach. Wskaźnik GJ/m³ odbiega od optimum.`,
      expected_improvement: { iez_points: Math.round((85 - iez) * 0.6) },
      affected_hours: [7, 8, 18, 19, 20],
    });
  }

  if (node.stats.avg_wskaznik > 0.28) {
    recommendations.push({
      id: `${node.id}-rec-2`,
      priority: 'medium',
      category: 'hydraulic_balance',
      title: 'Równoważenie hydrauliczne',
      description: 'Przeprowadź pełne równoważenie instalacji CWU. Wykryto nierównomierny rozkład przepływów.',
      expected_improvement: { iez_points: 5 },
      affected_hours: [6, 7, 8, 9, 17, 18, 19, 20, 21],
    });
  }

  if (iez < 75) {
    recommendations.push({
      id: `${node.id}-rec-3`,
      priority: 'low',
      category: 'circulation_pump',
      title: 'Optymalizacja pompy cyrkulacyjnej',
      description: 'Dostosuj harmonogram pracy pompy cyrkulacyjnej do profilu zużycia CWU.',
      expected_improvement: { iez_points: 3 },
      affected_hours: [1, 2, 3, 4, 5],
    });
  }

  return recommendations;
}

// Get all nodes
export function getNodes(): Node[] {
  return rawNodes.map(n => ({
    id: n.id,
    name: n.name,
    address: n.address,
    apartments_count: n.apartments_count,
    building_volume_m3: n.building_volume_m3,
    mtcv_type: n.mtcv_type,
    mtcv_count: n.mtcv_count,
    readings: n.readings,
    stats: n.stats,
  }));
}

// Get single node by ID
export function getNode(id: string): Node | undefined {
  const node = rawNodes.find(n => n.id === id);
  if (!node) return undefined;

  return {
    id: node.id,
    name: node.name,
    address: node.address,
    apartments_count: node.apartments_count,
    building_volume_m3: node.building_volume_m3,
    mtcv_type: node.mtcv_type,
    mtcv_count: node.mtcv_count,
    readings: node.readings,
    stats: node.stats,
  };
}

// Get efficiency data for a node
export function getEfficiency(nodeId: string): EfficiencyData | undefined {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return undefined;
  return generateEfficiencyData(node);
}

// Get daily profile for a node
export function getDailyProfile(nodeId: string): DailyProfile | undefined {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return undefined;
  return generateDailyProfile(node);
}

// Get history for a node
export function getHistory(nodeId: string): HistoryEntry[] {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return [];
  return generateHistory(node);
}

// Get alerts for a node
export function getNodeAlerts(nodeId: string): Alert[] {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return [];
  return generateAlerts(node);
}

// Get all active alerts across all nodes
export function getAllAlerts(): Alert[] {
  const allAlerts: Alert[] = [];

  for (const node of rawNodes) {
    allAlerts.push(...generateAlerts(node));
  }

  return allAlerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// Get recommendations for a node
export function getRecommendations(nodeId: string): Recommendation[] {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return [];
  return generateRecommendations(node);
}

// Get ranking
export function getRanking(): RankingEntry[] {
  const sorted = [...rawNodes].sort((a, b) => b.stats.avg_iez - a.stats.avg_iez);

  return sorted.map((node, index) => ({
    position: index + 1,
    node_id: node.id,
    name: node.name,
    category: node.stats.category,
    avg_iez: node.stats.avg_iez,
    trend: node.stats.trend,
  }));
}

// Get full node data with all related information
export function getNodeWithEfficiency(id: string): NodeWithEfficiency | undefined {
  const node = rawNodes.find(n => n.id === id);
  if (!node) return undefined;

  const efficiency = generateEfficiencyData(node);

  return {
    id: node.id,
    name: node.name,
    address: node.address,
    apartments_count: node.apartments_count,
    building_volume_m3: node.building_volume_m3,
    mtcv_type: node.mtcv_type,
    mtcv_count: node.mtcv_count,
    readings: node.readings,
    stats: node.stats,
    efficiency,
    dailyProfile: generateDailyProfile(node),
    history: generateHistory(node),
    alerts: generateAlerts(node),
    recommendations: generateRecommendations(node),
  };
}

// Get all nodes with efficiency data
export function getNodesWithEfficiency(): NodeWithEfficiency[] {
  return rawNodes
    .map(node => getNodeWithEfficiency(node.id))
    .filter((node): node is NodeWithEfficiency => node !== undefined);
}

// Get dashboard statistics
export function getDashboardStats(): DashboardStats {
  const allAlerts = getAllAlerts();

  const avgIez = Math.round(
    rawNodes.reduce((sum, node) => sum + node.stats.avg_iez, 0) / rawNodes.length
  );

  const categoryACount = rawNodes.filter(n => n.stats.category === 'A').length;
  const categoryBCount = rawNodes.filter(n => n.stats.category === 'B').length;
  const categoryCCount = rawNodes.filter(n => n.stats.category === 'C').length;

  return {
    totalNodes: rawNodes.length,
    avgIez,
    activeAlerts: allAlerts.filter(a => a.status === 'active').length,
    categoryACount,
    categoryBCount,
    categoryCCount,
  };
}

// Get monthly history for charts (real data)
export function getMonthlyHistory(nodeId: string): { date: string; iez: number; wskaznik: number; gj: number; m3: number }[] {
  const node = rawNodes.find(n => n.id === nodeId);
  if (!node) return [];

  return node.readings.map(r => ({
    date: `${r.year}-${String(r.month).padStart(2, '0')}`,
    iez: calculateIEZ(r.wskaznik),
    wskaznik: r.wskaznik,
    gj: r.gj,
    m3: r.m3,
  }));
}

// Get all readings across all years for a node
export function getNodeReadings(nodeId: string): MonthlyReading[] {
  const node = rawNodes.find(n => n.id === nodeId);
  return node?.readings || [];
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format datetime for display
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get relative time
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min temu`;
  if (diffHours < 24) return `${diffHours}h temu`;
  if (diffDays === 1) return 'wczoraj';
  return `${diffDays} dni temu`;
}

// Get trend info
export function getTrendInfo(trend: 'improving' | 'declining' | 'stable', change: number): { icon: string; text: string; color: string } {
  switch (trend) {
    case 'improving':
      return { icon: '↗', text: `+${Math.abs(change)}`, color: 'text-success' };
    case 'declining':
      return { icon: '↘', text: `-${Math.abs(change)}`, color: 'text-critical' };
    default:
      return { icon: '→', text: `${change > 0 ? '+' : ''}${change}`, color: 'text-foreground-muted' };
  }
}

// Get category color class
export function getCategoryColor(category: Category): string {
  switch (category) {
    case 'A': return 'text-category-a';
    case 'B': return 'text-category-b';
    case 'C': return 'text-category-c';
  }
}

// Get category background class
export function getCategoryBg(category: Category): string {
  switch (category) {
    case 'A': return 'bg-success-muted text-success';
    case 'B': return 'bg-warning-muted text-warning';
    case 'C': return 'bg-critical-muted text-critical';
  }
}

// Get status color class
export function getStatusColor(status: 'ok' | 'warning' | 'critical'): string {
  switch (status) {
    case 'ok': return 'text-success';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-critical';
  }
}

// Get severity color
export function getSeverityColor(severity: 'info' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'info': return 'text-info';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-critical';
  }
}

export function getSeverityBg(severity: 'info' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'info': return 'bg-info-muted border-info/30';
    case 'warning': return 'bg-warning-muted border-warning/30';
    case 'critical': return 'bg-critical-muted border-critical/30';
  }
}

// Format month name in Polish
export function formatMonth(month: number): string {
  const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  return months[month - 1] || '';
}
// Auto-deploy test Tue 13 Jan 2026 18:53:23 CET
