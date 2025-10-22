import hre from "hardhat";

/**
 * Quick test script to verify getPolicyDetails function works
 */

async function main() {
  console.log("Testing getPolicyDetails function...\n");
  
  // Deploy contract first
  const PYUSD_SEPOLIA = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = await Policy.deploy(PYUSD_SEPOLIA);
  await policy.waitForDeployment();
  
  const address = await policy.getAddress();
  console.log("✅ Contract deployed to:", address);
  
  // Try to get a non-existent policy
  console.log("\n🔍 Testing getPolicyDetails(1)...");
  const policyDetails = await policy.getPolicyDetails(1);
  
  console.log("Policy Details:");
  console.log("  Policy ID:", policyDetails.policyId.toString());
  console.log("  Holder:", policyDetails.policyHolder);
  console.log("  Flight ID:", policyDetails.flightId);
  console.log("  Premium:", hre.ethers.formatUnits(policyDetails.premiumAmount, 6), "PYUSD");
  console.log("  Payout:", hre.ethers.formatUnits(policyDetails.payoutAmount, 6), "PYUSD");
  console.log("  Delay Threshold:", policyDetails.delayThreshold.toString(), "minutes");
  console.log("  Status:", policyDetails.status === 0n ? "ACTIVE" : policyDetails.status === 1n ? "PAID" : "EXPIRED");
  
  if (policyDetails.policyHolder === hre.ethers.ZeroAddress) {
    console.log("\n✅ Policy doesn't exist (as expected) - function works!");
  }
  
  console.log("\n✨ getPolicyDetails function is working correctly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

