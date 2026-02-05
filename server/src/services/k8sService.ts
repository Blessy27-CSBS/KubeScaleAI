import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

export class K8sService {

    // Create a dedicated namespace for a tenant
    async createNamespace(name: string): Promise<void> {
        try {
            await execPromise(`kubectl create namespace ${name}`);
            console.log(`[K8s] Created namespace: ${name}`);
        } catch (error: any) {
            if (error.stderr && error.stderr.includes('AlreadyExists')) {
                console.log(`[K8s] Namespace ${name} already exists.`);
            } else {
                throw error;
            }
        }
    }

    // Apply Resource Quotas (CPU/Memory limits)
    async applyQuota(namespace: string, cpu: string, memory: string, pods: number): Promise<void> {
        const quotaYaml = `
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-quota
  namespace: ${namespace}
spec:
  hard:
    requests.cpu: "${cpu}"
    requests.memory: "${memory}"
    pods: "${pods}"
`;
        await this.applyYaml(namespace, 'quota', quotaYaml);
    }

    // Deploy an Application
    async deployApp(namespace: string, appName: string, image: string, port: number, replicas: number): Promise<void> {
        const deploymentYaml = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  namespace: ${namespace}
  labels:
    app: ${appName}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        ports:
        - containerPort: ${port}
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
`;
        await this.applyYaml(namespace, `${appName}-deploy`, deploymentYaml);

        const serviceYaml = `
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
  namespace: ${namespace}
spec:
  selector:
    app: ${appName}
  ports:
    - protocol: TCP
      port: 80
      targetPort: ${port}
  type: ClusterIP
`;
        await this.applyYaml(namespace, `${appName}-svc`, serviceYaml);
    }

    // Helper to apply YAML
    private async applyYaml(namespace: string, name: string, content: string): Promise<void> {
        const filePath = path.join(process.cwd(), `temp-${namespace}-${name}.yaml`);
        fs.writeFileSync(filePath, content);
        try {
            await execPromise(`kubectl apply -f ${filePath}`);
            console.log(`[K8s] Applied ${name} in ${namespace}`);
        } finally {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
}

export const k8sService = new K8sService();
