import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Area,
    PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import {
    Incident, MetricDataPoint, ServiceHealth, Vulnerability, CloudCost, EnvironmentStatus, FeatureFlag, AuditLogEntry, PullRequestMetric, CodeQualityMetric
} from '../types';
import {
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationCircleIcon, CogIcon, BugAntIcon, CloudIcon, SecurityShieldIcon, ServerStackIcon, ChartBarIcon, ClockIcon, RocketLaunchIcon, UserGroupIcon, FolderOpenIcon, DocumentTextIcon
} from './Icons';
import {
    mockIncidents, mockServiceHealths, mockVulnerabilities, mockCloudCosts, mockEnvironmentStatuses, mockFeatureFlags, mockAuditLogs, mockPullRequestMetrics, mockCodeQualityMetrics, mockLatencyData, mockErrorRateData, mockThroughputData, deploymentFrequencyData, buildDurationData, recentDeployments
} from '../services/mockData';

// --- Helper Components & Functions ---

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'Success':
        case 'Resolved':
        case 'Operational':
        case 'Fixed':
        case 'Healthy':
        case 'Open': // for feature flags, open means active
            return 'text-green-400';
        case 'Failed':
        case 'Outage':
        case 'Critical':
        case 'High':
        case 'Offline':
            return 'text-red-400';
        case 'Pending':
        case 'Investigating':
        case 'Degraded':
        case 'Medium':
        case 'Staging':
            return 'text-yellow-400';
        case 'Low':
        case 'Closed':
        case 'Maintenance':
        case 'Development':
        case 'UAT':
            return 'text-blue-400';
        default:
            return 'text-gray-400';
    }
};

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Success':
        case 'Resolved':
        case 'Operational':
        case 'Fixed':
        case 'Healthy':
        case 'Open':
            return <CheckCircleIcon />;
        case 'Failed':
        case 'Outage':
        case 'Critical':
        case 'High':
        case 'Offline':
            return <XCircleIcon />;
        case 'Pending':
        case 'Investigating':
        case 'Degraded':
        case 'Medium':
            return <ExclamationCircleIcon />;
        case 'Low':
        case 'Closed':
        case 'Maintenance':
            return <InformationCircleIcon />;
        default:
            return null;
    }
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'Success' || status === 'Resolved' || status === 'Operational' || status === 'Fixed' || status === 'Healthy'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : status === 'Failed' || status === 'Outage' || status === 'Critical' || status === 'High' || status === 'Offline'
                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                : status === 'Pending' || status === 'Investigating' || status === 'Degraded' || status === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
    }`}>
        {status}
    </span>
);

export const MetricCard: React.FC<{ title: string; value: string | number; description: string; className?: string; icon?: React.ReactNode }> = ({ title, value, description, className, icon }) => (
    <Card className={`flex-1 ${className}`}>
        <div className="flex items-center h-full">
            {icon && <div className="mr-4 text-gray-500">{icon}</div>}
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    </Card>
);

export const DetailModal: React.FC<{ title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-700">
                    <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-white border-b border-gray-700 pb-2 mb-4" id="modal-title">{title}</h3>
                                <div className="mt-2 text-gray-300">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex justify-center mt-6">
            <ul className="flex items-center -space-x-px h-10 text-base">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-500 bg-gray-800 border border-gray-700 rounded-l-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="sr-only">Previous</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" /></svg>
                    </button>
                </li>
                {pageNumbers.map((number) => (
                    <li key={number}>
                        <button
                            onClick={() => onPageChange(number)}
                            className={`flex items-center justify-center px-4 h-10 leading-tight transition-colors ${
                                currentPage === number
                                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                                    : 'text-gray-500 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-gray-800 border border-gray-700 rounded-r-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="sr-only">Next</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" /></svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

// --- Sub-Dashboards / Sections ---

export const IncidentManagementDashboard: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterService, setFilterService] = useState<string>('All');
    const [filterSeverity, setFilterSeverity] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [currentPage, setCurrentPage] = useState(1);
    const incidentsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIncidents(mockIncidents);
            setLoading(false);
        }, 500);
    }, []);

    const filteredIncidents = useMemo(() => {
        return incidents.filter(incident => {
            const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
            const matchesService = filterService === 'All' || incident.service === filterService;
            const matchesSeverity = filterSeverity === 'All' || incident.severity === filterSeverity;
            const matchesSearch = searchTerm === '' ||
                                  incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  incident.id.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesService && matchesSeverity && matchesSearch;
        });
    }, [incidents, filterStatus, filterService, filterSeverity, searchTerm]);

    const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);
    const currentIncidents = useMemo(() => {
        const startIndex = (currentPage - 1) * incidentsPerPage;
        return filteredIncidents.slice(startIndex, startIndex + incidentsPerPage);
    }, [filteredIncidents, currentPage, incidentsPerPage]);

    const handleIncidentClick = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsModalOpen(true);
    };

    const avgMttr = useMemo(() => {
        const resolved = incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed');
        if (resolved.length === 0) return 'N/A';
        const totalMttr = resolved.reduce((sum, i) => sum + (i.mttr || 0), 0);
        return `${(totalMttr / resolved.length).toFixed(0)}m`;
    }, [incidents]);

    const incidentSeverityData = useMemo(() => {
        const counts = incidents.reduce((acc, incident) => {
            acc[incident.severity] = (acc[incident.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [incidents]);

    const incidentTrendData = useMemo(() => {
        const trend: Record<string, { date: string; open: number; resolved: number }> = {};
        incidents.forEach(inc => {
            const date = inc.reportedAt.split(',')[0]; // Simple date extraction
            if (!trend[date]) {
                trend[date] = { date, open: 0, resolved: 0 };
            }
            trend[date].open += 1;
            if (inc.status === 'Resolved' || inc.status === 'Closed') {
                trend[date].resolved += 1;
            }
        });
        return Object.values(trend).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [incidents]);


    const uniqueServices = useMemo(() => ['All', ...new Set(incidents.map(i => i.service))], [incidents]);
    const uniqueSeverities = useMemo(() => ['All', ...new Set(incidents.map(i => i.severity))].sort((a, b) => {
        const order = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'All': 0 };
        return order[b as keyof typeof order] - order[a as keyof typeof order];
    }), [incidents]);
    const uniqueStatuses = useMemo(() => ['All', ...new Set(incidents.map(i => i.status))], [incidents]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <BugAntIcon className="h-6 w-6 mr-3 text-red-500"/>
                    Incident Management
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Incidents (30d)" value={incidents.length} description="All incidents reported" icon={<BugAntIcon className="h-7 w-7 text-red-500" />} />
                <MetricCard title="Open Incidents" value={incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length} description="Currently active investigations" icon={<ExclamationCircleIcon className="h-7 w-7 text-yellow-500" />} />
                <MetricCard title="Critical Incidents" value={incidents.filter(i => i.severity === 'Critical' && (i.status === 'Open' || i.status === 'Investigating')).length} description="Highest priority incidents" icon={<XCircleIcon className="h-7 w-7 text-red-500" />} />
                <MetricCard title="Avg. MTTR" value={avgMttr} description="Mean time to resolution" icon={<ClockIcon className="h-7 w-7 text-blue-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Incident Trend (Last 30 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={incidentTrendData}>
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Legend />
                            <Line type="monotone" dataKey="open" stroke="#ff7300" name="New Incidents" strokeWidth={2} dot={{r: 4}} />
                            <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved Incidents" strokeWidth={2} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Incidents by Severity">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={incidentSeverityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {incidentSeverityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        entry.name === 'Critical' ? '#ef4444' :
                                        entry.name === 'High' ? '#f59e0b' :
                                        entry.name === 'Medium' ? '#fcd34d' :
                                        '#60a5fa'
                                    } />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="All Incidents">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by title, ID, description..."
                        className="flex-grow p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterService}
                        onChange={(e) => { setFilterService(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueServices.map(service => <option key={service} value={service}>{service}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterSeverity}
                        onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueSeverities.map(severity => <option key={severity} value={severity}>{severity}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">ID</th>
                                <th scope="col" className="px-6 py-4">Title</th>
                                <th scope="col" className="px-6 py-4">Service</th>
                                <th scope="col" className="px-6 py-4">Severity</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Reported At</th>
                                <th scope="col" className="px-6 py-4">Assigned To</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center animate-pulse">Loading incidents...</td></tr>
                            ) : currentIncidents.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No incidents found matching criteria.</td></tr>
                            ) : (
                                currentIncidents.map(inc => (
                                    <tr key={inc.id} className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer group" onClick={() => handleIncidentClick(inc)}>
                                        <td className="px-6 py-4 font-mono group-hover:text-blue-400 transition-colors">{inc.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{inc.title}</td>
                                        <td className="px-6 py-4">{inc.service}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={inc.severity} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={inc.status} />
                                        </td>
                                        <td className="px-6 py-4">{inc.reportedAt}</td>
                                        <td className="px-6 py-4">{inc.assignedTo}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredIncidents.length > 0 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </Card>

            <DetailModal title={`Incident Details: ${selectedIncident?.id}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedIncident && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div><p className="text-gray-400 text-sm">Title</p><p className="text-white font-medium">{selectedIncident.title}</p></div>
                             <div><p className="text-gray-400 text-sm">Service</p><p className="text-white font-medium">{selectedIncident.service}</p></div>
                             <div><p className="text-gray-400 text-sm">Severity</p><StatusBadge status={selectedIncident.severity} /></div>
                             <div><p className="text-gray-400 text-sm">Status</p><StatusBadge status={selectedIncident.status} /></div>
                             <div><p className="text-gray-400 text-sm">Reported</p><p className="text-white">{selectedIncident.reportedAt}</p></div>
                             <div><p className="text-gray-400 text-sm">Resolved</p><p className="text-white">{selectedIncident.resolvedAt || 'N/A'}</p></div>
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                             <p className="text-gray-400 text-sm mb-1">Description</p>
                             <p className="text-gray-200 bg-gray-900/50 p-3 rounded-md">{selectedIncident.description}</p>
                        </div>
                         <div className="grid grid-cols-2 gap-4 pt-2">
                             <div><p className="text-gray-400 text-sm">Assigned To</p><p className="text-white">{selectedIncident.assignedTo}</p></div>
                             <div><p className="text-gray-400 text-sm">Affected Users</p><p className="text-white">{selectedIncident.affectedUsers.toLocaleString()}</p></div>
                             {selectedIncident.mttr && <div><p className="text-gray-400 text-sm">MTTR</p><p className="text-white">{selectedIncident.mttr} minutes</p></div>}
                        </div>
                    </div>
                )}
            </DetailModal>
        </div>
    );
};

export const MonitoringDashboard: React.FC = () => {
    const [serviceHealths, setServiceHealths] = useState<ServiceHealth[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setServiceHealths(mockServiceHealths);
            setLoading(false);
        }, 600);
    }, []);

    const operationalServices = serviceHealths.filter(s => s.status === 'Operational').length;
    const degradedServices = serviceHealths.filter(s => s.status === 'Degraded').length;
    const outageServices = serviceHealths.filter(s => s.status === 'Outage').length;

    const latencyChartData = useMemo(() => mockLatencyData, []);
    const errorRateChartData = useMemo(() => mockErrorRateData, []);
    const throughputChartData = useMemo(() => mockThroughputData, []);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-3 text-blue-500"/>
                    Monitoring & Observability
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <MetricCard title="Operational Services" value={operationalServices} description="Currently fully functional" icon={<CheckCircleIcon className="h-7 w-7 text-green-500" />} />
                <MetricCard title="Degraded Services" value={degradedServices} description="Experiencing minor issues" icon={<ExclamationCircleIcon className="h-7 w-7 text-yellow-500" />} />
                <MetricCard title="Services in Outage" value={outageServices} description="Major service interruptions" icon={<XCircleIcon className="h-7 w-7 text-red-500" />} />
                <MetricCard title="Total Services Monitored" value={serviceHealths.length} description="All active application services" icon={<ServerStackIcon className="h-7 w-7 text-blue-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="API Gateway Latency (Past 24h)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={latencyChartData}>
                            <XAxis dataKey="time" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Latency" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Transactions API Error Rate (Past 24h)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={errorRateChartData}>
                            <XAxis dataKey="time" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} domain={[0, 10]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Error Rate" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Frontend App Throughput (Past 24h)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={throughputChartData}>
                            <XAxis dataKey="time" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" label={{ value: 'Req/Sec', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Throughput" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Live Service Status Overview">
                    <div className="h-full flex flex-col justify-between">
                        <ul className="divide-y divide-gray-700 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {loading ? (
                                <li className="py-2 text-center text-gray-500 animate-pulse">Loading service health...</li>
                            ) : serviceHealths.length === 0 ? (
                                <li className="py-2 text-center text-gray-500">No service health data.</li>
                            ) : (
                                serviceHealths.map(sh => (
                                    <li key={sh.service} className="flex justify-between items-center py-2 px-2 hover:bg-gray-700/50 rounded-md transition-colors">
                                        <div className="flex items-center">
                                            <span className={`mr-2 ${getStatusColor(sh.status)}`}>{getStatusIcon(sh.status)}</span>
                                            <span className="font-medium text-white">{sh.service}</span>
                                        </div>
                                        <div className="text-right text-sm text-gray-400">
                                            <StatusBadge status={sh.status} />
                                            <span className="block text-xs mt-1">Lat: {sh.latency}ms, Err: {sh.errorRate}%</span>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                        <p className="text-xs text-gray-500 mt-4 text-right pt-2 border-t border-gray-700">Last updated: {new Date().toLocaleTimeString()}</p>
                    </div>
                </Card>
            </div>

            <Card title="All Service Health Checks">
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Service</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Latency (ms)</th>
                                <th scope="col" className="px-6 py-4">Error Rate (%)</th>
                                <th scope="col" className="px-6 py-4">Throughput (Req/s)</th>
                                <th scope="col" className="px-6 py-4">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center animate-pulse">Loading service healths...</td></tr>
                            ) : serviceHealths.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">No service health data found.</td></tr>
                            ) : (
                                serviceHealths.map(sh => (
                                    <tr key={sh.service} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{sh.service}</td>
                                        <td className="px-6 py-4"><StatusBadge status={sh.status} /></td>
                                        <td className="px-6 py-4">{sh.latency.toFixed(2)}</td>
                                        <td className="px-6 py-4">{sh.errorRate.toFixed(2)}</td>
                                        <td className="px-6 py-4">{sh.throughput.toLocaleString()}</td>
                                        <td className="px-6 py-4">{sh.lastUpdated}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const SecurityComplianceDashboard: React.FC = () => {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterService, setFilterService] = useState<string>('All');
    const [filterSeverity, setFilterSeverity] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const vulnsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setVulnerabilities(mockVulnerabilities);
            setLoading(false);
        }, 700);
    }, []);

    const filteredVulnerabilities = useMemo(() => {
        return vulnerabilities.filter(v => {
            const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
            const matchesService = filterService === 'All' || v.service === filterService;
            const matchesSeverity = filterSeverity === 'All' || v.severity === filterSeverity;
            const matchesSearch = searchTerm === '' ||
                                  v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  v.id.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesService && matchesSeverity && matchesSearch;
        });
    }, [vulnerabilities, filterStatus, filterService, filterSeverity, searchTerm]);

    const totalPages = Math.ceil(filteredVulnerabilities.length / vulnsPerPage);
    const currentVulnerabilities = useMemo(() => {
        const startIndex = (currentPage - 1) * vulnsPerPage;
        return filteredVulnerabilities.slice(startIndex, startIndex + vulnsPerPage);
    }, [filteredVulnerabilities, currentPage, vulnsPerPage]);

    const vulnerabilitiesBySeverity = useMemo(() => {
        const counts = filteredVulnerabilities.reduce((acc, v) => {
            acc[v.severity] = (acc[v.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredVulnerabilities]);

    const vulnerabilitiesByType = useMemo(() => {
        const counts = filteredVulnerabilities.reduce((acc, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredVulnerabilities]);

    const uniqueVulnerabilityStatuses = useMemo(() => ['All', ...new Set(vulnerabilities.map(v => v.status))], [vulnerabilities]);
    const uniqueVulnerabilityServices = useMemo(() => ['All', ...new Set(vulnerabilities.map(v => v.service))], [vulnerabilities]);
    const uniqueVulnerabilitySeverities = useMemo(() => ['All', ...new Set(vulnerabilities.map(v => v.severity))].sort((a, b) => {
        const order = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'All': 0 };
        return order[b as keyof typeof order] - order[a as keyof typeof order];
    }), [vulnerabilities]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <SecurityShieldIcon className="h-6 w-6 mr-3 text-purple-500"/>
                    Security & Compliance
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Vulnerabilities" value={vulnerabilities.length} description="All identified security flaws" icon={<SecurityShieldIcon className="h-7 w-7 text-blue-500" />} />
                <MetricCard title="Open Vulnerabilities" value={vulnerabilities.filter(v => v.status === 'Open').length} description="Awaiting fix or review" icon={<ExclamationCircleIcon className="h-7 w-7 text-yellow-500" />} />
                <MetricCard title="Critical Vulns (Open)" value={vulnerabilities.filter(v => v.severity === 'Critical' && v.status === 'Open').length} description="Highest risk, immediate action" icon={<XCircleIcon className="h-7 w-7 text-red-500" />} />
                <MetricCard title="Avg. Time to Fix" value="5 days" description="Mean duration to resolve issues" icon={<ClockIcon className="h-7 w-7 text-purple-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Vulnerabilities by Severity">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={vulnerabilitiesBySeverity}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Bar dataKey="value" fill="#8884d8">
                                {vulnerabilitiesBySeverity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        entry.name === 'Critical' ? '#ef4444' :
                                        entry.name === 'High' ? '#f59e0b' :
                                        entry.name === 'Medium' ? '#fcd34d' :
                                        '#60a5fa'
                                    } />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Vulnerabilities by Type">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={vulnerabilitiesByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#82ca9d"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {vulnerabilitiesByType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="All Security Vulnerabilities">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by description, type, ID..."
                        className="flex-grow p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueVulnerabilityStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterService}
                        onChange={(e) => { setFilterService(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueVulnerabilityServices.map(service => <option key={service} value={service}>{service}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterSeverity}
                        onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueVulnerabilitySeverities.map(severity => <option key={severity} value={severity}>{severity}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">ID</th>
                                <th scope="col" className="px-6 py-4">Service</th>
                                <th scope="col" className="px-6 py-4">Severity</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Reported At</th>
                                <th scope="col" className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center animate-pulse">Loading vulnerabilities...</td></tr>
                            ) : currentVulnerabilities.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No vulnerabilities found matching criteria.</td></tr>
                            ) : (
                                currentVulnerabilities.map(v => (
                                    <tr key={v.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-mono group-hover:text-purple-400 transition-colors">{v.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{v.service}</td>
                                        <td className="px-6 py-4"><StatusBadge status={v.severity} /></td>
                                        <td className="px-6 py-4">{v.type}</td>
                                        <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                                        <td className="px-6 py-4">{v.reportedAt}</td>
                                        <td className="px-6 py-4 truncate max-w-xs" title={v.description}>{v.description}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredVulnerabilities.length > 0 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </Card>
        </div>
    );
};

export const CloudCostManagementDashboard: React.FC = () => {
    const [cloudCosts, setCloudCosts] = useState<CloudCost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setCloudCosts(mockCloudCosts);
            setLoading(false);
        }, 800);
    }, []);

    const totalCostLastMonth = cloudCosts.length > 0 ? cloudCosts[cloudCosts.length - 1].totalCost : 0;
    const previousMonthCost = cloudCosts.length > 1 ? cloudCosts[cloudCosts.length - 2].totalCost : 0;
    const costChange = totalCostLastMonth - previousMonthCost;
    const costChangePercent = previousMonthCost > 0 ? ((costChange / previousMonthCost) * 100).toFixed(2) : '0.00';

    const costBreakdownLastMonth = useMemo(() => {
        if (cloudCosts.length === 0) return [];
        const lastMonth = cloudCosts[cloudCosts.length - 1];
        return [
            { name: 'Compute', value: lastMonth.compute, color: '#8884d8' },
            { name: 'Storage', value: lastMonth.storage, color: '#82ca9d' },
            { name: 'Network', value: lastMonth.network, color: '#ffc658' },
            { name: 'Database', value: lastMonth.database, color: '#ff7300' },
            { name: 'Other', value: lastMonth.other, color: '#a4de6c' },
        ];
    }, [cloudCosts]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <CloudIcon className="h-6 w-6 mr-3 text-green-400"/>
                    Cloud Cost Management
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Spend (Last MTH)" value={`$${totalCostLastMonth.toLocaleString()}`} description="Current month's estimated cloud bill" icon={<CloudIcon className="h-7 w-7 text-blue-500" />} />
                <MetricCard title="Monthly Change" value={`${costChange >= 0 ? '+' : ''}$${costChange.toLocaleString()} (${costChangePercent}%)`} description="Vs. previous month" className={costChange > 0 ? 'bg-red-900/20' : 'bg-green-900/20'} icon={costChange > 0 ? <XCircleIcon className="h-7 w-7 text-red-500" /> : <CheckCircleIcon className="h-7 w-7 text-green-500" />} />
                <MetricCard title="Estimated Annual Spend" value={`$${(totalCostLastMonth * 12).toLocaleString()}`} description="Based on current month's run rate" icon={<ClockIcon className="h-7 w-7 text-gray-500" />} />
                <MetricCard title="Budget Alert Level" value="85%" description="On track to exceed budget" className="bg-yellow-900/20" icon={<ExclamationCircleIcon className="h-7 w-7 text-yellow-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Monthly Cloud Spend Trend">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={cloudCosts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} formatter={(value: number) => `$${value.toLocaleString()}`}/>
                            <Legend />
                            <Area type="monotone" dataKey="totalCost" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Cost" />
                            <Area type="monotone" dataKey="compute" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Compute" />
                            <Area type="monotone" dataKey="storage" stackId="1" stroke="#ffc658" fill="#ffc658" name="Storage" />
                            <Area type="monotone" dataKey="network" stackId="1" stroke="#ff7300" fill="#ff7300" name="Network" />
                            <Area type="monotone" dataKey="database" stackId="1" stroke="#a4de6c" fill="#a4de6c" name="Database" />
                            <Area type="monotone" dataKey="other" stackId="1" stroke="#d0ed57" fill="#d0ed57" name="Other" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Last Month's Cost Breakdown">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={costBreakdownLastMonth}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {costBreakdownLastMonth.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} formatter={(value: number) => `$${value.toLocaleString()}`}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Monthly Cost Details">
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Month</th>
                                <th scope="col" className="px-6 py-4">Total Cost</th>
                                <th scope="col" className="px-6 py-4">Compute</th>
                                <th scope="col" className="px-6 py-4">Storage</th>
                                <th scope="col" className="px-6 py-4">Network</th>
                                <th scope="col" className="px-6 py-4">Database</th>
                                <th scope="col" className="px-6 py-4">Other</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center animate-pulse">Loading costs...</td></tr>
                            ) : cloudCosts.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No cost data found.</td></tr>
                            ) : (
                                cloudCosts.map(cc => (
                                    <tr key={cc.month} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{cc.month}</td>
                                        <td className="px-6 py-4 text-white font-semibold">${cc.totalCost.toLocaleString()}</td>
                                        <td className="px-6 py-4">${cc.compute.toLocaleString()}</td>
                                        <td className="px-6 py-4">${cc.storage.toLocaleString()}</td>
                                        <td className="px-6 py-4">${cc.network.toLocaleString()}</td>
                                        <td className="px-6 py-4">${cc.database.toLocaleString()}</td>
                                        <td className="px-6 py-4">${cc.other.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const EnvironmentServiceDashboard: React.FC = () => {
    const [environmentStatuses, setEnvironmentStatuses] = useState<EnvironmentStatus[]>([]);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [loadingEnvs, setLoadingEnvs] = useState(true);
    const [loadingFlags, setLoadingFlags] = useState(true);

    const [filterEnvName, setFilterEnvName] = useState<string>('All');
    const [filterEnvStatus, setFilterEnvStatus] = useState<string>('All');
    const [flagSearchTerm, setFlagSearchTerm] = useState<string>('');
    const [flagFilterEnv, setFlagFilterEnv] = useState<string>('All');
    const [flagFilterService, setFlagFilterService] = useState<string>('All');

    useEffect(() => {
        setLoadingEnvs(true);
        setTimeout(() => {
            setEnvironmentStatuses(mockEnvironmentStatuses);
            setLoadingEnvs(false);
        }, 900);

        setLoadingFlags(true);
        setTimeout(() => {
            setFeatureFlags(mockFeatureFlags);
            setLoadingFlags(false);
        }, 1000);
    }, []);

    const filteredEnvironmentStatuses = useMemo(() => {
        return environmentStatuses.filter(env => {
            const matchesName = filterEnvName === 'All' || env.name === filterEnvName;
            const matchesStatus = filterEnvStatus === 'All' || env.status === filterEnvStatus;
            return matchesName && matchesStatus;
        });
    }, [environmentStatuses, filterEnvName, filterEnvStatus]);

    const filteredFeatureFlags = useMemo(() => {
        return featureFlags.filter(flag => {
            const matchesSearch = flagSearchTerm === '' ||
                                  flag.name.toLowerCase().includes(flagSearchTerm.toLowerCase()) ||
                                  flag.description.toLowerCase().includes(flagSearchTerm.toLowerCase());
            const matchesEnv = flagFilterEnv === 'All' || flag.environment === flagFilterEnv;
            const matchesService = flagFilterService === 'All' || flag.service === flagFilterService;
            return matchesSearch && matchesEnv && matchesService;
        });
    }, [featureFlags, flagSearchTerm, flagFilterEnv, flagFilterService]);

    const uniqueEnvNames = useMemo(() => ['All', ...new Set(environmentStatuses.map(e => e.name))], [environmentStatuses]);
    const uniqueEnvStatuses = useMemo(() => ['All', ...new Set(environmentStatuses.map(e => e.status))], [environmentStatuses]);
    const uniqueFlagEnvs = useMemo(() => ['All', ...new Set(featureFlags.map(f => f.environment))], [featureFlags]);
    const uniqueFlagServices = useMemo(() => ['All', ...new Set(featureFlags.map(f => f.service))], [featureFlags]);

    const activeFeatureFlags = featureFlags.filter(f => f.enabled).length;
    const environmentsHealthy = environmentStatuses.filter(e => e.status === 'Healthy').length;
    const environmentsDegraded = environmentStatuses.filter(e => e.status === 'Degraded').length;
    const environmentsOffline = environmentStatuses.filter(e => e.status === 'Offline').length;

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <ServerStackIcon className="h-6 w-6 mr-3 text-cyan-400"/>
                    Environment & Service Management
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Environments" value={environmentStatuses.length} description="Defined deployment environments" icon={<FolderOpenIcon className="h-7 w-7 text-green-500" />} />
                <MetricCard title="Healthy Environments" value={environmentsHealthy} description="Fully operational" icon={<CheckCircleIcon className="h-7 w-7 text-green-500" />} />
                <MetricCard title="Degraded/Offline" value={environmentsDegraded + environmentsOffline} description="Requiring attention" icon={<ExclamationCircleIcon className="h-7 w-7 text-yellow-500" />} />
                <MetricCard title="Active Feature Flags" value={activeFeatureFlags} description="Features currently enabled" icon={<CogIcon className="h-7 w-7 text-blue-500" />} />
            </div>

            <Card title="Environment Health Status">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterEnvName}
                        onChange={(e) => setFilterEnvName(e.target.value)}
                    >
                        {uniqueEnvNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterEnvStatus}
                        onChange={(e) => setFilterEnvStatus(e.target.value)}
                    >
                        {uniqueEnvStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Environment</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Deployed Services</th>
                                <th scope="col" className="px-6 py-4">Last Sync</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loadingEnvs ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center animate-pulse">Loading environments...</td></tr>
                            ) : filteredEnvironmentStatuses.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center">No environments found matching criteria.</td></tr>
                            ) : (
                                filteredEnvironmentStatuses.map(env => (
                                    <tr key={env.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{env.name}</td>
                                        <td className="px-6 py-4"><StatusBadge status={env.status} /></td>
                                        <td className="px-6 py-4">
                                            <ul className="list-disc list-inside text-xs text-gray-400">
                                                {env.deployedServices.slice(0, 3).map((s, idx) => (
                                                    <li key={idx}>{s.name} (<span className="text-gray-300 font-mono">{s.version}</span>)</li>
                                                ))}
                                                {env.deployedServices.length > 3 && <li>... ({env.deployedServices.length - 3} more)</li>}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">{env.lastSync}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Feature Flag Management">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by flag name or description..."
                        className="flex-grow p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={flagSearchTerm}
                        onChange={(e) => setFlagSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={flagFilterEnv}
                        onChange={(e) => setFlagFilterEnv(e.target.value)}
                    >
                        {uniqueFlagEnvs.map(env => <option key={env} value={env}>{env}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={flagFilterService}
                        onChange={(e) => setFlagFilterService(e.target.value)}
                    >
                        {uniqueFlagServices.map(service => <option key={service} value={service}>{service}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Flag Name</th>
                                <th scope="col" className="px-6 py-4">Service</th>
                                <th scope="col" className="px-6 py-4">Environment</th>
                                <th scope="col" className="px-6 py-4">Enabled</th>
                                <th scope="col" className="px-6 py-4">Rollout %</th>
                                <th scope="col" className="px-6 py-4">Last Updated</th>
                                <th scope="col" className="px-6 py-4">Updated By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loadingFlags ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center animate-pulse">Loading feature flags...</td></tr>
                            ) : filteredFeatureFlags.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No feature flags found matching criteria.</td></tr>
                            ) : (
                                filteredFeatureFlags.map(flag => (
                                    <tr key={flag.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{flag.name}</td>
                                        <td className="px-6 py-4">{flag.service}</td>
                                        <td className="px-6 py-4"><StatusBadge status={flag.environment} /></td>
                                        <td className="px-6 py-4">
                                            {flag.enabled ? <CheckCircleIcon className="text-green-400" /> : <XCircleIcon className="text-red-400" />}
                                        </td>
                                        <td className="px-6 py-4">{flag.rolloutPercentage}%</td>
                                        <td className="px-6 py-4">{flag.lastUpdated}</td>
                                        <td className="px-6 py-4">{flag.updatedBy}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const DeveloperProductivityDashboard: React.FC = () => {
    const [prMetrics, setPrMetrics] = useState<PullRequestMetric[]>([]);
    const [codeQualityMetrics, setCodeQualityMetrics] = useState<CodeQualityMetric[]>([]);
    const [loadingPR, setLoadingPR] = useState(true);
    const [loadingCQ, setLoadingCQ] = useState(true);

    useEffect(() => {
        setLoadingPR(true);
        setTimeout(() => {
            setPrMetrics(mockPullRequestMetrics);
            setLoadingPR(false);
        }, 1100);

        setLoadingCQ(true);
        setTimeout(() => {
            setCodeQualityMetrics(mockCodeQualityMetrics);
            setLoadingCQ(false);
        }, 1200);
    }, []);

    const totalPRsMergedLast30Days = useMemo(() => {
        const last30Days = prMetrics.slice(-30);
        return last30Days.reduce((sum, metric) => sum + metric.merged, 0);
    }, [prMetrics]);

    const averageCycleTimeLast30Days = useMemo(() => {
        const last30Days = prMetrics.slice(-30).filter(m => m.merged > 0);
        if (last30Days.length === 0) return 'N/A';
        const totalCycleTime = last30Days.reduce((sum, metric) => sum + metric.cycleTime, 0);
        return `${(totalCycleTime / last30Days.length).toFixed(1)}h`;
    }, [prMetrics]);

    const avgCodeCoverage = useMemo(() => {
        if (codeQualityMetrics.length === 0) return 'N/A';
        const totalCoverage = codeQualityMetrics.reduce((sum, metric) => sum + metric.coverage, 0);
        return `${(totalCoverage / codeQualityMetrics.length).toFixed(1)}%`;
    }, [codeQualityMetrics]);

    const totalTechnicalDebtHours = useMemo(() => {
        return codeQualityMetrics.reduce((sum, metric) => sum + metric.technicalDebtHours, 0);
    }, [codeQualityMetrics]);


    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-3 text-pink-500"/>
                    Developer Productivity
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="PRs Merged (30d)" value={totalPRsMergedLast30Days} description="Total pull requests merged" icon={<RocketLaunchIcon className="h-7 w-7 text-green-500" />} />
                <MetricCard title="Avg. PR Cycle Time (30d)" value={averageCycleTimeLast30Days} description="Time from PR open to merge" icon={<ClockIcon className="h-7 w-7 text-blue-500" />} />
                <MetricCard title="Avg. Code Coverage" value={avgCodeCoverage} description="Across all services" icon={<ChartBarIcon className="h-7 w-7 text-purple-500" />} />
                <MetricCard title="Total Technical Debt" value={`${totalTechnicalDebtHours}h`} description="Estimated technical debt across services" icon={<BugAntIcon className="h-7 w-7 text-yellow-500" />} />
            </div>

            <Card title="Pull Request Activity (Last 60 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prMetrics}>
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                        <Legend />
                        <Line type="monotone" dataKey="open" stroke="#ff7300" name="Open PRs" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="merged" stroke="#82ca9d" name="Merged PRs" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Code Quality Overview">
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Service</th>
                                <th scope="col" className="px-6 py-4">Lines of Code</th>
                                <th scope="col" className="px-6 py-4">Bugs Found</th>
                                <th scope="col" className="px-6 py-4">Vulnerabilities</th>
                                <th scope="col" className="px-6 py-4">Coverage (%)</th>
                                <th scope="col" className="px-6 py-4">Tech Debt (Hrs)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loadingCQ ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center animate-pulse">Loading code quality metrics...</td></tr>
                            ) : codeQualityMetrics.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">No code quality data found.</td></tr>
                            ) : (
                                codeQualityMetrics.map(cq => (
                                    <tr key={cq.service} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{cq.service}</td>
                                        <td className="px-6 py-4">{cq.linesOfCode.toLocaleString()}</td>
                                        <td className="px-6 py-4">{cq.bugsFound}</td>
                                        <td className="px-6 py-4">{cq.vulnerabilitiesFound}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${cq.coverage}%` }}></div>
                                                </div>
                                                {cq.coverage.toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{cq.technicalDebtHours}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const AuditLogViewer: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterUser, setFilterUser] = useState<string>('All');
    const [filterAction, setFilterAction] = useState<string>('All');
    const [filterResource, setFilterResource] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setAuditLogs(mockAuditLogs);
            setLoading(false);
        }, 1300);
    }, []);

    const filteredAuditLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const matchesUser = filterUser === 'All' || log.user === filterUser;
            const matchesAction = filterAction === 'All' || log.action === filterAction;
            const matchesResource = filterResource === 'All' || log.resourceType === filterResource;
            const matchesSearch = searchTerm === '' ||
                                  log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesUser && matchesAction && matchesResource && matchesSearch;
        });
    }, [auditLogs, filterUser, filterAction, filterResource, searchTerm]);

    const totalPages = Math.ceil(filteredAuditLogs.length / logsPerPage);
    const currentLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return filteredAuditLogs.slice(startIndex, startIndex + logsPerPage);
    }, [filteredAuditLogs, currentPage, logsPerPage]);

    const uniqueUsers = useMemo(() => ['All', ...new Set(auditLogs.map(log => log.user))], [auditLogs]);
    const uniqueActions = useMemo(() => ['All', ...new Set(auditLogs.map(log => log.action))], [auditLogs]);
    const uniqueResourceTypes = useMemo(() => ['All', ...new Set(auditLogs.map(log => log.resourceType))], [auditLogs]);

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white tracking-wider flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-3 text-gray-400"/>
                    Audit Log Viewer
                </h3>
            </div>

            <Card title="System Audit Logs">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by details, resource ID, IP..."
                        className="flex-grow p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterUser}
                        onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                    <select
                        className="p-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        value={filterResource}
                        onChange={(e) => { setFilterResource(e.target.value); setCurrentPage(1); }}
                    >
                        {uniqueResourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Timestamp</th>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Action</th>
                                <th scope="col" className="px-6 py-4">Resource Type</th>
                                <th scope="col" className="px-6 py-4">Resource ID</th>
                                <th scope="col" className="px-6 py-4">Details</th>
                                <th scope="col" className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center animate-pulse">Loading audit logs...</td></tr>
                            ) : currentLogs.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">No audit logs found matching criteria.</td></tr>
                            ) : (
                                currentLogs.map(log => (
                                    <tr key={log.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">{log.timestamp}</td>
                                        <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                        <td className="px-6 py-4"><StatusBadge status={log.action} /></td>
                                        <td className="px-6 py-4">{log.resourceType}</td>
                                        <td className="px-6 py-4 font-mono">{log.resourceId}</td>
                                        <td className="px-6 py-4 truncate max-w-xs" title={log.details}>{log.details}</td>
                                        <td className="px-6 py-4 font-mono">{log.ipAddress}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredAuditLogs.length > 0 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </Card>
        </div>
    );
};

// --- Main DemoBankDevOpsView Component ---

export enum DashboardTab {
    Overview = 'Overview',
    Incidents = 'Incidents',
    Monitoring = 'Monitoring',
    Security = 'Security',
    Cost = 'Cost',
    Environments = 'Environments',
    Productivity = 'Productivity',
    Audit = 'Audit',
}

const DemoBankDevOpsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.Overview);

    // Calculate metrics for the overview cards
    const totalDeployments = deploymentFrequencyData.reduce((sum, d) => sum + d.deployments, 0);
    const avgBuildDuration = buildDurationData.reduce((sum, b) => sum + b.duration, 0) / buildDurationData.length;
    const changeFailureRate = buildDurationData.filter(b => !b.success).length / buildDurationData.length * 100;

    // Simulate MTTR - using a simple average from mock incidents
    const resolvedIncidents = mockIncidents.filter(i => i.status === 'Resolved' || i.status === 'Closed' && i.mttr !== undefined);
    const meanTimeToRestore = resolvedIncidents.length > 0
        ? (resolvedIncidents.reduce((sum, i) => sum + (i.mttr || 0), 0) / resolvedIncidents.length / 60).toFixed(1) + 'h' // convert minutes to hours
        : 'N/A';

    const tabs = [
        { name: DashboardTab.Overview, icon: <ChartBarIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Incidents, icon: <BugAntIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Monitoring, icon: <ChartBarIcon className="h-5 w-5 mr-2" /> }, // Reusing icon for now
        { name: DashboardTab.Security, icon: <SecurityShieldIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Cost, icon: <CloudIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Environments, icon: <ServerStackIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Productivity, icon: <UserGroupIcon className="h-5 w-5 mr-2" /> },
        { name: DashboardTab.Audit, icon: <DocumentTextIcon className="h-5 w-5 mr-2" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case DashboardTab.Overview:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Deployments (YTD)" value={totalDeployments} description="Across all services" icon={<RocketLaunchIcon className="h-7 w-7 text-green-500" />} />
                            <MetricCard title="Change Failure Rate" value={`${changeFailureRate.toFixed(1)}%`} description="Percentage of failed deployments" className={changeFailureRate > 5 ? 'bg-red-900/20' : 'bg-green-900/20'} icon={<XCircleIcon className={`h-7 w-7 ${changeFailureRate > 5 ? 'text-red-500' : 'text-green-500'}`} />} />
                            <MetricCard title="Avg. Build Duration" value={`${avgBuildDuration.toFixed(1)}m`} description="Mean pipeline execution time" className={avgBuildDuration > 6 ? 'bg-yellow-900/20' : 'bg-blue-900/20'} icon={<ClockIcon className="h-7 w-7 text-blue-500" />} />
                            <MetricCard title="Mean Time to Restore" value={meanTimeToRestore} description="Time to recover from incidents" className={meanTimeToRestore !== 'N/A' && parseFloat(meanTimeToRestore) > 0.5 ? 'bg-red-900/20' : 'bg-blue-900/20'} icon={<ClockIcon className="h-7 w-7 text-purple-500" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Average Build Duration (minutes)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={buildDurationData}>
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" domain={[4, 7]} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                                        <Line type="monotone" dataKey="duration" stroke="#8884d8" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Deployment Frequency (Monthly)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={deploymentFrequencyData}>
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', color: '#f3f4f6' }} />
                                        <Bar dataKey="deployments" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>

                        <Card title="Recent Deployments">
                            <div className="overflow-x-auto rounded-lg border border-gray-700">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">Status</th>
                                            <th scope="col" className="px-6 py-4">Service</th>
                                            <th scope="col" className="px-6 py-4">Version</th>
                                            <th scope="col" className="px-6 py-4">Environment</th>
                                            <th scope="col" className="px-6 py-4">Date</th>
                                            <th scope="col" className="px-6 py-4">Author</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {recentDeployments.slice(0, 10).map(dep => (
                                            <tr key={dep.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4">{getStatusIcon(dep.status)}</td>
                                                <td className="px-6 py-4 font-medium text-white">{dep.service}</td>
                                                <td className="px-6 py-4 font-mono">{dep.version}</td>
                                                <td className="px-6 py-4"><StatusBadge status={dep.environment} /></td>
                                                <td className="px-6 py-4">{dep.date}</td>
                                                <td className="px-6 py-4">{dep.author}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                );
            case DashboardTab.Incidents:
                return <IncidentManagementDashboard />;
            case DashboardTab.Monitoring:
                return <MonitoringDashboard />;
            case DashboardTab.Security:
                return <SecurityComplianceDashboard />;
            case DashboardTab.Cost:
                return <CloudCostManagementDashboard />;
            case DashboardTab.Environments:
                return <EnvironmentServiceDashboard />;
            case DashboardTab.Productivity:
                return <DeveloperProductivityDashboard />;
            case DashboardTab.Audit:
                return <AuditLogViewer />;
            default:
                return <p className="text-white">Select a tab</p>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-700 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Demo Bank DevOps Platform</h2>
                    <p className="mt-1 text-gray-400">Centralized observability and management console</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Refresh Data
                    </button>
                </div>
            </header>

            <div>
                <nav className="flex space-x-1 overflow-x-auto pb-4 custom-scrollbar" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`${
                                activeTab === tab.name
                                    ? 'bg-gray-800 text-white shadow-sm ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                            } whitespace-nowrap px-4 py-3 rounded-lg font-medium text-sm flex items-center transition-all duration-200`}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <main className="min-h-[600px]">
                {renderContent()}
            </main>
        </div>
    );
};

export default DemoBankDevOpsView;