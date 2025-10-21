# FlySure - PYUSD Flight Insurance

A blockchain-based flight insurance platform built for hackathon using Hardhat and PYUSD stablecoin.

## Project Structure

```
flysure-pyusd/
├── contracts/          # Smart contracts
│   └── Policy.sol     # Main insurance policy contract
├── test/              # Test files
├── scripts/           # Deployment and interaction scripts
├── ignition/          # Hardhat Ignition deployment modules
├── artifacts/         # Compiled contracts (generated)
├── cache/             # Hardhat cache (generated)
└── typechain-types/   # TypeScript types for contracts (generated)
```

## Features

The `Policy.sol` contract includes:
- Policy creation with premium payment
- Flight details storage (flight number, departure time)
- Coverage amount management
- Policy claiming mechanism
- Owner withdrawal functionality
- OpenZeppelin security features (Ownable, ReentrancyGuard)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

All tests pass successfully! ✅

```bash
npx hardhat test
```

**Test Results:**
- ✔ Deployment tests
- ✔ Policy creation tests
- ✔ Policy claiming tests
- ✔ Withdrawal tests

### Deploy Contracts

**Using deployment script:**
```bash
# Start local node
npx hardhat node

# In another terminal, deploy
npx hardhat run scripts/deploy.ts --network localhost
```

**Using Hardhat Ignition:**
```bash
npx hardhat ignition deploy ./ignition/modules/Policy.ts --network <network-name>
```

### Interact with Contracts

After deploying, use the interaction script:

```bash
# Update the contract address in scripts/interact.ts
npx hardhat run scripts/interact.ts --network localhost
```

## Available Commands

- `npx hardhat compile` - Compile contracts ✅
- `npx hardhat test` - Run tests (see note above)
- `npx hardhat node` - Start local Hardhat network
- `npx hardhat run scripts/deploy.ts` - Deploy using script
- `npx hardhat clean` - Clean artifacts and cache

## Technologies Used

- **Hardhat 2.22** - Ethereum development environment
- **Solidity 0.8.28** - Smart contract language  
- **OpenZeppelin Contracts 5.4** - Secure smart contract library
- **TypeScript** - Type-safe development
- **Ethers.js v6** - Ethereum library for interacting with contracts
- **Chai** - Testing framework

## Next Steps

1. ✅ ~~Create test files~~ - Complete! (9 tests passing)
2. ✅ ~~Create deployment scripts~~ - Complete! (`scripts/deploy.ts`)
3. Configure networks in `hardhat.config.ts` for testnet deployment
4. Set up environment variables (use `.env.example` as template)
5. Set up frontend with Next.js/React
6. Integrate PYUSD stablecoin for payments
7. Add oracle integration for flight delay verification

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

**⚠️ Important:** Never commit your `.env` file with real keys!

## GitHub Repository

[FlySure GitHub](https://github.com/y4hyya/FlySure)

## License

ISC

