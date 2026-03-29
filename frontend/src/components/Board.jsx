import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw, MainMenu } from '@excalidraw/excalidraw';
import { 
  Mic, ArrowLeft, Save, Sparkles, Type, Globe, Edit3, 
  Wand2, Pencil, Home, Layout, Zap, Rocket, Palette 
} from 'lucide-react';
import AIPopup from './AIPopup';
import AITextToImagePopup from './AITextToImagePopup';
import WebImagePopup from './WebImagePopup';
import CreativeSidebar from './CreativeSidebar';

// AI Icons Constants
const BULB_SRC = "/custom_bulb.png";

const Board = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [sessionName, setSessionName] = useState('New Session');
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [isAITextPopupOpen, setIsAITextPopupOpen] = useState(false);
  const [isWebImagePopupOpen, setIsWebImagePopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Use STATE (not ref) so React re-runs the load effect when data arrives
  const [boardDataToLoad, setBoardDataToLoad] = useState(null);
  const hasLoaded = useRef(false);

  // ── FETCH session from backend ──
  useEffect(() => {
    if (!sessionId) return;
    hasLoaded.current = false; // reset for new sessionId
    setBoardDataToLoad(null);

    const fetchSession = async () => {
      try {
        const resp = await fetch(`https://notecraft-backend-vpad.onrender.com/api/sessions/${sessionId}`);
        if (!resp.ok) {
          console.log('[Board] New session – no existing data');
          return;
        }
        const data = await resp.json();
        if (data.session) {
          setSessionName(data.session.name || 'New Session');
          const bd = data.session.board_data;
          if (Array.isArray(bd) && bd.length > 0) {
            console.log(`[Board] Loaded ${bd.length} elements from server`);
            setBoardDataToLoad(bd); // triggers load effect
          } else {
            console.log('[Board] Session exists but board_data is empty', bd);
          }
        }
      } catch (err) {
        console.error('[Board] Failed to fetch session:', err);
      }
    };
    fetchSession();
  }, [sessionId]);

  // ── APPLY board data to Excalidraw once BOTH are ready ──
  // This fires whenever excalidrawAPI OR boardDataToLoad changes,
  // so it works regardless of which arrives first.
  useEffect(() => {
    if (!excalidrawAPI || !boardDataToLoad || hasLoaded.current) return;
    hasLoaded.current = true;
    console.log(`[Board] Restoring ${boardDataToLoad.length} elements into Excalidraw`);
    try {
      excalidrawAPI.updateScene({ elements: boardDataToLoad });
      // Small delay so Excalidraw can paint before scrolling to fit
      setTimeout(() => {
        try { excalidrawAPI.scrollToContent(); } catch (_) {}
      }, 100);
    } catch (err) {
      console.error('[Board] updateScene failed:', err);
    }
  }, [excalidrawAPI, boardDataToLoad]);

  // ── DARK MODE ──
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleRename = () => {
    const newName = prompt('Rename session:', sessionName);
    if (newName?.trim()) setSessionName(newName.trim());
  };

  const handleVoiceToText = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported. Please use Google Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      navigator.clipboard.writeText(text).then(() =>
        alert(`Voice captured: "${text}"\n\nPaste it (Ctrl+V) onto the board.`)
      );
    };
    recognition.start();
  }, []);

  // ── SAVE ──
  const saveSession = async () => {
    if (!excalidrawAPI) return;
    setSaveStatus('saving');
    // Get ALL non-deleted elements
    const elements = excalidrawAPI.getSceneElements();
    console.log(`[Board] Saving ${elements.length} elements for session ${sessionId}`);
    try {
      const resp = await fetch('https://notecraft-backend-vpad.onrender.com/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, name: sessionName, board_data: elements }),
      });
      const result = await resp.json();
      if (resp.ok) {
        const savedCount = result?.session?.board_data?.length ?? '?';
        console.log(`[Board] Save confirmed – ${savedCount} elements stored`);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        console.error('[Board] Save failed:', result);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('[Board] Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>

      {/* ── HEADER ── */}
      <div style={{
        height: '64px',
        background: 'var(--bg-primary)',
        borderBottom: '1.5px solid var(--border-color)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* LEFT: Logo + Session Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0
            }}
          >
            <div style={{
              width: '28px', height: '28px', background: '#FFD600',
              borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Pencil size={14} color="#0a0a0a" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              NoteCraft
            </span>
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

          <div
            onClick={handleRename}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <h1 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
              {sessionName}
            </h1>
            <Edit3 size={13} color="var(--text-muted)" />
          </div>
        </div>

        {/* RIGHT: Tools */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-pill"
            style={{ padding: '8px 16px', gap: '6px', borderRadius: '6px' }}
          >
            <span style={{ fontSize: '1rem' }}>{isDarkMode ? '☀️' : '🌙'}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{isDarkMode ? 'LIGHT' : 'DARK'}</span>
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

          <button
            onClick={handleVoiceToText}
            className={`btn-pill ${isRecording ? 'btn-solid-yellow' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '6px', gap: '6px' }}
            title="Voice to Text"
          >
            <Mic size={15} />
            <span>{isRecording ? 'LISTENING...' : 'VOICE'}</span>
          </button>

          <button onClick={() => setIsAIPopupOpen(true)} className="btn-pill" style={{ padding: '8px 16px', borderRadius: '6px', gap: '6px' }}>
            <Pencil size={15} /><span>AI PEN</span>
          </button>

          <button onClick={() => setIsAITextPopupOpen(true)} className="btn-pill" style={{ padding: '8px 16px', borderRadius: '6px', gap: '6px' }}>
            <Sparkles size={15} /><span>MAGIC</span>
          </button>

          <button onClick={() => setIsWebImagePopupOpen(true)} className="btn-pill" style={{ padding: '8px 16px', borderRadius: '6px', gap: '6px' }}>
            <Globe size={15} /><span>ASSETS</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`btn-pill ${isSidebarOpen ? 'btn-solid-yellow rocket-active' : ''}`}
            style={{ padding: '8px 20px', borderRadius: '6px', gap: '6px', fontWeight: 700 }}
          >
            <Rocket size={15} /><span>STUDIO</span>
          </button>

          <button
            onClick={saveSession}
            disabled={saveStatus === 'saving'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '6px', border: 'none',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.78rem',
              fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              background: saveStatus === 'saved' ? '#16a34a' : saveStatus === 'error' ? '#dc2626' : '#FFD600',
              color: saveStatus === 'saved' || saveStatus === 'error' ? '#fff' : '#0a0a0a',
            }}
          >
            <Save size={15} />
            <span>
              {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'saved' ? '✓ SAVED' : saveStatus === 'error' ? '✗ ERROR' : 'SAVE'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div style={{ flex: 1, width: '100vw', position: 'relative' }}>
        <Excalidraw 
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          UIOptions={{ canvasActions: { loadScene: false } }}
          theme={isDarkMode ? 'dark' : 'light'}
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
        </Excalidraw>
      </div>

      {/* Overlays */}
      <AIPopup 
        isOpen={isAIPopupOpen} 
        onClose={() => setIsAIPopupOpen(false)} 
        elements={excalidrawAPI?.getSceneElements()} 
        appState={excalidrawAPI?.getAppState()} 
        files={excalidrawAPI?.getFiles()} 
      />

      <AITextToImagePopup 
        isOpen={isAITextPopupOpen} 
        onClose={() => setIsAITextPopupOpen(false)} 
      />

      <WebImagePopup 
        isOpen={isWebImagePopupOpen} 
        onClose={() => setIsWebImagePopupOpen(false)} 
      />

      <CreativeSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        excalidrawAPI={excalidrawAPI}
      />
    </div>
  );
};

export default Board;
