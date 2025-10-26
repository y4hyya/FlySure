import hre from "hardhat";

async function main() {
  const policyAddress = "0xE810868616519A7f1df273D95BCB248448c47278";
  const pyusdAddress = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  
  console.log("🔍 Checking Contract Status...");
  console.log("Policy Contract:", policyAddress);
  console.log("PYUSD Token:", pyusdAddress);
  
  try {
    // Get contracts
    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = Policy.attach(policyAddress);
    
    const PYUSD = await hre.ethers.getContractFactory("MockPYUSD");
    const pyusd = PYUSD.attach(pyusdAddress);
    
    // Check contract PYUSD balance
    const contractBalance = await pyusd.balanceOf(policyAddress);
    console.log("\n💰 Contract PYUSD Balance:", hre.ethers.formatUnits(contractBalance, 6), "PYUSD");
    
    // Check oracle address
    const oracleAddress = await policy.oracleAddress();
    console.log("🔮 Oracle Address:", oracleAddress);
    
    // Check owner
    const owner = await policy.owner();
    console.log("👑 Owner:", owner);
    
    // Check if contract has enough balance for a payout
    const minPayout = hre.ethers.parseUnits("100", 6); // 100 PYUSD
    if (contractBalance < minPayout) {
      console.log("⚠️  WARNING: Contract balance is low for payouts!");
      console.log("   Consider funding the contract with more PYUSD");
    } else {
      console.log("✅ Contract has sufficient balance for payouts");
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
