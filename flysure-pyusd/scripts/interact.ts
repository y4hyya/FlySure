import hre from "hardhat";

async function main() {
  // Replace with your deployed contract address
  const policyAddress = "YOUR_CONTRACT_ADDRESS";

  console.log("Connecting to Policy contract...");
  const Policy = await hre.ethers.getContractFactory("Policy");
  const policy = Policy.attach(policyAddress);

  // Get signers
  const [owner, user1] = await hre.ethers.getSigners();

  console.log("Owner address:", owner.address);
  console.log("User1 address:", user1.address);

  // Example: Create a policy
  const flightNumber = "AA123";
  const departureTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
  const coverageAmount = hre.ethers.parseEther("1.0");
  const premium = hre.ethers.parseEther("0.1");

  console.log("\nCreating policy...");
  const tx = await policy.connect(user1).createPolicy(
    flightNumber,
    departureTime,
    coverageAmount,
    { value: premium }
  );

  await tx.wait();
  console.log("Policy created! Transaction hash:", tx.hash);

  // Get policy details
  const policyDetails = await policy.getPolicy(1);
  console.log("\nPolicy Details:");
  console.log("Policyholder:", policyDetails.policyholder);
  console.log("Flight Number:", policyDetails.flightNumber);
  console.log("Coverage Amount:", hre.ethers.formatEther(policyDetails.coverageAmount), "ETH");
  console.log("Premium:", hre.ethers.formatEther(policyDetails.premium), "ETH");
  console.log("Is Active:", policyDetails.isActive);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

