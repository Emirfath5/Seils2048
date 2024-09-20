import React, { useState, useEffect } from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Tile from "./Tile";
import Cell from "./Cell";
import { Board } from "../helper";
import useEvent from "../hooks/useEvent";
import GameOverlay from "./GameOverlay";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "./ABI";
import LeaderboardModal from "./LeaderboardModal";
import InfoCard from "./InfoCard";
import SpinnerModal from "./SpinnerModal";
import Season from "./Season";

// TODO: env
const CONTRACT_ADDRESS = "0x964Ff163e297F349A37e611aE0dBD947af56B8e0"; 


const SeiChainId = "1329";


const BoardView = () => {
  const [board, setBoard] = useState(new Board());
  const [gameContract, setContract] = useState(null);
  const [signerContract, setSignerContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [score, setScore] = useState(null);
  const [level, setLevel] = useState(null);
  const [badgeList, setBadgeList] = useState(null);

  const [isMint, setIsMint] = useState(null); // I
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingLeaber, setIsLoadingLeaber] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [hasRun, setHasRun] = useState(false); // 确保操作只执行一次
  const nftLinks = [
    { name: "InitiationBadge", link: "https://i.postimg.cc/XN5pQnvm/1750494639.jpg" },
    { name: "ValorBadge", link: "https://i.postimg.cc/mrqgynWT/1421317652.jpg" },
    { name: "WisdomBadge", link: "https://i.postimg.cc/LX16CVmL/535677802.jpg" },
    { name: "GloryBadge", link: "https://i.postimg.cc/D0QfFyJz/1488291647.jpg" },
  ];



  useEffect(() => {
    const nftLinks = [
      { name: "InitiationBadge", link: "https://i.postimg.cc/XN5pQnvm/1750494639.jpg" },
      { name: "ValorBadge", link: "https://i.postimg.cc/mrqgynWT/1421317652.jpg" },
      { name: "WisdomBadge", link: "https://i.postimg.cc/LX16CVmL/535677802.jpg" },
      { name: "GloryBadge", link: "https://i.postimg.cc/D0QfFyJz/1488291647.jpg" },
    ];
  
    const initialize = async () => {
      if (window.ethereum) {
        try {
         
          const newProvider = new ethers.BrowserProvider(window.ethereum);

          // Get the current chain ID
          const currentChainId = await newProvider.send("sei_chainId", []);

         

          if (currentChainId !== SeiChainId) {
            await switchToSeiMainnet(newProvider);
          }

          // 请求用户账户
          const accounts = await newProvider.send("eth_requestAccounts", []);
          const account = accounts[0];
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
          // 创建合约实例
          const newContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            newProvider
          );
          setContract(newContract);

          //
          const signer = await newProvider.getSigner();
          // console.log("address:", accounts[0]);
          const sgContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setSignerContract(sgContract);

          const getScore = async () => {
            try {
              const score = await newContract.accumulatedScores(account);
              setScore(score.toString());
              
            } catch (error) {
              console.error("Error fetching score:", error);
            }
          };

          getScore();
           //false

          
          const getLevel = async () => {
            try {
              const level = await newContract.getUserTierAndMintStatus(account);
              setLevel(level[0].toString());
              setIsMint(level[1]);
            } catch (error) {
              console.error("Error fetching level:", error);
            }
          };
          
          getLevel();
          

          const getBadgeList = async () => {
            try {
              const badgesMetaList = await newContract.getPlayerAllNFT(account);
              const badges = generateNewUrlList(badgesMetaList, nftLinks)
              setBadgeList(badges);
            } catch (error) {
              console.error("Error fetching badge list:", error);
            }
          };

          getBadgeList();

          const getCurrentGameScore = async () => {
            try {
              const currScore = await newContract.scores(account);
              if (currScore > 0) {
                if (board.score === 0) {
                  board.score = parseInt(currScore, 10);
                }
              }
            } catch (error) {
              console.error("Error fetching score:", error);
            }
          };

          getCurrentGameScore();
          setIsLoading(false);
        } catch (error) {
          console.error("Initialization error:", error);
        }
      } else {
        alert("MetaMask is not installed");
      }
    };

    initialize();
  }, [board, badgeList]);

 

  const generateNewUrlList = (urls, correspondences) => {
    return urls.map(url => {
      // 提取 JSON 文件名部分
      const fileName = url.split('/').pop().replace('.json', '');
  
      // 查找对应关系
      const correspondence = correspondences.find(cor => cor.name === fileName);
  
      // 如果有匹配的 ID, 则生成新的 URL
      if (correspondence) {
        const newUrl = correspondence.link;
        return newUrl;
      }
  
      // 如果没有匹配的 ID，则保留原始 URL
      return url;
    });
  };

  const switchToSeiMainnet = async (provider) => {
    // const networkParams = {
    //   chainId: LineaSepoliaChainId,
    //   chainName: "Linea Sepolia",
    //   rpcUrls: ["https://sepolia.linea.build"],
    //   nativeCurrency: {
    //     name: "Ether",
    //     symbol: "ETH",
    //     decimals: 18,
    //   },
    //   blockExplorerUrls: ["https://sepolia.linea.build"],
    // }; 

    // linea mainnet
     const networkParams = {
      chainId: SeiChainId,
      chainName: "Sei Network",
      rpcUrls: ["https://evm-rpc.sei-apis.com"],
      nativeCurrency: {
        name: "Sei",
        symbol: "SEI",
        decimals: 18,
      },
      blockExplorerUrls: ["https://seitrace.com/?chain=pacific-1"],
    }; 
    

    try {
      
      await provider.send("wallet_switchEthereumChain", [
        { chainId: SeiChainId },
      ]);

      
      const newChainId = await provider.send("sei_chainId", []);
      if (newChainId === SeiChainId) {
        console.log("Successfully switched to Sei Mainnet network.");
      } else {
        console.log("Failed to switch network.");
        toast.error("Failed to switch network.");
      }
    } catch (error) {
      if (error.code === 4902) {
        
        try {
          await provider.send("wallet_addEthereumChain", [networkParams]);
          console.log("Network added successfully.");
        } catch (addError) {
          console.log("Failed to add network:", addError);
          toast.error("Network added successfully.");
        }
        console.log("Network not found. Please add the network manually.");
        toast.error("Network not found. Please add the network manually.");
      } else {
        console.log("Network switch error:", error);
        toast.error("Network switch error:", error);
      }
    }
  };


  const updateLevel = async () => {
    if (gameContract && address) {
      try {
        const level = await gameContract.getUserTierAndMintStatus(address);
        setLevel(level[0].toString());
        setIsMint(level[1]);
      } catch (error) {
        console.error("Error fetching score:", error);
      }
    }
  };

  const updateBadgeList = async () => {
    if (gameContract && address) {
      try {
        const badgesMetaList = await gameContract.getPlayerAllNFT(address);
        const badges = generateNewUrlList(badgesMetaList, nftLinks)
        setBadgeList(badges);
      } catch (error) {
        console.error("Error fetching score:", error);
      }
    }
  };

  const handleScoreQuery = async () => {
    if (gameContract && address) {
      try {
        // console.log(gameContract);
        // console.log(address);

        const score = await gameContract.accumulatedScores(address);
        // console.log("分数： ", score);
        // alert(`Your score: ${score.toString()}`);
        setScore(score.toString());
      } catch (error) {
        console.error("Error fetching score:", error);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (board.hasWon()) {
      return;
    }

    if (event.keyCode >= 37 && event.keyCode <= 40) {
      let direction = event.keyCode - 37;
      let boardClone = Object.assign(
        Object.create(Object.getPrototypeOf(board)),
        board
      );
      let newBoard = boardClone.move(direction);
      setBoard(newBoard);
    }
  };

  useEvent("keydown", handleKeyDown);

  const cells = board.cells.map((row, rowIndex) => {
    return (
      <div key={rowIndex}>
        {row.map((col, colIndex) => {
          return <Cell key={rowIndex * board.size + colIndex} />;
        })}
      </div>
    );
  });

  const tiles = board.tiles
    .filter((tile) => tile.value !== 0)
    .map((tile, index) => {
      return <Tile tile={tile} key={index} />;
    });

  // reset game
  const resetGame = () => {
    setBoard(new Board());
  };

  const saveGame = async () => {
    setIsProcessing(true);
    const cells = board.cells;
    const size = cells.length;

    const elements = Array.from({ length: size }, () => Array(size).fill(null));

    // 使用 for 循环遍历 cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tile = cells[i][j];
        // 对 newArray 进行赋值，这里可以根据需要修改赋值逻辑
        elements[i][j] = tile.value;
      }
    }

    // 保存棋盘和的当前分数
    if (signerContract && address) {
      try {
        const tx = await signerContract.updateBoard(elements, board.score);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        setIsSuccess(true);

        handleScoreQuery();
        // toast.success("Score saved successfully!");
        // console.log(board.score);
      } catch (error) {
        console.error("Error update score:", error);
        setIsSuccess(false);
        setIsFailed(true);
        // toast.error("Failed to save score. Please try again.");
      } finally {
        setTimeout(() => setIsProcessing(false), 2000);
      }
    }

    setTimeout(() => setIsSuccess(false), 2100);
    setTimeout(() => setIsFailed(false), 2100);
  };

  // const overGame = async () => {
  //   setBoard(new Board());
  // };

  // end game
  const endGame = async () => {
    setIsProcessing(true);
    // console.log(board);
    if (signerContract && address) {
      try {
        // console.log(signerContract);
        // console.log(board.score);
        const tx = await signerContract.endGame(board.score);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        setBoard(new Board());
        handleScoreQuery();
        setIsSuccess(true);

        // toast.success("Score saved successfully!");
        // console.log(board.score);
      } catch (error) {
        console.error("Error update score:", error);
        setIsSuccess(false);
        setIsFailed(true);
        // toast.error("Failed to save score. Please try again.");
      } finally {
        setTimeout(() => setIsProcessing(false), 2000);
      }
    }
    setTimeout(() => setIsSuccess(false), 2100);
    setTimeout(() => setIsFailed(false), 2100);
  };

  const mintNft = async () => {
    setIsProcessing(true);
    // console.log(board);
    if (signerContract && address) {
      try {
        // console.log(signerContract);
        // console.log(board.score);
        const tx = await signerContract.mintNFT(level);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        // 更新勋章

        updateBadgeList();
        updateLevel();
        setIsSuccess(true);
        // toast.success("NFT badge minted successfully!");
        // console.log(board.score);
      } catch (error) {
        console.error("Error mint nft:", error);
        setIsSuccess(false);
        setIsFailed(true);

        // toast.error("Failed to mint NFT badge. Please try again.");
      } finally {
        setTimeout(() => setIsProcessing(false), 2000);
      }
    }
    setTimeout(() => setIsSuccess(false), 2100);
    setTimeout(() => setIsFailed(false), 2100);
  };

  // Function to format address with ellipsis
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!hasRun && (board.hasWon() || board.hasLost())) {
    setHasRun(true);
    setTimeout(async () => {
      console.log("3 seconds have passed");
      await endGame();
      setBoard(new Board());
      setHasRun(false);
    }, 3000); // 延迟 3 秒
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const openLeaderboard = async () => {
    setShowLeaderboard(true);

    if (gameContract && address) {
      try {
        const leaber = await gameContract.getTop10Players();
        const filteredData = leaber.filter(
          (item) => item[0] !== "0x0000000000000000000000000000000000000000"
        );
        setLeaderboardData(filteredData);
      } catch (error) {
        console.error("Error fetching topplayers:", error);
      }
    }
    setIsLoadingLeaber(false);
  };

  const closeLeaderboard = async () => {
    setShowLeaderboard(false);
    setLeaderboardData(null);
    setIsLoadingLeaber(true);
  };

  return (
    <div className="container">
      {hasRun && <div className="overlay" />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Zoom}
      />
      {isLoggedIn ? (
        <div className="game-container">
          <SpinnerModal
            isProcessing={isProcessing}
            isSuccess={isSuccess}
            isFailed={isFailed}
          />
          <div className="details-box">
            <div
              className={`resetButton ${board.score > 0 ? "disabled" : ""}`}
              onClick={board.score > 0 ? null : resetGame}
            >
              New
            </div>
            <div
              className={`saveButton ${board.score === 0 ? "disabled" : ""}`}
              onClick={board.score > 0 ? saveGame : null}
            >
              Save
            </div>
            <div
              className={`endButton ${board.score === 0 ? "disabled" : ""}`}
              onClick={board.score > 0 ? endGame : null}
            >
              End
            </div>
            <div className="score-box">
              <div className="score-header">PIONTS</div>
              <div>{board.score}</div>
            </div>
          </div>
          <div className="board">
            {cells}
            {tiles}
            <GameOverlay board={board} />
          </div>
        </div>
      ) : (
        <p>Connecting to MetaMask...</p>
      )}

      <div className="info-container">
        <div className="game-button" onClick={openLeaderboard}>
          Leaderboard
        </div>
        {showLeaderboard && (
          <LeaderboardModal onClose={closeLeaderboard}>
            <h2>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingLeaber ? (
                  <tr>
                    <td>Loading...</td>
                  </tr>
                ) : (
                  leaderboardData &&
                  leaderboardData.map((entry, index) => (
                    <tr key={index}>
                      <td>{formatAddress(entry[0])}</td>
                      <td>{entry[1].toString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </LeaderboardModal>
        )}
        <InfoCard
          address={formatAddress(address)}
          score={score !== null ? score : "Loading..."}
          level={level !== null ? level : "Loading..."}
          isMint={isMint}
          onClick={mintNft}
          thumbnails={badgeList}
        />
        <Season />
      </div>
    </div>
  );
};

export default BoardView;
