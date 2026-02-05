import { Request, Response } from 'express';
import { k8sService } from '../services/k8sService';
import { Tenant } from '../models/tenant';

// In-memory store for demo (replace with DB later)
export const tenants: Tenant[] = [];

export class TenantController {

    async createTenant(req: Request, res: Response) {
        try {
            const { name, plan } = req.body;
            const id = `tenant-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const namespace = id;

            // Define quotas based on plan
            const quotas = plan === 'pro'
                ? { cpu: '4000m', memory: '8Gi', pods: 50 }
                : { cpu: '2000m', memory: '4Gi', pods: 10 };

            try {
                // 1. Attempt K8s Namespace Creation
                await k8sService.createNamespace(namespace);
                // 2. Apply Quotas
                await k8sService.applyQuota(namespace, quotas.cpu, quotas.memory, quotas.pods);
            } catch (k8sError) {
                console.warn(`[Demo Mode] K8s cluster not available or reachable. Proceeding with in-memory tenant only. Error: ${k8sError}`);
            }

            const newTenant: Tenant = {
                id,
                name,
                namespace,
                plan,
                createdAt: new Date(),
                quotas
            };

            tenants.push(newTenant);
            console.log(`[TenantController] Created tenant: ${name} (${id})`);
            res.json({ success: true, tenant: newTenant });

        } catch (error: any) {
            console.error("[TenantController] Fatal error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getTenants(req: Request, res: Response) {
        res.json(tenants);
    }
}

export const tenantController = new TenantController();
