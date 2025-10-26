import hre from "hardhat";

async function main() {
  // Configuration
  const POLICY_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const PYUSD_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Mock PYUSD
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract instances
  const pyusdToken = await hre.ethers.getContractAt("MockPYUSD", PYUSD_ADDRESS);
  
  // Transfer PYUSD to contract for payouts
  const transferAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
  
  console.log("\n💰 Transferring PYUSD to contract...");
  console.log("   Amount:", hre.ethers.formatUnits(transferAmount, 6), "PYUSD");
  console.log("   To:", POLICY_CONTRACT_ADDRESS);
  
  const tx = await pyusdToken.transfer(POLICY_CONTRACT_ADDRESS, transferAmount);
  await tx.wait();
  
  console.log("   ✅ Transfer successful! Tx:", tx.hash);
  
  // Check balances
  const contractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
  const signerBalance = await pyusdToken.balanceOf(signer.address);
  
  console.log("\n📊 Updated Balances:");
  console.log("   Contract Balance:", hre.ethers.formatUnits(contractBalance, 6), "PYUSD");
  console.log("   Signer Balance:", hre.ethers.formatUnits(signerBalance, 6), "PYUSD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
