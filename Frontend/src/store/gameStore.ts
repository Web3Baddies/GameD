import { create } from 'zustand';
import { hederaService, LeaderboardEntry } from '@/services/hederaService';

export interface Player {
  id: string;
  walletAddress: string;
  username?: string;
  currentStage: number;
  totalScore: number;
  tokensEarned: number;
  nftsEarned: number;
  completedStages: number[];
}

export interface Stage {
  id: number;
  name: string;
  difficulty: number;
  tokenReward: number;
  minScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  timeLimit: number;
}

export interface GameState {
  // Player state
  player: Player | null;
  isConnected: boolean;
  walletAddress: string | null;

  // Game state
  currentStage: number;
  score: number;
  coins: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  gameMode: 'menu' | 'stage-select' | 'playing' | 'paused';

  // UI state
  showQuiz: boolean;
  currentQuestion: Question | null;
  quizAnswers: { [questionId: string]: number };

  // Actions
  setPlayer: (player: Player | null) => void;
  setConnected: (connected: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  updateScore: (points: number) => void;
  updateCoins: (amount: number) => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setGameSpeed: (speed: number) => void;
  setGameMode: (mode: 'menu' | 'stage-select' | 'playing' | 'paused') => void;
  setCurrentStage: (stage: number) => void;
  setShowQuiz: (show: boolean) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setQuizAnswer: (questionId: string, answer: number) => void;
  completeStage: (stageId: number, finalScore: number) => Promise<boolean>;
  registerPlayer: (username: string) => Promise<boolean>;
  loadPlayerData: (walletAddress: string) => Promise<void>;
  loadLeaderboard: () => Promise<LeaderboardEntry[]>;
  resetGame: () => void;
}

const _initialPlayer: Player = {
  id: '',
  walletAddress: '',
  currentStage: 1,
  totalScore: 0,
  tokensEarned: 0,
  nftsEarned: 0,
  completedStages: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  player: null,
  isConnected: false,
  walletAddress: null,
  currentStage: 1,
  score: 0,
  coins: 0,
  isPlaying: false,
  isPaused: false,
  gameSpeed: 1,
  gameMode: 'stage-select',
  showQuiz: false,
  currentQuestion: null,
  quizAnswers: {},

  // Actions
  setPlayer: (player) => set({ player }),

  setConnected: (connected) => set({ isConnected: connected }),

  setWalletAddress: (address) => set({ walletAddress: address }),

  setGameMode: (mode) => set({ gameMode: mode }),

  setCurrentStage: (stage) => set({ currentStage: stage }),
  
  updateScore: (points) => set((state) => ({
    score: state.score + points,
    player: state.player ? {
      ...state.player,
      totalScore: state.player.totalScore + points
    } : null
  })),
  
  updateCoins: (amount) => set((state) => ({
    coins: Math.max(0, state.coins + amount)
  })),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setPaused: (paused) => set({ isPaused: paused }),
  
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  
  setShowQuiz: (show) => set({ showQuiz: show }),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  setQuizAnswer: (questionId, answer) => set((state) => ({
    quizAnswers: {
      ...state.quizAnswers,
      [questionId]: answer
    }
  })),
  
  completeStage: async (stageId, finalScore) => {
    try {
      const answers = Object.values(get().quizAnswers);
      const success = await hederaService.mockCompleteStage(stageId, finalScore, answers);
      
      if (success) {
        set((state) => {
          const newPlayer = state.player ? {
            ...state.player,
            currentStage: Math.max(state.player.currentStage, stageId + 1),
            completedStages: [...state.player.completedStages, stageId],
            totalScore: state.player.totalScore + finalScore
          } : null;
          
          return {
            player: newPlayer,
            currentStage: Math.max(state.currentStage, stageId + 1),
            score: 0, // Reset score for next stage
            showQuiz: false,
            currentQuestion: null,
            quizAnswers: {}
          };
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to complete stage:', error);
      return false;
    }
  },

  registerPlayer: async (username) => {
    try {
      const walletAddress = get().walletAddress;
      if (!walletAddress) return false;
      
      const success = await hederaService.mockRegisterPlayer(username, walletAddress);
      if (success) {
        await get().loadPlayerData(walletAddress);
      }
      return success;
    } catch (error) {
      console.error('Failed to register player:', error);
      return false;
    }
  },

  loadPlayerData: async (walletAddress) => {
    try {
      const playerData = await hederaService.mockGetPlayer(walletAddress);
      if (playerData) {
        set({
          player: {
            id: playerData.wallet,
            walletAddress: playerData.wallet,
            username: playerData.username,
            currentStage: playerData.currentStage,
            totalScore: playerData.totalScore,
            tokensEarned: playerData.tokensEarned,
            nftsEarned: playerData.nftsEarned,
            completedStages: playerData.completedStages
          },
          currentStage: playerData.currentStage,
          score: 0,
          coins: 0
        });
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
  },

  loadLeaderboard: async () => {
    try {
      return await hederaService.mockGetLeaderboard(10);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  },
  
  resetGame: () => set({
    player: null,
    isConnected: false,
    walletAddress: null,
    currentStage: 1,
    score: 0,
    coins: 0,
    isPlaying: false,
    isPaused: false,
    gameSpeed: 1,
    showQuiz: false,
    currentQuestion: null,
    quizAnswers: {}
  })
}));
