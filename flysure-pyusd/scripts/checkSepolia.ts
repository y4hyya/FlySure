import hre from "hardhat";

async function main() {
  console.log("🔍 Checking Sepolia network status...");
  
  try {
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    // Get latest block
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("Latest block:", blockNumber);
    
    // Check if we have a private key
    const [signer] = await hre.ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    // Check balance
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.log("❌ No ETH balance. You need Sepolia ETH to deploy contracts.");
      console.log("Get Sepolia ETH from: https://sepoliafaucet.com/");
      console.log("Address:", signer.address);
      return;
    }
    
    console.log("✅ Ready to deploy to Sepolia!");
    
  } catch (error) {
    console.error("❌ Error connecting to Sepolia:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });