# 🚀 FlySure PYUSD - Project Information

## Project Overview

**FlySure** is a decentralized flight insurance platform built for a hackathon. The project uses blockchain technology to provide transparent, automated flight insurance policies paid with PYUSD stablecoin.

## 🎯 What's Been Set Up

### ✅ Hardhat Development Environment
- **Version:** Hardhat 2.26.3
- **Language:** TypeScript
- **Build Status:** ✅ All systems operational

### ✅ Smart Contract: Policy.sol
A fully functional flight insurance policy contract featuring:
- Policy creation with flight details
- Premium payment handling
- Automated claim processing
- Owner management and fund withdrawal
- OpenZeppelin security integrations

### ✅ Testing Suite
- **9 comprehensive tests** covering all functionality
- **100% pass rate** ✅
- Test coverage includes deployment, policy creation, claims, and access control

### ✅ Deployment Infrastructure
- `scripts/deploy.ts` - Production deployment script
- `scripts/interact.ts` - Contract interaction template
- `ignition/modules/Policy.ts` - Hardhat Ignition module
- `.env.example` - Environment configuration template

## 📂 Key Files

| File | Purpose |
|------|---------|
| `contracts/Policy.sol` | Main insurance policy smart contract |
| `test/Policy.test.ts` | Comprehensive test suite (9 tests) |
| `scripts/deploy.ts` | Deployment script for any network |
| `scripts/interact.ts` | Example interaction script |
| `hardhat.config.ts` | Hardhat configuration |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variables template |
| `README.md` | Full project documentation |
| `SETUP_SUMMARY.md` | Detailed setup summary |

## 🔧 Quick Commands

```bash
# Development
npm run compile        # Compile contracts
npm run test          # Run tests
npm run deploy        # Deploy contracts

# Or use npx hardhat directly
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts --network <network>
```

## 📊 Project Statistics

- **Smart Contracts:** 1 (Policy.sol)
- **Test Files:** 1 (9 tests total)
- **Test Pass Rate:** 100% ✅
- **Lines of Contract Code:** ~135
- **Security Features:** Ownable, ReentrancyGuard
- **Dependencies:** 25+ packages installed
- **TypeScript Types:** Auto-generated via TypeChain

## 🔐 Security Features

1. **Access Control:** OpenZeppelin's Ownable pattern
2. **Reentrancy Protection:** OpenZeppelin's ReentrancyGuard
3. **Input Validation:** Comprehensive require statements
4. **Event Logging:** Full audit trail via events
5. **Tested:** All critical paths covered by tests

## 🎨 Contract Functions

### Public/External Functions
- `createPolicy()` - Create a new insurance policy
- `claimPolicy()` - Claim a policy payout
- `getPolicy()` - View policy details
- `withdraw()` - Owner withdraws funds (onlyOwner)

### View Functions
- `nextPolicyId` - Get next policy ID
- `owner()` - Get contract owner
- `policies()` - Access policy mapping

## 💡 Smart Contract Features

```solidity
struct InsurancePolicy {
    address policyholder;
    string flightNumber;
    uint256 departureTime;
    uint256 coverageAmount;
    uint256 premium;
    bool isActive;
    bool isClaimed;
}
```

### Events
- `PolicyCreated` - Emitted on policy purchase
- `PolicyClaimed` - Emitted on successful claim

## 🌐 Network Configuration

Currently configured for:
- **Hardhat Network** (local development)
- Ready for testnet deployment (Sepolia, Polygon Mumbai)
- Mainnet deployment ready (requires RPC configuration)

## 📦 Dependencies Installed

### Core Development
- `hardhat` (2.26.3)
- `@nomicfoundation/hardhat-toolbox`
- `@nomicfoundation/hardhat-ethers`
- `ethers` (v6.4.0)
- `typescript`
- `ts-node`

### Testing & Verification
- `chai`
- `@nomicfoundation/hardhat-chai-matchers`
- `@nomicfoundation/hardhat-network-helpers`
- `@nomicfoundation/hardhat-verify`

### Security & Standards
- `@openzeppelin/contracts` (5.4.0)
- Includes: Ownable, ReentrancyGuard, Context

### Type Generation
- `typechain`
- `@typechain/hardhat`
- `@typechain/ethers-v6`

## 🚀 Ready for Hackathon Development

### Immediate Next Steps:
1. **Frontend Development** - Build Next.js/React UI
2. **PYUSD Integration** - Add stablecoin payment support
3. **Oracle Integration** - Connect to flight data API
4. **Testnet Deployment** - Deploy to Sepolia or Polygon
5. **Frontend-Contract Integration** - Connect UI to blockchain

### Future Enhancements:
- Policy cancellation with partial refunds
- Multi-flight bundle policies
- Tiered coverage levels
- Automatic oracle-triggered claims
- NFT policy certificates
- DAO governance for dispute resolution

## 📖 Documentation

All documentation is included:
- `README.md` - User guide and API reference
- `SETUP_SUMMARY.md` - Detailed setup walkthrough
- `PROJECT_INFO.md` - This file
- Inline code comments in all contracts and scripts

## 🔗 Resources

- **GitHub Repository:** https://github.com/y4hyya/FlySure
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/
- **Ethers.js Docs:** https://docs.ethers.org/

## ✨ Project Status

| Component | Status |
|-----------|--------|
| Smart Contracts | ✅ Complete |
| Tests | ✅ 9/9 Passing |
| Deployment Scripts | ✅ Ready |
| TypeScript Setup | ✅ Configured |
| Documentation | ✅ Complete |
| Frontend | ⏳ Pending |
| Testnet Deployment | ⏳ Pending |

---

**Created:** October 21, 2025  
**Last Updated:** October 21, 2025  
**Status:** ✅ Ready for Development

**Build Status:** ✅ Compiles Successfully  
**Test Status:** ✅ 9/9 Tests Passing  
**TypeScript:** ✅ No Errors

Happy Building! 🎉

