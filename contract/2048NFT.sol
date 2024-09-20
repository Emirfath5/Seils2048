
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AchivementNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    mapping(address => uint256[]) private playerOwnedScoreTiers;
    string[5] private tokenURIs;

    constructor() ERC721("AchivementNFT", "ANFT") Ownable(msg.sender) {
        tokenCounter = 0;
        tokenURIs[
            1
        ] = "https://coral-accessible-raven-225.mypinata.cloud/ipfs/QmZWzgLXsEVsDWSZxSgRWrrAmCPxj8vm6qC7rEghgQcQMD/InitiationBadge.json";
        tokenURIs[
            2
        ] = "https://coral-accessible-raven-225.mypinata.cloud/ipfs/QmZWzgLXsEVsDWSZxSgRWrrAmCPxj8vm6qC7rEghgQcQMD/ValorBadge.json";
        tokenURIs[
            3
        ] = "https://coral-accessible-raven-225.mypinata.cloud/ipfs/QmZWzgLXsEVsDWSZxSgRWrrAmCPxj8vm6qC7rEghgQcQMD/WisdomBadge.json";
        tokenURIs[
            4
        ] = "https://coral-accessible-raven-225.mypinata.cloud/ipfs/QmZWzgLXsEVsDWSZxSgRWrrAmCPxj8vm6qC7rEghgQcQMD/GloryBadge.json";
    }

    function mintNFT(address recipient, uint256 scoreTier) public onlyOwner {
        if (playerOwnedScoreTiers[recipient].length >= scoreTier) {
            revert("no nft can mint!");
        }
        for (
            uint256 i = playerOwnedScoreTiers[recipient].length;
            i < scoreTier;
            i++
        ) {
            playerOwnedScoreTiers[recipient].push(i + 1);

            uint256 newTokenId = tokenCounter;
            _safeMint(recipient, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i + 1]);

            tokenCounter++;
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getPlayerOwnedScoreTier(
        address _owner
    ) public view returns (string[] memory) {
        uint256 length = playerOwnedScoreTiers[_owner].length;
        if (length == 0) {
            string[] memory blank;
            return blank;
        }
        uint256[] memory sortedPlayerTiers = sort(
            playerOwnedScoreTiers[_owner]
        );
        string[] memory uris = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            uris[i] = tokenURIs[sortedPlayerTiers[i]];
        }
        return uris;
    }

    function sort(
        uint256[] memory array
    ) public pure returns (uint256[] memory) {
        uint256 length = array.length;
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    // Swap elements
                    uint256 temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                }
            }
        }
        return array;
    }
}
