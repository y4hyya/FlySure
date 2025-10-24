import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Use custom RPC URL from environment variable if available, otherwise use default
const sepoliaChain = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
      ],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'FlySure - PYUSD Flight Insurance',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepoliaChain],
  ssr: true,
});
