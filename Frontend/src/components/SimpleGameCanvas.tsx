'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export function SimpleGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState({
    playerX: 100,
    playerY: 400,
    playerVelocityY: 0,
    coins: [] as Array<{ x: number; y: number; id: number; collected: boolean }>,
    obstacles: [] as Array<{ x: number; y: number; id: number; type: 'spike' | 'pit' | 'block' }>,
    knowledgeWalls: [] as Array<{ x: number; y: number; id: number; question: string; answered: boolean }>,
    stageProgress: 0,
    isJumping: false,
    gameSpeed: 2,
    isGrounded: true,
    gameTime: 0,
    stageLength: 2000, // Distance to complete stage
    currentCheckpoint: 0
  });

  const {
    updateScore,
    updateCoins,
    setShowQuiz,
    setCurrentQuestion,
    currentStage,
    isPlaying,
    setPlaying
  } = useGameStore();

  // Initialize stage based on current stage
  const initializeStage = (stage: number) => {
    const stageData = {
      1: {
        coins: Array.from({ length: 15 }, (_, i) => ({
          x: 200 + i * 80,
          y: 350 + Math.sin(i) * 15,
          id: i,
          collected: false
        })),
        obstacles: [
          { x: 400, y: 450, id: 1, type: 'spike' as const },
          { x: 600, y: 450, id: 2, type: 'pit' as const },
          { x: 800, y: 450, id: 3, type: 'block' as const },
          { x: 1000, y: 450, id: 4, type: 'spike' as const }
        ],
        knowledgeWalls: [
          { x: 1200, y: 200, id: 1, question: "What is HBAR used for?", answered: false }
        ],
        speed: 2,
        length: 1500
      },
      2: {
        coins: Array.from({ length: 20 }, (_, i) => ({
          x: 200 + i * 60,
          y: 350 + Math.sin(i) * 20,
          id: i,
          collected: false
        })),
        obstacles: [
          { x: 300, y: 450, id: 1, type: 'spike' as const },
          { x: 500, y: 450, id: 2, type: 'pit' as const },
          { x: 700, y: 450, id: 3, type: 'block' as const },
          { x: 900, y: 450, id: 4, type: 'spike' as const },
          { x: 1100, y: 450, id: 5, type: 'pit' as const }
        ],
        knowledgeWalls: [
          { x: 800, y: 200, id: 1, question: "What is a smart contract?", answered: false },
          { x: 1400, y: 200, id: 2, question: "What is Hedera's consensus mechanism?", answered: false }
        ],
        speed: 3,
        length: 1800
      },
      3: {
        coins: Array.from({ length: 25 }, (_, i) => ({
          x: 200 + i * 50,
          y: 350 + Math.sin(i) * 25,
          id: i,
          collected: false
        })),
        obstacles: [
          { x: 250, y: 450, id: 1, type: 'spike' as const },
          { x: 400, y: 450, id: 2, type: 'pit' as const },
          { x: 550, y: 450, id: 3, type: 'block' as const },
          { x: 700, y: 450, id: 4, type: 'spike' as const },
          { x: 850, y: 450, id: 5, type: 'pit' as const },
          { x: 1000, y: 450, id: 6, type: 'block' as const }
        ],
        knowledgeWalls: [
          { x: 600, y: 200, id: 1, question: "What is HTS?", answered: false },
          { x: 1000, y: 200, id: 2, question: "What is HCS?", answered: false },
          { x: 1400, y: 200, id: 3, question: "What is the gas fee for Hedera transactions?", answered: false }
        ],
        speed: 4,
        length: 2000
      }
    };

    return stageData[stage as keyof typeof stageData] || stageData[1];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize stage
    const stageData = initializeStage(currentStage);
    setGameState(prev => ({
      ...prev,
      coins: stageData.coins,
      obstacles: stageData.obstacles,
      knowledgeWalls: stageData.knowledgeWalls,
      gameSpeed: stageData.speed,
      stageLength: stageData.length,
      stageProgress: 0,
      currentCheckpoint: 0
    }));

    // Initial render function - shows game even when not playing
    const initialRender = () => {
      if (!ctx) return;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Draw ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 500, 800, 100);

      // Draw grass
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 500, 800, 20);

      // Draw a few coins for visual preview
      const previewCoins = [300, 400, 500];
      previewCoins.forEach(x => {
        ctx.save();
        ctx.translate(x, 350);

        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Coin shine
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-3, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw player at initial position
      ctx.save();
      ctx.translate(100 + 15, 450 + 15);

      // Player body
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(-15, -15, 30, 30);

      // Player head
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.arc(0, -25, 12, 0, Math.PI * 2);
      ctx.fill();

      // Player eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-5, -28, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -28, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Game loop with immediate drawing
    const gameLoop = () => {
      if (!ctx) return;

        // Update game state
        setGameState(prev => {
          const currentState = { ...prev };

        // Apply gravity
        currentState.playerVelocityY += 0.6;
        currentState.playerY += currentState.playerVelocityY;

        // Ground collision
        if (currentState.playerY >= 450) {
          currentState.playerY = 450;
          currentState.playerVelocityY = 0;
          currentState.isJumping = false;
          currentState.isGrounded = true;
        } else {
          currentState.isGrounded = false;
        }

        // Move all objects (this creates the running effect)
        currentState.coins = currentState.coins.map(coin => ({
          ...coin,
          x: coin.x - currentState.gameSpeed,
          y: coin.y + Math.sin(coin.x * 0.01) * 0.5
        })).filter(coin => coin.x > -50);

        currentState.obstacles = currentState.obstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - currentState.gameSpeed
        })).filter(obstacle => obstacle.x > -50);

        currentState.knowledgeWalls = currentState.knowledgeWalls.map(wall => ({
          ...wall,
          x: wall.x - currentState.gameSpeed
        })).filter(wall => wall.x > -100);

        // Update stage progress
        currentState.stageProgress += currentState.gameSpeed;
        currentState.gameTime += 1;

        // Draw everything immediately with the updated state
        drawFrame(currentState);

        // Check collisions with updated state
        checkCollisions(currentState);

        return currentState;
      });

      // Continue game loop if playing
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    // Collision detection function
    const checkCollisions = (state: typeof gameState) => {
      // Check coin collisions
      state.coins.forEach(coin => {
        if (!coin.collected &&
            Math.abs(coin.x - state.playerX) < 25 &&
            Math.abs(coin.y - state.playerY) < 25) {

          updateCoins(10);
          updateScore(10);

          setGameState(prev => ({
            ...prev,
            coins: prev.coins.map(c =>
              c.id === coin.id ? { ...c, collected: true } : c
            )
          }));
        }
      });

      // Check obstacle collisions
      state.obstacles.forEach(obstacle => {
        if (Math.abs(obstacle.x - state.playerX) < 30 &&
            Math.abs(obstacle.y - state.playerY) < 50) {
          setPlaying(false);
        }
      });

      // Check knowledge wall collisions
      state.knowledgeWalls.forEach(wall => {
        if (!wall.answered &&
            Math.abs(wall.x - state.playerX) < 50 &&
            state.playerY > wall.y && state.playerY < wall.y + 300) {

          const questions = {
            1: {
              question: "What is HBAR used for?",
              options: ["Paying transaction fees", "Mining rewards", "Staking only", "Nothing"],
              correctAnswer: 0
            },
            2: {
              question: "What is a smart contract?",
              options: ["A legal document", "Self-executing code", "A type of token", "A database"],
              correctAnswer: 1
            },
            3: {
              question: "What is Hedera's consensus mechanism?",
              options: ["Proof of Work", "Proof of Stake", "Hashgraph", "Delegated Proof of Stake"],
              correctAnswer: 2
            }
          };

          const questionData = questions[wall.id as keyof typeof questions] || questions[1];

          setCurrentQuestion({
            id: wall.id.toString(),
            question: questionData.question,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            points: 50,
            timeLimit: 30
          });
          setShowQuiz(true);
          setPlaying(false);
        }
      });

      // Check stage completion
      if (state.stageProgress >= state.stageLength) {
        setPlaying(false);
      }
    };

    // Draw function that uses current state
    const drawFrame = (state: typeof gameState) => {
      if (!ctx) return;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Draw ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 500, 800, 100);

      // Draw grass
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 500, 800, 20);

      // Draw player
      ctx.save();
      ctx.translate(state.playerX + 15, state.playerY + 15);

      // Player body
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(-15, -15, 30, 30);

      // Player head
      ctx.fillStyle = '#FFE66D';
      ctx.beginPath();
      ctx.arc(0, -25, 12, 0, Math.PI * 2);
      ctx.fill();

      // Player eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-5, -28, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -28, 2, 0, Math.PI * 2);
      ctx.fill();

      // Running animation
      ctx.fillStyle = '#FF6B6B';
      const armOffset = Math.sin(state.gameTime * 0.2) * 5;
      ctx.fillRect(-20, -10 + armOffset, 8, 15);
      ctx.fillRect(12, -10 - armOffset, 8, 15);

      ctx.restore();

      // Draw coins
      state.coins.forEach(coin => {
        if (!coin.collected) {
          ctx.save();
          ctx.translate(coin.x, coin.y);

          // Coin glow
          const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
          glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
          glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();

          // Coin body
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          // Coin shine
          ctx.fillStyle = '#FFF';
          ctx.beginPath();
          ctx.arc(-3, -3, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Draw obstacles
      state.obstacles.forEach(obstacle => {
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);

        switch (obstacle.type) {
          case 'spike':
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(20, 50);
            ctx.lineTo(-20, 50);
            ctx.closePath();
            ctx.fill();
            break;
          case 'pit':
            ctx.fillStyle = '#000';
            ctx.fillRect(-30, 0, 60, 50);
            break;
          case 'block':
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-25, 0, 50, 50);
            break;
        }

        ctx.restore();
      });

      // Draw knowledge walls
      state.knowledgeWalls.forEach(wall => {
        if (!wall.answered) {
          ctx.save();
          ctx.translate(wall.x, wall.y);

          // Wall background
          const wallGradient = ctx.createLinearGradient(0, 0, 100, 0);
          wallGradient.addColorStop(0, '#9B59B6');
          wallGradient.addColorStop(1, '#8E44AD');
          ctx.fillStyle = wallGradient;
          ctx.fillRect(0, 0, 100, 300);

          // Wall border
          ctx.strokeStyle = '#6C3483';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, 100, 300);

          // Question mark
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', 50, 150);

          // Question text
          ctx.font = 'bold 12px Arial';
          ctx.fillText('KNOWLEDGE', 50, 180);
          ctx.fillText('WALL', 50, 200);

          ctx.restore();
        }
      });
    };

    // Always show initial render
    initialRender();

    if (isPlaying) {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStage, updateScore, updateCoins, setShowQuiz, setCurrentQuestion, setPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState.isGrounded && isPlaying) {
        setGameState(prev => ({
          ...prev,
          playerVelocityY: -18,
          isJumping: true
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isGrounded, isPlaying]);

  // Start game when component mounts
  useEffect(() => {
    if (isPlaying) {
      setGameState(prev => ({
        ...prev,
        playerX: 100,
        playerY: 400,
        playerVelocityY: 0,
        gameSpeed: 3,
        gameTime: 0
      }));
    }
  }, [isPlaying]);

  return (
    <div className="flex justify-center items-center min-h-[600px] bg-gradient-to-br from-blue-400 to-green-400">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-white rounded-xl shadow-2xl"
          style={{ 
            background: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
            borderRadius: '12px'
          }}
        />
        
        {/* Game Overlay UI */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Mindora Runner</h2>
              <p className="text-lg mb-6">Press SPACE to jump and collect coins!</p>
              <button
                onClick={() => setPlaying(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
