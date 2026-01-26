<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KubeScale AI - Predictive Kubernetes Orchestrator

KubeScale AI is a **Predictive Auto-Scaling Dashboard** that uses **Groq (Llama 3)** and **Tavily (Real-Time Search)** to forecast web traffic and provision Kubernetes pods *before* demand spikes. Unlike reactive scaling, this tool analyzes real-time internet trends (news, outages, sales) to ensure zero downtime and optimal resource usage.

## Features

- **Real-Time Traffic Analysis**: Integrates **Tavily Search API** to fetch live data about a specific URL (outages, trending news, sales).
- **Predictive Scaling**: LLM-based reasoning (Llama 3) uses this real-time data to forecast concurrent users.
- **Proactive Scaling Simulation**: Automatically calculates and visualizes required pod counts ahead of time.
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
   GROQ_API_KEY=gsk_your_groq_api_key_here
   TAVILY_API_KEY=tvly-your_tavily_api_key_here
   ```
   > - Get a free Groq API key from the [Groq Console](https://console.groq.com/).
   > - Get a free Tavily API key from [Tavily AI](https://tavily.com/).

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:3000` to access the dashboard.
