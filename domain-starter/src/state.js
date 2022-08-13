import { useEffect, useState } from "react";
import { networks } from "./utils/networks";
import { ethers } from "ethers";
import { DomainsContract } from "./contracts/DomainsContract";

export const connect = (Component) => {
  return (props) => {
    const [mints, setMints] = useState([]);
    const [currentAccount, setCurrentAccount] = useState("");
    const [network, setNetwork] = useState("");

    const fetchMints = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          // You know all this
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            DomainsContract.address,
            DomainsContract.abi,
            signer
          );

          // Get all the domain names from our contract
          const names = await contract.getAllNames();
          console.log(names);
          // For each name, get the record and the address
          const mintRecords = await Promise.all(
            names.map(async (name) => {
              const mintRecord = await contract.records(name);
              const owner = await contract.domains(name);
              console.log(name);
              return {
                id: names.indexOf(name),
                name: name,
                record: mintRecord,
                owner: owner,
              };
            })
          );

          console.log("MINTS FETCHED ", mintRecords);
          setMints(mintRecords);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // This will run any time currentAccount or network are changed
    useEffect(() => {
      if (network === "Polygon Mumbai Testnet") {
        fetchMints();
      }
    }, [currentAccount, network]);

    // Update your checkIfWalletIsConnected function to handle the network
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }

      // This is the new part, we check the user's network chain ID
      const chainId = await ethereum.request({ method: "eth_chainId" });
      setNetwork(networks[chainId]);

      ethereum.on("chainChanged", handleChainChanged);

      // Reload the page when they change networks
      function handleChainChanged(_chainId) {
        window.location.reload();
      }
    };

    useEffect(() => {
      checkIfWalletIsConnected();
    }, []);

    const switchNetwork = async () => {
      if (window.ethereum) {
        try {
          // Try to switch to the Mumbai testnet
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }], // Check networks.js for hexadecimal network ids
          });
        } catch (error) {
          // This error code means that the chain we want has not been added to MetaMask
          // In this case we ask the user to add it to their MetaMask
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x13881",
                    chainName: "Polygon Mumbai Testnet",
                    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                    nativeCurrency: {
                      name: "Mumbai Matic",
                      symbol: "MATIC",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
                  },
                ],
              });
            } catch (error) {
              console.log(error);
            }
          }
          console.log(error);
        }
      } else {
        // If window.ethereum is not found then MetaMask is not installed
        alert(
          "MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html"
        );
      }
    };

    return (
      <Component
        test="currentAccount"
        network={network}
        mints={mints}
        setMints={setMints}
        fetchMints={fetchMints}
        setNetwork={setNetwork}
        switchNetwork={switchNetwork}
        currentAccount={currentAccount}
        setCurrentAccount={setCurrentAccount}
        {...props}
      />
    );
  };
};
