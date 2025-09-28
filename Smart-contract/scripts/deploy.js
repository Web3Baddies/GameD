const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Mindora Runner contracts...");

  // Get the contract factory
  const MindoraRunner = await ethers.getContractFactory("MindoraRunner");

  // Deploy the contract
  console.log("📝 Deploying MindoraRunner contract...");
  const mindoraRunner = await MindoraRunner.deploy();
  await mindoraRunner.waitForDeployment();

  const contractAddress = await mindoraRunner.getAddress();
  console.log("✅ MindoraRunner deployed to:", contractAddress);

  // Get contract info
  const totalStages = await mindoraRunner.getTotalStages();
  console.log("📊 Initial stages created:", totalStages.toString());

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const totalPlayers = await mindoraRunner.getTotalPlayers();
  console.log("👥 Total players:", totalPlayers.toString());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: await mindoraRunner.owner(),
    deploymentTime: new Date().toISOString(),
    totalStages: totalStages.toString(),
    totalPlayers: totalPlayers.toString()
  };

  console.log("📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Set token addresses using setTokenAddresses()");
  console.log("2. Verify contract on HashScan");
  console.log("3. Update frontend with contract address");
  console.log("4. Test player registration and stage completion");

  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`Contract Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
