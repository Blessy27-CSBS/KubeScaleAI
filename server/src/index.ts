import express from 'express';
import cors from 'cors';
import { tenantController } from './controllers/tenantController';
import { appController } from './controllers/appController';
import { scalingService } from './services/scalingService';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Tenant APIs ---
app.post('/api/tenants', (req, res) => tenantController.createTenant(req, res));
app.get('/api/tenants', (req, res) => tenantController.getTenants(req, res));

// --- App APIs ---
app.post('/api/apps', (req, res) => appController.deployApp(req, res));
app.get('/api/apps', (req, res) => appController.getApps(req, res));

// --- Custom Metrics API (for Prometheus) ---
app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(scalingService.getPrometheusMetrics());
});

// --- Health Check ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: 'mini-aws-v1' });
});

// --- Simulated App Output ---
app.get('/apps/:name', (req, res) => {
    const appName = req.params.name;
    res.send(`
        <html>
            <head>
                <title>${appName} - Hosted by KubeScale</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fdf2f8; color: #831843; }
                    .card { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 500px; }
                    h1 { margin-bottom: 0.5rem; color: #9d174d; font-size: 2.5rem; }
                    .badge { background: #fce7f3; color: #be185d; padding: 0.5rem 1rem; border-radius: 999px; font-weight: bold; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2rem; display: inline-block; }
                    p { color: #db2777; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">Running on Mini-AWS</span>
                    <h1>${appName}</h1>
                    <p>Your application is successfully deployed!<br>Traffic is being monitored by our AI Engine.</p>
                    <p style="font-size: 0.8rem; margin-top: 2rem; opacity: 0.6;">Pod ID: pod-${Date.now().toString().slice(-6)}</p>
                </div>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`[Mini-AWS] Control Plane running at http://localhost:${port}`);
    // Start the AI Prediction Engine
    scalingService.startPredictionLoop();
});
