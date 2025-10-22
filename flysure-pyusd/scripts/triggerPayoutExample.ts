import hre from "hardhat";

/**
 * Example script showing how to trigger a policy payout (Oracle function)
 * 
 * Prerequisites:
 * 1. You must be the oracle address (or owner for testing)
 * 2. Policy must exist and be ACTIVE
 * 3. Contract must have sufficient PYUSD for payout
 */

async function main() {
  // Configuration
  const POLICY_CONTRACT_ADDRESS = "YOUR_DEPLOYED_POLICY_CONTRACT_ADDRESS";
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // Sepolia
  
  // Policy to process
  const POLICY_ID = 1; // Change this to your policy ID
  const ACTUAL_DELAY = 150; // Actual flight delay in minutes
  
  // Get signer (should be oracle address)
  const [signer] = await hre.ethers.getSigners();
  console.log("Using oracle account:", signer.address);
  
  // Get contract instances
  const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
  const pyusdToken = await hre.ethers.getContractAt("IERC20", PYUSD_ADDRESS);
  
  console.log("\n📋 Processing Payout Request");
  console.log("   Policy ID:", POLICY_ID);
  console.log("   Actual Delay:", ACTUAL_DELAY, "minutes");
  
  // Step 1: Verify oracle address
  const oracleAddress = await policyContract.oracleAddress();
  console.log("\n🔐 Oracle Address:", oracleAddress);
  
  if (signer.address.toLowerCase() !== oracleAddress.toLowerCase()) {
    console.error("\n❌ Error: You are not the oracle!");
    console.log("   Your address:", signer.address);
    console.log("   Oracle address:", oracleAddress);
    return;
  }
  
  // Step 2: Fetch policy details
  console.log("\n📄 Fetching policy details...");
  const policy = await policyContract.policies(POLICY_ID);
  
  if (policy.policyHolder === hre.ethers.ZeroAddress) {
    console.error("\n❌ Error: Policy not found!");
    return;
  }
  
  console.log("   Policy ID:", policy.policyId.toString());
  console.log("   Holder:", policy.policyHolder);
  console.log("   Flight ID:", policy.flightId);
  console.log("   Premium:", hre.ethers.formatUnits(policy.premiumAmount, 6), "PYUSD");
  console.log("   Payout:", hre.ethers.formatUnits(policy.payoutAmount, 6), "PYUSD");
  console.log("   Delay Threshold:", policy.delayThreshold.toString(), "minutes");
  console.log("   Status:", policy.status === 0n ? "ACTIVE" : policy.status === 1n ? "PAID" : "EXPIRED");
  
  if (policy.status !== 0n) {
    console.error("\n❌ Error: Policy is not ACTIVE!");
    return;
  }
  
  // Step 3: Check contract PYUSD balance
  const contractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
  console.log("\n💰 Contract PYUSD Balance:", hre.ethers.formatUnits(contractBalance, 6), "PYUSD");
  
  if (contractBalance < policy.payoutAmount) {
    console.error("\n❌ Error: Contract has insufficient PYUSD for payout!");
    console.log("   Required:", hre.ethers.formatUnits(policy.payoutAmount, 6), "PYUSD");
    console.log("   Available:", hre.ethers.formatUnits(contractBalance, 6), "PYUSD");
    return;
  }
  
  // Step 4: Determine payout eligibility
  console.log("\n🔍 Delay Analysis:");
  console.log("   Threshold:", policy.delayThreshold.toString(), "minutes");
  console.log("   Actual Delay:", ACTUAL_DELAY, "minutes");
  
  const willPayout = ACTUAL_DELAY >= policy.delayThreshold;
  console.log("   Payout Eligible:", willPayout ? "YES ✅" : "NO ❌");
  
  if (willPayout) {
    console.log("   Action: Will process payout");
  } else {
    console.log("   Action: Will expire policy without payout");
  }
  
  // Step 5: Trigger payout
  console.log("\n⚡ Triggering payout...");
  const tx = await policyContract.triggerPayout(POLICY_ID, ACTUAL_DELAY);
  
  console.log("   Transaction sent:", tx.hash);
  console.log("   Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("   ✅ Transaction confirmed!");
  
  // Step 6: Check if payout event was emitted
  const payoutEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = policyContract.interface.parseLog(log);
      return parsed?.name === "PolicyPaidOut";
    } catch {
      return false;
    }
  });
  
  if (payoutEvent) {
    const parsedEvent = policyContract.interface.parseLog(payoutEvent);
    console.log("\n🎉 PAYOUT SUCCESSFUL!");
    console.log("   Policy ID:", parsedEvent?.args[0].toString());
    console.log("   Beneficiary:", parsedEvent?.args[1]);
    console.log("   Amount Paid:", hre.ethers.formatUnits(parsedEvent?.args[2], 6), "PYUSD");
  } else {
    console.log("\n⏰ POLICY EXPIRED");
    console.log("   Flight delay did not meet threshold");
    console.log("   No payout processed");
  }
  
  // Step 7: Verify updated policy status
  const updatedPolicy = await policyContract.policies(POLICY_ID);
  console.log("\n📊 Updated Policy Status:");
  console.log("   Status:", updatedPolicy.status === 0n ? "ACTIVE" : updatedPolicy.status === 1n ? "PAID" : "EXPIRED");
  
  // Check holder balance if payout was made
  if (willPayout) {
    const holderBalance = await pyusdToken.balanceOf(policy.policyHolder);
    console.log("   Holder Balance:", hre.ethers.formatUnits(holderBalance, 6), "PYUSD");
  }
  
  // Final contract balance
  const finalContractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
  console.log("   Contract Balance:", hre.ethers.formatUnits(finalContractBalance, 6), "PYUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


