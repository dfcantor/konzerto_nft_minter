import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react"; 
import konzertoTicketNFT from './utils/konzertoTicketNFT.json';
import { ethers } from "ethers";


// Constants
const TWITTER_HANDLE = 'danielkant_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0xA3447172b7f6DA74460898C202BfD301246876c9";
//const OPENSEA_LINK = '';
//const TOTAL_MINT_COUNT = 50;




const App = () => {

  
  
      const [currentAccount, setCurrentAccount] = useState("");
    
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)

          

      } else {
          console.log("No authorized account found")
      }
  }


   /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
     
    } catch (error) {
      console.log(error)
    }
  }

// Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, konzertoTicketNFT.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
 
  
    try {
      const { ethereum } = window;
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      
      if (chainId !== rinkebyChainId) {
	      alert("You are not connected to the Rinkeby Test Network!");
      }

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, konzertoTicketNFT.abi, signer);
  
        
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAKonzertoTicketNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        setupEventListener()     
       

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  
}


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Konzerto v1.0.0</p>
          <p className="sub-text">
            Transforming the live music scene. 
          
          </p>

          <p className="sub-text">
             
            NFTickets. Digital Collectibles for fans. Make your concert experience unique.
             
          </p>
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <hr></hr>
        <div className="footer-container">
        <a
            className="footer-text"
href="https://drive.google.com/drive/folders/1i8cmCJDkBWfKfOTZ5C2W7SDO19Zo7Bos?usp=sharing
            // eslint-disable-next-line" 
            target="_blank"
            rel="noreferrer"
          >{`You can get my thesis and pitch here`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;