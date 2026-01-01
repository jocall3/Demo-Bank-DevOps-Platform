export interface Incident {
    id: string;
    title: string;
    service: string;
    status: 'Open' | 'Resolved' | 'Investigating' | 'Closed';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    reportedAt: string;
    resolvedAt?: string;
    mttr?: number; // Mean Time To Resolution in minutes
    description: string;
    assignedTo: string;
    affectedUsers: number;
}

export interface MetricDataPoint {
    time: string; // e.g., '10:00', 'Jul 1'
    value: number;
}

export interface ServiceHealth {
    service: string;
    status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
    latency: number; // ms
    errorRate: number; // %
    throughput: number; // requests/sec
    lastUpdated: string;
}

export interface Vulnerability {
    id: string;
    service: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    type: string;
    description: string;
    status: 'Open' | 'Fixed' | 'False Positive' | 'Ignored';
    reportedAt: string;
    fixedAt?: string;
}

export interface CloudCost {
    month: string;
    totalCost: number;
    compute: number;
    storage: number;
    network: number;
    database: number;
    other: number;
}

export interface EnvironmentStatus {
    id: string;
    name: string;
    status: 'Healthy' | 'Degraded' | 'Offline';
    deployedServices: { name: string; version: string; }[];
    lastSync: string;
}

export interface FeatureFlag {
    id: string;
    name: string;
    service: string;
    environment: string;
    enabled: boolean;
    rolloutPercentage: number;
    description: string;
    lastUpdated: string;
    updatedBy: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: string;
    ipAddress: string;
}

export interface PullRequestMetric {
    date: string;
    open: number;
    merged: number;
    cycleTime: number; // in hours
}

export interface CodeQualityMetric {
    service: string;
    linesOfCode: number;
    bugsFound: number;
    vulnerabilitiesFound: number;
    coverage: number; // percentage
    technicalDebtHours: number;
}
