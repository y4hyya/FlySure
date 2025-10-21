// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Policy
 * @dev Flight insurance policy contract for FlySure
 */
contract Policy is Ownable, ReentrancyGuard {
    
    struct InsurancePolicy {
        address policyholder;
        string flightNumber;
        uint256 departureTime;
        uint256 coverageAmount;
        uint256 premium;
        bool isActive;
        bool isClaimed;
    }
    
    mapping(uint256 => InsurancePolicy) public policies;
    uint256 public nextPolicyId;
    
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed policyholder,
        string flightNumber,
        uint256 departureTime,
        uint256 coverageAmount,
        uint256 premium
    );
    
    event PolicyClaimed(
        uint256 indexed policyId,
        address indexed policyholder,
        uint256 payoutAmount
    );
    
    constructor() Ownable(msg.sender) {
        nextPolicyId = 1;
    }
    
    /**
     * @dev Create a new insurance policy
     * @param _flightNumber Flight number
     * @param _departureTime Scheduled departure time
     * @param _coverageAmount Amount of coverage
     */
    function createPolicy(
        string memory _flightNumber,
        uint256 _departureTime,
        uint256 _coverageAmount
    ) external payable returns (uint256) {
        require(msg.value > 0, "Premium must be greater than 0");
        require(_departureTime > block.timestamp, "Departure time must be in the future");
        
        uint256 policyId = nextPolicyId++;
        
        policies[policyId] = InsurancePolicy({
            policyholder: msg.sender,
            flightNumber: _flightNumber,
            departureTime: _departureTime,
            coverageAmount: _coverageAmount,
            premium: msg.value,
            isActive: true,
            isClaimed: false
        });
        
        emit PolicyCreated(
            policyId,
            msg.sender,
            _flightNumber,
            _departureTime,
            _coverageAmount,
            msg.value
        );
        
        return policyId;
    }
    
    /**
     * @dev Claim a policy payout
     * @param _policyId Policy ID to claim
     */
    function claimPolicy(uint256 _policyId) external nonReentrant {
        InsurancePolicy storage policy = policies[_policyId];
        
        require(policy.policyholder == msg.sender, "Not the policyholder");
        require(policy.isActive, "Policy is not active");
        require(!policy.isClaimed, "Policy already claimed");
        require(block.timestamp > policy.departureTime, "Flight has not departed yet");
        
        policy.isClaimed = true;
        policy.isActive = false;
        
        uint256 payoutAmount = policy.coverageAmount;
        
        (bool success, ) = payable(msg.sender).call{value: payoutAmount}("");
        require(success, "Payout transfer failed");
        
        emit PolicyClaimed(_policyId, msg.sender, payoutAmount);
    }
    
    /**
     * @dev Get policy details
     * @param _policyId Policy ID
     */
    function getPolicy(uint256 _policyId) external view returns (InsurancePolicy memory) {
        return policies[_policyId];
    }
    
    /**
     * @dev Owner can withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}

