import requests
import json

GEMINI_API_KEY = "AIzaSyAMR_bshx4QMupGNMD3mwnz1YZ1bnOven4"
url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={GEMINI_API_KEY}"

payload = {
  "instances": [
    {"prompt": "A cute orange cat"}
  ],
  "parameters": {
    "sampleCount": 1
  }
}

print(f"Making POST to {url}")
response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print("Success! Got predictions.")
else:
    print(response.text)
