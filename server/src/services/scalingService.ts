import { apps } from '../controllers/appController';
import { aiService } from './aiService';

export class ScalingService {

    // Background loop to update predictions
    startPredictionLoop(intervalMs: number = 10000) {
        console.log('[Scaling] Prediction loop started.');
        setInterval(async () => {
            for (const app of apps) {
                try {
                    // 1. Get AI Prediction
                    const prediction = await aiService.predictTraffic(app);

                    // 2. Update App State (so metrics endpoint can see it)
                    if (!app.metrics) {
                        app.metrics = {
                            currentReplicas: 0,
                            predictedTraffic: 0,
                            lastUpdated: new Date()
                        };
                    }

                    app.metrics.predictedTraffic = prediction.predictedTraffic;
                    app.metrics.lastUpdated = new Date();

                    console.log(`[AI] App: ${app.name} (${app.tenantId}) | Pred: ${prediction.predictedTraffic} users`);
                } catch (e) {
                    console.error(`[Scaling] Error processing ${app.name}:`, e);
                }
            }
        }, intervalMs);
    }

    // Generate Prometheus Metrics Format
    getPrometheusMetrics(): string {
        let output = '# HELP kubescale_predicted_traffic Predicted concurrent users\n';
        output += '# TYPE kubescale_predicted_traffic gauge\n';

        for (const app of apps) {
            if (app.metrics) {
                // Prometheus format: name{label="val"} value
                output += `kubescale_predicted_traffic{app="${app.name}",tenant="${app.tenantId}"} ${app.metrics.predictedTraffic}\n`;
            }
        }

        return output;
    }
}

export const scalingService = new ScalingService();
