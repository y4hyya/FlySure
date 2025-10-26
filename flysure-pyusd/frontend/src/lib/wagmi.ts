import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, localhost } from 'wagmi/chains';
import { http } from 'viem';

// Configure localhost chain
const configuredLocalhost = {
  ...localhost,
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
    public: {
      http: ['http://localhost:8545'],
    },
  },
};

// Configure Sepolia with reliable RPC URLs
const configuredSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: {
      http: [
        'https://sepolia.drpc.org',
        'https://rpc.sepolia.org',
        'https://ethereum-sepolia-rpc.publicnode.com'
      ],
    },
    public: {
      http: [
        'https://sepolia.drpc.org',
        'https://rpc.sepolia.org',
        'https://ethereum-sepolia-rpc.publicnode.com'
      ],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'FlySure - PYUSD Flight Insurance',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [configuredSepolia], // Use Sepolia testnet
  ssr: true,
  batch: {
    multicall: {
      batchSize: 1024,
      wait: 16,
    },
  },
  transports: {
    [sepolia.id]: http('https://sepolia.drpc.org', {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
});
