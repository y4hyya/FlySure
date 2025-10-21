// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Policy
 * @dev Flight insurance policy contract for FlySure
 */
contract Policy is Ownable {
    
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
    
    constructor() Ownable(msg.sender) {
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

