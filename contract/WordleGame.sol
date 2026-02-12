// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract WordleGame {

    IERC20 public immutable wordleToken;
    address public owner;
    uint256 public entryFee;

    event GamePlayed(address indexed player, uint256 fee);
    event EntryFeeUpdated(uint256 newFee);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _tokenAddress) {
        wordleToken = IERC20(_tokenAddress);
        owner = msg.sender;

        // default = 100 WORDLE (18 decimals assumed)
        entryFee = 100 * 1e18;
    }

    function playGame() external {
        require(
            wordleToken.transferFrom(msg.sender, address(this), entryFee),
            "Token transfer failed"
        );

        emit GamePlayed(msg.sender, entryFee);
    }

    function setEntryFee(uint256 _newFee) external onlyOwner {
        entryFee = _newFee;
        emit EntryFeeUpdated(_newFee);
    }

    function withdraw(address _to) external onlyOwner {
        uint256 balance = wordleToken.balanceOf(address(this));
        require(balance > 0, "No balance");
        wordleToken.transfer(_to, balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
