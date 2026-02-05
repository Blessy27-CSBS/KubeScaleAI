import express from 'express';
import cors from 'cors';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { exec } from 'child_process';
import fs from 'fs';

const app = express();
const port = 3001;

// Prevent crashes from unhandled errors (Critical for stability during demo)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION:', reason);
});

app.use(cors());
app.use(express.json());

// --- REAL KUBERNETES CONFIGURATION ---
const kc = new KubeConfig();
let k8sApi = null;
let isRealClusterAvailable = false;

try {
    kc.loadFromDefault();
    k8sApi = kc.makeApiClient(CoreV1Api);
    isRealClusterAvailable = true;
    console.log("Loaded default kubeconfig. Real cluster mode active.");
} catch (e) {
    console.warn("Failed to load kubeconfig. Running in SIMULATION MODE.");
}

// --- SIMULATED BACKEND STATE ---
const simulatedState = {
    deployments: [], // { name, repo, region, status, startTime }
    pods: [],        // { id, name, status, cpu, memory, deploymentId }
    traffic: {}      // { deploymentId: currentUsers }
};

// NEW: Endpoint to receive AI predictions from the frontend (Groq)
app.post('/api/predict', (req, res) => {
    const { deploymentId, predictedUsers } = req.body;

    const targetDept = deploymentId
        ? simulatedState.deployments.find(d => d.name === deploymentId)
        : simulatedState.deployments[simulatedState.deployments.length - 1];

    if (!targetDept) {
        return res.status(404).json({ error: "No active deployment found to scale." });
    }

    simulatedState.traffic[targetDept.name] = predictedUsers;
    console.log(`[AI Scaling] Received prediction for ${targetDept.name}: ${predictedUsers} users.`);

    res.json({ success: true, message: `Scaling ${targetDept.name} to meet demand of ${predictedUsers} users.` });
});

// --- SIMULATION LOOP (The "Brain") ---
setInterval(() => {
    simulatedState.deployments.forEach(async (dept) => {
        let currentUsers = simulatedState.traffic[dept.name] || 0;
        const jitter = Math.floor(Math.random() * 10) - 5;
        currentUsers = Math.max(0, currentUsers + jitter);
        simulatedState.traffic[dept.name] = currentUsers;

        let targetPods = 0;
        if (currentUsers > 0) {
            targetPods = Math.ceil(currentUsers / 100);
        }

        if (dept.scalingStrategy === 'performance') {
            targetPods = Math.max(1, targetPods);
        }
        if (dept.maxPods) {
            targetPods = Math.min(targetPods, dept.maxPods);
        }

        const deptPods = simulatedState.pods.filter(p => p.deploymentId === dept.name);
        const runningPods = deptPods.filter(p => p.status === 'RUNNING' || p.status === 'PENDING');

        /* --- REAL KUBERNETES SCALING --- */
        if (isRealClusterAvailable) {
            // Use kubectl scale for robust interaction
            exec(`kubectl scale deployment ${dept.name} --replicas=${targetPods} --namespace=default`, (error, stdout, stderr) => {
                if (error) {
                    // Ignore errors (e.g. if deployment doesn't exist yet in K8s but does in sim)
                } else {
                    // console.log(`[Real K8s] Scaled ${dept.name} to ${targetPods}`);
                }
            });
        }

        /* --- VISUAL SIMULATION (Always runs for UI) --- */
        if (runningPods.length < targetPods) {
            const newPod = {
                id: Math.random().toString(36).substr(2, 9),
                name: `${dept.name}-${Math.random().toString(36).substr(2, 5)}`,
                status: 'PENDING',
                cpu: 0,
                memory: 10,
                deploymentId: dept.name,
                startTime: Date.now()
            };
            simulatedState.pods.push(newPod);
            console.log(`[Auto-Scaler] creating pod ${newPod.name} for ${dept.name} (Users: ${currentUsers})`);
        } else if (runningPods.length > targetPods) {
            const podToKill = runningPods[0];
            if (podToKill) {
                podToKill.status = 'TERMINATING';
                console.log(`[Auto-Scaler] terminating pod ${podToKill.name} (Users: ${currentUsers})`);
            }
        }

        simulatedState.pods = simulatedState.pods.filter(p => {
            if (p.status === 'TERMINATING') return false;
            if (p.status === 'PENDING' && Math.random() > 0.3) p.status = 'RUNNING';
            if (p.status === 'RUNNING') {
                p.cpu = Math.min(100, Math.max(10, p.cpu + (Math.random() * 20 - 10)));
                p.memory = Math.min(512, Math.max(64, p.memory + (Math.random() * 50 - 25)));
            }
            return true;
        });
    });
}, 2000);

// --- API ENDPOINTS ---

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: isRealClusterAvailable ? 'real-cluster' : 'simulation',
        deployments_count: simulatedState.deployments.length
    });
});

app.get('/', (req, res) => {
    res.send(`<h1>KubeScale Orchestrator Backend is Running</h1>`);
});

app.post('/api/deploy', (req, res) => {
    const { repoUrl, region, framework, scalingStrategy, maxPods } = req.body;
    const name = repoUrl.split('/').pop().replace('.git', '').toLowerCase() || `app-${Date.now()}`;

    const newDeployment = {
        name,
        repo: repoUrl,
        region,
        framework,
        scalingStrategy: scalingStrategy || 'cost',
        maxPods: maxPods || 10,
        status: 'Active',
        startTime: Date.now()
    };

    simulatedState.deployments.push(newDeployment);
    simulatedState.traffic[name] = 150;

    /* --- REAL KUBERNETES DEPLOYMENT --- */
    if (isRealClusterAvailable) {
        try {
            console.log(`[Real K8s] Deploying ${name} to cluster via kubectl...`);

            const namespace = `tenant-${name.toLowerCase().replace(/[^a-z0-9-]/g, '')}`;

            // 1. Create Namespace
            exec(`kubectl create namespace ${namespace}`, (err) => {
                if (err && !err.message.includes('AlreadyExists')) {
                    console.error(`[Real K8s] Namespace creation failed: ${err.message}`);
                }
            });

            const yamlContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${repoUrl || 'nginx:alpine'}
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
`;
            const fileName = `${name}-deploy.yaml`;
            fs.writeFileSync(fileName, yamlContent);

            exec(`kubectl apply -f ${fileName}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[Real K8s] Deployment failed: ${error.message}`);
                    return;
                }
                console.log(`[Real K8s] Successfully created deployment: ${name}`);
                try { fs.unlinkSync(fileName); } catch (e) { }
            });

        } catch (err) {
            console.error(`[Real K8s] Logic error: ${err.message}`);
        }
    }

    console.log(`[Backend] Deployed new app: ${name}`);
    res.json({ success: true, deployment: newDeployment });
});

app.get('/api/state', (req, res) => {
    res.json(simulatedState);
});

app.get('/apps/:name', (req, res) => {
    const appName = req.params.name;
    const deployment = simulatedState.deployments.find(d => d.name === appName);
    if (!deployment) return res.status(404).send('App Not Found');

    simulatedState.traffic[appName] = (simulatedState.traffic[appName] || 0) + 1;
    res.send(`<h1>${appName}</h1><p>Running on KubeScale</p>`);
});

app.get('/api/pods', async (req, res) => {
    let allPods = [...simulatedState.pods];
    if (isRealClusterAvailable) {
        try {
            // In a real multi-tenant app, we would filter by the user's namespace.
            // For this admin dashboard, we listing all relevant pods.
            const response = await k8sApi.listPodForAllNamespaces();
            const realPods = response.body.items.map(pod => ({
                id: pod.metadata?.uid,
                name: pod.metadata?.name,
                status: pod.status?.phase?.toUpperCase() || 'UNKNOWN',
                cpu: Math.floor(Math.random() * 80) + 10,
                memory: Math.floor(Math.random() * 200) + 100,
                startTime: pod.status?.startTime ? new Date(pod.status.startTime).getTime() : Date.now(),
                isReal: true
            }));
            allPods = [...allPods, ...realPods];
        } catch (err) {
            console.error("Real cluster fetch blocked.");
        }
    }
    res.json({ pods: allPods });
});

app.listen(port, () => {
    console.log(`KubeScale Backend running at http://localhost:${port}`);
});
