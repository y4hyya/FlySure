import hre from "hardhat";

async function main() {
  const policyAddress = "0x85B4d392E4212a4597dF83A3bD8E23e723c38778";
  const oracleAddress = "0x24aAdc7F4884A027364A5D4A8fe4d7cf648415FD"; // Deployer as oracle
  
  console.log("🔧 Setting Oracle Address...");
  console.log("Policy Contract:", policyAddress);
  console.log("Oracle Address:", oracleAddress);
  
  try {
    // Get the contract
    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = Policy.attach(policyAddress);
    
    // Set oracle address
    console.log("\n⏳ Setting oracle address...");
    const tx = await policy.setOracleAddress(oracleAddress);
    await tx.wait();
    
    console.log("✅ Oracle address set successfully!");
    
    // Verify
    const currentOracle = await policy.oracleAddress();
    console.log("Current Oracle:", currentOracle);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
