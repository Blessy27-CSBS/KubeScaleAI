export interface Tenant {
    id: string; // e.g. "tenant-acme"
    name: string; // "Acme Corp"
    namespace: string;
    plan: 'basic' | 'pro' | 'enterprise';
    createdAt: Date;
    quotas: {
        cpu: string;     // Kubernetes format: "2000m"
        memory: string;  // "4Gi"
        pods: number;    // 20
    };
}
