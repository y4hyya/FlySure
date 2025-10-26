// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PolicyNFT
 * @dev ERC721 NFT contract representing insurance policies
 * @notice This contract mints NFTs for each insurance policy created
 */
contract PolicyNFT is ERC721, ERC721URIStorage, Ownable {
    
    // Enum to represent the status of a policy NFT
    enum PolicyStatus {
        Active,     // 0 - Policy is active and valid
        Claimable,  // 1 - Policy is ready for claim (flight delayed/cancelled)
        PaidOut,    // 2 - Policy has been paid out
        Expired     // 3 - Policy has expired (flight was on time)
    }
    
    // Struct to represent policy details stored in the NFT
    struct PolicyDetails {
        string flightNumber;        // Flight identifier (e.g., "TK1234")
        uint256 premiumAmount;     // Amount paid for the policy
        uint256 payoutAmount;      // Amount to be paid out on claim
        uint256 departureTimestamp; // Flight departure timestamp
        PolicyStatus status;       // Current policy status
    }
    
    // Mapping to link tokenId to policy details
    mapping(uint256 => PolicyDetails) public policyDetails;
    
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event PolicyNFTCreated(
        uint256 indexed tokenId,
        address indexed owner,
        string flightNumber,
        uint256 premiumAmount,
        uint256 payoutAmount
    );
    
    event PolicyStatusUpdated(
        uint256 indexed tokenId,
        PolicyStatus oldStatus,
        PolicyStatus newStatus
    );
    
    /**
     * @dev Constructor sets the ERC721 name and symbol
     * @param initialOwner The initial owner of the contract
     */
    constructor(address initialOwner) 
        ERC721("FlySure Policy", "FLYP") 
        Ownable(initialOwner) 
    {
        _baseTokenURI = "https://api.flysure.com/metadata/";
    }
    
    /**
     * @dev Returns the base URI for token metadata
     * @return The base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Sets the base URI for token metadata
     * @param baseURI The new base URI
     * @notice Only the owner can call this function
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mints a policy NFT (only callable by owner contract)
     * @param _policyholder The address to mint the NFT to
     * @param _flightNumber The flight number
     * @param _premium The premium amount paid
     * @param _payout The payout amount
     * @param _departureTime The departure timestamp
     * @param _policyId The policy ID (will be used as tokenId)
     */
    function mintPolicy(
        address _policyholder,
        string memory _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureTime,
        uint256 _policyId
    ) external onlyOwner {
        // Mint the NFT with the specified policy ID as token ID
        _safeMint(_policyholder, _policyId);
        
        // Set the token URI dynamically
        _setTokenURI(_policyId, string(abi.encodePacked(_policyId, ".json")));
        
        // Store policy details
        policyDetails[_policyId] = PolicyDetails({
            flightNumber: _flightNumber,
            premiumAmount: _premium,
            payoutAmount: _payout,
            departureTimestamp: _departureTime,
            status: PolicyStatus.Active
        });
        
        emit PolicyNFTCreated(
            _policyId,
            _policyholder,
            _flightNumber,
            _premium,
            _payout
        );
    }
    
    /**
     * @dev Updates the status of a policy NFT (only callable by owner contract)
     * @param _policyId The policy ID to update
     * @param _newStatus The new status
     */
    function updatePolicyStatus(uint256 _policyId, PolicyStatus _newStatus) external onlyOwner {
        require(_ownerOf(_policyId) != address(0), "Token does not exist");
        
        PolicyStatus oldStatus = policyDetails[_policyId].status;
        policyDetails[_policyId].status = _newStatus;
        
        emit PolicyStatusUpdated(_policyId, oldStatus, _newStatus);
    }
    
    /**
     * @dev Burns a policy NFT (only callable by owner contract)
     * @param _policyId The policy ID to burn
     */
    function burnPolicy(uint256 _policyId) external onlyOwner {
        require(_ownerOf(_policyId) != address(0), "Token does not exist");
        
        // Burn the token
        _burn(_policyId);
        
        // Clear policy details
        delete policyDetails[_policyId];
    }
    
    /**
     * @dev Returns the policy status for a given policy ID
     * @param _policyId The policy ID
     * @return The current policy status
     */
    function getPolicyStatus(uint256 _policyId) public view returns (PolicyStatus) {
        require(_ownerOf(_policyId) != address(0), "Token does not exist");
        return policyDetails[_policyId].status;
    }
    
    /**
     * @dev Returns the policy details for a given token ID
     * @param tokenId The token ID
     * @return PolicyDetails struct containing all policy information
     */
    function getPolicyDetails(uint256 tokenId) public view returns (PolicyDetails memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return policyDetails[tokenId];
    }
    
    /**
     * @dev Returns the total number of tokens minted
     * @return The total supply of tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Override supportsInterface to include ERC721URIStorage
     * @param interfaceId The interface ID to check
     * @return bool Whether the contract supports the interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override tokenURI to use ERC721URIStorage
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
