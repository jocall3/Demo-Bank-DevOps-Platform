import {
    Incident, MetricDataPoint, ServiceHealth, Vulnerability, CloudCost, EnvironmentStatus, FeatureFlag, AuditLogEntry, PullRequestMetric, CodeQualityMetric
} from '../types';

const services = ['API Gateway', 'Frontend App', 'Transactions API', 'AI Advisor API', 'User Service', 'Payment Gateway', 'Reporting Service', 'Auth Service', 'Fraud Detection', 'Notifications', 'Investment API', 'Loan Service', 'Card Service', 'ATM API', 'Merchant API', 'Compliance API', 'Onboarding Service', 'Risk Engine', 'FX Service', 'Settlement Service'];
const users = ['alice.d', 'bob.s', 'charlie.m', 'diana.p', 'eve.w', 'frank.z', 'grace.l', 'harry.k', 'isabel.t', 'john.j', 'karen.b', 'liam.g', 'mia.r', 'noah.s', 'olivia.m', 'peter.w', 'quinn.a'];
const environments = ['Development', 'Staging', 'Production', 'UAT'];
const severities = ['Critical', 'High', 'Medium', 'Low'];
const statusOptions = ['Open', 'Resolved', 'Investigating', 'Closed'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number, decimals: number) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateIncidents = (count: number): Incident[] => {
    const incidents: Incident[] = [];
    for (let i = 0; i < count; i++) {
        const reportedDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()); // Last 30 days
        const status = getRandomElement(statusOptions);
        const resolvedDate = status === 'Resolved' || status === 'Closed' ? getRandomDate(reportedDate, new Date()) : undefined;
        const mttr = resolvedDate ? Math.round((resolvedDate.getTime() - reportedDate.getTime()) / (1000 * 60)) : undefined; // minutes

        incidents.push({
            id: `INC-${1000 + i}`,
            title: `Service ${getRandomElement(services)} experiencing ${getRandomElement(['latency spikes', 'error rate increase', 'connection issues', 'data inconsistency'])}`,
            service: getRandomElement(services),
            status: status as any,
            severity: getRandomElement(severities) as any,
            reportedAt: reportedDate.toLocaleString(),
            resolvedAt: resolvedDate?.toLocaleString(),
            mttr,
            description: `Detailed investigation for incident INC-${1000 + i}. Root cause analysis initiated.`,
            assignedTo: getRandomElement(users),
            affectedUsers: getRandomInt(100, 50000),
        });
    }
    return incidents;
};

const generateMetricData = (serviceName: string, startDate: Date, endDate: Date, type: 'latency' | 'errors' | 'throughput'): MetricDataPoint[] => {
    const data: MetricDataPoint[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        let value: number;
        switch (type) {
            case 'latency': value = getRandomFloat(20, 200, 2); break;
            case 'errors': value = getRandomFloat(0.1, 5, 2); break;
            case 'throughput': value = getRandomInt(1000, 10000); break;
        }
        data.push({
            time: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value
        });
        currentDate.setMinutes(currentDate.getMinutes() + 5);
    }
    return data;
};

const generateServiceHealth = (count: number): ServiceHealth[] => {
    const health: ServiceHealth[] = [];
    for (let i = 0; i < count; i++) {
        health.push({
            service: services[i % services.length],
            status: getRandomElement(['Operational', 'Degraded', 'Outage']) as any,
            latency: getRandomFloat(50, 500, 2),
            errorRate: getRandomFloat(0.01, 10, 2),
            throughput: getRandomInt(500, 15000),
            lastUpdated: getRandomDate(new Date(Date.now() - 60 * 60 * 1000), new Date()).toLocaleTimeString(),
        });
    }
    return health;
};

const vulnerabilityTypes = ['SQL Injection', 'XSS', 'Broken Authentication', 'Insecure Deserialization', 'Missing Security Headers', 'Sensitive Data Exposure'];
const vulnerabilityStatus = ['Open', 'Fixed', 'False Positive', 'Ignored'];

const generateVulnerabilities = (count: number): Vulnerability[] => {
    const vulnerabilities: Vulnerability[] = [];
    for (let i = 0; i < count; i++) {
        const reportedDate = getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
        const status = getRandomElement(vulnerabilityStatus);
        const fixedAt = status === 'Fixed' ? getRandomDate(reportedDate, new Date()) : undefined;

        vulnerabilities.push({
            id: `VULN-${2000 + i}`,
            service: getRandomElement(services),
            severity: getRandomElement(severities) as any,
            type: getRandomElement(vulnerabilityTypes),
            description: `Found a ${getRandomElement(vulnerabilityTypes)} vulnerability in ${getRandomElement(services)}.`,
            status: status as any,
            reportedAt: reportedDate.toLocaleString(),
            fixedAt: fixedAt?.toLocaleString(),
        });
    }
    return vulnerabilities;
};

const generateCloudCosts = (months: number): CloudCost[] => {
    const costs: CloudCost[] = [];
    const baseCost = 10000;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < months; i++) {
        const totalCost = baseCost + getRandomInt(-1000, 5000);
        const compute = getRandomFloat(0.4 * totalCost, 0.6 * totalCost, 2);
        const storage = getRandomFloat(0.1 * totalCost, 0.2 * totalCost, 2);
        const network = getRandomFloat(0.05 * totalCost, 0.15 * totalCost, 2);
        const database = getRandomFloat(0.1 * totalCost, 0.25 * totalCost, 2);
        const other = parseFloat((totalCost - compute - storage - network - database).toFixed(2));

        costs.push({
            month: monthNames[i % 12],
            totalCost: parseFloat(totalCost.toFixed(2)),
            compute,
            storage,
            network,
            database,
            other: other > 0 ? other : 0,
        });
    }
    return costs;
};

const generateEnvironmentStatus = (count: number): EnvironmentStatus[] => {
    const envs: EnvironmentStatus[] = [];
    for (let i = 0; i < count; i++) {
        const deployedServices = Array.from({ length: getRandomInt(3, 10) }).map(() => ({
            name: getRandomElement(services),
            version: `v${getRandomInt(1, 5)}.${getRandomInt(0, 10)}.${getRandomInt(0, 50)}`,
        }));
        envs.push({
            id: `ENV-${300 + i}`,
            name: environments[i % environments.length] + (i >= environments.length ? `-${Math.floor(i / environments.length) + 1}` : ''),
            status: getRandomElement(['Healthy', 'Degraded', 'Offline']) as any,
            deployedServices: [...new Set(deployedServices.map(s => s.name))].map(name => deployedServices.find(s => s.name === name)!), // unique services
            lastSync: getRandomDate(new Date(Date.now() - 12 * 60 * 60 * 1000), new Date()).toLocaleString(),
        });
    }
    return envs;
};

const generateFeatureFlags = (count: number): FeatureFlag[] => {
    const flags: FeatureFlag[] = [];
    for (let i = 0; i < count; i++) {
        flags.push({
            id: `FF-${400 + i}`,
            name: `feature-x-${i}`,
            service: getRandomElement(services),
            environment: getRandomElement(environments),
            enabled: Math.random() > 0.3,
            rolloutPercentage: getRandomElement([0, 10, 25, 50, 75, 100]),
            description: `Enables or disables feature X for testing.`,
            lastUpdated: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()).toLocaleString(),
            updatedBy: getRandomElement(users),
        });
    }
    return flags;
};

const generateAuditLogs = (count: number): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const actions = ['DEPLOY', 'UPDATE_CONFIG', 'CREATE_RESOURCE', 'DELETE_RESOURCE', 'ACCESS_DATA', 'MODIFY_DATA', 'LOGIN', 'LOGOUT', 'FEATURE_TOGGLE'];
    const resourceTypes = ['Service', 'Environment', 'Database', 'User', 'Feature Flag', 'Incident'];

    for (let i = 0; i < count; i++) {
        const action = getRandomElement(actions);
        const resourceType = getRandomElement(resourceTypes);
        const resourceId = `${resourceType.substring(0, 3).toUpperCase()}-${getRandomInt(100, 999)}`;
        logs.push({
            id: `AUDIT-${5000 + i}`,
            timestamp: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()).toLocaleString(),
            user: getRandomElement(users),
            action: action,
            resourceType: resourceType,
            resourceId: resourceId,
            details: `${action} action performed on ${resourceType} ${resourceId}.`,
            ipAddress: `192.168.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`,
        });
    }
    return logs;
};

const generatePullRequestMetrics = (days: number): PullRequestMetric[] => {
    const metrics: PullRequestMetric[] = [];
    let currentDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    for (let i = 0; i < days; i++) {
        const open = getRandomInt(5, 20);
        const merged = getRandomInt(10, 30);
        const cycleTime = getRandomFloat(1.5, 24, 2); // hours
        metrics.push({
            date: currentDate.toISOString().split('T')[0],
            open,
            merged,
            cycleTime,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return metrics;
};

const generateCodeQualityMetrics = (count: number): CodeQualityMetric[] => {
    const metrics: CodeQualityMetric[] = [];
    for (let i = 0; i < count; i++) {
        metrics.push({
            service: services[i % services.length],
            linesOfCode: getRandomInt(5000, 100000),
            bugsFound: getRandomInt(0, 20),
            vulnerabilitiesFound: getRandomInt(0, 10),
            coverage: getRandomFloat(60, 95, 2),
            technicalDebtHours: getRandomInt(10, 200),
        });
    }
    return metrics;
};

export const buildDurationData = [
    { name: 'Build #501', duration: 5.2, success: true }, { name: 'Build #502', duration: 5.5, success: true },
    { name: 'Build #503', duration: 4.8, success: true }, { name: 'Build #504', duration: 6.1, success: false },
    { name: 'Build #505', duration: 5.4, success: true }, { name: 'Build #506', duration: 5.8, success: true },
    { name: 'Build #507', duration: 5.1, success: true }, { name: 'Build #508', duration: 6.3, success: false },
    { name: 'Build #509', duration: 5.0, success: true }, { name: 'Build #510', duration: 5.7, success: true },
    { name: 'Build #511', duration: 4.9, success: true }, { name: 'Build #512', duration: 6.0, success: true },
    { name: 'Build #513', duration: 5.6, success: true }, { name: 'Build #514', duration: 6.5, success: false },
    { name: 'Build #515', duration: 5.3, success: true }, { name: 'Build #516', duration: 5.9, success: true },
    { name: 'Build #517', duration: 4.7, success: true }, { name: 'Build #518', duration: 6.2, success: false },
    { name: 'Build #519', duration: 5.0, success: true }, { name: 'Build #520', duration: 5.5, success: true },
    { name: 'Build #521', duration: 5.2, success: true }, { name: 'Build #522', duration: 5.5, success: true },
    { name: 'Build #523', duration: 4.8, success: true }, { name: 'Build #524', duration: 6.1, success: false },
    { name: 'Build #525', duration: 5.4, success: true }, { name: 'Build #526', duration: 5.8, success: true },
    { name: 'Build #527', duration: 5.1, success: true }, { name: 'Build #528', duration: 6.3, success: false },
    { name: 'Build #529', duration: 5.0, success: true }, { name: 'Build #530', duration: 5.7, success: true },
    { name: 'Build #531', duration: 4.9, success: true }, { name: 'Build #532', duration: 6.0, success: true },
    { name: 'Build #533', duration: 5.6, success: true }, { name: 'Build #534', duration: 6.5, success: false },
    { name: 'Build #535', duration: 5.3, success: true }, { name: 'Build #536', duration: 5.9, success: true },
    { name: 'Build #537', duration: 4.7, success: true }, { name: 'Build #538', duration: 6.2, success: false },
    { name: 'Build #539', duration: 5.0, success: true }, { name: 'Build #540', duration: 5.5, success: true },
    { name: 'Build #541', duration: 5.2, success: true }, { name: 'Build #542', duration: 5.5, success: true },
    { name: 'Build #543', duration: 4.8, success: true }, { name: 'Build #544', duration: 6.1, success: false },
    { name: 'Build #545', duration: 5.4, success: true }, { name: 'Build #546', duration: 5.8, success: true },
    { name: 'Build #547', duration: 5.1, success: true }, { name: 'Build #548', duration: 6.3, success: false },
    { name: 'Build #549', duration: 5.0, success: true }, { name: 'Build #550', duration: 5.7, success: true },
];

export const deploymentFrequencyData = [
    { name: 'Jan', deployments: 22 }, { name: 'Feb', deployments: 25 }, { name: 'Mar', deployments: 30 },
    { name: 'Apr', deployments: 28 }, { name: 'May', deployments: 35 }, { name: 'Jun', deployments: 42 },
    { name: 'Jul', deployments: 38 }, { name: 'Aug', deployments: 45 }, { name: 'Sep', deployments: 40 },
    { name: 'Oct', deployments: 50 }, { name: 'Nov', deployments: 48 }, { name: 'Dec', deployments: 55 },
];

export const recentDeployments = [
    { id: 1, service: 'API Gateway', version: 'v1.25.3', status: 'Success', date: '2h ago', environment: 'Production', author: 'alice.d' },
    { id: 2, service: 'Frontend App', version: 'v2.10.1', status: 'Success', date: '8h ago', environment: 'Production', author: 'bob.s' },
    { id: 3, service: 'Transactions API', version: 'v1.15.0', status: 'Failed', date: '1d ago', environment: 'Production', author: 'charlie.m' },
    { id: 4, service: 'AI Advisor API', version: 'v1.8.2', status: 'Success', date: '2d ago', environment: 'Production', author: 'diana.p' },
    { id: 5, service: 'User Service', version: 'v3.0.5', status: 'Success', date: '3d ago', environment: 'Production', author: 'eve.w' },
    { id: 6, service: 'Reporting Service', version: 'v0.9.1', status: 'Pending', date: '4d ago', environment: 'Staging', author: 'frank.z' },
    { id: 7, service: 'Fraud Detection', version: 'v1.1.2', status: 'Success', date: '5d ago', environment: 'Production', author: 'grace.l' },
    { id: 8, service: 'Notifications', version: 'v1.0.0', status: 'Failed', date: '6d ago', environment: 'Staging', author: 'harry.k' },
    { id: 9, service: 'Auth Service', version: 'v1.5.0', status: 'Success', date: '7d ago', environment: 'Production', author: 'isabel.t' },
    { id: 10, service: 'Payment Gateway', version: 'v2.2.0', status: 'Success', date: '8d ago', environment: 'Production', author: 'john.j' },
];

export const mockIncidents = generateIncidents(50);
export const mockServiceHealths = generateServiceHealth(services.length);
export const mockVulnerabilities = generateVulnerabilities(100);
export const mockCloudCosts = generateCloudCosts(12);
export const mockEnvironmentStatuses = generateEnvironmentStatus(environments.length + 2);
export const mockFeatureFlags = generateFeatureFlags(20);
export const mockAuditLogs = generateAuditLogs(500);
export const mockPullRequestMetrics = generatePullRequestMetrics(60);
export const mockCodeQualityMetrics = generateCodeQualityMetrics(services.length);

export const mockLatencyData = generateMetricData('API Gateway', new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(), 'latency');
export const mockErrorRateData = generateMetricData('Transactions API', new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(), 'errors');
export const mockThroughputData = generateMetricData('Frontend App', new Date(Date.now() - 24 * 60 * 60 * 1000), new Date(), 'throughput');
