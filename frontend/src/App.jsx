import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Board from './components/Board'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/board/:sessionId" element={<Board />} />
      <Route path="/board" element={<Board />} />
    </Routes>
  )
}

export default App
