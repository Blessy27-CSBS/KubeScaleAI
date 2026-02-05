export interface Application {
    id: string;
    tenantId: string;
    name: string;
    imageUrl: string;
    namespace: string;
    status: 'pending' | 'deploying' | 'running' | 'failed' | 'scaled-to-zero';
    config: {
        port: number;
        replicas: { min: number; max: number };
        resources: { cpu: string; memory: string };
        scalingPolicy: 'cost-first' | 'balanced' | 'performance-first';
    };
    metrics?: {
        currentReplicas: number;
        predictedTraffic: number;
        lastUpdated: Date;
    };
}
