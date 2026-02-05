import fetch from 'node-fetch';

async function verifyScaling() {
    const baseUrl = 'http://localhost:3001';

    console.log("1. Deploying Test App...");
    const deployres = await fetch(`${baseUrl}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            repoUrl: 'https://github.com/test/aws-scaling-demo',
            region: 'us-east-1',
            framework: 'Node.js',
            scalingStrategy: 'performance',
            maxPods: 50
        })
    });
    const deployData = await deployres.json();
    console.log("Deployment Result:", deployData);

    console.log("\n2. Triggering AI Traffic Spike (5000 users)...");
    const predictRes = await fetch(`${baseUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            deploymentId: deployData.deployment.name,
            predictedUsers: 5000
        })
    });
    const predictData = await predictRes.json();
    console.log("Prediction Result:", predictData);

    console.log("\n3. Waiting for Backend to React...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("\n4. Checking Backend State/Logs...");
    const stateRes = await fetch(`${baseUrl}/api/state`);
    const state = await stateRes.json();
    const appTraffic = state.traffic[deployData.deployment.name];
    console.log(`Current Traffic for ${deployData.deployment.name}: ${appTraffic}`);
}

verifyScaling();
