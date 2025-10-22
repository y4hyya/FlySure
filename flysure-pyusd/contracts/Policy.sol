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
    
    // Custom errors
    error NotOracle();
    
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
    
    // Mapping to track user's policy IDs
    mapping(address => uint256[]) private userPolicies;
    
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
    
    /**
     * @dev Modifier to restrict function access to oracle only
     */
    modifier onlyOracle() {
        if (msg.sender != oracleAddress) revert NotOracle();
        _;
    }
    
    /**
     * @dev Create a new insurance policy
     * @param _flightId Flight identifier (e.g., "IST-BER-20251025")
     * @param _premiumAmount Amount of PYUSD to pay as premium
     * @param _payoutAmount Amount of PYUSD to receive if claim is valid
     * @param _delayThreshold Delay threshold in minutes (e.g., 120)
     * @return policyId The ID of the newly created policy
     * 
     * Requirements:
     * - User must have approved this contract to spend at least _premiumAmount PYUSD
     * - _premiumAmount must be greater than 0
     * - _payoutAmount must be greater than 0
     * - _delayThreshold must be greater than 0
     */
    function createPolicy(
        string memory _flightId,
        uint256 _premiumAmount,
        uint256 _payoutAmount,
        uint256 _delayThreshold
    ) public returns (uint256) {
        // Validation checks
        require(_premiumAmount > 0, "Premium amount must be greater than 0");
        require(_payoutAmount > 0, "Payout amount must be greater than 0");
        require(_delayThreshold > 0, "Delay threshold must be greater than 0");
        require(bytes(_flightId).length > 0, "Flight ID cannot be empty");
        
        // Transfer premium from user to this contract
        // Note: User must have called pyusdToken.approve(thisContract, _premiumAmount) first
        bool success = pyusdToken.transferFrom(msg.sender, address(this), _premiumAmount);
        require(success, "PYUSD transfer failed");
        
        // Increment policy counter and get new policy ID
        _policyIdCounter++;
        uint256 newPolicyId = _policyIdCounter;
        
        // Create new policy in storage
        policies[newPolicyId] = PolicyInfo({
            policyId: newPolicyId,
            policyHolder: msg.sender,
            flightId: _flightId,
            premiumAmount: _premiumAmount,
            payoutAmount: _payoutAmount,
            delayThreshold: _delayThreshold,
            status: PolicyStatus.ACTIVE
        });
        
        // Track policy ID for user
        userPolicies[msg.sender].push(newPolicyId);
        
        // Emit event
        emit PolicyCreated(
            newPolicyId,
            msg.sender,
            _flightId,
            _premiumAmount,
            _payoutAmount
        );
        
        return newPolicyId;
    }
    
    /**
     * @dev Trigger a policy payout based on actual flight delay
     * @param _policyId The ID of the policy to process
     * @param _actualDelayInMinutes The actual flight delay in minutes
     * 
     * Requirements:
     * - Can only be called by the oracle address
     * - Policy must exist and be ACTIVE
     * - If delay >= threshold: pays out and sets status to PAID
     * - If delay < threshold: sets status to EXPIRED (no payout)
     */
    function triggerPayout(uint256 _policyId, uint256 _actualDelayInMinutes) public onlyOracle {
        // Get policy from storage
        PolicyInfo storage policy = policies[_policyId];
        
        // Validation checks
        require(policy.policyHolder != address(0), "Policy not found");
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        
        // Check if delay meets or exceeds threshold
        if (_actualDelayInMinutes >= policy.delayThreshold) {
            // Delay threshold met - process payout
            policy.status = PolicyStatus.PAID;
            
            // Transfer payout amount from contract to policy holder
            bool success = pyusdToken.transfer(policy.policyHolder, policy.payoutAmount);
            require(success, "PYUSD payout transfer failed");
            
            // Emit payout event
            emit PolicyPaidOut(_policyId, policy.policyHolder, policy.payoutAmount);
        } else {
            // Delay threshold not met - expire policy without payout
            policy.status = PolicyStatus.EXPIRED;
        }
    }
    
    /**
     * @dev Get detailed information about a specific policy
     * @param _policyId The ID of the policy to retrieve
     * @return PolicyInfo struct containing all policy details
     * 
     * This is a convenience function for frontend to fetch complete policy data
     */
    function getPolicyDetails(uint256 _policyId) public view returns (PolicyInfo memory) {
        return policies[_policyId];
    }
    
    /**
     * @dev Get all policy IDs for a specific user
     * @param _user Address of the user
     * @return Array of policy IDs owned by the user
     * 
     * Use this to retrieve a user's policy IDs, then call getPolicyDetails for each
     */
    function getPolicyIdsForUser(address _user) public view returns (uint256[] memory) {
        return userPolicies[_user];
    }
}

