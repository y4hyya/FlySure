import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Import dotenv to load .env variables

// Get environment variables
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";
const privateKey = process.env.PRIVATE_KEY || "";

// Add a warning if the private key is missing
if (!privateKey || privateKey === "YOUR_PRIVATE_KEY_PLACEHOLDER") {
  console.warn(
    "WARNING: PRIVATE_KEY is not set or is still a placeholder in .env file. Deployment will fail."
  );
}
if (!sepoliaRpcUrl || sepoliaRpcUrl === "YOUR_SEPOLIA_RPC_URL_PLACEHOLDER") {
  console.warn(
    "WARNING: SEPOLIA_RPC_URL is not set or is still a placeholder in .env file. Deployment will fail."
  );
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: { // This is the new network definition
      url: sepoliaRpcUrl,
      accounts: privateKey && privateKey !== "YOUR_PRIVATE_KEY_PLACEHOLDER" ? [privateKey] : [],
      chainId: 11155111 // Sepolia's official Chain ID
    }
  }
};

export default config;

