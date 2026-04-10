import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/api/pipeline/stream"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket.")
            await websocket.send(json.dumps({"topic": "Test Conflict"}))
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                print(f"Received: {data['type']} - {data.get('agent_id')} - {data.get('status')}")
                if data['type'] == 'complete' or data['type'] == 'error':
                    break
    except Exception as e:
        print(f"Test failed: {e}")

asyncio.run(test_ws())
