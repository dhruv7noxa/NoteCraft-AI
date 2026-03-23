import requests
import json
import urllib.parse
import base64

GEMINI_API_KEY = "AIzaSyAMR_bshx4QMupGNMD3mwnz1YZ1bnOven4"
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

payload = {
    "contents": [{
        "parts": [
            {"text": "You are an expert graphic designer. Create a beautiful, colorful, highly detailed SVG illustration of: 'A cute butterfly'. Return ONLY the raw <svg>...</svg> code without any markdown formatting or tick marks."}
        ]
    }],
    "generationConfig": {
        "temperature": 0.4
    }
}

response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
if response.status_code == 200:
    data = response.json()
    svg_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    # Strip markdown if present
    if svg_text.startswith("```"):
        svg_text = svg_text.split("```")[1]
        if svg_text.startswith("svg"):
            svg_text = svg_text[3:]
    if svg_text.startswith("```"):
        svg_text = svg_text[:-3]
    
    print("SUCCESS, SVG length:", len(svg_text))
    print(svg_text[:100])
else:
    print(response.text)
