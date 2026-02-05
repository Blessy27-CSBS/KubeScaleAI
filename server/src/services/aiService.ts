import { Application } from '../models/app';

interface Prediction {
    appId: string;
    predictedTraffic: number; // Estimated concurrent users next 10m
    confidence: number;       // 0-1
    reasoning: string;
}

export class AiService {

    // Simulate AI prediction (Replace with Groq API call in production)
    async predictTraffic(app: Application): Promise<Prediction> {
        // Mock logic: Simulate a sine wave traffic pattern based on time
        const time = Date.now();
        const hour = new Date(time).getHours();

        // Traffic peaks at 10am and 4pm
        const baseTraffic = 100;
        const volatility = Math.random() * 50;
        const timeFactor = Math.sin((hour / 24) * Math.PI * 2) * 500;

        const predictedVal = Math.max(0, Math.floor(baseTraffic + timeFactor + volatility));

        return {
            appId: app.id,
            predictedTraffic: predictedVal,
            confidence: 0.89,
            reasoning: predictedVal > 400 ? "High traffic surge detected matching historical pattern for Monday morning." : "Traffic expected to remain stable/low."
        };
    }

    // Calculate recommended replicas based on scaling policy
    calculateReplicas(app: Application, prediction: Prediction): number {
        const usersPerPod = 100; // Assume 1 pod handles 100 users
        let requiredPods = Math.ceil(prediction.predictedTraffic / usersPerPod);

        // Policy Adjustments
        if (app.config.scalingPolicy === 'performance-first') {
            requiredPods += 2; // Buffer
        } else if (app.config.scalingPolicy === 'cost-first') {
            // Allow scale down to zero if very low traffic
            if (prediction.predictedTraffic < 10) requiredPods = 0;
        } else {
            // Balanced: Min 1
            requiredPods = Math.max(1, requiredPods);
        }

        // Clamp to limits
        return Math.min(Math.max(requiredPods, app.config.replicas.min), app.config.replicas.max);
    }
}

export const aiService = new AiService();
