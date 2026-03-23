# 🚀 NoteCraft AI

<div align="center">
  <h3>An intelligent, aesthetic, and highly interactive whiteboard workspace powered by AI</h3>
  <br />
</div>

## ✨ Overview

NoteCraft AI is a next-generation creative workspace built to enhance your brainstorming, teaching, and designing sessions. Featuring a stark, stunning **Yellow × Black × White** modern aesthetic, NoteCraft combines an infinite canvas with powerful AI tools, voice recognition, and real-time cloud saving.

### 🌟 Key Features

- **🎨 Infinite Creative Canvas**: Built on top of Excalidraw for butter-smooth drawing, diagramming, and mind-mapping.
- **🎙️ Voice-to-Text Integration**: Instantly capture your thoughts via spoken word and drop them onto the board.
- **✨ Magic Studio (Text-to-Texture)**: Generate and deploy custom textured assets and 3D typography straight to the canvas.
- **☁️ Cloud Sessions**: All your workspaces are securely saved and instantly retrievable via Supabase PostgreSQL.
- **🖼️ Web Assets**: Quickly pull and embed images and textures.
- **🪄 AI Pen**: Analyze your sketches and generate high-quality images directly from your doodles using Gemini AI.
- **⚡ Dark / Light Modes**: Flawless visual toggling between light aesthetics and an immersive dark mode workspace.


## 🛠️ Technology Stack

**Frontend**
- **React 18** + **Vite** for lightning-fast HMR and building.
- **Excalidraw API** for the core canvas engine.
- **Lucide React** for beautiful, consistent iconography.

**Backend & Database**
- **Python / Flask**: Handles API routing and AI agent coordination.
- **Supabase (PostgreSQL)**: Handles persistent `board_data` storage utilizing `jsonb` robust saving capabilities.
- **Google Gemini & Nano Banana API**: Powers the AI vision and image generation pipelines.


## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- A Supabase Project (with a `sessions` table containing `id`, `name`, `created_at`, and `board_data` columns)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhruv7noxa/NoteCraft-AI.git
   cd NoteCraft-AI
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   python -m venv venv
   # Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
   pip install -r requirements.txt
   ```
   *Create a `.env` file in the `backend` folder containing your `SUPABASE_URL`, `SUPABASE_KEY`, and `GEMINI_API_KEY`.*
   ```bash
   python app.py
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Launch**
   Open your browser and navigate to `http://localhost:5173`.


## 🎨 Design System
NoteCraft utilizes a distinct, high-contrast aesthetic:
- **Primary Color:** Custom Yellow (`#FFD600`)
- **Backgrounds:** Deep Black (`#0a0a0a`) & Crisp White (`#ffffff`)
- **Typography:** Space Grotesk & Space Mono 


## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/dhruv7noxa/NoteCraft-AI/issues).


## 📝 License
This project is open-source and available under the MIT License.
