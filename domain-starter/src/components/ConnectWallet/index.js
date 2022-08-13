import { connect } from "../../state";
import { useState } from "react";
// Render methods
const ConnectWallet = (props) => {
  const { setCurrentAccount } = props;
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="connect-wallet-container">
      {/* Call the connectWallet function we just wrote when the button is clicked */}
      <p className="subtitle">
        Welcome to Polygon Name Service connect your wallet to get started
      </p>
      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default connect(ConnectWallet);
