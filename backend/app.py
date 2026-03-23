from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, requests
from ai_logic import analyze_sketch_with_gemini, generate_image_with_nano_banana
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

def get_supabase_headers():
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def get_supabase_write_headers():
    """Headers that bypass RLS for write operations (insert/update/delete)."""
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    if not url or not key:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        # Request sorted by created_at descending
        res = requests.get(f"{url}/rest/v1/sessions?select=id,name,created_at&order=created_at.desc", headers=get_supabase_headers())
        res.raise_for_status()
        return jsonify({"sessions": res.json()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    if not url or not key:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        res = requests.get(f"{url}/rest/v1/sessions?select=*&id=eq.{session_id}", headers=get_supabase_headers())
        res.raise_for_status()
        data = res.json()
        print(f"[LOAD] session_id={session_id}, found={len(data)} rows")
        if len(data) > 0:
            session = data[0]
            bd = session.get("board_data")
            # If board_data was stored as a JSON string, parse it back
            if isinstance(bd, str):
                try:
                    session["board_data"] = json.loads(bd)
                    print(f"[LOAD] Parsed board_data from string, elements={len(session['board_data'])}")
                except Exception:
                    session["board_data"] = []
            elif isinstance(bd, list):
                print(f"[LOAD] board_data is native list, elements={len(bd)}")
            else:
                print(f"[LOAD] board_data is {type(bd).__name__}: {bd}")
                session["board_data"] = []
            return jsonify({"session": session}), 200
        return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        print(f"[LOAD] Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions', methods=['POST'])
def save_session():
    if not url or not key:
        return jsonify({"error": "Supabase not configured"}), 500
    data = request.json
    session_id = data.get("id")
    board_data = data.get("board_data", [])
    name = data.get("name", "Untitled Board")

    print(f"[SAVE] id={session_id}, name={name}, elements={len(board_data) if isinstance(board_data, list) else 'N/A'}")

    h = get_supabase_headers()

    try:
        # Step 1: check if session exists
        check = requests.get(f"{url}/rest/v1/sessions?id=eq.{session_id}&select=id", headers=h)
        exists = check.ok and len(check.json()) > 0
        print(f"[SAVE] Session exists in DB: {exists}")

        payload = {"name": name, "board_data": board_data}

        if exists:
            # Step 2a: UPDATE via PATCH
            res = requests.patch(
                f"{url}/rest/v1/sessions?id=eq.{session_id}",
                headers=h,
                json=payload
            )
        else:
            # Step 2b: INSERT via POST
            payload["id"] = session_id
            res = requests.post(f"{url}/rest/v1/sessions", headers=h, json=payload)

        print(f"[SAVE] DB status={res.status_code}, body={res.text[:300]}")
        res.raise_for_status()

        # Step 3: re-fetch to confirm
        fetch = requests.get(f"{url}/rest/v1/sessions?id=eq.{session_id}&select=*", headers=h)
        saved_list = fetch.json()
        saved = saved_list[0] if saved_list else payload
        bd = saved.get("board_data")
        print(f"[SAVE] Confirmed elements saved: {len(bd) if isinstance(bd, list) else type(bd).__name__}")
        return jsonify({"session": saved}), 200

    except Exception as e:
        print(f"[SAVE] Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    if not url or not key:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        # Use basic headers without Prefer so we get 204 on success
        h = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        res = requests.delete(
            f"{url}/rest/v1/sessions?id=eq.{session_id}",
            headers=h
        )
        print(f"[DELETE] session_id={session_id}, status={res.status_code}, body={res.text[:200]}")
        # 204 = deleted, 200 = deleted with body — both are success
        if res.status_code in (200, 204):
            # Verify it's actually gone
            verify = requests.get(
                f"{url}/rest/v1/sessions?id=eq.{session_id}&select=id",
                headers=h
            )
            remaining = verify.json()
            print(f"[DELETE] Verification: {len(remaining)} rows remaining for this id")
            if remaining:
                # Row still exists — RLS is blocking delete
                # Try alternative: update a flag or return specific error
                print(f"[DELETE] WARNING: Row still exists after delete — RLS may be blocking")
                return jsonify({"error": "Delete blocked by database policy. Please disable RLS on sessions table in Supabase dashboard.", "rls_blocked": True}), 403
            return jsonify({"success": True}), 200
        res.raise_for_status()
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"[DELETE] Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    base64_image = data.get("image") # Expecting Base64 string
    
    if not base64_image:
        return jsonify({"error": "No image provided"}), 400

    if base64_image.startswith("data:image"):
        base64_image = base64_image.split(",")[1]

    try:
        description = analyze_sketch_with_gemini(base64_image)
        image_url = generate_image_with_nano_banana(description)
        return jsonify({"description": description, "image_url": image_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-image-from-text', methods=['POST'])
def generate_image_from_text():
    data = request.json
    prompt = data.get('text')
    if not prompt:
        return jsonify({"error": "No text prompt provided"}), 400
    
    try:
        image_url = generate_image_with_nano_banana(prompt)
        return jsonify({"image_url": image_url, "description": prompt}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
