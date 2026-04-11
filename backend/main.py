import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Dict, Any

from agents import run_pipeline
from sentiment_engine import analyze_osint_sentiment

# Load .env for local dev; on Render, env vars are set in the dashboard
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
print(f"Looking for .env at: {env_path}")
print(f".env exists: {os.path.exists(env_path)}")
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path, override=True)
    print(f".env loaded successfully")
    
# Debug: Check if RESEND_API_KEY is loaded
resend_key = os.getenv("RESEND_API_KEY")
print(f"RESEND_API_KEY found: {bool(resend_key)}")
if resend_key:
    print(f"RESEND_API_KEY starts with: {resend_key[:10]}...")

app = FastAPI(title="Conflict Intelligence System API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    currentBrief: Dict[str, Any]

@app.websocket("/api/pipeline/stream")
async def pipeline_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        # Receive the initial topic/query from frontend
        data = await websocket.receive_text()
        request_data = json.loads(data)
        topic = request_data.get("topic", "")
        
        # Execute the pipeline and pass a callback to stream progress
        async def progress_callback(agent_id: int, status: str, elapsed: int = 0, result: Any = None):
            await websocket.send_json({
                "type": "progress",
                "agent_id": agent_id,
                "status": status,
                "elapsed": elapsed,
                "result": result
            })

        final_brief = await run_pipeline(topic, progress_callback)
        
        # Send final completion
        await websocket.send_json({
            "type": "complete",
            "brief": final_brief
        })
        
    except WebSocketDisconnect:
        print("Frontend disconnected from WebSocket.")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})

class SentimentRequest(BaseModel):
    topic: str
    osint_data: Dict[str, Any] = None

@app.post("/api/chat")
async def chat_interaction(request: ChatRequest):
    # Route chat requests to Anthropic / Groq
    pass

@app.post("/api/sentiment/analyze")
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of OSINT data"""
    try:
        # If no OSINT data provided, run a quick pipeline to get it
        if not request.osint_data:
            # Create a simple progress callback that doesn't stream
            async def dummy_callback(agent_id, status, elapsed=0, result=None):
                pass
            
            osint_result = await run_pipeline(request.topic, dummy_callback)
        else:
            osint_result = request.osint_data
        
        # Analyze sentiment
        sentiment_result = await analyze_osint_sentiment(osint_result)
        
        return {
            "success": True,
            "data": sentiment_result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/sentiment/status")
async def sentiment_status():
    """Check sentiment engine status"""
    try:
        from sentiment_engine import sentiment_engine
        return {
            "status": "active",
            "models": {
                "vader": sentiment_engine.vader_analyzer is not None,
                "textblob": True  # TextBlob is always available if import succeeded
            },
            "history_count": len(sentiment_engine.sentiment_history)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
