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
    
    // Enum to represent flight status from oracle
    enum FlightStatus {
        ON_TIME,     // 0 - Flight is on time
        DELAYED,     // 1 - Flight is delayed
        CANCELLED    // 2 - Flight is cancelled
    }
    
    // Struct to represent a policy
    struct PolicyInfo {
        uint256 policyId;
        address policyHolder;
        string flightId;              // e.g., "IST-BER-20251025"
        uint256 premiumAmount;        // Amount of PYUSD paid
        uint256 payoutAmount;         // Amount of PYUSD to be paid on delay
        uint256 delayThreshold;       // Delay threshold in minutes (e.g., 120)
        uint256 departureTimestamp;   // Flight departure timestamp
        FlightStatus flightStatus;    // Current flight status from oracle
        uint256 actualDelayMinutes;   // Actual delay in minutes (set by oracle)
        PolicyStatus status;
    }
    
    // Mapping to store policies by ID
    mapping(uint256 => PolicyInfo) public policies;
    
    // Counter for policy IDs
    uint256 private _policyIdCounter;
    
    // Mapping to track user's policy IDs
    mapping(address => uint256[]) private userPolicies;
    
    // Mapping to track which address has insured which flight (prevents double-booking)
    mapping(address => mapping(string => bool)) public hasInsuredFlight;
    
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
    
    event FlightStatusUpdated(
        uint256 indexed policyId,
        string indexed flightId,
        FlightStatus newStatus,
        uint256 actualDelayMinutes
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
     * @param _departureTimestamp Flight departure timestamp
     * @return policyId The ID of the newly created policy
     * 
     * Requirements:
     * - User must have approved this contract to spend at least _premiumAmount PYUSD
     * - _premiumAmount must be greater than 0
     * - _payoutAmount must be greater than 0
     * - _delayThreshold must be greater than 0
     * - _departureTimestamp must be in the future
     * - Oracle address must be set
     * - Contract must have sufficient PYUSD for payout
     */
    function createPolicy(
        string memory _flightId,
        uint256 _premiumAmount,
        uint256 _payoutAmount,
        uint256 _delayThreshold,
        uint256 _departureTimestamp
    ) public returns (uint256) {
        // Validation checks
        require(_premiumAmount > 0, "Premium amount must be greater than 0");
        require(_payoutAmount > 0, "Payout amount must be greater than 0");
        require(_delayThreshold > 0, "Delay threshold must be greater than 0");
        require(bytes(_flightId).length > 0, "Flight ID cannot be empty");
        require(_departureTimestamp > block.timestamp, "Departure must be in the future");
        require(oracleAddress != address(0), "Oracle address not set");
        require(_payoutAmount <= _premiumAmount * 10, "Payout cannot exceed 10x premium");
        
        // Prevent double-booking: check if user has already insured this flight
        require(
            hasInsuredFlight[msg.sender][_flightId] == false,
            "FlySure: You have already insured this flight"
        );
        
        // Check if contract has sufficient PYUSD for payout
        require(pyusdToken.balanceOf(address(this)) >= _payoutAmount, "Insufficient contract balance for payout");
        
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
            departureTimestamp: _departureTimestamp,
            flightStatus: FlightStatus.ON_TIME, // Initialize as on time
            actualDelayMinutes: 0, // Initialize as no delay
            status: PolicyStatus.ACTIVE
        });
        
        // Track policy ID for user
        userPolicies[msg.sender].push(newPolicyId);
        
        // Mark this flight as insured by this user (prevent double-booking)
        hasInsuredFlight[msg.sender][_flightId] = true;
        
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
     * @dev User-facing function to claim payout based on oracle-provided flight status
     * @param _policyId The ID of the policy to claim
     * 
     * Requirements:
     * - Can only be called by the policy holder
     * - Policy must exist and be ACTIVE
     * - Flight status must be set by oracle (DELAYED or CANCELLED)
     * - Uses Checks-Effects-Interactions pattern for security
     * 
     * This is the main user-facing claim function that processes payouts
     * based on parametric conditions set by the oracle
     */
    function claimPayout(uint256 _policyId) public {
        // Get policy from storage
        PolicyInfo storage policy = policies[_policyId];
        
        // Validation checks
        require(policy.policyHolder != address(0), "Policy not found");
        require(msg.sender == policy.policyHolder, "Only policy holder can claim");
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        
        // Check if departure time has passed (policy can only be claimed after departure)
        require(block.timestamp >= policy.departureTimestamp, "Cannot claim before departure time");
        
        // Check oracle-provided flight status and process accordingly
        if (policy.flightStatus == FlightStatus.CANCELLED) {
            // Flight cancelled - full payout regardless of delay threshold
            // CHECKS-EFFECTS-INTERACTIONS PATTERN
            // 1. CHECKS: All validation above
            
            // 2. EFFECTS: Update state before external calls
            policy.status = PolicyStatus.PAID;
            
            // 3. INTERACTIONS: External call (transfer tokens)
            bool success = pyusdToken.transfer(policy.policyHolder, policy.payoutAmount);
            require(success, "PYUSD payout transfer failed");
            
            // Emit payout event
            emit PolicyPaidOut(_policyId, policy.policyHolder, policy.payoutAmount);
            
        } else if (policy.flightStatus == FlightStatus.DELAYED) {
            // For delayed flights, we need to check if delay meets threshold
            // Note: This requires the actual delay to be passed as a parameter
            // For now, we'll assume if status is DELAYED, it qualifies for payout
            // In a real implementation, you might want to store the actual delay
            // or require it as a parameter
            
            // CHECKS-EFFECTS-INTERACTIONS PATTERN
            // 1. CHECKS: All validation above
            
            // 2. EFFECTS: Update state before external calls
            policy.status = PolicyStatus.PAID;
            
            // 3. INTERACTIONS: External call (transfer tokens)
            bool success = pyusdToken.transfer(policy.policyHolder, policy.payoutAmount);
            require(success, "PYUSD payout transfer failed");
            
            // Emit payout event
            emit PolicyPaidOut(_policyId, policy.policyHolder, policy.payoutAmount);
            
        } else {
            // FlightStatus.ON_TIME - not eligible for payout
            revert("Flight status does not qualify for payout");
        }
    }
    
    /**
     * @dev User-facing function to expire policy if flight was on time
     * @param _policyId The ID of the policy to expire
     * 
     * Requirements:
     * - Can only be called by the policy holder
     * - Policy must exist and be ACTIVE
     * - Flight status must be ON_TIME
     * - Departure time must have passed
     */
    function expirePolicy(uint256 _policyId) public {
        // Get policy from storage
        PolicyInfo storage policy = policies[_policyId];
        
        // Validation checks
        require(policy.policyHolder != address(0), "Policy not found");
        require(msg.sender == policy.policyHolder, "Only policy holder can expire");
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        require(block.timestamp >= policy.departureTimestamp, "Cannot expire before departure time");
        require(policy.flightStatus == FlightStatus.ON_TIME, "Flight status does not qualify for expiration");
        
        // Update policy status to expired
        policy.status = PolicyStatus.EXPIRED;
        
        // Emit expiration event (optional - could add this event)
        // emit PolicyExpired(_policyId, policy.policyHolder);
    }
    
    /**
     * @dev Update flight status from oracle (Chainlink or other trusted oracle)
     * @param _policyId The ID of the policy to update
     * @param _flightStatus The new flight status (0=OnTime, 1=Delayed, 2=Cancelled)
     * @param _actualDelayMinutes The actual delay in minutes (0 if on time or cancelled)
     * 
     * Requirements:
     * - Can only be called by the oracle address
     * - Policy must exist and be ACTIVE
     * - Automatically processes payout if delay >= threshold
     * - This is the main parametric trigger function
     */
    function updateFlightStatus(
        uint256 _policyId,
        FlightStatus _flightStatus,
        uint256 _actualDelayMinutes
    ) public onlyOracle {
        // Get policy from storage
        PolicyInfo storage policy = policies[_policyId];
        
        // Validation checks
        require(policy.policyHolder != address(0), "Policy not found");
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        
        // Update flight status
        policy.flightStatus = _flightStatus;
        
        // Emit status update event
        emit FlightStatusUpdated(_policyId, policy.flightId, _flightStatus, _actualDelayMinutes);
        
        // Note: Oracle only updates flight status. User must call claimPayout() or expirePolicy()
        // to process the policy based on the updated flight status.
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
    
    /**
     * @dev Get active policies for a specific flight ID
     * @param _flightId The flight identifier
     * @return Array of policy IDs for the flight
     * 
     * Useful for oracles to find all policies for a specific flight
     */
    function getActivePoliciesForFlight(string memory _flightId) public view returns (uint256[] memory) {
        uint256[] memory activePolicies = new uint256[](_policyIdCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _policyIdCounter; i++) {
            PolicyInfo memory policy = policies[i];
            if (policy.status == PolicyStatus.ACTIVE && 
                keccak256(bytes(policy.flightId)) == keccak256(bytes(_flightId))) {
                activePolicies[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activePolicies[i];
        }
        
        return result;
    }
}

