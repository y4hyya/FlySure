# 🛫 FlySure - Parametric Flight Insurance DApp

[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black.svg)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow.svg)](https://hardhat.org/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io/)

**FlySure** is a decentralized parametric flight insurance application built on Ethereum Sepolia testnet. It provides automated flight delay and cancellation insurance using PYUSD stablecoin, with oracle-driven parametric triggers for instant payouts.

## 🌟 Features

### 🎯 Core Functionality
- **Parametric Insurance**: Automated payouts based on flight status data
- **Oracle Integration**: Real-time flight status updates from trusted sources
- **PYUSD Integration**: Uses Paxos's official PYUSD stablecoin on Sepolia
- **Smart Contract Automation**: Self-executing insurance policies
- **Real-time Claims**: Instant payout processing based on oracle data

### 🛠️ Technical Features
- **Solidity Smart Contracts**: Secure and gas-optimized insurance logic
- **Next.js Frontend**: Modern React-based user interface
- **Wagmi Integration**: Seamless Web3 wallet connectivity
- **shadcn/ui Components**: Beautiful and accessible UI components
- **TypeScript**: Full type safety across the entire application
- **Hardhat Framework**: Comprehensive testing and deployment tools

### 🎨 User Experience
- **Modern UI/UX**: Clean, responsive design with dark theme
- **Wallet Integration**: MetaMask and other Web3 wallet support
- **Real-time Updates**: Live transaction status and policy updates
- **Admin Panel**: Comprehensive management interface for oracles and owners
- **Mobile Responsive**: Optimized for all device sizes

## 🏗️ Architecture

### Smart Contract Layer
```
Policy.sol
├── PolicyInfo struct (policyholder, flightId, amounts, timestamps, status)
├── FlightStatus enum (ON_TIME, DELAYED, CANCELLED)
├── PolicyStatus enum (ACTIVE, PAID, EXPIRED)
├── createPolicy() - Create new insurance policies
├── updateFlightStatus() - Oracle updates flight data
├── claimPayout() - Policyholder claims based on oracle data
├── expirePolicy() - Expire on-time policies
└── Access control (owner, oracle, policyholder)
```

### Frontend Layer
```
Next.js Application
├── Pages
│   ├── / - Homepage with modern UI
│   ├── /create - Policy creation form
│   ├── /policies - User's policy dashboard
│   └── /admin - Admin panel for oracles
├── Components
│   ├── CreatePolicyForm - Policy creation with validation
│   ├── MyPolicies - Policy management and claims
│   ├── Navigation - Floating navigation bar
│   └── UI Components - shadcn/ui integration
└── Lib
    ├── wagmi.ts - Web3 configuration
    ├── abi.ts - Contract ABIs and addresses
    └── utils.ts - Utility functions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Sepolia ETH for gas fees
- PYUSD testnet tokens

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/y4hyya/FlySure.git
cd FlySure/flysure-pyusd
```

2. **Install dependencies**
```bash
npm install
cd frontend
npm install
cd ..
```

3. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Add your configuration
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
```

4. **Deploy contracts to Sepolia**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

5. **Fund the contract**
```bash
npx hardhat run scripts/fundSepolia.ts --network sepolia
```

6. **Start the frontend**
```bash
cd frontend
npm run dev
```

7. **Access the application**
- Open `http://localhost:3000`
- Connect your MetaMask wallet to Sepolia testnet
- Get PYUSD testnet tokens from [Paxos Faucet](https://faucet.paxos.com/)

## 📋 Usage Guide

### For Policyholders

#### Creating a Policy
1. Navigate to `/create`
2. Enter flight details:
   - **Flight Code**: e.g., "TK1234"
   - **Premium Amount**: Amount to pay (in PYUSD)
   - **Delay Threshold**: Minutes of delay to trigger payout
   - **Departure Time**: Flight departure timestamp
3. Click "Create Policy"
4. Approve PYUSD spending
5. Confirm policy creation transaction

#### Managing Policies
1. Navigate to `/policies`
2. View all your active policies
3. **Process Claim**: Available when flight is delayed/cancelled
4. **Expire Policy**: Available when flight is on time

### For Oracles

#### Updating Flight Status
1. Navigate to `/admin` (requires oracle access)
2. Go to "Flight Status Update" section
3. Enter policy details:
   - **Policy ID**: Target policy ID
   - **Flight Status**: ON_TIME, DELAYED, or CANCELLED
   - **Actual Delay**: Delay in minutes (for DELAYED status)
4. Click "Update Flight Status"
5. Confirm transaction

### For Contract Owners

#### Admin Functions
1. Navigate to `/admin` (requires owner access)
2. **Set Oracle Address**: Configure trusted oracle
3. **Create Policies**: Direct policy creation
4. **Monitor Contract**: View contract status and balances

## 🔧 Development

### Project Structure
```
flysure-pyusd/
├── contracts/
│   ├── Policy.sol          # Main insurance contract
│   └── MockPYUSD.sol      # Test token contract
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and configurations
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── scripts/
│   ├── deploy.ts          # Contract deployment
│   ├── fundSepolia.ts     # Contract funding
│   ├── checkOracle.ts     # Oracle management
│   └── testContract.ts    # Contract testing
├── test/
│   └── Policy.test.ts     # Comprehensive test suite
└── hardhat.config.ts      # Hardhat configuration
```

### Testing
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Policy.test.ts

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Contract Verification
```bash
# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <PYUSD_TOKEN_ADDRESS>
```

## 🌐 Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.drpc.org`
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Policy Contract**: `0x48445399E3e69f6700d64EDB00fb9DC5dD6C39c1`

### Getting Testnet Tokens
- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **PYUSD**: [Paxos Faucet](https://faucet.paxos.com/)

## 🔒 Security Features

### Smart Contract Security
- **Access Control**: Owner, oracle, and policyholder role separation
- **Checks-Effects-Interactions**: Prevents re-entrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Safe Math**: Overflow/underflow protection
- **Emergency Functions**: Owner can pause critical functions

### Frontend Security
- **Input Sanitization**: All user inputs are validated
- **Transaction Confirmation**: Multi-step transaction approval
- **Error Handling**: Comprehensive error catching and user feedback
- **Wallet Integration**: Secure Web3 wallet connectivity

## 📊 Contract Functions

### Public Functions
```solidity
// Create a new insurance policy
function createPolicy(
    string memory _flightId,
    uint256 _premiumAmount,
    uint256 _payoutAmount,
    uint256 _delayThreshold,
    uint256 _departureTimestamp
) public returns (uint256)

// Claim payout based on oracle data
function claimPayout(uint256 _policyId) public

// Expire policy if flight was on time
function expirePolicy(uint256 _policyId) public

// Get policy details
function getPolicyDetails(uint256 _policyId) public view returns (PolicyInfo memory)
```

### Oracle Functions
```solidity
// Update flight status (oracle only)
function updateFlightStatus(
    uint256 _policyId,
    FlightStatus _flightStatus,
    uint256 _actualDelayMinutes
) public onlyOracle
```

### Owner Functions
```solidity
// Set oracle address
function setOracleAddress(address _oracleAddress) public onlyOwner

// Emergency functions
function pause() public onlyOwner
function unpause() public onlyOwner
```

## 🧪 Testing Scenarios

### Policy Creation Tests
- ✅ Valid policy creation
- ✅ Invalid parameters rejection
- ✅ PYUSD transfer validation
- ✅ Access control verification

### Oracle Integration Tests
- ✅ Oracle-only access control
- ✅ Flight status updates
- ✅ Delay threshold validation
- ✅ Event emission verification

### Claim Process Tests
- ✅ Delayed flight payout
- ✅ Cancelled flight payout
- ✅ On-time flight expiration
- ✅ Insufficient delay rejection

### Edge Cases
- ✅ Past departure time validation
- ✅ Zero amount rejection
- ✅ Non-existent policy handling
- ✅ Re-entrancy protection

## 🚀 Deployment

### Local Development
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to localhost
npx hardhat run scripts/deploy.ts --network localhost

# Start frontend
cd frontend && npm run dev
```

### Sepolia Testnet
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Fund contract
npx hardhat run scripts/fundSepolia.ts --network sepolia

# Verify contract
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <PYUSD_TOKEN_ADDRESS>
```

### Production Deployment
1. Configure production RPC URLs
2. Update contract addresses in frontend
3. Deploy to mainnet
4. Verify contracts on Etherscan
5. Update frontend configuration

## 📈 Gas Optimization

### Contract Optimizations
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple operations in single transaction
- **Event Usage**: Minimal storage writes
- **Function Visibility**: Appropriate access levels

### Frontend Optimizations
- **Transaction Batching**: Group related operations
- **Gas Estimation**: Dynamic gas limit calculation
- **Error Recovery**: Graceful failure handling
- **Caching**: Reduce redundant contract calls

## 🔍 Monitoring & Analytics

### Contract Events
```solidity
event PolicyCreated(uint256 indexed policyId, address indexed policyHolder, string flightId);
event FlightStatusUpdated(uint256 indexed policyId, string flightId, FlightStatus status, uint256 delayMinutes);
event PolicyPaidOut(uint256 indexed policyId, address indexed policyHolder, uint256 amount);
event PolicyExpired(uint256 indexed policyId, address indexed policyHolder);
```

### Frontend Monitoring
- Transaction status tracking
- Error logging and reporting
- User interaction analytics
- Performance metrics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- **Solidity**: Follow Solidity style guide
- **TypeScript**: Use strict type checking
- **React**: Follow React best practices
- **Testing**: Maintain >90% test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Paxos**: For PYUSD stablecoin integration
- **Hardhat**: For development framework
- **Next.js**: For frontend framework
- **shadcn/ui**: For UI components
- **Wagmi**: For Web3 integration

## 📞 Support

### Documentation
- [Smart Contract Documentation](contracts/Policy.sol)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community discussions
- **Twitter**: Project updates

### Contact
- **Email**: support@flysure.app
- **Website**: https://flysure.app
- **GitHub**: https://github.com/y4hyya/FlySure

---

**Built with ❤️ for the decentralized future of insurance**
