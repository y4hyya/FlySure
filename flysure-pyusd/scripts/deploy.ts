import hre from "hardhat";

async function main() {
  console.log("Deploying Policy contract...");

  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = await Policy.deploy();

  await policy.waitForDeployment();

  const address = await policy.getAddress();
  console.log(`Policy contract deployed to: ${address}`);
  
  console.log("\nNext steps:");
  console.log("1. Verify the contract on a block explorer");
  console.log("2. Interact with the contract using the address above");
  console.log("3. Create policies and test the insurance functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

