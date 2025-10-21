import hre from "hardhat";

async function main() {
  console.log("Deploying Policy contract...");

  // PYUSD token address on Sepolia testnet
  const PYUSD_SEPOLIA = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  console.log(`Using PYUSD token at: ${PYUSD_SEPOLIA}`);

  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = await Policy.deploy(PYUSD_SEPOLIA);

  await policy.waitForDeployment();

  const address = await policy.getAddress();
  console.log(`\n✅ Policy contract deployed to: ${address}`);
  console.log(`   PYUSD Token: ${PYUSD_SEPOLIA}`);
  
  console.log("\nNext steps:");
  console.log("1. Verify the contract on Sepolia Etherscan");
  console.log("2. Get PYUSD testnet tokens from: https://faucet.paxos.com/");
  console.log("3. Interact with the contract using the address above");
  console.log("4. Create policies and test the insurance functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

