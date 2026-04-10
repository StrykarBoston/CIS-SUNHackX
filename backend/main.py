import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Dict, Any

from agents import run_pipeline

load_dotenv()

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

@app.post("/api/chat")
async def chat_interaction(request: ChatRequest):
    # Route chat requests to Anthropic / Groq
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
