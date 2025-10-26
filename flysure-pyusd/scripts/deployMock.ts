import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Mock PYUSD Token...");
  console.log("==================================================\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployment Details:");
  console.log("   Deployer:", deployer.address);
  console.log("   Network:", hre.network.name);
  console.log("   Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy MockPYUSD
  console.log("\n⏳ Deploying MockPYUSD contract...");
  const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = await MockPYUSD.deploy();
  await mockPYUSD.waitForDeployment();

  const mockPYUSDAddress = await mockPYUSD.getAddress();
  console.log("✅ MockPYUSD deployed to:", mockPYUSDAddress);

  // Check balance
  const balance = await mockPYUSD.balanceOf(deployer.address);
  console.log("💰 Deployer PYUSD balance:", hre.ethers.formatUnits(balance, 6), "PYUSD");

  // Deploy Policy contract with MockPYUSD
  console.log("\n⏳ Deploying Policy contract with MockPYUSD...");
  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = await Policy.deploy(mockPYUSDAddress);
  await policy.waitForDeployment();

  const policyAddress = await policy.getAddress();
  console.log("✅ Policy deployed to:", policyAddress);

  // Set oracle (deployer as oracle for testing)
  console.log("\n🔧 Setting deployer as oracle...");
  await policy.setOracleAddress(deployer.address);
  console.log("✅ Oracle set to:", deployer.address);

  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("==================================================");
  console.log("📍 Contract Addresses:");
  console.log("   MockPYUSD:", mockPYUSDAddress);
  console.log("   Policy Contract:", policyAddress);
  console.log("   Oracle:", deployer.address);

  console.log("\n📚 Usage Examples:");
  console.log("==================================================");
  console.log("1️⃣  Create a Policy:");
  console.log(`   await policy.createPolicy("IST-BER-20251025", premium, payout, 120);`);
  
  console.log("\n2️⃣  Trigger Payout:");
  console.log(`   await policy.triggerPayout(policyId, actualDelayInMinutes);`);

  console.log("\n3️⃣  Get Policy Details:");
  console.log(`   const policy = await policy.getPolicyDetails(policyId);`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    mockPYUSD: mockPYUSDAddress,
    policyContract: policyAddress,
    oracle: deployer.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
