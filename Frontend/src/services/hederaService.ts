import { Client, PrivateKey, AccountId, ContractCallQuery, ContractExecuteTransaction, ContractFunctionParameters } from '@hashgraph/sdk';

export interface PlayerData {
  wallet: string;
  username: string;
  currentStage: number;
  totalScore: number;
  tokensEarned: number;
  nftsEarned: number;
  completedStages: number[];
  registrationTime: number;
  isActive: boolean;
}

export interface StageData {
  id: number;
  name: string;
  difficulty: number;
  tokenReward: number;
  minScore: number;
  isActive: boolean;
  questions: string[];
  correctAnswers: number[];
}

export interface LeaderboardEntry {
  player: string;
  totalScore: number;
  currentStage: number;
  lastUpdateTime: number;
}

class HederaService {
  private client: Client | null = null;
  private contractAddress: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Initialize Hedera client
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      
      if (network === 'mainnet') {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      // Set operator (in production, this would be done server-side)
      const operatorId = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID;
      const operatorKey = process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY;
      
      if (operatorId && operatorKey) {
        this.client.setOperator(
          AccountId.fromString(operatorId),
          PrivateKey.fromString(operatorKey)
        );
      }

      this.isInitialized = true;
      console.log('✅ Hedera client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error);
    }
  }

  setContractAddress(address: string) {
    this.contractAddress = address;
  }

  async registerPlayer(username: string, _walletAddress: string): Promise<boolean> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractAddress)
        .setFunction('registerPlayer', new ContractFunctionParameters().addString(username))
        .setGas(100000);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Failed to register player:', error);
      throw error;
    }
  }

  async getPlayer(walletAddress: string): Promise<PlayerData | null> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractAddress)
        .setFunction('getPlayer', new ContractFunctionParameters().addAddress(walletAddress))
        .setGas(100000);

      const response = await query.execute(this.client);
      
      if (response.getBool(0)) { // Player exists
        return {
          wallet: response.getAddress(1),
          username: response.getString(2),
          currentStage: response.getUint256(3).toNumber(),
          totalScore: response.getUint256(4).toNumber(),
          tokensEarned: response.getUint256(5).toNumber(),
          nftsEarned: response.getUint256(6).toNumber(),
          completedStages: [], // Mock data for now
          registrationTime: response.getUint256(8).toNumber(),
          isActive: response.getBool(9)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get player:', error);
      throw error;
    }
  }

  async completeStage(
    stageId: number, 
    score: number, 
    answers: number[], 
    walletAddress: string
  ): Promise<boolean> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractAddress)
        .setFunction('completeStage', new ContractFunctionParameters()
          .addUint256(stageId)
          .addUint256(score)
          .addUint256Array(answers)
        )
        .setGas(200000);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      return receipt.status.toString() === 'SUCCESS';
    } catch (error) {
      console.error('Failed to complete stage:', error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractAddress)
        .setFunction('getLeaderboard', new ContractFunctionParameters().addUint256(limit))
        .setGas(100000);

      const response = await query.execute(this.client);
      
      const entries: LeaderboardEntry[] = [];
      const count = response.getUint256(0).toNumber();
      
      for (let i = 0; i < count; i++) {
        entries.push({
          player: response.getAddress(1 + i * 4),
          totalScore: response.getUint256(2 + i * 4).toNumber(),
          currentStage: response.getUint256(3 + i * 4).toNumber(),
          lastUpdateTime: response.getUint256(4 + i * 4).toNumber()
        });
      }
      
      return entries;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  async getPlayerRank(walletAddress: string): Promise<number> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractAddress)
        .setFunction('getPlayerRank', new ContractFunctionParameters().addAddress(walletAddress))
        .setGas(100000);

      const response = await query.execute(this.client);
      return response.getUint256(0).toNumber();
    } catch (error) {
      console.error('Failed to get player rank:', error);
      throw error;
    }
  }

  async getStage(stageId: number): Promise<StageData | null> {
    if (!this.client || !this.contractAddress) {
      throw new Error('Hedera client or contract not initialized');
    }

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractAddress)
        .setFunction('stages', new ContractFunctionParameters().addUint256(stageId))
        .setGas(100000);

      const response = await query.execute(this.client);
      
      return {
        id: response.getUint256(0).toNumber(),
        name: response.getString(1),
        difficulty: response.getUint256(2).toNumber(),
        tokenReward: response.getUint256(3).toNumber(),
        minScore: response.getUint256(4).toNumber(),
        isActive: response.getBool(5),
        questions: [], // Mock data for now
        correctAnswers: [] // Mock data for now
      };
    } catch (error) {
      console.error('Failed to get stage:', error);
      throw error;
    }
  }

  // Mock functions for development
  async mockRegisterPlayer(username: string, walletAddress: string): Promise<boolean> {
    console.log(`Mock: Registering player ${username} with wallet ${walletAddress}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  async mockGetPlayer(walletAddress: string): Promise<PlayerData | null> {
    console.log(`Mock: Getting player data for ${walletAddress}`);
    return new Promise(resolve => setTimeout(() => resolve({
      wallet: walletAddress,
      username: 'MockPlayer',
      currentStage: 1,
      totalScore: 0,
      tokensEarned: 0,
      nftsEarned: 0,
      completedStages: [],
      registrationTime: Date.now(),
      isActive: true
    }), 500));
  }

  async mockCompleteStage(stageId: number, score: number, _answers: number[]): Promise<boolean> {
    console.log(`Mock: Completing stage ${stageId} with score ${score}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  async mockGetLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    console.log(`Mock: Getting leaderboard with limit ${limit}`);
    return new Promise(resolve => setTimeout(() => resolve([
      { player: '0x123...', totalScore: 15420, currentStage: 5, lastUpdateTime: Date.now() },
      { player: '0x456...', totalScore: 14280, currentStage: 4, lastUpdateTime: Date.now() },
      { player: '0x789...', totalScore: 13850, currentStage: 4, lastUpdateTime: Date.now() }
    ]), 500));
  }
}

// Export singleton instance
export const hederaService = new HederaService();
