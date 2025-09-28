'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Play, Pause, RotateCcw, Trophy, Coins } from 'lucide-react';

export function GameUI() {
  const { 
    isPlaying, 
    isPaused, 
    score, 
    coins, 
    currentStage,
    setPlaying, 
    setPaused 
  } = useGameStore();

  const [showInstructions, setShowInstructions] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      setPaused(!isPaused);
    } else {
      setPlaying(true);
    }
  };

  const handleRestart = () => {
    setPlaying(false);
    setPaused(false);
    // Reset game state would go here
  };

  return (
    <>
      {/* Game HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        {/* Top HUD */}
        <div className="flex justify-between items-start p-6">
          {/* Left side - Score and Coins */}
          <div className="flex space-x-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">{score}</span>
            </div>
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
              <Coins className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-xl">{coins}</span>
            </div>
          </div>

          {/* Center - Stage Progress */}
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-full px-6 py-3 shadow-lg">
              <span className="text-white font-bold text-xl">Stage {currentStage}</span>
            </div>
            <div className="w-64 bg-gray-300 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((score / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-white text-sm font-semibold">Progress to Next Stage</span>
          </div>

          {/* Right side - Controls */}
          <div className="flex space-x-2">
            <button
              onClick={handlePlayPause}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-105 pointer-events-auto"
              title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
            >
              {isPlaying ? (isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />) : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-105 pointer-events-auto"
              title="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-105 pointer-events-auto"
              title="Instructions"
            >
              <span className="font-bold text-lg">?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
            <h3 className="text-3xl font-bold mb-6 text-white text-center">Mindora Runner</h3>
            <div className="space-y-4 text-white">
              <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                <span className="text-3xl">🏃‍♂️</span>
                <div>
                  <span className="font-semibold">Run & Jump:</span> Press <kbd className="bg-white/30 px-3 py-1 rounded font-mono">SPACE</kbd> to jump over spikes, pits, and blocks
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                <span className="text-3xl">💰</span>
                <div>
                  <span className="font-semibold">Collect Coins:</span> Gather golden coins to earn QuestCoin tokens
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                <span className="text-3xl">🧠</span>
                <div>
                  <span className="font-semibold">Knowledge Walls:</span> Answer blockchain questions to break walls and progress
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                <span className="text-3xl">🏆</span>
                <div>
                  <span className="font-semibold">Stage Rewards:</span> Complete stages to earn NFT badges and HTS tokens
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/20 rounded-lg p-4">
                <span className="text-3xl">⚡</span>
                <div>
                  <span className="font-semibold">Progressive Difficulty:</span> Each stage gets faster with more obstacles and harder questions
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-8 w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Let&apos;s Play! 🎮
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 pointer-events-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center shadow-2xl">
            <h2 className="text-4xl font-bold mb-4 text-white">Game Paused</h2>
            <p className="text-white/80 mb-8 text-lg">Click the play button to resume your adventure!</p>
            <button
              onClick={() => setPaused(false)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Resume Game ▶️
            </button>
          </div>
        </div>
      )}
    </>
  );
}
