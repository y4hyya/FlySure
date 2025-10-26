// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PolicyNFT.sol";

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
    
    // PolicyNFT contract instance
    PolicyNFT public policyNFTContract;
    
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
    
    // Mapping to track if a flight ID already has a policy (prevents multiple policies for same flight)
    mapping(string => bool) public flightHasPolicy;
    
    // Mapping to track policy IDs for each flight (for oracle to find)
    mapping(string => uint256[]) public flightToPolicyIds;
    
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
    
    event ClaimPaid(
        uint256 indexed policyId,
        address indexed claimant,
        uint256 payoutAmount
    );
    
    /**
     * @dev Constructor to initialize the contract with PYUSD token address
     * @param _pyusdTokenAddress Address of PYUSD token on Sepolia testnet
     * For Sepolia: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
     */
    constructor(address _pyusdTokenAddress, address _policyNFTAddress) Ownable(msg.sender) {
        require(_pyusdTokenAddress != address(0), "Invalid PYUSD token address");
        require(_policyNFTAddress != address(0), "Invalid PolicyNFT contract address");
        pyusdToken = IERC20(_pyusdTokenAddress);
        policyNFTContract = PolicyNFT(_policyNFTAddress);
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
    /**
     * @dev Create a new insurance policy and mint an NFT
     * @param _flightNumber The flight number
     * @param _departureTimestamp The departure timestamp
     * @param _payoutAmount The payout amount
     * @return newPolicyId The ID of the created policy
     */
    function createPolicy(
        string memory _flightNumber,
        uint256 _departureTimestamp,
        uint256 _payoutAmount
    ) public returns (uint256) {
        // Calculate premium (10% of payout amount)
        uint256 calculatedPremium = _payoutAmount / 10;
        
        // Validation checks
        require(_payoutAmount > 0, "Payout amount must be greater than 0");
        require(bytes(_flightNumber).length > 0, "Flight number cannot be empty");
        require(_departureTimestamp > block.timestamp, "Departure must be in the future");
        require(oracleAddress != address(0), "Oracle address not set");
        
        // Prevent double-booking: check if user has already insured this flight
        require(
            hasInsuredFlight[msg.sender][_flightNumber] == false,
            "FlySure: You have already insured this flight"
        );
        
        // Prevent multiple policies for the same flight ID
        require(
            flightHasPolicy[_flightNumber] == false,
            "FlySure: This flight already has a policy"
        );
        
        // Check if contract has sufficient PYUSD for payout
        require(pyusdToken.balanceOf(address(this)) >= _payoutAmount, "Insufficient contract balance for payout");
        
        // Transfer premium from user to this contract
        // Note: User must have called pyusdToken.approve(thisContract, calculatedPremium) first
        bool success = pyusdToken.transferFrom(msg.sender, address(this), calculatedPremium);
        require(success, "PYUSD transfer failed");
        
        // Get the new policy ID
        uint256 newPolicyId = _policyIdCounter;
        
        // Call the NFT Contract to mint policy NFT
        policyNFTContract.mintPolicy(
            msg.sender,
            _flightNumber,
            calculatedPremium, // premium
            _payoutAmount,
            _departureTimestamp,
            newPolicyId
        );
        
        // Update local mappings for oracle to find later
        flightToPolicyIds[_flightNumber].push(newPolicyId);
        
        // Mark this flight as insured by this user (prevent double-booking)
        hasInsuredFlight[msg.sender][_flightNumber] = true;
        
        // Mark this flight as having a policy (prevent multiple policies for same flight)
        flightHasPolicy[_flightNumber] = true;
        
        // Track policy ID for user
        userPolicies[msg.sender].push(newPolicyId);
        
        // Increment the ID counter
        _policyIdCounter++;
        
        // Emit event
        emit PolicyCreated(
            newPolicyId,
            msg.sender,
            _flightNumber,
            calculatedPremium,
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
    /**
     * @dev Process a claim for a policy NFT
     * @param _policyId The policy ID to claim
     */
    function processClaim(uint256 _policyId) public {
        // Check ownership: verify that msg.sender actually owns this policy NFT
        require(policyNFTContract.ownerOf(_policyId) == msg.sender, "FlySure: Not your policy");
        
        // Check status: verify the NFT's status is 'Claimable' (which the oracle set)
        PolicyNFT.PolicyStatus currentStatus = policyNFTContract.getPolicyStatus(_policyId);
        require(currentStatus == PolicyNFT.PolicyStatus.Claimable, "FlySure: Policy is not claimable");
        
        // Get payout amount from NFT contract
        (string memory flightNumber, uint256 premiumAmount, uint256 payoutAmount, uint256 departureTimestamp, PolicyNFT.PolicyStatus status) = policyNFTContract.policyDetails(_policyId);
        uint256 payout = payoutAmount;
        require(payout > 0, "Payout invalid");
        
        // CHECKS-EFFECTS-INTERACTIONS PATTERN
        // EFFECT: First, burn the NFT to prevent re-entrancy/double claims
        policyNFTContract.burnPolicy(_policyId);
        
        // INTERACTION: Transfer the funds
        bool success = pyusdToken.transfer(msg.sender, payout);
        require(success, "Failed to send payment");
        
        // Emit event
        emit ClaimPaid(_policyId, msg.sender, payout);
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
    /**
     * @dev Update flight status for all policies of a specific flight (called by oracle)
     * @param _flightNumber The flight number to update
     * @param _newStatus The new policy status (0=Active, 1=Claimable, 2=PaidOut, 3=Expired)
     */
    function updateFlightStatus(string memory _flightNumber, uint8 _newStatus) public {
        // Oracle security check
        require(msg.sender == oracleAddress, "Not the oracle");
        
        // Get the array of policy IDs for the flight
        uint256[] memory policyIds = flightToPolicyIds[_flightNumber];
        
        // Loop and update each policy NFT
        for (uint i = 0; i < policyIds.length; i++) {
            uint256 policyId = policyIds[i];
            
            // Check current status to avoid redundant updates
            PolicyNFT.PolicyStatus currentStatus = policyNFTContract.getPolicyStatus(policyId);
            
            // Only update if Active (e.g., don't update a PaidOut policy)
            if (currentStatus == PolicyNFT.PolicyStatus.Active) {
                policyNFTContract.updatePolicyStatus(policyId, PolicyNFT.PolicyStatus(_newStatus));
            }
        }
        
        // Emit event for the flight status update
        emit FlightStatusUpdated(0, _flightNumber, FlightStatus(_newStatus), 0);
    }
    
    /**
     * @dev Get detailed information about a specific policy NFT
     * @param _policyId The ID of the policy to retrieve
     * @return PolicyInfo struct containing all policy details
     * 
     * This is a convenience function for frontend to fetch complete policy data
     */
    function getPolicyDetails(uint256 _policyId) public view returns (PolicyInfo memory) {
        // Get data from NFT contract
        (string memory flightNumber, uint256 premiumAmount, uint256 payoutAmount, uint256 departureTimestamp, PolicyNFT.PolicyStatus status) = policyNFTContract.policyDetails(_policyId);
        
        // Convert NFT status to PolicyInfo status
        uint8 policyStatus;
        if (status == PolicyNFT.PolicyStatus.Active) {
            policyStatus = 0; // ACTIVE
        } else if (status == PolicyNFT.PolicyStatus.Claimable) {
            policyStatus = 0; // Still ACTIVE for frontend purposes
        } else if (status == PolicyNFT.PolicyStatus.PaidOut) {
            policyStatus = 1; // PAID
        } else if (status == PolicyNFT.PolicyStatus.Expired) {
            policyStatus = 2; // EXPIRED
        }
        
        return PolicyInfo({
            policyId: _policyId,
            policyHolder: policyNFTContract.ownerOf(_policyId),
            flightId: flightNumber,
            premiumAmount: premiumAmount,
            payoutAmount: payoutAmount,
            delayThreshold: 120, // Default threshold
            departureTimestamp: departureTimestamp,
            flightStatus: FlightStatus.ON_TIME, // Default to ON_TIME
            actualDelayMinutes: 0, // Default
            status: PolicyStatus(policyStatus)
        });
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

