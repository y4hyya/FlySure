// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockPYUSD
 * @dev Mock PYUSD token for testing purposes
 */
contract MockPYUSD is ERC20 {
    constructor() ERC20("Mock PayPal USD", "PYUSD") {
        // Mint 1,000,000 PYUSD to the deployer
        _mint(msg.sender, 1000000 * 10**6); // 6 decimals like real PYUSD
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
