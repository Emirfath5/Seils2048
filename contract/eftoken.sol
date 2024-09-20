pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract eftoken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {
    constructor() ERC20("Seils", "Seils") ERC20Permit("eftoken") {
        _mint(msg.sender, 2015000000 * 10 ** decimals());
    }

    function FrogPond() public pure returns (string memory) {
        return "Brrrrrrrrrrrrrrr";
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
