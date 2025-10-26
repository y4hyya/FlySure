import hre from "hardhat";

async function main() {
  const POLICY_CONTRACT_ADDRESS = "0x48445399E3e69f6700d64EDB00fb9DC5dD6C39c1";
  const PYUSD_TOKEN_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get contract instances
  const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
  const pyusdToken = await hre.ethers.getContractAt("IERC20", PYUSD_TOKEN_ADDRESS);
  
  // Check balances
  console.log("\n📊 Current Balances:");
  const deployerBalance = await pyusdToken.balanceOf(deployer.address);
  const contractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
  
  console.log(`Deployer PYUSD Balance: ${hre.ethers.formatUnits(deployerBalance, 6)} PYUSD`);
  console.log(`Contract PYUSD Balance: ${hre.ethers.formatUnits(contractBalance, 6)} PYUSD`);
  
  // Check if deployer has PYUSD
  if (deployerBalance === 0n) {
    console.log("\n⚠️  Deployer has no PYUSD tokens!");
    console.log("Please get PYUSD testnet tokens from: https://faucet.paxos.com/");
    console.log("Or transfer PYUSD to your address:", deployer.address);
    return;
  }
  
  // Fund contract if deployer has PYUSD
  const fundAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
  
  if (deployerBalance >= fundAmount) {
    console.log(`\n💰 Transferring ${hre.ethers.formatUnits(fundAmount, 6)} PYUSD to contract...`);
    
    const tx = await pyusdToken.transfer(POLICY_CONTRACT_ADDRESS, fundAmount);
    await tx.wait();
    
    console.log("✅ Transfer successful!");
    
    // Check final balances
    const finalContractBalance = await pyusdToken.balanceOf(POLICY_CONTRACT_ADDRESS);
    console.log(`Final Contract Balance: ${hre.ethers.formatUnits(finalContractBalance, 6)} PYUSD`);
  } else {
    console.log(`\n⚠️  Insufficient PYUSD balance. Need ${hre.ethers.formatUnits(fundAmount, 6)} PYUSD`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
