import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying FlySure Policy Contract...");
  console.log("=" .repeat(50));

  // PYUSD token address on Sepolia testnet
  const PYUSD_SEPOLIA_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Deployment Details:");
  console.log("   Deployer:", deployer.address);
  console.log("   Network:", hre.network.name);
  console.log("   PYUSD Token:", PYUSD_SEPOLIA_ADDRESS);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   Deployer Balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ Error: Deployer has no ETH for gas!");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
    return;
  }

  // Deploy Policy contract
  console.log("\n⏳ Deploying Policy contract...");
  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = await Policy.deploy(PYUSD_SEPOLIA_ADDRESS);

  await policy.waitForDeployment();

  const policyAddress = await policy.getAddress();
  
  console.log("\n✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=" .repeat(50));
  console.log("\n📍 Contract Addresses:");
  console.log("   Policy Contract:", policyAddress);
  console.log("   PYUSD Token:", PYUSD_SEPOLIA_ADDRESS);
  
  // Verify contract configuration
  console.log("\n🔍 Verifying Configuration...");
  const pyusdToken = await policy.pyusdToken();
  const owner = await policy.owner();
  const oracleAddress = await policy.oracleAddress();
  
  console.log("   PYUSD Token Set:", pyusdToken === PYUSD_SEPOLIA_ADDRESS ? "✅" : "❌");
  console.log("   Owner:", owner);
  console.log("   Oracle:", oracleAddress === hre.ethers.ZeroAddress ? "Not set (needs configuration)" : oracleAddress);
  
  // Contract interaction examples
  console.log("\n📚 Usage Examples:");
  console.log("=" .repeat(50));
  
  console.log("\n1️⃣  Set Oracle Address (Owner only):");
  console.log(`   await policy.setOracleAddress("YOUR_ORACLE_ADDRESS");`);
  
  console.log("\n2️⃣  Create a Policy (Users):");
  console.log(`   // First approve PYUSD`);
  console.log(`   await pyusd.approve("${policyAddress}", ethers.parseUnits("10", 6));`);
  console.log(`   // Then create policy`);
  console.log(`   await policy.createPolicy("IST-BER-20251025", premium, payout, 120);`);
  
  console.log("\n3️⃣  Trigger Payout (Oracle only):");
  console.log(`   await policy.triggerPayout(policyId, actualDelayInMinutes);`);
  
  console.log("\n4️⃣  Get Policy Details:");
  console.log(`   const policy = await policy.getPolicyDetails(policyId);`);
  
  // Save deployment info
  console.log("\n💾 Saving deployment information...");
  const deploymentInfo = {
    network: hre.network.name,
    policyContract: policyAddress,
    pyusdToken: PYUSD_SEPOLIA_ADDRESS,
    deployer: deployer.address,
    owner: owner,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("=" .repeat(50));
  console.log("1. Set oracle address using setOracleAddress()");
  console.log("2. Fund contract with PYUSD for payouts");
  console.log("3. Get PYUSD testnet tokens: https://faucet.paxos.com/");
  console.log("4. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${policyAddress} ${PYUSD_SEPOLIA_ADDRESS}`);
  console.log("5. Test policy creation with scripts/createPolicyExample.ts");
  console.log("6. Build and deploy frontend");
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });

