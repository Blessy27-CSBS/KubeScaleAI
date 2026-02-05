<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KubeScale AI - Predictive Kubernetes Orchestrator

KubeScale AI is a **Predictive Auto-Scaling & Deployment Platform** designed for startups. It uses **Groq (Llama 3)** and **Tavily (Real-Time Search)** to forecast traffic and provision resources *only when needed*. 

**Why KubeScale?** Unlike AWS or Azure which charge for idle servers, KubeScale offers **Scale-to-Zero** deployment. If no one is using your app, you pay $0. We analyze real-time internet trends to wake up your infrastructure *before* the first user arrives.

## Features

- **One-Click Deployment**: Deploy from GitHub in seconds. No complex AWS/Azure configuration required.
- **Scale-to-Zero**: Automatically scales down to 0 pods when traffic is low, saving ~80% on cloud bills.
- **Real-Time Traffic Analysis**: Integrates **Tavily Search API** to fetch live data about a specific URL (outages, trending news, sales).
- **Predictive Scaling**: LLM-based reasoning (Llama 3) uses real-time data to forecast concurrent users.
- **AI SRE Assistant (Nova AI)**: An integrated chatbot that explains scaling decisions and offers infrastructure advice.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **AI Engine**: Groq SDK (Llama-3.3-70b-versatile)
- **Real-Time Data**: Tavily Search API
- **Styling**: Tailwind CSS (custom design system)
- **Visualization**: Recharts

## Run Locally

**Prerequisites:**  Node.js 18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create or update the `.env.local` file in the root directory and add your API keys:
   ```env
   VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
   VITE_TAVILY_API_KEY=tvly-your_tavily_api_key_here
   ```
   > - Get a free Groq API key from the [Groq Console](https://console.groq.com/).
   > - Get a free Tavily API key from [Tavily AI](https://tavily.com/).

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:3000` to access the dashboard.

## Infrastructure Integration
KubeScale is cloud-native ready. You can run it with Docker or deploy to Kubernetes.

### Local Docker (Recommended for Testing)
Run the full stack (Frontend + Backend) locally with one command:
```bash
docker-compose up --build
```

### Kubernetes Deployment
Deploy the backend to any Kubernetes cluster (Minikube, EKS, etc.):
```bash
kubectl apply -f k8s/
```
