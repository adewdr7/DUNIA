/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import Layout from './components/Layout';
import Lobby from './pages/Lobby';
import WorldView from './pages/WorldView';

function GameContent() {
  const { currentWorld, joinWorld } = useGame();

  // Simple view switching based on game state for MVP
  // In a real app, we'd use URL params like /world/:id
  
  if (currentWorld) {
    return <WorldView onBack={() => window.location.reload()} />; 
    // Reloading to reset state for MVP simplicity, or we could implement a leaveWorld function
  }

  return <Lobby />;
}

export default function App() {
  return (
    <GameProvider>
      <Layout>
        <GameContent />
      </Layout>
    </GameProvider>
  );
}
