import mockData from '@/data/mock-data.json';
import type {
  Node,
  EfficiencyData,
  DailyProfile,
  HistoryEntry,
  Alert,
  Recommendation,
  RankingEntry,
  NodeWithEfficiency,
  DashboardStats,
} from './types';

// Type assertion for imported JSON
const data = mockData as {
  nodes: Node[];
  efficiency_current: Record<string, EfficiencyData>;
  daily_profile: Record<string, DailyProfile>;
  history_30_days: Record<string, HistoryEntry[]>;
  alerts: Record<string, Alert[]>;
  recommendations: Record<string, Recommendation[]>;
  ranking: RankingEntry[];
};

// Get all nodes
export function getNodes(): Node[] {
  return data.nodes;
}

// Get single node by ID
export function getNode(id: string): Node | undefined {
  return data.nodes.find((node) => node.id === id);
}

// Get efficiency data for a node
export function getEfficiency(nodeId: string): EfficiencyData | undefined {
  return data.efficiency_current[nodeId];
}

// Get daily profile for a node
export function getDailyProfile(nodeId: string): DailyProfile | undefined {
  return data.daily_profile[nodeId];
}

// Get history for a node
export function getHistory(nodeId: string): HistoryEntry[] {
  return data.history_30_days[nodeId] || [];
}

// Get alerts for a node
export function getNodeAlerts(nodeId: string): Alert[] {
  const alerts = data.alerts[nodeId] || [];
  return alerts.map((alert) => ({
    ...alert,
    node_id: nodeId,
    node_name: getNode(nodeId)?.name,
  }));
}

// Get all active alerts across all nodes
export function getAllAlerts(): Alert[] {
  const allAlerts: Alert[] = [];

  for (const nodeId of Object.keys(data.alerts)) {
    const node = getNode(nodeId);
    const nodeAlerts = data.alerts[nodeId].map((alert) => ({
      ...alert,
      node_id: nodeId,
      node_name: node?.name,
    }));
    allAlerts.push(...nodeAlerts);
  }

  // Sort by severity (critical first) then by date
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
  return data.recommendations[nodeId] || [];
}

// Get ranking
export function getRanking(): RankingEntry[] {
  return data.ranking;
}

// Get full node data with all related information
export function getNodeWithEfficiency(id: string): NodeWithEfficiency | undefined {
  const node = getNode(id);
  if (!node) return undefined;

  const efficiency = getEfficiency(id);
  if (!efficiency) return undefined;

  return {
    ...node,
    efficiency,
    dailyProfile: getDailyProfile(id),
    history: getHistory(id),
    alerts: getNodeAlerts(id),
    recommendations: getRecommendations(id),
  };
}

// Get all nodes with efficiency data
export function getNodesWithEfficiency(): NodeWithEfficiency[] {
  return data.nodes
    .map((node) => getNodeWithEfficiency(node.id))
    .filter((node): node is NodeWithEfficiency => node !== undefined);
}

// Get dashboard statistics
export function getDashboardStats(): DashboardStats {
  const nodes = getNodesWithEfficiency();
  const allAlerts = getAllAlerts();

  const avgIez = Math.round(
    nodes.reduce((sum, node) => sum + node.efficiency.iez.value, 0) / nodes.length
  );

  const categoryACount = nodes.filter((n) => n.efficiency.benchmark.category === 'A').length;
  const categoryBCount = nodes.filter((n) => n.efficiency.benchmark.category === 'B').length;
  const categoryCCount = nodes.filter((n) => n.efficiency.benchmark.category === 'C').length;

  return {
    totalNodes: nodes.length,
    avgIez,
    activeAlerts: allAlerts.filter((a) => a.status === 'active').length,
    categoryACount,
    categoryBCount,
    categoryCCount,
  };
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

// Get trend icon/text
export function getTrendInfo(trend: 'rising' | 'falling' | 'stable', change: number): { icon: string; text: string; color: string } {
  switch (trend) {
    case 'rising':
      return { icon: '↗', text: `+${change}`, color: 'text-success' };
    case 'falling':
      return { icon: '↘', text: `${change}`, color: 'text-critical' };
    default:
      return { icon: '→', text: `${change > 0 ? '+' : ''}${change}`, color: 'text-foreground-muted' };
  }
}

// Get category color class
export function getCategoryColor(category: 'A' | 'B' | 'C'): string {
  switch (category) {
    case 'A': return 'text-category-a';
    case 'B': return 'text-category-b';
    case 'C': return 'text-category-c';
  }
}

// Get category background class
export function getCategoryBg(category: 'A' | 'B' | 'C'): string {
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
