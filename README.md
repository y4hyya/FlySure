# 🛫 FlySure - NFT-Based Parametric Flight Insurance DApp

[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black.svg)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow.svg)](https://hardhat.org/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io/)
[![ERC721](https://img.shields.io/badge/NFT-ERC721-green.svg)](https://eips.ethereum.org/EIPS/eip-721)

**FlySure** is a revolutionary decentralized parametric flight insurance application built on Ethereum Sepolia testnet. It leverages NFT technology to represent insurance policies as unique digital assets, providing automated flight delay and cancellation insurance using PYUSD stablecoin with oracle-driven parametric triggers for instant payouts.

## 🌟 Features

### 🎯 Core Functionality
- **NFT-Based Policies**: Each insurance policy is represented as a unique ERC721 NFT
- **Parametric Insurance**: Automated payouts based on flight status data
- **Oracle Integration**: Real-time flight status updates from trusted sources
- **PYUSD Integration**: Uses Paxos's official PYUSD stablecoin on Sepolia
- **Smart Contract Automation**: Self-executing insurance policies with NFT burning
- **Real-time Claims**: Instant payout processing based on oracle data
- **Flight Policy Prevention**: One policy per flight ID to prevent double-booking

### 🛠️ Technical Features
- **ERC721 NFT Contract**: PolicyNFT.sol for NFT-based policy representation
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
- **NFT Visualization**: Beautiful policy NFT cards with status indicators

## 🏗️ Architecture

### Smart Contract Layer
```
Policy.sol (Main Contract)
├── PolicyInfo struct (policyholder, flightId, amounts, timestamps, status)
├── FlightStatus enum (ON_TIME, DELAYED, CANCELLED)
├── PolicyStatus enum (ACTIVE, PAID, EXPIRED)
├── createPolicy() - Creates NFT and stores policy data
├── updateFlightStatus() - Oracle updates flight data
├── processClaim() - NFT-based claim processing with burning
├── getPolicyDetails() - Fetches data from NFT contract
└── Access control (owner, oracle, policyholder)

PolicyNFT.sol (NFT Contract)
├── PolicyDetails struct (flightNumber, amounts, timestamps, status)
├── PolicyStatus enum (Active, Claimable, PaidOut, Expired)
├── mintPolicy() - Mints new policy NFT
├── updatePolicyStatus() - Updates NFT status
├── burnPolicy() - Burns NFT after claim
├── getPolicyStatus() - Returns current NFT status
└── ERC721URIStorage integration
```

### Frontend Layer
```
Next.js Application
├── Pages
│   ├── / - Homepage with modern UI
│   ├── /create - Policy creation form with NFT preview
│   ├── /policies - User's NFT policy dashboard
│   └── /admin - Admin panel for oracles
├── Components
│   ├── CreatePolicyForm - Policy creation with validation
│   ├── MyPolicies - NFT policy management and claims
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

5. **Set oracle address**
```bash
npx hardhat run scripts/setOracle.ts --network sepolia
```

6. **Fund the contract**
```bash
npx hardhat run scripts/fundContract.ts --network sepolia
```

7. **Start the frontend**
```bash
cd frontend
npm run dev
```

8. **Access the application**
- Open `http://localhost:3000`
- Connect your MetaMask wallet to Sepolia testnet
- Get PYUSD testnet tokens from [Paxos Faucet](https://faucet.paxos.com/)

## 📋 Usage Guide

### For Policyholders

#### Creating a Policy
1. Navigate to `/create`
2. Enter flight details:
   - **Flight Code**: e.g., "TK1234" (must be unique)
   - **Premium Amount**: Amount to pay (in PYUSD)
   - **Payout Amount**: Amount to receive if delayed/cancelled
   - **Departure Time**: Flight departure timestamp
3. Click "Create Policy"
4. Approve PYUSD spending
5. Confirm policy creation transaction
6. **NFT Minted**: Your policy is now represented as a unique NFT

#### Managing Policies
1. Navigate to `/policies`
2. View all your NFT policies
3. **Process Claim**: Available when flight is delayed/cancelled (NFT gets burned)
4. **Expire Policy**: Available when flight is on time

### For Oracles

#### Updating Flight Status
1. Navigate to `/admin` (requires oracle access)
2. Go to "Oracle Payout Trigger" section
3. Enter flight details:
   - **Flight ID**: Target flight number
   - **Flight Status**: ON_TIME, DELAYED, or CANCELLED
4. Click "Trigger Payout"
5. Confirm transaction

### For Contract Owners

#### Admin Functions
1. Navigate to `/admin` (requires owner access)
2. **Set Oracle Address**: Configure trusted oracle
3. **Monitor Contract**: View contract status and balances
4. **Manage Policies**: View all policies and their status

## 🔧 Development

### Project Structure
```
flysure-pyusd/
├── contracts/
│   ├── Policy.sol          # Main insurance contract
│   ├── PolicyNFT.sol       # NFT contract for policies
│   └── MockPYUSD.sol       # Test token contract
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and configurations
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── scripts/
│   ├── deploy.ts          # Contract deployment
│   ├── fundContract.ts    # Contract funding
│   ├── setOracle.ts       # Oracle configuration
│   ├── checkContractStatus.ts # Contract monitoring
│   └── checkFlightPolicy.ts   # Flight policy checker
├── test/
│   ├── Policy.test.ts     # Main contract tests
│   └── PolicyNFT.test.ts  # NFT contract tests
└── hardhat.config.ts      # Hardhat configuration
```

### Testing
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Policy.test.ts
npx hardhat test test/PolicyNFT.test.ts

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Contract Verification
```bash
# Verify Policy contract on Etherscan
npx hardhat verify --network sepolia <POLICY_CONTRACT_ADDRESS> <PYUSD_TOKEN_ADDRESS> <POLICY_NFT_ADDRESS>

# Verify PolicyNFT contract on Etherscan
npx hardhat verify --network sepolia <POLICY_NFT_ADDRESS>
```

## 🌐 Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.drpc.org`
- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Policy Contract**: `0x85B4d392E4212a4597dF83A3bD8E23e723c38778`
- **PolicyNFT Contract**: `0x11f45E3bd6Be53D29d065c8D37d5646de5Df454C`

### Getting Testnet Tokens
- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **PYUSD**: [Paxos Faucet](https://faucet.paxos.com/)

## 🔒 Security Features

### Smart Contract Security
- **NFT Ownership Verification**: Only NFT owners can claim payouts
- **Access Control**: Owner, oracle, and policyholder role separation
- **Checks-Effects-Interactions**: Prevents re-entrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Safe Math**: Overflow/underflow protection
- **NFT Burning**: Prevents double claims by burning NFTs after payout

### Frontend Security
- **Input Sanitization**: All user inputs are validated
- **Transaction Confirmation**: Multi-step transaction approval
- **Error Handling**: Comprehensive error catching and user feedback
- **Wallet Integration**: Secure Web3 wallet connectivity
- **Real-time Validation**: Flight uniqueness checking

## 📊 Contract Functions

### Public Functions
```solidity
// Create a new insurance policy (mints NFT)
function createPolicy(
    string memory _flightNumber,
    uint256 _departureTimestamp,
    uint256 _payoutAmount
) public returns (uint256)

// Process claim (burns NFT and transfers payout)
function processClaim(uint256 _policyId) public

// Get policy details from NFT contract
function getPolicyDetails(uint256 _policyId) public view returns (PolicyInfo memory)

// Get user's policy IDs
function getPolicyIdsForUser(address _user) public view returns (uint256[] memory)
```

### Oracle Functions
```solidity
// Update flight status (oracle only)
function updateFlightStatus(
    string memory _flightNumber,
    uint8 _newStatus
) public onlyOracle
```

### Owner Functions
```solidity
// Set oracle address
function setOracleAddress(address _oracleAddress) public onlyOwner
```

### NFT Contract Functions
```solidity
// Mint new policy NFT (owner only)
function mintPolicy(
    address _policyholder,
    string memory _flightNumber,
    uint256 _premium,
    uint256 _payout,
    uint256 _departureTime,
    uint256 _policyId
) external onlyOwner

// Update NFT status (owner only)
function updatePolicyStatus(uint256 _policyId, PolicyStatus _newStatus) external onlyOwner

// Burn NFT (owner only)
function burnPolicy(uint256 _policyId) external onlyOwner

// Get NFT status
function getPolicyStatus(uint256 _policyId) public view returns (PolicyStatus)
```

## 🧪 Testing Scenarios

### Policy Creation Tests
- ✅ Valid policy creation with NFT minting
- ✅ Invalid parameters rejection
- ✅ PYUSD transfer validation
- ✅ Flight uniqueness validation
- ✅ Access control verification

### NFT Integration Tests
- ✅ NFT minting and burning
- ✅ Status updates
- ✅ Ownership verification
- ✅ Metadata handling

### Oracle Integration Tests
- ✅ Oracle-only access control
- ✅ Flight status updates
- ✅ Event emission verification
- ✅ Multiple policy updates

### Claim Process Tests
- ✅ Delayed flight payout with NFT burning
- ✅ Cancelled flight payout
- ✅ On-time flight expiration
- ✅ Double claim prevention

### Edge Cases
- ✅ Past departure time validation
- ✅ Zero amount rejection
- ✅ Non-existent policy handling
- ✅ Re-entrancy protection
- ✅ Flight policy prevention

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

# Set oracle address
npx hardhat run scripts/setOracle.ts --network sepolia

# Fund contract
npx hardhat run scripts/fundContract.ts --network sepolia

# Verify contracts
npx hardhat verify --network sepolia <POLICY_CONTRACT_ADDRESS> <PYUSD_TOKEN_ADDRESS> <POLICY_NFT_ADDRESS>
npx hardhat verify --network sepolia <POLICY_NFT_ADDRESS>
```

### Production Deployment
1. Configure production RPC URLs
2. Update contract addresses in frontend
3. Deploy to mainnet
4. Verify contracts on Etherscan
5. Update frontend configuration

## 📈 Gas Optimization

### Contract Optimizations
- **NFT Burning**: Efficient cleanup after claims
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple operations in single transaction
- **Event Usage**: Minimal storage writes
- **Function Visibility**: Appropriate access levels

### Frontend Optimizations
- **Transaction Batching**: Group related operations
- **Gas Estimation**: Dynamic gas limit calculation
- **Error Recovery**: Graceful failure handling
- **Caching**: Reduce redundant contract calls
- **Real-time Validation**: Prevent unnecessary transactions

## 🔍 Monitoring & Analytics

### Contract Events
```solidity
event PolicyCreated(uint256 indexed policyId, address indexed policyHolder, string flightId);
event PolicyNFTCreated(uint256 indexed policyId, address indexed policyHolder, string flightId);
event FlightStatusUpdated(uint256 indexed policyId, string flightId, FlightStatus status, uint256 delayMinutes);
event ClaimPaid(uint256 indexed policyId, address indexed claimant, uint256 payoutAmount);
event PolicyStatusUpdated(uint256 indexed policyId, PolicyStatus oldStatus, PolicyStatus newStatus);
```

### Frontend Monitoring
- Transaction status tracking
- Error logging and reporting
- User interaction analytics
- Performance metrics
- NFT creation and burning events

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
- **NFT Standards**: Follow ERC721 best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Paxos**: For PYUSD stablecoin integration
- **Hardhat**: For development framework
- **Next.js**: For frontend framework
- **shadcn/ui**: For UI components
- **Wagmi**: For Web3 integration
- **OpenZeppelin**: For ERC721 NFT implementation

## 📞 Support

### Documentation
- [Smart Contract Documentation](contracts/Policy.sol)
- [NFT Contract Documentation](contracts/PolicyNFT.sol)
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

*Revolutionizing flight insurance through NFT technology and parametric triggers*