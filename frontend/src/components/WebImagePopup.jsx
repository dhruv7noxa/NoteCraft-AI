import React, { useState } from 'react';
import { X, Globe, Image as ImageIcon, Search } from 'lucide-react';

const WebImagePopup = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      // Use Wikipedia's public completely free API for high-quality open-source thumbnails
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=pageimages&format=json&pithumbsize=400&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.query && data.query.pages) {
        const fetchedImages = Object.values(data.query.pages)
          .filter(p => p.thumbnail)
          .map(p => ({
            id: p.pageid,
            url: p.thumbnail.source,
            title: p.title
          }));
        setImages(fetchedImages);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to search web images.");
    } finally {
      setLoading(false);
    }
  };

  const copyImage = async (imgUrl) => {
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white"; // Add white background to be safe
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(async (pngBlob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            alert("✅ Image Copied! Close and press Ctrl+V on the board.");
          } catch(err) {
            console.error(err);
            alert("Clipboard permission denied in your browser. Try dragging the image to the board instead.");
          }
          URL.revokeObjectURL(objectUrl);
        }, 'image/png');
      };
      
      img.onerror = () => {
         alert("Failed to process image for copying. Try dragging it to the board.");
      };
    } catch(err) {
      console.error(err);
      alert("Failed to fetch image. Try dragging it directly to the board.");
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '16px', width: '700px', maxWidth: '95%', maxHeight: '90vh', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative', display: 'flex', flexDirection: 'column' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={24} />
        </button>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#059669' }}>
          <Globe /> Web Images
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '20px' }}>
          Search for completely free, open-source images from the web.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search dogs, mountains, history..."
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
          />
          <button onClick={handleSearch} className="btn-primary" disabled={loading} style={{ padding: '0 20px', background: '#059669' }}>
            {loading ? "Searching..." : <Search size={20} />}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#f3f4f6', borderRadius: '8px', padding: '15px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>Gathering web images...</p>
          ) : hasSearched && images.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '20px' }}>No images found. Try a different search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {images.map(img => (
                <div key={img.id} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '150px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      draggable="true"
                    />
                  </div>
                  <button 
                    onClick={() => copyImage(img.url)}
                    style={{ background: '#f8fafc', border: 'none', borderTop: '1px solid #e5e7eb', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem', color: '#4f46e5' }}
                  >
                    <ImageIcon size={14} /> Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebImagePopup;
