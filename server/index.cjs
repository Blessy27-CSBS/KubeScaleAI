const express = require('express');
const cors = require('cors');
const k8s = require('@kubernetes/client-node');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize KubeConfig
const kc = new k8s.KubeConfig();
try {
    kc.loadFromDefault();
    console.log("Loaded default kubeconfig.");
} catch (e) {
    console.warn("Failed to load kubeconfig. Real cluster mode will not work until configured.", e);
}

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'real-cluster-backend' });
});

app.get('/api/pods', async (req, res) => {
    try {
        console.log(`Fetching pods for namespace: ${namespace}`);
        const response = await k8sApi.listNamespacedPod(namespace);

        const pods = response.body.items.map(pod => ({
            id: pod.metadata?.uid,
            name: pod.metadata?.name,
            status: pod.status?.phase?.toUpperCase() || 'UNKNOWN',
            // Simple mock metrics for MVP as metrics-server API is complex to proxy directly without raw API calls
            cpu: Math.floor(Math.random() * 80) + 10,
            memory: Math.floor(Math.random() * 200) + 100,
            startTime: pod.status?.startTime ? new Date(pod.status.startTime).getTime() : Date.now()
        }));

        res.json({ pods });
    } catch (err) {
        console.error("Error details:", JSON.stringify(err, null, 2));
        res.status(500).json({ error: "Cluster connection failed", details: err.message || err });
    }
});

app.post('/api/scale', async (req, res) => {
    // MVP: Just a placeholder. Real scaling requires Deployment patching.
    res.json({ message: "Scaling command received (Not implemented in MVP)" });
});

app.listen(port, () => {
    console.log(`KubeScale Backend running at http://localhost:${port}`);
});
