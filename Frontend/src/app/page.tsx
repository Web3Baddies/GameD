'use client';

import { useState } from 'react';
import { SimpleGameCanvas } from '@/components/SimpleGameCanvas';
import { WalletConnection } from '@/components/WalletConnection';
import { GameUI } from '@/components/GameUI';
import { Leaderboard } from '@/components/Leaderboard';
import { QuizModal } from '@/components/QuizModal';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const { isConnected } = useGameStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <WalletConnection />

      <main className="relative w-full max-w-4xl mx-auto my-8">
        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl border border-white/20">
            <h1 className="text-4xl font-bold mb-4">Welcome to Mindora Runner!</h1>
            <p className="text-xl mb-6">Connect your Hedera wallet to start your adventure.</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-xs space-y-2 text-lg">
              <li>🧠 Learn new things</li>
              <li>💰 Collect QuestCoins</li>
              <li>🖼️ Earn unique NFTs</li>
              <li>📊 Compete on the leaderboard</li>
            </ul>
          </div>
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
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl relative">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Leaderboard</h2>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
            >
              ✕
            </button>
            <Leaderboard />
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal />
    </div>
  );
}