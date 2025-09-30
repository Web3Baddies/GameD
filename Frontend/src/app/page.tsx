'use client';

import { useState } from 'react';
import { SimpleGameCanvas } from '@/components/SimpleGameCanvas';
import { NewWalletConnection } from '@/components/NewWalletConnection';
import { GameUI } from '@/components/GameUI';
import { Leaderboard } from '@/components/Leaderboard';
import { QuizModal } from '@/components/QuizModal';
import { GameOverModal } from '@/components/GameOverModal';
import { PixelBackground } from '@/components/PixelBackground';
import { ContractManager } from '@/components/ContractManager';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const { isConnected, player } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);



  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Contract Manager - handles contract callbacks */}
      <ContractManager />


      {/* Pixel Art Background */}
      <PixelBackground />

      <main className="relative w-full max-w-4xl mx-auto my-8">
        {!isConnected || !player?.isRegistered ? (
          <>
            <NewWalletConnection />
          <div className="nes-container with-title is-centered pixel-art relative z-10 max-w-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <p className="title pixel-font text-primary">MINDORA RUNNER</p>
            <h1 className="pixel-font text-xl mb-6 text-gray-800 text-center">
              Run • Learn • Earn
            </h1>

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏃‍♂️</div>
              <p className="pixel-font text-sm text-gray-700 mb-4">
                Jump obstacles, answer questions,<br/>
                earn tokens & NFTs on Hedera!
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600 mb-4">
                {!isConnected ? 'Connect wallet to start' : 'Complete registration to play'}
              </p>
            </div>
          </div>
          </>
        ) : (
          <div className="relative">
            <SimpleGameCanvas />
            <GameUI />
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="nes-container with-title is-centered pixel-art w-full max-w-2xl relative" style={{ backgroundColor: 'white' }}>
            <p className="title pixel-font text-primary">LEADERBOARD</p>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="nes-btn is-error absolute top-4 right-4 text-sm"
            >
              ✕
            </button>
            <Leaderboard />
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal />

      {/* Game Over Modal */}
      <GameOverModal />
    </div>
  );
}