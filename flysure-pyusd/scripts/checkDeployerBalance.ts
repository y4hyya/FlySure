import hre from "hardhat";

async function main() {
  const pyusdAddress = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const deployerAddress = "0x24aAdc7F4884A027364A5D4A8fe4d7cf648415FD";
  
  console.log("🔍 Checking Deployer PYUSD Balance...");
  console.log("Deployer:", deployerAddress);
  console.log("PYUSD Token:", pyusdAddress);
  
  try {
    // Get PYUSD contract
    const PYUSD = await hre.ethers.getContractFactory("MockPYUSD");
    const pyusd = PYUSD.attach(pyusdAddress);
    
    // Check deployer balance
    const deployerBalance = await pyusd.balanceOf(deployerAddress);
    console.log("\n💰 Deployer PYUSD Balance:", hre.ethers.formatUnits(deployerBalance, 6), "PYUSD");
    
    if (deployerBalance === 0n) {
      console.log("❌ Deployer has no PYUSD!");
      console.log("   Get PYUSD from: https://faucet.paxos.com/");
    } else {
      console.log("✅ Deployer has PYUSD balance");
    }
    
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
