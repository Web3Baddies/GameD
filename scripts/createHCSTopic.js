const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
  PrivateKey
} = require("@hashgraph/sdk");
const fs = require("fs");

// Your account details
const operatorId = "0.0.6919858";
const operatorKey = PrivateKey.fromStringECDSA("0xe95f45e1c1bf59d65479d042898b8e13b4011fd0bdd4890867fcd36b0c2abb73");

async function createHCSTopic() {
  console.log("📨 Creating HCS topic for game events...");

  // Create Hedera client
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  try {
    // STEP 1: Create HCS Topic (like creating a public announcement board)
    console.log("📋 Creating game events topic...");

    const topicCreateTx = new TopicCreateTransaction()
      .setTopicMemo("Mindora Runner Game Events")  // Description
      .setAdminKey(operatorKey)                    // You can manage the topic
      .setSubmitKey(operatorKey)                   // You can post messages
      .setMaxTransactionFee(new Hbar(10));        // Max fee

    const topicCreateSubmit = await topicCreateTx.execute(client);
    const topicCreateReceipt = await topicCreateSubmit.getReceipt(client);
    const topicId = topicCreateReceipt.topicId;

    console.log(`✅ HCS Topic created: ${topicId}`);
    console.log(`🔗 View on Hashscan: https://hashscan.io/testnet/topic/${topicId}`);

    // STEP 2: Test by sending a message
    console.log("📤 Testing topic with sample message...");

    const testMessage = JSON.stringify({
      event: "game_started",
      player: "0.0.123456",
      timestamp: new Date().toISOString(),
      message: "Mindora Runner HCS topic is working!"
    });

    const messageSubmitTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(testMessage)
      .setMaxTransactionFee(new Hbar(1));

    const messageSubmitSubmit = await messageSubmitTx.execute(client);
    const messageSubmitReceipt = await messageSubmitSubmit.getReceipt(client);

    console.log(`✅ Test message sent! Sequence number: ${messageSubmitReceipt.topicSequenceNumber}`);

    // STEP 3: Update environment file
    console.log("📝 Updating .env.local with topic ID...");

    const envPath = '../Frontend/.env.local';
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace('NEXT_PUBLIC_GAME_EVENTS_TOPIC=0.0.TOPIC_ID', `NEXT_PUBLIC_GAME_EVENTS_TOPIC=${topicId}`);
    fs.writeFileSync(envPath, envContent);

    console.log("✅ Environment updated!");
    console.log("");
    console.log("🎉 HCS TOPIC CREATED SUCCESSFULLY!");
    console.log("📋 What this enables:");
    console.log("   📨 Public game event logging");
    console.log("   ⏰ Timestamped proof of achievements");
    console.log("   🛡️ Anti-cheat verification");
    console.log("   📊 Public leaderboard transparency");
    console.log("");
    console.log("🎯 Your game now has full transparency!");

  } catch (error) {
    console.error("❌ HCS topic creation failed:", error);
  }

  client.close();
}

// Run HCS topic creation
createHCSTopic();