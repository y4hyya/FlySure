import PolicyABIJson from './PolicyABI.json';

export const POLICY_ABI = PolicyABIJson;

// Contract addresses (Sepolia testnet)
export const POLICY_CONTRACT_ADDRESS = '0x48445399E3e69f6700d64EDB00fb9DC5dD6C39c1' as const;
export const PYUSD_TOKEN_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' as const; // Real PYUSD on Sepolia

// PYUSD ERC20 ABI (minimal for approve and balanceOf)
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

