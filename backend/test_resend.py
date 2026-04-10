import os
import resend
from dotenv import load_dotenv

load_dotenv('../.env')

api_key = os.getenv("RESEND_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'} (length: {len(api_key) if api_key else 0})")

resend.api_key = api_key

try:
    response = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "vedantsangamnere556@gmail.com",
        "subject": "🚨 Test Email from script",
        "text": "This is a test."
    })
    print("Success! Response:", response)
except Exception as e:
    print("Error:", str(e))
