import { Request, Response } from 'express';
import { k8sService } from '../services/k8sService';
import { Application } from '../models/app';
import { tenants } from './tenantController';

// In-memory app store
export const apps: Application[] = [];

export class AppController {

    async deployApp(req: Request, res: Response) {
        try {
            const { tenantId, name, image, config } = req.body;

            const tenant = tenants.find(t => t.id === tenantId);
            if (!tenant) throw new Error('Tenant not found');

            // 1. Deploy to Tenant Namespace (Demo Mode: Catch Failures)
            try {
                await k8sService.deployApp(
                    tenant.namespace,
                    name,
                    image || 'nginx:alpine',
                    config.port || 80,
                    config.replicas.min
                );
            } catch (k8sErr) {
                console.warn(`[Demo Mode] K8s deployment failed (simulating success). Error: ${k8sErr}`);
            }

            const newApp: Application = {
                id: `${tenantId}-${name}`,
                tenantId,
                name,
                imageUrl: image,
                namespace: tenant.namespace,
                status: 'running', // Assume running for demo
                config: {
                    port: config.port || 80,
                    replicas: config.replicas,
                    resources: config.resources,
                    scalingPolicy: config.scalingPolicy
                },
                metrics: {
                    currentReplicas: config.replicas.min,
                    predictedTraffic: 0,
                    lastUpdated: new Date()
                }
            };

            apps.push(newApp);
            res.json({ success: true, app: newApp });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getApps(req: Request, res: Response) {
        const { tenantId } = req.query;
        if (tenantId) {
            res.json(apps.filter(a => a.tenantId === tenantId));
        } else {
            res.json(apps);
        }
    }
}

export const appController = new AppController();
