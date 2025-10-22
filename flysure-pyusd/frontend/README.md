# FlySure Frontend

Next.js frontend for the FlySure PYUSD flight insurance platform.

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI
- **@tanstack/react-query** - Data fetching

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH
- PYUSD testnet tokens (from https://faucet.paxos.com/)

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values:

```env
# Your deployed Policy contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# PYUSD Token Address (Sepolia)
NEXT_PUBLIC_PYUSD_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Providers
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── Providers.tsx    # Wagmi + RainbowKit providers
│   └── lib/
│       ├── abi.ts           # Contract ABIs and addresses
│       ├── PolicyABI.json   # Policy contract ABI
│       └── wagmi.ts         # Wagmi configuration
├── .env.local               # Environment variables (not committed)
├── .env.example             # Environment variables template
└── package.json
```

## 🔧 Configuration

### Wagmi & RainbowKit

Configured in `src/lib/wagmi.ts`:
- Chain: Sepolia testnet
- Wallet connectors via RainbowKit
- SSR enabled

### Contract Integration

Located in `src/lib/abi.ts`:
- Policy contract ABI
- PYUSD token ABI (ERC20 subset)
- Contract addresses

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Utilities
npm run lint         # Run ESLint
```

## 🌐 Connecting to Sepolia

1. Open MetaMask
2. Switch to Sepolia testnet
3. Click "Connect Wallet" in the app
4. Approve the connection

### Getting Testnet Assets

**Sepolia ETH** (for gas):
- https://sepoliafaucet.com/
- https://sepolia-faucet.pk910.de/

**PYUSD** (for premiums):
- https://faucet.paxos.com/

## 🎯 Features

### Current
- ✅ Wallet connection (RainbowKit)
- ✅ Sepolia network detection
- ✅ Contract integration ready
- ✅ Responsive design

### To Implement
- ⏳ Create policy form
- ⏳ View user policies
- ⏳ Policy details page
- ⏳ PYUSD approval flow
- ⏳ Transaction notifications
- ⏳ Policy status tracking

## 🔐 Security

- Environment variables for sensitive data
- Client-side wallet interactions only
- No private keys stored
- Read-only contract calls when not connected

## 🛠️ Development

### Adding New Features

1. **New Page**: Create in `src/app/`
2. **Component**: Add to `src/components/`
3. **Hook**: Custom hooks in `src/hooks/`
4. **Contract Calls**: Use wagmi hooks with ABIs from `src/lib/abi.ts`

### Using Contract Functions

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';

// Read contract
const { data: policyDetails } = useReadContract({
  address: POLICY_CONTRACT_ADDRESS,
  abi: POLICY_ABI,
  functionName: 'getPolicyDetails',
  args: [policyId],
});

// Write contract
const { writeContract } = useWriteContract();

const createPolicy = () => {
  writeContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'createPolicy',
    args: [flightId, premium, payout, threshold],
  });
};
```

## 🐛 Troubleshooting

### "Wrong Network" Error
- Switch MetaMask to Sepolia testnet
- Check `src/lib/wagmi.ts` configuration

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Environment Variables Not Working
- Ensure `.env.local` file exists
- Restart dev server after changes
- Use `NEXT_PUBLIC_` prefix for client-side variables

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://rainbowkit.com/
- **viem Docs**: https://viem.sh/
- **Tailwind CSS**: https://tailwindcss.com/

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📄 License

Part of the FlySure project - see main repository for license.

---

**Need Help?** Check the main project README or create an issue on GitHub.
