// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Policy
 * @dev Flight insurance policy contract for FlySure
 * Uses PYUSD (PayPal USD) stablecoin for premium payments and payouts
 */
contract Policy is Ownable {
    
    // PYUSD token interface
    IERC20 public pyusdToken;
    
    // Enum to represent the status of a policy
    enum PolicyStatus {
        ACTIVE,
        PAID,
        EXPIRED
    }
    
    // Struct to represent a policy
    struct PolicyInfo {
        uint256 policyId;
        address policyHolder;
        string flightId;              // e.g., "IST-BER-20251025"
        uint256 premiumAmount;        // Amount of PYUSD paid
        uint256 payoutAmount;         // Amount of PYUSD to be paid on delay
        uint256 delayThreshold;       // Delay threshold in minutes (e.g., 120)
        PolicyStatus status;
    }
    
    // Mapping to store policies by ID
    mapping(uint256 => PolicyInfo) public policies;
    
    // Counter for policy IDs
    uint256 private _policyIdCounter;
    
    // Oracle address for flight data verification
    address public oracleAddress;
    
    // Events
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        string flightId,
        uint256 premium,
        uint256 payout
    );
    
    event PolicyPaidOut(
        uint256 indexed policyId,
        address indexed holder,
        uint256 payoutAmount
    );
    
    /**
     * @dev Constructor to initialize the contract with PYUSD token address
     * @param _pyusdTokenAddress Address of PYUSD token on Sepolia testnet
     * For Sepolia: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
     */
    constructor(address _pyusdTokenAddress) Ownable(msg.sender) {
        require(_pyusdTokenAddress != address(0), "Invalid PYUSD token address");
        pyusdToken = IERC20(_pyusdTokenAddress);
        _policyIdCounter = 0;
    }
    
    /**
     * @dev Set the oracle address
     * @param _oracleAddress Address of the oracle
     */
    function setOracleAddress(address _oracleAddress) external onlyOwner {
        require(_oracleAddress != address(0), "Invalid oracle address");
        oracleAddress = _oracleAddress;
    }
}

