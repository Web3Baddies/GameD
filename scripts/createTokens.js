const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  PrivateKey
} = require("@hashgraph/sdk");
const fs = require("fs");

// Load environment variables
require('dotenv').config();

// Your account details from environment variables
const operatorId = process.env.HEDERA_OPERATOR_ID;
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);

async function createTokens() {
  console.log("🪙 Starting token creation...");

  // Create Hedera client
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  try {
    // STEP 1: Create QuestCoin Token (Like game currency)
    console.log("💰 Creating QuestCoin token...");

    const questCoinTx = new TokenCreateTransaction()
      .setTokenName("QuestCoin")           // Full name
      .setTokenSymbol("QC")                // Short symbol
      .setTokenType(TokenType.FungibleCommon)  // Regular token (not NFT)
      .setDecimals(2)                      // 2 decimal places (like dollars.cents)
      .setInitialSupply(1000000)           // Start with 1 million tokens
      .setSupplyType(TokenSupplyType.Infinite)  // Can create more later
      .setTreasuryAccountId(operatorId)    // You own the tokens
      .setAdminKey(operatorKey)            // You can manage the token
      .setSupplyKey(operatorKey)           // You can mint more tokens
      .setMaxTransactionFee(new Hbar(30)); // Max fee willing to pay

    const questCoinSubmit = await questCoinTx.execute(client);
    const questCoinReceipt = await questCoinSubmit.getReceipt(client);
    const questCoinId = questCoinReceipt.tokenId;

    console.log(`✅ QuestCoin created: ${questCoinId}`);
    console.log(`🔗 View on Hashscan: https://hashscan.io/testnet/token/${questCoinId}`);

    // STEP 2: Create Badge NFT Token (Like collectible trophies)
    console.log("🏆 Creating Badge NFT token...");

    const badgeNFTTx = new TokenCreateTransaction()
      .setTokenName("Mindora Runner Badges") // Full name
      .setTokenSymbol("MRB")                 // Short symbol
      .setTokenType(TokenType.NonFungibleUnique)  // NFT type
      .setSupplyType(TokenSupplyType.Infinite)    // Can create unlimited NFTs
      .setTreasuryAccountId(operatorId)      // You own the NFTs
      .setAdminKey(operatorKey)              // You can manage NFTs
      .setSupplyKey(operatorKey)             // You can mint new NFTs
      .setMaxTransactionFee(new Hbar(30));   // Max fee willing to pay

    const badgeNFTSubmit = await badgeNFTTx.execute(client);
    const badgeNFTReceipt = await badgeNFTSubmit.getReceipt(client);
    const badgeNFTId = badgeNFTReceipt.tokenId;

    console.log(`✅ Badge NFT created: ${badgeNFTId}`);
    console.log(`🔗 View on Hashscan: https://hashscan.io/testnet/token/${badgeNFTId}`);

    // STEP 3: Update environment file
    console.log("📝 Updating .env.local with token IDs...");

    const envPath = '../Frontend/.env.local';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace('NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=0.0.TOKEN_ID', `NEXT_PUBLIC_QUESTCOIN_TOKEN_ID=${questCoinId}`);
    envContent = envContent.replace('NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=0.0.NFT_TOKEN_ID', `NEXT_PUBLIC_BADGE_NFT_TOKEN_ID=${badgeNFTId}`);
    fs.writeFileSync(envPath, envContent);

    console.log("✅ Environment updated!");
    console.log("");
    console.log("🎉 ALL TOKENS CREATED SUCCESSFULLY!");
    console.log("📋 Summary:");
    console.log(`   💰 QuestCoin: ${questCoinId}`);
    console.log(`   🏆 Badge NFT: ${badgeNFTId}`);
    console.log("");
    console.log("🎯 Next step: Start your game with 'npm run dev'");

  } catch (error) {
    console.error("❌ Token creation failed:", error);
  }

  client.close();
}

// Run token creation
createTokens();