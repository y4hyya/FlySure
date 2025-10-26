import hre from "hardhat";

/**
 * Example script showing how to create an insurance policy
 * 
 * Prerequisites:
 * 1. Policy contract deployed on Sepolia
 * 2. User has PYUSD tokens (get from https://faucet.paxos.com/)
 * 3. User has approved the Policy contract to spend PYUSD
 */

async function main() {
  // Configuration
  const POLICY_CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const PYUSD_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Mock PYUSD
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract instances
  const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
  const pyusdToken = await hre.ethers.getContractAt("IERC20", PYUSD_ADDRESS);
  
  // Policy parameters
  const flightId = "IST-BER-20251025"; // Istanbul to Berlin, Oct 25, 2025
  const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD (6 decimals!)
  const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD payout
  const delayThreshold = 120; // 120 minutes delay threshold
  
  console.log("\n📋 Policy Details:");
  console.log("   Flight ID:", flightId);
  console.log("   Premium:", hre.ethers.formatUnits(premiumAmount, 6), "PYUSD");
  console.log("   Payout:", hre.ethers.formatUnits(payoutAmount, 6), "PYUSD");
  console.log("   Delay Threshold:", delayThreshold, "minutes");
  
  // Step 1: Check PYUSD balance
  const balance = await pyusdToken.balanceOf(signer.address);
  console.log("\n💰 Your PYUSD Balance:", hre.ethers.formatUnits(balance, 6), "PYUSD");
  
  if (balance < premiumAmount) {
    console.error("\n❌ Error: Insufficient PYUSD balance!");
    console.log("   Get testnet PYUSD from: https://faucet.paxos.com/");
    return;
  }
  
  // Step 2: Approve Policy contract to spend PYUSD
  console.log("\n🔐 Step 1: Approving PYUSD spending...");
  const approveTx = await pyusdToken.approve(POLICY_CONTRACT_ADDRESS, premiumAmount);
  await approveTx.wait();
  console.log("   ✅ Approval successful! Tx:", approveTx.hash);
  
  // Verify allowance
  const allowance = await pyusdToken.allowance(signer.address, POLICY_CONTRACT_ADDRESS);
  console.log("   Allowance:", hre.ethers.formatUnits(allowance, 6), "PYUSD");
  
  // Step 3: Create policy
  console.log("\n📝 Step 2: Creating insurance policy...");
  const createTx = await policyContract.createPolicy(
    flightId,
    premiumAmount,
    payoutAmount,
    delayThreshold
  );
  
  console.log("   Transaction sent:", createTx.hash);
  console.log("   Waiting for confirmation...");
  
  const receipt = await createTx.wait();
  console.log("   ✅ Policy created successfully!");
  
  // Parse the PolicyCreated event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = policyContract.interface.parseLog(log);
      return parsed?.name === "PolicyCreated";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = policyContract.interface.parseLog(event);
    const policyId = parsedEvent?.args[0];
    
    console.log("\n🎉 Policy Created!");
    console.log("   Policy ID:", policyId.toString());
    console.log("   Holder:", parsedEvent?.args[1]);
    console.log("   Flight ID:", parsedEvent?.args[2]);
    console.log("   Premium Paid:", hre.ethers.formatUnits(parsedEvent?.args[3], 6), "PYUSD");
    console.log("   Payout Amount:", hre.ethers.formatUnits(parsedEvent?.args[4], 6), "PYUSD");
    
    // Fetch and display full policy details
    const policy = await policyContract.policies(policyId);
    console.log("\n📄 Full Policy Details:");
    console.log("   Policy ID:", policy.policyId.toString());
    console.log("   Holder:", policy.policyHolder);
    console.log("   Flight ID:", policy.flightId);
    console.log("   Premium:", hre.ethers.formatUnits(policy.premiumAmount, 6), "PYUSD");
    console.log("   Payout:", hre.ethers.formatUnits(policy.payoutAmount, 6), "PYUSD");
    console.log("   Delay Threshold:", policy.delayThreshold.toString(), "minutes");
    console.log("   Status:", policy.status === 0n ? "ACTIVE" : policy.status === 1n ? "PAID" : "EXPIRED");
  }
  
  // Check contract PYUSD balance
  const contractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
  console.log("\n💼 Contract PYUSD Balance:", hre.ethers.formatUnits(contractBalance, 6), "PYUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

