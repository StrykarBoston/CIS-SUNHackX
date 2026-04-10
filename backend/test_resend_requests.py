import os
import requests
from dotenv import load_dotenv

load_dotenv('../.env')

api_key = os.getenv("RESEND_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'} (length: {len(api_key) if api_key else 0})")

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "from": "onboarding@resend.dev",
    "to": "vedantsangamnere556@gmail.com",
    "subject": "🚨 Test Email from script",
    "text": "This is a test."
}

try:
    resp = requests.post("https://api.resend.com/emails", json=payload, headers=headers)
    print("Status:", resp.status_code)
    try:
        print("JSON:", resp.json())
    except:
        print("Text:", resp.text)
except Exception as e:
    print("Exception:", str(e))
