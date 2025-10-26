import hre from "hardhat";

async function main() {
  console.log("🔍 Checking contract at address...");

  const contractAddress = "0x24aAdc7F4884A027364A5D4A8fe4d7cf648415FD";
  
  try {
    // Check if it's a contract
    const code = await hre.ethers.provider.getCode(contractAddress);
    
    if (code === "0x") {
      console.log("❌ No contract found at this address");
      return;
    }
    
    console.log("✅ Contract found at address");
    console.log("Contract Address:", contractAddress);
    
    // Try to get contract instance
    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = Policy.attach(contractAddress);
    
    // Check owner
    try {
      const owner = await policy.owner();
      console.log("Contract Owner:", owner);
    } catch (error) {
      console.log("❌ Could not read owner - might not be Policy contract");
    }
    
    // Check PYUSD token address
    try {
      const pyusdToken = await policy.pyusdToken();
      console.log("PYUSD Token Address:", pyusdToken);
    } catch (error) {
      console.log("❌ Could not read PYUSD token - might not be Policy contract");
    }
    
    // Check policy counter
    try {
      const policyCounter = await policy._policyIdCounter();
      console.log("Policy Counter:", policyCounter.toString());
    } catch (error) {
      console.log("❌ Could not read policy counter - might not be Policy contract");
    }
    
  } catch (error: any) {
    console.error(`❌ Error checking contract: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
