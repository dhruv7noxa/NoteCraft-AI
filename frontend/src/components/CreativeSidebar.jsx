import React, { useState } from 'react';
import { X, Palette, Brush, Type, Wand2, ChevronLeft, Zap, Sparkles, Rocket } from 'lucide-react';

// picsum.photos seed URLs — 100% reliable, always return an image
const getPicsumUrl = (seed) => `https://picsum.photos/seed/${seed}/400/300`;

const TEXTURE_GROUPS = {
  "METALLIC": [
    { name: "Gold",     url: getPicsumUrl("gold-texture") },
    { name: "Silver",   url: getPicsumUrl("silver-metal") },
    { name: "Copper",   url: getPicsumUrl("copper-metal") },
    { name: "Chrome",   url: getPicsumUrl("chrome-shiny") },
    { name: "Steel",    url: getPicsumUrl("steel-dark") },
    { name: "Mercury",  url: getPicsumUrl("mercury-liquid") },
    { name: "Brass",    url: getPicsumUrl("brass-metal") },
    { name: "Iron",     url: getPicsumUrl("iron-rough") },
    { name: "Bronze",   url: getPicsumUrl("bronze-aged") },
    { name: "Rose",     url: getPicsumUrl("rose-gold") },
  ],
  "NATURE": [
    { name: "Marble",   url: getPicsumUrl("marble-white") },
    { name: "Ocean",    url: getPicsumUrl("ocean-waves") },
    { name: "Lava",     url: getPicsumUrl("lava-red") },
    { name: "Ice",      url: getPicsumUrl("ice-crystal") },
    { name: "Forest",   url: getPicsumUrl("forest-green") },
    { name: "Sand",     url: getPicsumUrl("desert-sand") },
    { name: "Moss",     url: getPicsumUrl("moss-green") },
    { name: "Fire",     url: getPicsumUrl("fire-flames") },
    { name: "Rock",     url: getPicsumUrl("rock-stone") },
    { name: "Sky",      url: getPicsumUrl("sky-clouds") },
  ],
  "ABSTRACT": [
    { name: "Nebula",    url: getPicsumUrl("nebula-space") },
    { name: "Prism",     url: getPicsumUrl("prism-rainbow") },
    { name: "Glitch",    url: getPicsumUrl("glitch-digital") },
    { name: "Splatter",  url: getPicsumUrl("paint-splatter") },
    { name: "Ink",       url: getPicsumUrl("ink-watercolor") },
    { name: "Halo",      url: getPicsumUrl("halo-light") },
    { name: "Noise",     url: getPicsumUrl("noise-grain") },
    { name: "Neon",      url: getPicsumUrl("neon-lights") },
    { name: "Vortex",    url: getPicsumUrl("vortex-spiral") },
    { name: "Cloud",     url: getPicsumUrl("cloud-sky") },
  ],
  "MATERIAL": [
    { name: "Leather",   url: getPicsumUrl("leather-brown") },
    { name: "Denim",     url: getPicsumUrl("denim-jeans") },
    { name: "Carbon",    url: getPicsumUrl("carbon-fiber") },
    { name: "Paper",     url: getPicsumUrl("paper-texture") },
    { name: "Concrete",  url: getPicsumUrl("concrete-wall") },
    { name: "Wood",      url: getPicsumUrl("wood-plank") },
    { name: "Rust",      url: getPicsumUrl("rust-metal") },
    { name: "Circuit",   url: getPicsumUrl("circuit-board") },
    { name: "Woven",     url: getPicsumUrl("woven-fabric") },
    { name: "Wool",      url: getPicsumUrl("wool-knit") },
  ],
  "JEWELS": [
    { name: "Emerald",   url: getPicsumUrl("emerald-gem") },
    { name: "Ruby",      url: getPicsumUrl("ruby-red") },
    { name: "Sapphire",  url: getPicsumUrl("sapphire-blue") },
    { name: "Amethyst",  url: getPicsumUrl("amethyst-purple") },
    { name: "Diamond",   url: getPicsumUrl("diamond-crystal") },
    { name: "Pearl",     url: getPicsumUrl("pearl-white") },
    { name: "Jade",      url: getPicsumUrl("jade-green") },
    { name: "Opal",      url: getPicsumUrl("opal-iridescent") },
    { name: "Topaz",     url: getPicsumUrl("topaz-yellow") },
    { name: "Crystal",   url: getPicsumUrl("crystal-clear") },
  ]
};

const TEXTURES = Object.values(TEXTURE_GROUPS).flat();


const FONTS = [
  { name: 'Serif', family: '"Times New Roman", serif', style: 'italic' },
  { name: 'Modern', family: '"Inter", sans-serif', style: 'bold' },
  { name: 'Script', family: '"Brush Script MT", cursive', style: 'normal' },
  { name: 'Mono', family: '"Courier New", monospace', style: 'bold' }
];

const BRUSH_PRESETS = [
  { name: 'Architect', roughness: 0, strokeWidth: 2, strokeSharpness: 'sharp' },
  { name: 'Sketchy', roughness: 2, strokeWidth: 1, strokeSharpness: 'round' },
  { name: 'Cartoon', roughness: 1, strokeWidth: 4, strokeSharpness: 'round' },
  { name: 'Marker', roughness: 0, strokeWidth: 12, strokeSharpness: 'sharp' }
];

const SWATCHES = [
  '#000000', '#4b5563', '#94a3b8', '#ffffff', // Monochromes
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', // Warm/Bright
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', // Cool/Vibrant
  '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', // Pink/Purples
  '#ffedd5', '#dcfce7', '#dbeafe', '#f3e8ff', // Pastels
  '#451a03', '#064e3b', '#1e3a8a', '#4c1d95'  // Deep/Dark
];

const CreativeSidebar = ({ isOpen, onClose, excalidrawAPI }) => {
  const [activeTab, setActiveTab] = useState('magic');
  const [text, setText] = useState('NoteCraft');
  const [selectedTexture, setSelectedTexture] = useState(TEXTURES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[1]);
  const [generating, setGenerating] = useState(false);
  const [showAllTextures, setShowAllTextures] = useState(false);

  const handleApplyBrush = (preset) => {
    if (!excalidrawAPI) return;
    excalidrawAPI.updateScene({
      appState: {
        currentItemStrokeWidth: preset.strokeWidth,
        currentItemRoughness: preset.roughness,
        currentItemStrokeSharpness: preset.strokeSharpness
      }
    });
  };

  const handleApplyColor = (color, type) => {
    if (!excalidrawAPI) return;
    if (type === 'stroke') {
      excalidrawAPI.updateScene({ appState: { currentItemStrokeColor: color } });
    } else {
      excalidrawAPI.updateScene({ appState: { currentItemBackgroundColor: color } });
    }
  };

  const handleSyncTexture = (texture) => {
    setSelectedTexture(texture);
  };

  // Gradient fallback colors based on texture category
  const buildFallbackGradient = (ctx, canvas) => {
    const name = selectedTexture?.name?.toLowerCase() || '';
    let colors = ['#1a1a2e', '#16213e'];
    if (['gold','rose','copper','bronze','brass'].some(k => name.includes(k))) colors = ['#b8860b','#ffd700','#b8860b'];
    else if (['silver','chrome','steel','mercury','iron','platinum'].some(k => name.includes(k))) colors = ['#708090','#c0c0c0','#708090'];
    else if (['ocean','sky','cloud','sapphire','ice'].some(k => name.includes(k))) colors = ['#0077b6','#90e0ef'];
    else if (['fire','lava','ruby','rust'].some(k => name.includes(k))) colors = ['#9d0208','#e85d04','#f48c06'];
    else if (['forest','moss','jade','emerald'].some(k => name.includes(k))) colors = ['#1b4332','#52b788'];
    else if (['nebula','neon','amethyst','opal'].some(k => name.includes(k))) colors = ['#240046','#7b2ff7','#f72585'];
    else if (['marble','crystal','pearl','diamond'].some(k => name.includes(k))) colors = ['#dee2e6','#adb5bd','#6c757d'];
    else if (['leather','wood','wool','denim'].some(k => name.includes(k))) colors = ['#6b4226','#a0522d'];
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
    return grad;
  };

  const handleGenerateAsset = () => {
    if (!selectedTexture || !excalidrawAPI) return;
    setGenerating(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 300;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedTexture.url;

    const renderTextOnCanvas = (textureImg) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        if (textureImg) {
          const pattern = ctx.createPattern(textureImg, 'repeat');
          if (pattern) ctx.fillStyle = pattern;
          else ctx.fillStyle = buildFallbackGradient(ctx, canvas);
        } else {
          ctx.fillStyle = buildFallbackGradient(ctx, canvas);
        }
      } catch (e) {
        // CORS-tainted canvas — use gradient fallback
        ctx.fillStyle = buildFallbackGradient(ctx, canvas);
      }

      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.font = `${selectedFont.style} 180px ${selectedFont.family}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text || 'NoteCraft', 0, 0);
      ctx.restore();

      try {
        return canvas.toDataURL('image/png');
      } catch (e) {
        // If canvas is tainted, generate a pure gradient version
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = buildFallbackGradient(ctx, canvas);
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 20;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.font = `${selectedFont.style} 180px ${selectedFont.family}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text || 'NoteCraft', 0, 0);
        ctx.restore();
        return canvas.toDataURL('image/png');
      }
    };

    img.onload = () => {
      console.log("Texture loaded:", selectedTexture.name);
      const dataUrl = renderTextOnCanvas(img);
      deployImageToExcalidraw(dataUrl);
    };

    img.onerror = () => {
      console.warn("Texture image failed to load, using gradient fallback.");
      const dataUrl = renderTextOnCanvas(null);
      deployImageToExcalidraw(dataUrl, true);
    };

    const deployImageToExcalidraw = (dataUrl, isFallback = false) => {
      const fileId = window.crypto.randomUUID().replace(/-/g, '');
      const elementId = window.crypto.randomUUID().replace(/-/g, '');

      // Step 1: Register the image file with Excalidraw
      excalidrawAPI.addFiles([{
        id: fileId,
        mimeType: 'image/png',
        dataURL: dataUrl,
        created: Date.now(),
        lastRetrieved: Date.now(),
      }]);

      // Step 2: Calculate viewport-centered position
      const appState = excalidrawAPI.getAppState();
      const zoom = appState.zoom?.value ?? 1;
      const scrollX = appState.scrollX ?? 0;
      const scrollY = appState.scrollY ?? 0;
      const viewW = appState.width ?? window.innerWidth;
      const viewH = appState.height ?? window.innerHeight;
      const x = (viewW / 2 - scrollX) / zoom - 400;
      const y = (viewH / 2 - scrollY) / zoom - 120;

      // Step 3: Wait for file to register, then inject the element
      setTimeout(() => {
        try {
          excalidrawAPI.updateScene({
            elements: [
              ...excalidrawAPI.getSceneElements(),
              {
                id: elementId,
                type: 'image',
                fileId: fileId,
                status: 'saved',
                x,
                y,
                width: 800,
                height: 240,
                angle: 0,
                strokeColor: 'transparent',
                backgroundColor: 'transparent',
                fillStyle: 'solid',
                strokeWidth: 1,
                strokeStyle: 'solid',
                roughness: 0,
                opacity: 100,
                groupIds: [],
                frameId: null,
                roundness: null,
                boundElements: null,
                link: null,
                locked: false,
                updated: Date.now(),
                isDeleted: false,
                version: 1,
                versionNonce: Math.floor(Math.random() * 2147483647),
                seed: Math.floor(Math.random() * 2147483647),
                scale: [1, 1],
              }
            ]
          });
          setGenerating(false);
          if (isFallback) {
            alert(`✨ "${text}" placed on canvas (with solid color — texture image failed to load).`);
          } else {
            alert(`✨ Texture text "${text}" deployed on canvas!`);
          }
        } catch (err) {
          // Fallback: download as PNG if Excalidraw API fails
          console.error('Canvas injection failed, downloading PNG:', err);
          const link = document.createElement('a');
          link.download = `NoteCraft-${text}.png`;
          link.href = dataUrl;
          link.click();
          setGenerating(false);
          alert(`✨ Downloaded "${text}" as PNG. Drag it onto the canvas!`);
        }
      }, 300);
    };
  };


  return (
    <div
      style={{
        position: 'absolute', top: 0, right: isOpen ? 0 : '-400px',
        width: '380px', height: '100%',
        background: 'var(--bg-primary)',
        borderLeft: '1.5px solid var(--border-color)',
        zIndex: 1000,
        transition: 'right 0.35s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.12)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1.5px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#FFD600',
            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={13} color="#0a0a0a" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Creative Studio
            </p>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              NoteCraft
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '32px', height: '32px', border: '1.5px solid var(--border-color)',
            borderRadius: '6px', background: 'var(--bg-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1,
            transition: 'all 0.15s ease', fontFamily: 'inherit'
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#FFD600'; e.currentTarget.style.color = '#0a0a0a'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', padding: '12px 16px',
        gap: '6px', borderBottom: '1.5px solid var(--border-color)',
        flexShrink: 0,
      }}>
        {[
          { id: 'magic',   label: 'MAGIC',   icon: <Sparkles size={14} /> },
          { id: 'brushes', label: 'DRAW',    icon: <Brush size={14} /> },
          { id: 'colors',  label: 'PALETTE', icon: <Palette size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 6px',
              border: activeTab === tab.id ? '1.5px solid #FFD600' : '1.5px solid var(--border-color)',
              borderRadius: '6px',
              background: activeTab === tab.id ? '#FFD600' : 'var(--bg-secondary)',
              color: activeTab === tab.id ? '#0a0a0a' : 'var(--text-secondary)',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px', transition: 'all 0.15s ease',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* ── MAGIC TAB ── */}
        {activeTab === 'magic' && (
          <div className="animate-soft">
            {/* Text input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '6px' }}>
                Text
              </label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="NoteCraft..."
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid var(--border-color)', borderRadius: '6px',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '0.95rem', fontWeight: 600, outline: 'none',
                  fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#FFD600'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Font selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '6px' }}>
                Font Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {FONTS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f)}
                    style={{
                      padding: '8px 4px',
                      border: selectedFont.name === f.name ? '1.5px solid #FFD600' : '1.5px solid var(--border-color)',
                      borderRadius: '6px',
                      background: selectedFont.name === f.name ? '#FFD600' : 'var(--bg-secondary)',
                      color: selectedFont.name === f.name ? '#0a0a0a' : 'var(--text-secondary)',
                      fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Deploy button */}
            <button
              onClick={handleGenerateAsset}
              disabled={generating}
              style={{
                width: '100%', padding: '13px',
                background: generating ? 'var(--bg-card)' : '#0a0a0a',
                color: generating ? 'var(--text-muted)' : '#FFD600',
                border: 'none', borderRadius: '6px',
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '20px',
              }}
              onMouseOver={e => { if(!generating) e.currentTarget.style.background = '#FFD600'; if(!generating) e.currentTarget.style.color = '#0a0a0a'; }}
              onMouseOut={e => { if(!generating) e.currentTarget.style.background = '#0a0a0a'; if(!generating) e.currentTarget.style.color = '#FFD600'; }}
            >
              <Zap size={15} />
              {generating ? 'Generating...' : 'Deploy Texture Text'}
            </button>

            {/* Texture Library */}
            <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Texture Library
                </label>
                <button
                  onClick={() => setShowAllTextures(!showAllTextures)}
                  style={{
                    padding: '4px 10px', border: '1.5px solid var(--border-color)',
                    borderRadius: '4px', background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#FFD600'; e.currentTarget.style.color = '#FFD600'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {showAllTextures ? 'Show Less' : 'View All 50'}
                </button>
              </div>

              {Object.entries(TEXTURE_GROUPS).map(([title, groupItems]) => (
                <div key={title} style={{ marginBottom: '16px', display: (showAllTextures || title === 'METALLIC') ? 'block' : 'none' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.6rem', fontWeight: 700,
                    color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {title}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {(showAllTextures ? groupItems : groupItems.slice(0, 5)).map(t => (
                      <div
                        key={t.name}
                        onClick={() => handleSyncTexture(t)}
                        title={t.name}
                        style={{
                          cursor: 'pointer', borderRadius: '6px', overflow: 'hidden',
                          aspectRatio: '1', transition: 'all 0.15s',
                          border: selectedTexture?.name === t.name
                            ? '2px solid #FFD600'
                            : '2px solid transparent',
                          boxShadow: selectedTexture?.name === t.name
                            ? '0 0 0 1px #FFD600, 0 4px 12px rgba(255,214,0,0.3)'
                            : 'none',
                          outline: 'none',
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <img
                          src={t.url}
                          alt={t.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DRAW TAB ── */}
        {activeTab === 'brushes' && (
          <div className="animate-soft" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Brush Presets
            </p>
            {BRUSH_PRESETS.map(p => (
              <div
                key={p.name}
                onClick={() => handleApplyBrush(p)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '6px', padding: '16px 18px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#FFD600';
                  e.currentTarget.style.background = 'var(--accent-yellow-light)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
              >
                <div style={{
                  width: '40px', height: '40px', background: '#FFD600',
                  borderRadius: '6px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                }}>
                  🖌️
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {p.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Width {p.strokeWidth} · Roughness {p.roughness}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PALETTE TAB ── */}
        {activeTab === 'colors' && (
          <div className="animate-soft">
            <p style={{ margin: '0 0 10px', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Quick Colors
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Gold',    color: '#FFD600' },
                { name: 'Onyx',    color: '#0a0a0a' },
                { name: 'Silver',  color: '#C0C0C0' },
                { name: 'Teal',    color: '#00CED1' },
                { name: 'Violet',  color: '#8A2BE2' },
                { name: 'Coral',   color: '#FF6B6B' },
                { name: 'Emerald', color: '#50C878' },
                { name: 'White',   color: '#ffffff' },
              ].map(item => (
                <div
                  key={item.name}
                  onClick={() => handleApplyColor(item.color, 'stroke')}
                  title={item.name}
                  style={{
                    aspectRatio: '1', background: item.color,
                    borderRadius: '6px', cursor: 'pointer',
                    border: '1.5px solid var(--border-color)', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'flex-end', padding: '6px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#FFD600'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: item.color === '#0a0a0a' ? '#FFD600' : '#0a0a0a',
                    letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Full Palette
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {SWATCHES.map(color => (
                <div
                  key={color}
                  onClick={() => handleApplyColor(color, 'stroke')}
                  style={{
                    aspectRatio: '1', background: color, borderRadius: '5px',
                    cursor: 'pointer', border: '1.5px solid var(--border-color)', transition: 'all 0.12s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.borderColor = '#FFD600'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                />
              ))}
            </div>

            <p style={{ margin: '0 0 8px', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Custom Color
            </p>
            <div style={{
              padding: '20px', border: '1.5px dashed var(--border-color)',
              borderRadius: '6px', textAlign: 'center', background: 'var(--bg-secondary)',
            }}>
              <input
                type="color"
                onChange={e => handleApplyColor(e.target.value, 'stroke')}
                style={{ width: '60px', height: '60px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px' }}
              />
              <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Pick any color
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeSidebar;

