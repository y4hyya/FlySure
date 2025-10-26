import hre from "hardhat";

/**
 * Example script showing how an external oracle (Chainlink, etc.) would interact with FlySure
 * 
 * This demonstrates the parametric trigger mechanism for flight insurance
 * 
 * Prerequisites:
 * 1. You must be the oracle address (set via setOracleAddress)
 * 2. Policy must exist and be ACTIVE
 * 3. Contract must have sufficient PYUSD for payout
 */

async function main() {
  // Configuration
  const POLICY_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update with deployed address
  const PYUSD_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Mock PYUSD

  // Flight data (simulating external oracle data)
  const FLIGHT_DATA = {
    flightId: "TK1234",
    actualStatus: 1, // 0=OnTime, 1=Delayed, 2=Cancelled
    actualDelayMinutes: 150, // Actual delay from flight API
    departureTime: "2024-01-15T14:30:00Z"
  };

  // Get signer (should be oracle address)
  const [signer] = await hre.ethers.getSigners();
  console.log("Using oracle account:", signer.address);

  // Get contract instances
  const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);

  console.log("\n🔍 Oracle Integration Example");
  console.log("   Flight ID:", FLIGHT_DATA.flightId);
  console.log("   Status:", FLIGHT_DATA.actualStatus === 0 ? "On Time" : FLIGHT_DATA.actualStatus === 1 ? "Delayed" : "Cancelled");
  console.log("   Delay:", FLIGHT_DATA.actualDelayMinutes, "minutes");

  // Step 1: Verify oracle address
  const oracleAddress = await policyContract.oracleAddress();
  console.log("\n🔐 Oracle Address:", oracleAddress);

  if (signer.address.toLowerCase() !== oracleAddress.toLowerCase()) {
    console.error("\n❌ Error: You are not the oracle!");
    console.log("   Your address:", signer.address);
    console.log("   Oracle address:", oracleAddress);
    return;
  }

  // Step 2: Find active policies for this flight
  console.log("\n📋 Finding active policies for flight:", FLIGHT_DATA.flightId);
  const activePolicies = await policyContract.getActivePoliciesForFlight(FLIGHT_DATA.flightId);
  
  if (activePolicies.length === 0) {
    console.log("   No active policies found for this flight");
    return;
  }

  console.log("   Found", activePolicies.length, "active policies");

  // Step 3: Process each policy
  for (let i = 0; i < activePolicies.length; i++) {
    const policyId = activePolicies[i];
    console.log(`\n📄 Processing Policy ID: ${policyId}`);

    // Get policy details
    const policy = await policyContract.getPolicyDetails(policyId);
    
    console.log("   Policy Holder:", policy.policyHolder);
    console.log("   Premium:", hre.ethers.formatUnits(policy.premiumAmount, 6), "PYUSD");
    console.log("   Payout:", hre.ethers.formatUnits(policy.payoutAmount, 6), "PYUSD");
    console.log("   Delay Threshold:", policy.delayThreshold.toString(), "minutes");
    console.log("   Current Status:", policy.status === 0n ? "ACTIVE" : policy.status === 1n ? "PAID" : "EXPIRED");

    // Step 4: Update flight status (this is the parametric trigger!)
    console.log("\n⚡ Updating flight status from oracle data...");
    
    try {
      const tx = await policyContract.updateFlightStatus(
        policyId,
        FLIGHT_DATA.actualStatus, // FlightStatus enum
        FLIGHT_DATA.actualDelayMinutes
      );

      console.log("   Transaction sent:", tx.hash);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("   ✅ Transaction confirmed!");

      // Step 5: Check if payout event was emitted
      const payoutEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = policyContract.interface.parseLog(log);
          return parsed?.name === "PolicyPaidOut";
        } catch {
          return false;
        }
      });

      const statusEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = policyContract.interface.parseLog(log);
          return parsed?.name === "FlightStatusUpdated";
        } catch {
          return false;
        }
      });

      if (statusEvent) {
        const parsedStatusEvent = policyContract.interface.parseLog(statusEvent);
        console.log("\n📊 Flight Status Updated:");
        console.log("   Policy ID:", parsedStatusEvent?.args[0].toString());
        console.log("   Flight ID:", parsedStatusEvent?.args[1]);
        console.log("   New Status:", parsedStatusEvent?.args[2].toString());
        console.log("   Delay Minutes:", parsedStatusEvent?.args[3].toString());
      }

      if (payoutEvent) {
        const parsedPayoutEvent = policyContract.interface.parseLog(payoutEvent);
        console.log("\n🎉 PAYOUT PROCESSED!");
        console.log("   Policy ID:", parsedPayoutEvent?.args[0].toString());
        console.log("   Beneficiary:", parsedPayoutEvent?.args[1]);
        console.log("   Amount Paid:", hre.ethers.formatUnits(parsedPayoutEvent?.args[2], 6), "PYUSD");
      } else {
        console.log("\n⏰ POLICY EXPIRED");
        console.log("   Flight status did not trigger payout");
      }

      // Step 6: Verify updated policy status
      const updatedPolicy = await policyContract.getPolicyDetails(policyId);
      console.log("\n📊 Updated Policy Status:");
      console.log("   Status:", updatedPolicy.status === 0n ? "ACTIVE" : updatedPolicy.status === 1n ? "PAID" : "EXPIRED");
      console.log("   Flight Status:", updatedPolicy.flightStatus === 0n ? "ON_TIME" : updatedPolicy.flightStatus === 1n ? "DELAYED" : "CANCELLED");

    } catch (error: any) {
      console.error(`\n❌ Error processing policy ${policyId}:`, error.message);
    }
  }

  console.log("\n✅ Oracle integration example completed!");
  console.log("\n💡 This demonstrates how external flight data APIs would:");
  console.log("   1. Monitor flight status in real-time");
  console.log("   2. Call updateFlightStatus() when status changes");
  console.log("   3. Automatically trigger payouts based on parametric conditions");
  console.log("   4. Emit events for frontend monitoring");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
