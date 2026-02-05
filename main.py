from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
import os
import logging

# Conditional imports based on availability
try:
    from tavily import TavilyClient
    tavily_available = True
except ImportError:
    tavily_available = False

try:
    from groq import Groq
    groq_available = True
except ImportError:
    groq_available = False

try:
    from prometheus_client import Gauge, generate_latest, REGISTRY
    prometheus_available = True
except ImportError:
    prometheus_available = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="KubeScaleAI Predictor", version="1.0.0")

# Initialize Prometheus metrics if available
if prometheus_available:
    predicted_users_gauge = Gauge(
        'predicted_users_total',
        'Predicted total users for deployment',
        ['deployment']
    )
    prediction_latency_gauge = Gauge(
        'prediction_latency_seconds',
        'Latency of prediction request',
        ['deployment']
    )

# Initialize clients
tavily_client = None
groq_client = None

if tavily_available:
    tavily_api_key = os.getenv("TAVILY_API_KEY", "")
    if tavily_api_key:
        try:
            tavily_client = TavilyClient(api_key=tavily_api_key)
            logger.info("Tavily client initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Tavily: {e}")

if groq_available:
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if groq_api_key:
        try:
            groq_client = Groq(api_key=groq_api_key)
            logger.info("Groq client initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Groq: {e}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "KubeScaleAI Predictor",
        "version": "1.0.0",
        "tavily_enabled": tavily_available and tavily_client is not None,
        "groq_enabled": groq_available and groq_client is not None,
        "metrics_enabled": prometheus_available
    }


@app.get("/predict")
async def predict(url: str, deployment: str = "kubescaleai"):
    """
    Predict future user count based on current traffic analysis.
    
    Args:
        url: The URL to analyze for traffic
        deployment: Kubernetes deployment name for metrics labeling
    
    Returns:
        Prediction result with estimated user count and confidence
    """
    import time
    start_time = time.time()
    
    try:
        predicted_users = 0
        confidence = 0.5
        reasoning = ""
        
        # Step 1: Get real-time traffic data via Tavily (if available)
        if tavily_client:
            try:
                search_query = f"current visitors traffic {url}"
                search_results = tavily_client.search(query=search_query)
                
                if search_results and 'results' in search_results and len(search_results['results']) > 0:
                    content = search_results['results'][0].get('content', '')
                    logger.info(f"Tavily search result for {url}: {content[:100]}...")
                    reasoning += f"Real-time data: {content[:200]}. "
            except Exception as e:
                logger.error(f"Tavily search failed: {e}")
                reasoning += f"Real-time search unavailable: {str(e)}. "
        
        # Step 2: Use Groq for intelligent prediction (if available)
        if groq_client:
            try:
                prompt = f"""Based on the following traffic information for {url}:
                {reasoning if reasoning else 'No real-time data available'}
                
                Predict the next hour's concurrent user count. Respond with ONLY a number (integer) representing estimated users.
                Consider growth trends, time of day, and typical patterns. Return a realistic estimate between 1 and 10000."""
                
                response = groq_client.chat.completions.create(
                    model="llama-3.1-70b-versatile",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=50,
                    temperature=0.3
                )
                
                # Parse the response
                predicted_str = response.choices[0].message.content.strip()
                try:
                    predicted_users = int(''.join(filter(str.isdigit, predicted_str.split()[0])))
                    predicted_users = max(1, min(10000, predicted_users))  # Clamp to reasonable range
                    confidence = 0.85
                    logger.info(f"Groq prediction for {url}: {predicted_users} users")
                except (ValueError, IndexError):
                    predicted_users = 100  # Default fallback
                    confidence = 0.3
                    logger.warning(f"Could not parse Groq response: {predicted_str}")
            except Exception as e:
                logger.error(f"Groq prediction failed: {e}")
                predicted_users = 50  # Fallback to minimal estimate
                confidence = 0.2
                reasoning += f"Prediction failed: {str(e)}"
        else:
            # Fallback prediction without AI
            predicted_users = 50
            confidence = 0.2
            reasoning += "AI prediction unavailable. Using default estimate."
        
        # Update Prometheus metrics
        if prometheus_available:
            predicted_users_gauge.labels(deployment=deployment).set(predicted_users)
            latency = time.time() - start_time
            prediction_latency_gauge.labels(deployment=deployment).set(latency)
        
        return {
            "url": url,
            "predicted_users": predicted_users,
            "confidence": confidence,
            "deployment": deployment,
            "timestamp": time.time(),
            "reasoning": reasoning.strip()
        }
    
    except Exception as e:
        logger.error(f"Prediction endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    if not prometheus_available:
        raise HTTPException(
            status_code=503,
            detail="Prometheus metrics not available"
        )
    
    return Response(
        content=generate_latest(REGISTRY),
        media_type="text/plain; charset=utf-8"
    )


@app.get("/health")
async def health():
    """Kubernetes health check endpoint"""
    return {
        "status": "healthy",
        "ready": tavily_client is not None and groq_client is not None
    }


@app.post("/predict/batch")
async def predict_batch(requests: list):
    """
    Batch prediction endpoint for multiple URLs
    
    Args:
        requests: List of {"url": "...", "deployment": "..."} objects
    
    Returns:
        List of predictions
    """
    predictions = []
    for req in requests:
        result = await predict(req.get("url", ""), req.get("deployment", "kubescaleai"))
        predictions.append(result)
    return {"predictions": predictions, "count": len(predictions)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
