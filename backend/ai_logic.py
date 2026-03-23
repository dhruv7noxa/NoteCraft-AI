import os
import requests

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

def analyze_sketch_with_gemini(base64_image: str) -> str:
    """Uses Gemini 2.5 Flash to describe the base64 sketch via REST API"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": "Describe this simple sketch in one sentence for an image generator (e.g., 'A cute orange cat')."},
                {"inline_data": {
                    "mime_type": "image/png",
                    "data": base64_image
                }}
            ]
        }]
    }
    
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    response.raise_for_status()
    
    data = response.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        return "An abstract whiteboard sketch."

def generate_image_with_nano_banana(description: str) -> str:
    """
    Generates a literal image by asking Gemini 2.5 Flash to write beautiful SVG code, 
    completely eliminating the need for third-party flaky free image generators.
    """
    import base64
    import requests
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    # Much more descriptive prompt for higher artistic quality
    prompt = (
        f"You are a master vector illustrator and graphic designer. "
        f"Create a stunning, professional, and highly detailed SVG illustration of: '{description}'. "
        f"Design Guidelines:\n"
        f"- Use vibrant, harmonious color palettes.\n"
        f"- Incorporate beautiful linear and radial gradients for depth.\n"
        f"- Use clean, smooth Bézier curves and modern geometric shapes.\n"
        f"- Add subtle shadows or highlights to create a 3D layered effect.\n"
        f"- Ensure the composition is balanced and centered.\n"
        f"- Return ONLY the raw valid <svg>...</svg> code. Do not include markdown code blocks, titles, or descriptions."
    )
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4}
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        data = response.json()
        svg_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Cleanup markdown if output by the AI
        if svg_text.startswith("```"):
            svg_text = svg_text.split("```", 1)[-1]
            if "\n" in svg_text:
                first_line = svg_text.split("\n")[0]
                if first_line.strip().lower() in ["svg", "xml"]:
                    svg_text = svg_text[len(first_line)+1:]
        if svg_text.endswith("```"):
            svg_text = svg_text[:-3]
            
        svg_text = svg_text.strip()
        
        # Encode as a data URI so the frontend can drop it straight into the <img> tag
        encoded_svg = base64.b64encode(svg_text.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{encoded_svg}"
        
    except Exception as e:
        print(f"SVG Generation Failed: {e}")
        # Extreme fallback
        fallback = f'<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#4b5563">Failed to load API Image</text></svg>'
        return f"data:image/svg+xml;base64,{base64.b64encode(fallback.encode('utf-8')).decode('utf-8')}"
