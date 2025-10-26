import hre from "hardhat";

async function main() {
  const policyAddress = "0x85B4d392E4212a4597dF83A3bD8E23e723c38778";
  const pyusdAddress = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const fundAmount = hre.ethers.parseUnits("30", 6); // 30 PYUSD
  
  console.log("💰 Funding Policy Contract...");
  console.log("Policy Contract:", policyAddress);
  console.log("Fund Amount:", hre.ethers.formatUnits(fundAmount, 6), "PYUSD");
  
  try {
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Get PYUSD contract
    const PYUSD = await hre.ethers.getContractFactory("MockPYUSD");
    const pyusd = PYUSD.attach(pyusdAddress);
    
    // Check deployer balance
    const deployerBalance = await pyusd.balanceOf(deployer.address);
    console.log("Deployer Balance:", hre.ethers.formatUnits(deployerBalance, 6), "PYUSD");
    
    if (deployerBalance < fundAmount) {
      console.log("❌ Insufficient PYUSD balance!");
      return;
    }
    
    // Transfer PYUSD to contract
    console.log("\n⏳ Transferring PYUSD to contract...");
    const tx = await pyusd.transfer(policyAddress, fundAmount);
    await tx.wait();
    
    console.log("✅ Transfer successful!");
    
    // Verify new balance
    const newContractBalance = await pyusd.balanceOf(policyAddress);
    console.log("New Contract Balance:", hre.ethers.formatUnits(newContractBalance, 6), "PYUSD");
    
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