import React, { useState } from 'react';
import { X, Type, Image as ImageIcon } from 'lucide-react';

const AITextToImagePopup = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a description!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://notecraft-backend-vpad.onrender.com/api/generate-image-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt })
      });
      const data = await response.json();
      
      if (data.image_url) {
        setResultImage(data.image_url);
      } else {
        alert("Failed to generate: " + (data.error || "Unknown Error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error calling AI generation.");
    } finally {
      setLoading(false);
    }
  };

  const copyImage = async () => {
    try {
      const img = new Image();
      img.src = resultImage;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 800, 800);
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert("✅ Image Copied! \n\nClose this popup, click anywhere on your board, and press Ctrl+V (or Cmd+V) to paste your masterpiece!");
          } catch(err) {
            console.error(err);
            alert("Clipboard permission denied. Right click the image and copy it manually.");
          }
        }, 'image/png');
      };
    } catch (err) {
      console.error(err);
      alert("Failed to process image.");
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '16px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={24} />
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#4f46e5' }}>
          <Type /> AI Image
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
          Generate a detailed SVG vector image from text.
        </p>

        {!resultImage ? (
          <div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A cute baby elephant sitting on a rainbow..."
              style={{ width: '90%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', fontFamily: 'inherit', resize: 'none' }}
            />
            <button onClick={handleGenerate} className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
              {loading ? "Generating Image..." : "Generate AI Image"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ margin: '16px 0', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={resultImage} alt="AI Generated" style={{ width: '100%', display: 'block' }} />
            </div>
            
            <button onClick={copyImage} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6' }}>
              <ImageIcon size={18} /> Copy Image to Clipboard
            </button>

            <button onClick={() => { setResultImage(null); setPrompt(''); }} style={{ width: '100%', padding: '12px', marginTop: '10px', background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}>
              Generate Another
            </button>

            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITextToImagePopup;
