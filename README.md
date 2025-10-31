
# 🎮 Mindora Runner - Play, Learn, and Earn Game

A blockchain-powered educational runner game built on Hedera Network that combines gaming, learning, and earning. Players run through levels, answer educational questions about Hedera and Web3, and earn QuestCoin tokens and NFT badges as rewards.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Deployment](#deployment)
- [Gameplay](#gameplay)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

**Mindora Runner** is a "Learn-to-Earn" educational game that gamifies learning about Hedera blockchain, Web3 technologies, and African innovation & culture. Players control a runner character who must jump over obstacles, collect coins, and answer quiz questions to progress through stages. Completing stages rewards players with:

- 🪙 **QuestCoin (HTS Token)** - Fungible tokens earned by completing stages
- 🏆 **Badge NFTs** - Unique non-fungible tokens for stage completion
- 📊 **Leaderboard Rankings** - Compete with other players globally

The game leverages Hedera's smart contract service (HSCS) for game logic, Hedera Token Service (HTS) for token rewards, and provides a seamless wallet connection experience using WalletConnect AppKit.

### Key Highlights

- ✅ **On-chain Game State** - Player progress stored on Hedera smart contracts
- ✅ **Token Rewards** - Earn real HTS tokens (QuestCoin) for completing stages
- ✅ **NFT Badges** - Collect unique achievement badges as NFTs
- ✅ **Educational Content** - Learn about Hedera, Web3, and African history/culture
- ✅ **Leaderboards** - Compete on global and stage-specific leaderboards
- ✅ **Web3 Integration** - Seamless wallet connection with email & social login

---

## 🏗️ System Architecture & Data Flow

### Complete System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND                                      │
│                          (Next.js 15 + React 19)                                │
│                                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │  Game Canvas     │    │  ContractManager │    │  Marketplace      │       │
│  │  (Runner Game)   │───▶│  (State Mgmt)    │───▶│  (NFT Display)    │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
│         │                         │                          │                 │
│         │                         │                          │                 │
│         ▼                         ▼                          ▼                 │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │  useMindoraRunner│    │  wagmi + viem     │    │  Mirror Node API  │       │
│  │  (Hooks)         │    │  (EVM RPC)       │    │  (NFT Queries)    │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                         │                          │
         │                         │                          │
         │                         ▼                          │
         │                 ┌──────────────────┐               │
         │                 │ WalletConnect    │               │
         │                 │ AppKit           │               │
         │                 │ (Wallet Conn)    │               │
         │                 └──────────────────┘               │
         │                         │                          │
         ▼                         ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HEDERA NETWORK                                     │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                    HEDERA SMART CONTRACT SERVICE (HSCS)                │   │
│  │                                                                         │   │
│  │  ┌──────────────────────────────────────────────────────────────┐      │   │
│  │  │      MindoraRunnerFinal.sol (Contract ID: 0.0.7172114)      │      │   │
│  │  │                                                              │      │   │
│  │  │  • registerPlayer(username)                                 │      │   │
│  │  │  • saveGameSession(stage, score, coins, questions, completed)│     │   │
│  │  │  • claimTokens(stage)                                        │      │   │
│  │  │  • claimNFT(stage)                                           │      │   │
│  │  │  • getStageLeaderboard(stage)                                 │      │   │
│  │  │                                                              │      │   │
│  │  │  Storage:                                                    │      │   │
│  │  │  • players[address] → Player struct                         │      │   │
│  │  │  • stageCompleted[address][stage] → bool                    │      │   │
│  │  │  • tokensClaimed[address][stage] → bool                     │      │   │
│  │  │  • nftClaimed[address][stage] → bool                        │      │   │
│  │  │  • stageLeaderboards[stage] → GameSession[]                 │      │   │
│  │  └──────────────────────────────────────────────────────────────┘      │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                    HEDERA TOKEN SERVICE (HTS)                         │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────┐          ┌──────────────────────────┐    │   │
│  │  │  QuestCoin Token        │          │  Badge NFT Collection   │    │   │
│  │  │  (Fungible HTS)        │          │  (Non-Fungible HTS)      │    │   │
│  │  │  Token ID: 0.0.XXXXXX  │          │  Token ID: 0.0.XXXXXX   │    │   │
│  │  │                         │          │                          │    │   │
│  │  │  • Minted by Treasury   │          │  • Minted on Claim       │    │   │
│  │  │  • Transferred to Player│          │  • Serial # per Badge    │    │   │
│  │  │  • Stage Rewards:        │          │  • Metadata per Badge:   │    │   │
│  │  │    - Stage 1: 20 tokens │          │    - Explorer Badge      │    │   │
│  │  │    - Stage 2: 50 tokens │          │    - Adventurer Badge    │    │   │
│  │  │    - Stage 3: 100 tokens│          │    - Master Badge        │    │   │
│  │  └─────────────────────────┘          └──────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                    HEDERA MIRROR NODE API                             │   │
│  │                                                                         │   │
│  │  https://testnet.mirrornode.hedera.com                                │   │
│  │                                                                         │   │
│  │  Endpoints Used:                                                       │   │
│  │  • GET /api/v1/accounts/{id}/nfts → Get user's NFTs                  │   │
│  │  • GET /api/v1/tokens/{id}/nfts → Get all NFTs in collection         │   │
│  │  • GET /api/v1/tokens/{id} → Get token info (QuestCoin/NFTs)         │   │
│  │  • GET /api/v1/accounts/{id} → Get account balance & info            │   │
│  │  • GET /api/v1/transactions/{id} → Get transaction details            │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           PLAYER INTERACTION FLOW                            │
└────────────────────────────────────────────────────────────────────────────┘

1. WALLET CONNECTION
   ┌─────────────┐
   │   Player    │
   └──────┬──────┘
          │
          ▼
   ┌──────────────────┐
   │ WalletConnect    │ ← Email/Social Login or EVM Wallet
   │ AppKit           │
   └──────┬───────────┘
          │
          ▼ (Returns: walletAddress)
   ┌──────────────────┐
   │ Frontend State   │
   │ (Zustand Store)  │
   └──────┬───────────┘

2. PLAYER REGISTRATION
          │
          ▼
   ┌──────────────────┐    writeContract()    ┌──────────────────┐
   │ useMindoraRunner │ ────────────────────▶ │ Smart Contract   │
   │ Hook             │                        │ registerPlayer() │
   └──────────────────┘                        └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │ Hedera Network   │
                                              │ (Stores Player)  │
                                              └──────────────────┘

3. GAMEPLAY & STAGE COMPLETION
   ┌──────────────────┐
   │ Player Completes  │
   │ Stage 1           │
   └──────┬────────────┘
          │
          ▼
   ┌──────────────────┐    saveGameSession()   ┌──────────────────┐
   │ Game Store       │ ──────────────────────▶ │ Smart Contract   │
   │ (Stage Complete) │                         │ saveGameSession()│
   └──────────────────┘                         └────────┬─────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────┐
                                                │ Updates State:   │
                                                │ • stageCompleted │
                                                │ • totalScore     │
                                                │ • inGameCoins    │
                                                │ • questTokens    │
                                                └──────────────────┘

4. CLAIM TOKENS
   ┌──────────────────┐
   │ Player Clicks     │
   │ "Claim Tokens"   │
   └──────┬────────────┘
          │
          ▼
   ┌──────────────────┐    claimTokens(stage)   ┌──────────────────┐
   │ useMindoraRunner │ ──────────────────────▶ │ Smart Contract   │
   │ Hook             │                         │ claimTokens()    │
   └──────────────────┘                         └────────┬─────────┘
                                                          │
                                                          ▼ (Emits event)
                                                ┌──────────────────┐
                                                │ Hedera Service   │
                                                │ (SDK)            │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ QuestCoin Token  │
                                                │ Mint & Transfer  │
                                                │ to Player        │
                                                └──────────────────┘

5. CLAIM NFT BADGE
   ┌──────────────────┐
   │ Player Clicks     │
   │ "Claim Badge"    │
   └──────┬────────────┘
          │
          ▼
   ┌──────────────────┐    claimNFT(stage)      ┌──────────────────┐
   │ useMindoraRunner │ ──────────────────────▶ │ Smart Contract   │
   │ Hook             │                         │ claimNFT()       │
   └──────────────────┘                         └────────┬─────────┘
                                                          │
                                                          ▼ (Emits event)
                                                ┌──────────────────┐
                                                │ Hedera Service   │
                                                │ (SDK)            │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ Badge NFT Token  │
                                                │ Mint NFT with    │
                                                │ Metadata         │
                                                │ Transfer to Player│
                                                └──────────────────┘

6. QUERY NFT DATA (Marketplace)
   ┌──────────────────┐
   │ Marketplace      │
   │ Component       │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐    GET /api/v1/accounts/{id}/nfts
   │ Mirror Node API  │ ←─────────────────────────────────┐
   │ (HTTP Request)   │                                   │
   └──────┬───────────┘                                   │
          │                                               │
          ▼ (Returns NFT list)                            │
   ┌──────────────────┐                                   │
   │ NFT Data:        │                                   │
   │ • Serial Number  │                                   │
   │ • Token ID       │                                   │
   │ • Owner Address  │                                   │
   │ • Metadata URI   │                                   │
   └──────────────────┘                                   │
          │                                               │
          ▼                                               │
   ┌──────────────────┐    GET {metadataURI}              │
   │ Fetch Metadata   │ ←─────────────────────────────────┘
   │ (IPFS/HTTP)      │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │ Display NFT:     │
   │ • Badge Name     │
   │ • Badge Image    │
   │ • Owner Info     │
   └──────────────────┘
```

### Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    DETAILED COMPONENT INTERACTION FLOW                        │
└──────────────────────────────────────────────────────────────────────────────┘

FRONTEND COMPONENTS:
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ SimpleGameCanvas│─────▶│   QuizModal     │─────▶│  GameOverModal  │
│ (Game Engine)   │      │ (Questions)     │      │ (Save Prompt)   │
└────────┬────────┘      └─────────────────┘      └────────┬────────┘
         │                                                │
         │ Game State (Zustand)                           │
         ▼                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    gameStore.ts (Zustand)                       │
│  • currentStage                                                  │
│  • sessionCoins                                                 │
│  • quizAnswers                                                  │
│  • player (from contract)                                       │
│  • saveGameSession() ──┐                                       │
└────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  ContractManager.tsx │
              │  (Contract Bridge)    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ useMindoraRunner.ts   │
              │ (wagmi hooks)         │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  viem + wagmi         │
              │  (EVM RPC Client)     │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────────────────┐
              │      HEDERA EVM NODE              │
              │  (RPC Endpoint)                    │
              │  https://testnet.hashio.io/api     │
              └───────────┬───────────────────────┘
                          │
                          ▼
              ┌───────────────────────────────────┐
              │   SMART CONTRACT (Hedera)          │
              │   MindoraRunnerFinal.sol           │
              │   Address: 0.0.7172114             │
              └───────────┬───────────────────────┘
                          │
                          ▼
              ┌───────────────────────────────────┐
              │      HEDERA NETWORK                │
              │  • Updates on-chain state          │
              │  • Emits events                    │
              └───────────┬───────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ QuestCoin     │ │ Badge NFTs    │ │ Mirror Node   │
│ Token (HTS)  │ │ Token (HTS)   │ │ API (Query)   │
│              │ │               │ │               │
│ Mint & Xfer  │ │ Mint NFT      │ │ Get NFTs      │
│ to Player    │ │ to Player     │ │ Get Balance   │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Smart Contract → Token → NFT Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│              SMART CONTRACT TO TOKEN/NFT MINTING FLOW                       │
└────────────────────────────────────────────────────────────────────────────┘

1. CONTRACT STORAGE & STATE
   ┌────────────────────────────────────┐
   │ MindoraRunnerFinal.sol              │
   │                                     │
   │ Mapping: stageCompleted[addr][stage]│
   │ Mapping: tokensClaimed[addr][stage]│
   │ Mapping: nftClaimed[addr][stage]    │
   └────────────┬───────────────────────┘
                │
                │ When player completes stage and calls claimTokens() or claimNFT()
                ▼
   ┌────────────────────────────────────┐
   │ Contract Validates:               │
   │ • Stage completed?                │
   │ • Tokens not yet claimed?          │
   │ • NFT not yet claimed?             │
   └────────────┬───────────────────────┘
                │
                │ If valid, marks as claimed
                ▼
   ┌────────────────────────────────────┐
   │ Emits Event:                       │
   │ • TokensClaimed(address, stage, amt)│
   │ • NFTClaimed(address, stage, badge) │
   └────────────┬───────────────────────┘
                │
                │ Frontend listens for events
                ▼
   ┌────────────────────────────────────┐
   │ Frontend Detects Event              │
   │ Calls: hederaService.mintTokens()  │
   │        hederaService.mintNFT()      │
   └────────────┬───────────────────────┘
                │
                │ Uses Hedera SDK
                ▼
   ┌────────────────────────────────────┐
   │ Hedera SDK (JavaScript)           │
   │ • TokenMintTransaction             │
   │ • TokenTransferTransaction         │
   │ • NFT Minting with Metadata        │
   └────────────┬───────────────────────┘
                │
                │ Submits to Hedera Network
                ▼
   ┌────────────────────────────────────┐
   │ HEDERA TOKEN SERVICE (HTS)         │
   │                                     │
   │ ┌──────────────────────────────┐  │
   │ │ QuestCoin Token:              │  │
   │ │ • Mints new tokens            │  │
   │ │ • Transfers to player address │  │
   │ │ • Updates token supply        │  │
   │ └──────────────────────────────┘  │
   │                                     │
   │ ┌──────────────────────────────┐  │
   │ │ Badge NFT Token:              │  │
   │ │ • Mints NFT with serial #    │  │
   │ │ • Associates metadata        │  │
   │ │ • Transfers to player address│  │
   │ │ • Updates NFT supply         │  │
   │ └──────────────────────────────┘  │
   └────────────┬───────────────────────┘
                │
                │ Transaction confirmed on Hedera
                ▼
   ┌────────────────────────────────────┐
   │ MIRROR NODE API                    │
   │ • Indexes new transaction          │
   │ • Updates token balances           │
   │ • Updates NFT ownership            │
   │ • Makes data queryable via REST API│
   └────────────┬───────────────────────┘
                │
                │ Frontend queries for updates
                ▼
   ┌────────────────────────────────────┐
   │ Frontend (Marketplace)             │
   │ • Queries Mirror Node for NFTs     │
   │ • Fetches metadata from IPFS       │
   │ • Displays badges to user          │
   └────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Web3 Integration**: 
  - [WalletConnect AppKit](https://appkit.reown.com) - Wallet connection & authentication
  - [wagmi](https://wagmi.sh/) - React hooks for Hedera EVM
  - [viem](https://viem.sh/) - Ethereum/Hedera EVM interaction library
- **Game Engine**: HTML5 Canvas (custom runner game)
- **UI Components**: Framer Motion, Lucide React, NES.css

### Smart Contracts
- **Language**: Solidity 0.8.19
- **Network**: Hedera Testnet (Hedera Smart Contract Service)
- **Deployment**: Remix IDE
- **Contract Address**: `0.0.7172114` (Testnet)

### Backend Services
- **Hedera SDK**: [@hashgraph/sdk](https://github.com/hashgraph/hedera-sdk-js) - Token creation, NFT minting
- **HTS**: Hedera Token Service - QuestCoin & Badge NFTs
- **HCS**: Hedera Consensus Service (optional) - Game events

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Build Tool**: Next.js built-in bundler

---

## ✨ Features

### 🎮 Game Features
- **Endless Runner Gameplay** - Jump over obstacles, collect coins
- **Interactive Quiz System** - Answer questions about Hedera and Web3
- **3 Progressive Stages** - Increasing difficulty and rewards
- **Real-time Score Tracking** - On-chain leaderboard system
- **Coin Collection** - Collect coins for in-game currency

### 💰 Blockchain Features
- **Player Registration** - On-chain player profiles
- **Stage Completion Rewards** - Earn tokens and NFTs for completing stages
- **QuestCoin Tokens** - Fungible HTS tokens (20, 50, 100 tokens per stage)
- **Badge NFTs** - Unique NFT badges (Explorer, Adventurer, Master)
- **Leaderboard System** - Global and stage-specific rankings
- **Token & NFT Marketplace** - Trade badges and tokens (coming soon)

### 🔐 Wallet Integration
- **Email & Social Login** - Sign in with Google, Apple, etc.
- **EVM Wallet Support** - MetaMask, WalletConnect, and more
- **Hedera Native Wallets** - HashPack, Blade, etc.
- **Non-custodial** - Users maintain full control of their assets

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ LTS
- **npm** 9+
- **Hedera Testnet Account** - Get free testnet HBAR from [Hedera Portal](https://portal.hedera.com/)
- **Git** - For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GameD
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install deployment scripts dependencies** (optional)
   ```bash
   cd ../scripts
   npm install
   ```

4. **Configure environment variables**
   
   Create `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_HEDERA_NETWORK=testnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.7172114
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```
   
   Get a WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)

5. **Start development server**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the game**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
GameD/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React components
│   │   │   ├── SimpleGameCanvas.tsx    # Main game component
│   │   │   ├── QuizModal.tsx          # Quiz system
│   │   │   ├── GameUI.tsx             # Game interface
│   │   │   ├── Leaderboard.tsx         # Leaderboard display
│   │   │   └── WalletConnection.tsx    # Wallet integration
│   │   ├── config/             # Configuration
│   │   │   ├── contracts.ts    # Contract addresses & ABIs
│   │   │   └── wagmi.ts        # Wagmi configuration
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useMindoraRunner.ts    # Contract interaction hooks
│   │   │   └── useGameSounds.ts       # Audio hooks
│   │   ├── services/           # External services
│   │   │   └── hederaService.ts       # Hedera SDK integration
│   │   ├── store/             # State management
│   │   │   └── gameStore.ts           # Zustand game state
│   │   └── data/              # Static data
│   │       └── questions.ts          # Quiz questions
│   ├── public/                # Static assets
│   │   └── sounds/           # Game sound effects
│   └── package.json
│
├── Smart-contract/            # Solidity smart contracts
│   ├── MindoraRunnerFinal.sol        # Main game contract
│   └── NFTMarketplace.sol            # NFT marketplace contract
│
├── scripts/                   # Deployment scripts
│   ├── createTokens.js        # Create HTS tokens
│   ├── createHCSTopic.js      # Create HCS topic
│   └── setupNFTMetadata.js    # Generate NFT metadata
│
└── README.md                  # This file
```

---

## 📜 Smart Contracts

### MindoraRunnerFinal.sol

The main game contract that manages:
- Player registration and profiles
- Stage completion tracking
- Score and coin collection
- Token reward calculation
- NFT badge eligibility
- Leaderboard data

**Key Functions:**
- `registerPlayer(string username)` - Register a new player
- `saveGameSession(...)` - Save game progress and complete stages
- `claimTokens(uint256 stage)` - Claim QuestCoin tokens for a stage
- `claimNFT(uint256 stage)` - Claim NFT badge for a stage
- `getStageLeaderboard(...)` - Get leaderboard for a stage

**Contract Address (Testnet):** `0.0.7172114`  
**EVM Address:** `0xa2054053ded91cf7ecd51ea39756857a2f0a5284`

### NFTMarketplace.sol

Marketplace contract for trading NFT badges (future feature).

---

## 🎮 Gameplay

### How to Play

1. **Connect Wallet** - Click "Sign In / Sign Up" to connect your wallet
2. **Register** - Create your player profile (one-time setup)
3. **Start Game** - Click "Start Game" to begin
4. **Jump** - Press `SPACE` to jump over obstacles
5. **Collect Coins** - Gather golden coins for points
6. **Answer Questions** - Hit the purple wall to trigger quiz questions
7. **Complete Stages** - Answer correctly to complete the stage
8. **Earn Rewards** - Claim QuestCoin tokens and NFT badges
9. **Compete** - Check leaderboards to see your ranking

### Stage Rewards

- **Stage 1** - 20 QuestCoin + Explorer Badge NFT
- **Stage 2** - 50 QuestCoin + Adventurer Badge NFT
- **Stage 3** - 100 QuestCoin + Master Badge NFT

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard

3. **Deploy**
   - Vercel will automatically deploy on push

### Smart Contract Deployment (Remix IDE)

1. **Go to Remix IDE**: https://remix.ethereum.org
2. **Upload Contract**: Upload `Smart-contract/MindoraRunnerFinal.sol`
3. **Compile**: Select Solidity 0.8.19 compiler
4. **Deploy**: Use Hedera Remix plugin to deploy to testnet
5. **Copy Address**: Save contract address and update `NEXT_PUBLIC_CONTRACT_ADDRESS`

For detailed deployment instructions, see [scripts/README.md](./scripts/README.md)

---

## 📚 Additional Documentation

For more detailed information, see:

- [Frontend README](./frontend/README.md) - Frontend setup and development
- [Scripts README](./scripts/README.md) - Deployment scripts and token creation

---

## 🎯 Hackathon Submission

### Repository Requirements ✅

- ✅ **Public Non-Organization GitHub Repository** - This repository is public
- ✅ **Fresh Repository** - Created during hackathon period
- ✅ **Well-Structured README** - This README explains idea, stack, and setup steps
- ✅ **Good Coding Practices** - Clean, modular code with TypeScript

### Submission Steps

1. **Add Pitch Deck & Certification Links**
   
   Add links to your pitch deck and certifications in this README:
   
   ```markdown
   ## 📄 Pitch Deck & Certifications
   
   - [Pitch Deck](./docs/pitch-deck.pdf)
   - [Certification 1](./docs/certification-1.pdf)
   - [Demo Video](./docs/demo-video.mp4)
   ```

2. **Invite Collaborator**
   
   Invite `Hackathon@hashgraph-association.com` as a collaborator to this repository:
   
   - Go to repository Settings → Collaborators
   - Add `Hackathon@hashgraph-association.com`
   - Grant read access
   
   **Why?** An AI system assists the judging process and needs collaborator access to your repository.

3. **Submit to BUIDL Platform**
   
   Follow the hackathon submission process on the BUIDL platform.

---

## 🧪 Testing

```bash
# Run build to check for errors
cd frontend
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

This is a hackathon project. Contributions are welcome via pull requests!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Hedera Hashgraph** - For providing an amazing blockchain platform
- **WalletConnect** - For seamless wallet integration
- **Next.js Team** - For the excellent framework
- **Open Source Community** - For all the amazing libraries

---

## 📞 Contact & Support

- **GitHub Issues**: Report bugs or request features
- **Hackathon Discord**: Join the hackathon Discord for support

---

## 🔗 Useful Links

- [Hedera Documentation](https://docs.hedera.com)
- [WalletConnect AppKit Docs](https://appkit.reown.com)
- [HashScan Explorer](https://hashscan.io/testnet)
- [Hedera Portal](https://portal.hedera.com/)

---

**Built with ❤️ for the Hedera ecosystem**

Made for the Hedera Hackathon 🚀
