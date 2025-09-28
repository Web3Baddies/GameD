// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MindoraRunner is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Events
    event PlayerRegistered(address indexed player, string username);
    event StageCompleted(address indexed player, uint256 stageId, uint256 score, uint256 tokensEarned);
    event NFTAwarded(address indexed player, uint256 tokenId, string badgeType);
    event LeaderboardUpdated(address indexed player, uint256 newRank, uint256 totalScore);

    // Structs
    struct Player {
        address wallet;
        string username;
        uint256 currentStage;
        uint256 totalScore;
        uint256 tokensEarned;
        uint256 nftsEarned;
        uint256[] completedStages;
        uint256 registrationTime;
        bool isActive;
    }

    struct Stage {
        uint256 id;
        string name;
        uint256 difficulty;
        uint256 tokenReward;
        uint256 minScore;
        bool isActive;
        string[] questions;
        uint256[] correctAnswers;
    }

    struct LeaderboardEntry {
        address player;
        uint256 totalScore;
        uint256 currentStage;
        uint256 lastUpdateTime;
    }

    // State variables
    Counters.Counter private _playerCount;
    Counters.Counter private _stageCount;
    Counters.Counter private _nftCount;

    mapping(address => Player) public players;
    mapping(uint256 => Stage) public stages;
    mapping(address => bool) public isPlayerRegistered;
    
    LeaderboardEntry[] public leaderboard;
    mapping(address => uint256) public playerRank;

    // Game configuration
    uint256 public constant MAX_STAGES = 10;
    uint256 public constant TOKEN_DECIMALS = 2;
    uint256 public constant BASE_TOKEN_REWARD = 100;
    
    // Token and NFT addresses (set after deployment)
    address public gameToken;
    address public nftCollection;

    constructor() {
        _initializeStages();
    }

    // Player registration
    function registerPlayer(string memory username) external {
        require(!isPlayerRegistered[msg.sender], "Player already registered");
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 20, "Username too long");

        _playerCount.increment();
        
        players[msg.sender] = Player({
            wallet: msg.sender,
            username: username,
            currentStage: 1,
            totalScore: 0,
            tokensEarned: 0,
            nftsEarned: 0,
            completedStages: new uint256[](0),
            registrationTime: block.timestamp,
            isActive: true
        });

        isPlayerRegistered[msg.sender] = true;
        
        emit PlayerRegistered(msg.sender, username);
    }

    // Complete a stage
    function completeStage(
        uint256 stageId,
        uint256 score,
        uint256[] memory answers
    ) external nonReentrant {
        require(isPlayerRegistered[msg.sender], "Player not registered");
        require(stageId > 0 && stageId <= _stageCount.current(), "Invalid stage ID");
        require(stages[stageId].isActive, "Stage not active");
        require(score >= stages[stageId].minScore, "Score too low");
        
        Player storage player = players[msg.sender];
        require(stageId == player.currentStage, "Must complete stages in order");
        require(answers.length == stages[stageId].questions.length, "Invalid number of answers");

        // Validate answers
        require(_validateAnswers(stageId, answers), "Invalid answers");

        // Calculate rewards
        uint256 tokenReward = _calculateTokenReward(stageId, score);
        
        // Update player data
        player.currentStage = stageId + 1;
        player.totalScore += score;
        player.tokensEarned += tokenReward;
        player.completedStages.push(stageId);

        // Award NFT for significant achievements
        if (score >= stages[stageId].minScore * 2) {
            _awardNFT(msg.sender, stageId, score);
            player.nftsEarned++;
        }

        // Update leaderboard
        _updateLeaderboard(msg.sender);

        emit StageCompleted(msg.sender, stageId, score, tokenReward);
    }

    // Get player data
    function getPlayer(address playerAddress) external view returns (Player memory) {
        require(isPlayerRegistered[playerAddress], "Player not registered");
        return players[playerAddress];
    }

    // Get leaderboard
    function getLeaderboard(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        uint256 length = leaderboard.length;
        if (limit == 0 || limit > length) {
            limit = length;
        }

        LeaderboardEntry[] memory result = new LeaderboardEntry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = leaderboard[i];
        }
        return result;
    }

    // Get player rank
    function getPlayerRank(address playerAddress) external view returns (uint256) {
        require(isPlayerRegistered[playerAddress], "Player not registered");
        return playerRank[playerAddress];
    }

    // Internal functions
    function _validateAnswers(uint256 stageId, uint256[] memory answers) internal view returns (bool) {
        Stage storage stage = stages[stageId];
        for (uint256 i = 0; i < answers.length; i++) {
            if (answers[i] != stage.correctAnswers[i]) {
                return false;
            }
        }
        return true;
    }

    function _calculateTokenReward(uint256 stageId, uint256 score) internal view returns (uint256) {
        Stage storage stage = stages[stageId];
        uint256 baseReward = stage.tokenReward;
        uint256 scoreMultiplier = (score * 100) / stage.minScore; // Percentage of minimum score
        return (baseReward * scoreMultiplier) / 100;
    }

    function _awardNFT(address player, uint256 stageId, uint256 score) internal {
        _nftCount.increment();
        uint256 tokenId = _nftCount.current();
        
        string memory badgeType = _getBadgeType(stageId, score);
        
        emit NFTAwarded(player, tokenId, badgeType);
    }

    function _getBadgeType(uint256 stageId, uint256 score) internal pure returns (string memory) {
        if (stageId == 1) return "Explorer";
        if (stageId == 2) return "Adventurer";
        if (stageId == 3) return "Scholar";
        if (stageId == 4) return "Master";
        if (stageId == 5) return "Legend";
        return "Achievement";
    }

    function _updateLeaderboard(address player) internal {
        Player storage playerData = players[player];
        
        // Remove old entry if exists
        uint256 oldRank = playerRank[player];
        if (oldRank > 0) {
            _removeFromLeaderboard(oldRank - 1);
        }

        // Add new entry
        LeaderboardEntry memory newEntry = LeaderboardEntry({
            player: player,
            totalScore: playerData.totalScore,
            currentStage: playerData.currentStage,
            lastUpdateTime: block.timestamp
        });

        leaderboard.push(newEntry);
        _sortLeaderboard();
        
        // Update player rank
        for (uint256 i = 0; i < leaderboard.length; i++) {
            playerRank[leaderboard[i].player] = i + 1;
        }

        emit LeaderboardUpdated(player, playerRank[player], playerData.totalScore);
    }

    function _removeFromLeaderboard(uint256 index) internal {
        require(index < leaderboard.length, "Index out of bounds");
        
        for (uint256 i = index; i < leaderboard.length - 1; i++) {
            leaderboard[i] = leaderboard[i + 1];
        }
        leaderboard.pop();
    }

    function _sortLeaderboard() internal {
        for (uint256 i = 0; i < leaderboard.length - 1; i++) {
            for (uint256 j = 0; j < leaderboard.length - i - 1; j++) {
                if (leaderboard[j].totalScore < leaderboard[j + 1].totalScore) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }

    function _initializeStages() internal {
        // Stage 1: Beginner
        stages[1] = Stage({
            id: 1,
            name: "Beginner",
            difficulty: 1,
            tokenReward: 100,
            minScore: 60,
            isActive: true,
            questions: ["What is the capital of France?", "What is 2 + 2?"],
            correctAnswers: [1, 1] // Paris, 4
        });

        // Stage 2: Intermediate
        stages[2] = Stage({
            id: 2,
            name: "Intermediate",
            difficulty: 2,
            tokenReward: 250,
            minScore: 70,
            isActive: true,
            questions: ["What is the largest planet?", "What is the chemical symbol for gold?"],
            correctAnswers: [1, 2] // Jupiter, Au
        });

        // Stage 3: Advanced
        stages[3] = Stage({
            id: 3,
            name: "Advanced",
            difficulty: 3,
            tokenReward: 500,
            minScore: 80,
            isActive: true,
            questions: ["What is the speed of light?", "Who wrote 'Romeo and Juliet'?"],
            correctAnswers: [2, 0] // 299,792,458 m/s, Shakespeare
        });

        _stageCount = Counters.Counter(3);
    }

    // Admin functions
    function setTokenAddresses(address _gameToken, address _nftCollection) external onlyOwner {
        gameToken = _gameToken;
        nftCollection = _nftCollection;
    }

    function addStage(
        string memory name,
        uint256 difficulty,
        uint256 tokenReward,
        uint256 minScore,
        string[] memory questions,
        uint256[] memory correctAnswers
    ) external onlyOwner {
        require(_stageCount.current() < MAX_STAGES, "Maximum stages reached");
        require(questions.length == correctAnswers.length, "Questions and answers length mismatch");

        _stageCount.increment();
        uint256 stageId = _stageCount.current();

        stages[stageId] = Stage({
            id: stageId,
            name: name,
            difficulty: difficulty,
            tokenReward: tokenReward,
            minScore: minScore,
            isActive: true,
            questions: questions,
            correctAnswers: correctAnswers
        });
    }

    function toggleStage(uint256 stageId, bool isActive) external onlyOwner {
        require(stageId > 0 && stageId <= _stageCount.current(), "Invalid stage ID");
        stages[stageId].isActive = isActive;
    }

    function getTotalPlayers() external view returns (uint256) {
        return _playerCount.current();
    }

    function getTotalStages() external view returns (uint256) {
        return _stageCount.current();
    }
}
