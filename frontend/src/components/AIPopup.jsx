import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { exportToBlob } from '@excalidraw/excalidraw';

const AIPopup = ({ isOpen, onClose, elements, appState, files }) => {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    // Determine which elements the user actually highlighted/selected
    const selectedIds = appState?.selectedElementIds || {};
    const selectedElements = elements?.filter(el => selectedIds[el.id]) || [];
    
    // If they selected specific things, only export those. Otherwise fallback to everything.
    const targetElements = selectedElements.length > 0 ? selectedElements : elements;

    if (!targetElements || targetElements.length === 0) {
      alert("Draw or select something first!");
      return;
    }
    
    setLoading(true);
    try {
      // Export only the target elements to Blob, cropping the image tightly
      const blob = await exportToBlob({
        elements: targetElements,
        mimeType: "image/png",
        appState: { ...appState, exportBackground: true },
        files
      });

      // Convert Blob to Base64
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Send to Backend
      const response = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await response.json();
      
      if (data.image_url) {
        setResultImage(data.image_url);
        setDescription(data.description);
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
        // Excalidraw requires a proper background, avoid transparent SVG issues
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
          <Sparkles /> AI Pen
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
          Turn your sketches into high-quality images using Gemini 3 & Nano Banana 2.
        </p>

        {!resultImage ? (
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleGenerate} className="btn-primary" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
              {loading ? "Analyzing Sketch & Generating..." : "Generate from Board"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', color: '#6b7280', fontSize: '0.9rem' }}>
              Detected prompt: "{description}"
            </p>
            <div style={{ margin: '16px 0', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={resultImage} alt="AI Generated" style={{ width: '100%', display: 'block' }} />
            </div>
            
            <button onClick={copyImage} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6' }}>
              <ImageIcon size={18} /> Copy Image to Clipboard
            </button>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>
              Then click on the board and press Ctrl+V
            </p>

            <button onClick={() => { setResultImage(null); onClose(); }} className="btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPopup;
