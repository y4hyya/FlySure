import hre from "hardhat";

async function main() {
  const POLICY_CONTRACT_ADDRESS = "0x48445399E3e69f6700d64EDB00fb9DC5dD6C39c1";
  
  try {
    // Get contract instance
    const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
    
    // Check oracle address
    try {
      const oracleAddress = await policyContract.oracleAddress();
      console.log("Oracle Address:", oracleAddress);
      
      if (oracleAddress === "0x0000000000000000000000000000000000000000") {
        console.log("❌ Oracle address is not set!");
        console.log("Setting oracle address to owner...");
        
        const [deployer] = await hre.ethers.getSigners();
        const tx = await policyContract.setOracleAddress(deployer.address);
        await tx.wait();
        console.log("✅ Oracle address set to:", deployer.address);
      } else {
        console.log("✅ Oracle address is set");
      }
    } catch (error) {
      console.log("❌ Error getting oracle address:", error.message);
    }
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
