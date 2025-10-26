import hre from "hardhat";

async function main() {
  const POLICY_CONTRACT_ADDRESS = "0x48445399E3e69f6700d64EDB00fb9DC5dD6C39c1";
  
  try {
    // Get contract instance
    const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
    
    // Try to get contract code
    const code = await hre.ethers.provider.getCode(POLICY_CONTRACT_ADDRESS);
    console.log("Contract code length:", code.length);
    
    if (code === "0x") {
      console.log("❌ Contract not deployed or not found at address");
      return;
    }
    
    console.log("✅ Contract code found");
    
    // Try to call a simple function
    try {
      const pyusdAddress = await policyContract.pyusdToken();
      console.log("✅ PYUSD Token Address:", pyusdAddress);
    } catch (error) {
      console.log("❌ Error calling pyusdToken():", error.message);
    }
    
    // Try to get owner
    try {
      const owner = await policyContract.owner();
      console.log("✅ Owner:", owner);
    } catch (error) {
      console.log("❌ Error calling owner():", error.message);
    }
    
  } catch (error) {
    console.log("❌ Error getting contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
