// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./2048GameToken.sol";
import "./2048NFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Contract is Ownable {
    
    struct Players {
        address playerAddress;
        uint256 score;
    }

    
    error NoRewardCanClaim();

    
    event EndGame(address indexed player, uint256 token_amount);
    event UpdateTop10Players(address indexed player, uint256 score);
    event SetSeason(uint256 indexed season, uint256 rewardAmount);
    event ClaimReward(address indexed player, uint256 reward);
    event MintNFT(address indexed player, uint256 indexed scoreTier);

    
    uint256 public season; // 
    uint256 public rewardAmount; // 1/10
    uint256 public lastRewardAmount; // 
    GameTokenContract public tokenContract; // 
    AchivementNFT public nftContract;
    IERC20 public seilsToken =
        IERC20(0xf6715399d9e3f4E2A3f50c717763eFB486e7AEEC);
    
    Players[10] private top10Players; // 
    Players[10] private lastTop10Players; // 
    mapping(address => uint16[4][4]) private games; // 
    mapping(address => uint256) public accumulatedScores; // 
    mapping(address => uint256) public scores; //

        constructor() Ownable(msg.sender) {
        tokenContract = new GameTokenContract();
        nftContract = new AchivementNFT();
    }

    function updateBoard(
        uint16[4][4] calldata newBoard,
        uint256 score
    ) public payable {
        scores[msg.sender] = score;
        games[msg.sender] = newBoard;
    }

    // 
    function endGame(uint256 score) public {
        scores[msg.sender] = 0;
        accumulatedScores[msg.sender] += score;
        delete games[msg.sender];
        uint256 availableAmount = (score * 1e18) / getCoefficent();

        if (score > top10Players[top10Players.length - 1].score) {
            _updateTop10Players(msg.sender, accumulatedScores[msg.sender]);
        }

        tokenContract.mint(msg.sender, availableAmount);

        emit EndGame(msg.sender, availableAmount);
    }

    // ether
    function setSeason(uint256 _rewardAmount) public onlyOwner {
        season++;
        lastRewardAmount = rewardAmount;
        rewardAmount = _rewardAmount;
        lastTop10Players = top10Players;

        for (uint256 i = 0; i < top10Players.length; i++) {
            top10Players[i] = Players(address(0), 0);
        }

        require(
            croakToken.transferFrom(msg.sender, address(this), _rewardAmount),
            "Transfer failed"
        );

        emit SetSeason(season, _rewardAmount);
    }

    function claimReward() public {
        uint256 length = top10Players.length;
        for (uint256 i = 0; i < length; i++) {
            if (lastTop10Players[i].playerAddress == msg.sender) {
                lastTop10Players[i] = Players(address(0), 0);
                uint256 reward = lastRewardAmount / length;

                require(
                    seilsToken.transfer(msg.sender, reward),
                    "Transfer failed"
                );

                emit ClaimReward(msg.sender, reward);
                return;
            }
        }

        revert NoRewardCanClaim();
    }

    function mintNFT(uint256 scoreTier) public {
        uint256 score = accumulatedScores[msg.sender];
        if (scoreTier == 1) {
            require(score > 100000);
        } else if (scoreTier == 2) {
            require(score > 200000);
        } else if (scoreTier == 3) {
            require(score > 500000);
        } else if (scoreTier == 4) {
            require(score > 2000000);
        } else {
            revert("error score tier!");
        }

        nftContract.mintNFT(msg.sender, scoreTier);
        emit MintNFT(msg.sender, scoreTier);
    }

    
    function _updateTop10Players(address player, uint256 newScore) internal {
        bool playerExists = false;
        Players[10] memory _top10Players = top10Players;

        for (uint256 i = 0; i < _top10Players.length; i++) {
            if (
                _top10Players[i].playerAddress == player &&
                _top10Players[i].score < newScore
            ) {
                top10Players[i].score = newScore;
                playerExists = true;
                break;
            }
        }

        if (!playerExists) {
            top10Players[_top10Players.length - 1] = Players(player, newScore);
        }

        _sortLeaderboard();

        emit UpdateTop10Players(msg.sender, newScore);
    }

    function _sortLeaderboard() internal {
        Players[10] memory _top10Players = top10Players;

        for (uint256 i = 0; i < _top10Players.length - 1; i++) {
            for (uint256 j = 0; j < _top10Players.length - 1 - i; j++) {
                if (_top10Players[j].score < _top10Players[j + 1].score) {
                    Players memory temp = _top10Players[j];
                    _top10Players[j] = _top10Players[j + 1];
                    _top10Players[j + 1] = temp;
                }
            }
        }

        for (uint256 i = 0; i < top10Players.length; i++) {
            top10Players[i] = _top10Players[i];
        }
    }

    
    function getCoefficent() public view returns (uint256) {
        return (tokenContract.totalSupply() / 1e24) + 1;
    }

    // 
    function getGameBoard(
        address user
    ) public view returns (uint16[4][4] memory) {
        return games[user];
    }

    function getTop10Players() public view returns (Players[10] memory) {
        Players[10] memory top10 = top10Players;
        for (uint256 i = 0; i < 10; i++) {
            top10[i] = top10Players[i];
        }

        return top10;
    }

    function getPlayerAllNFT(
        address playerAddress
    ) public view returns (string[] memory) {
        return nftContract.getPlayerOwnedScoreTier(playerAddress);
    }

    function getUserTierAndMintStatus(
        address playerAddress
    ) public view returns (uint256, bool) {
        uint256 accumulatedScore = accumulatedScores[playerAddress];
        uint256 tier = 0;
        if (100000 < accumulatedScore && accumulatedScore < 200000) {
            tier = 1;
        } else if (200000 < accumulatedScore && accumulatedScore < 500000) {
            tier = 2;
        } else if (500000 < accumulatedScore && accumulatedScore < 2000000) {
            tier = 3;
        } else if (2000000 < accumulatedScore) {
            tier = 4;
        }
        string[] memory playerAllNFT = getPlayerAllNFT(playerAddress);
        return (tier, tier > playerAllNFT.length);
    }
}
