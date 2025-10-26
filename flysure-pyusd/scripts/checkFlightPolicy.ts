import hre from "hardhat";

async function main() {
  const policyAddress = "0xE810868616519A7f1df273D95BCB248448c47278";
  
  console.log("🔍 Checking Policy contract on Sepolia...");
  console.log("Contract Address:", policyAddress);
  
  try {
    // Get the contract
    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = Policy.attach(policyAddress);
    
    // Check if flightHasPolicy function exists
    console.log("\n📋 Testing flightHasPolicy function...");
    
    // Test with a sample flight code
    const testFlightCode = "TK1984";
    const hasPolicy = await policy.flightHasPolicy(testFlightCode);
    
    console.log(`Flight ${testFlightCode} has policy:`, hasPolicy);
    
    // Check contract owner
    const owner = await policy.owner();
    console.log("Contract Owner:", owner);
    
    // Check oracle address
    const oracle = await policy.oracleAddress();
    console.log("Oracle Address:", oracle);
    
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
