import hre from "hardhat";

async function main() {
  const POLICY_CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  
  // Get contract instance
  const policyContract = await hre.ethers.getContractAt("Policy", POLICY_CONTRACT_ADDRESS);
  
  // Get current owner
  const owner = await policyContract.owner();
  console.log("Current contract owner:", owner);
  
  // Get oracle address
  const oracle = await policyContract.oracleAddress();
  console.log("Current oracle address:", oracle);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
