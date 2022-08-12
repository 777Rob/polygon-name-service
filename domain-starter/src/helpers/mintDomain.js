import { ethers } from "ethers";
import { DomainsContract } from "../contracts/DomainsContract";

export const mintDomain = async (domain, record) => {
  // Don't run if the domain is empty
  if (!domain) {
    return;
  }
  // Alert the user if the domain is too short
  if (domain.length < 3) {
    alert("Domain must be at least 3 characters long");
    return;
  }
  // Calculate price based on length of domain (change this to match your contract)
  // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
  const price =
    domain.length === 3 ? "0.05" : domain.length === 4 ? "0.03" : "0.01";
  console.log("Minting domain", domain, "with price", price);
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        DomainsContract.address,
        DomainsContract.abi,
        signer
      );

      console.log("Going to pop wallet now to pay gas...");
      let tx = await contract.register(domain, {
        value: ethers.utils.parseEther(price),
      });
      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Check if the transaction was successfully completed
      if (receipt.status === 1) {
        console.log(
          "Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
        );

        // Set the record for the domain
        tx = await contract.setRecord(domain, record);
        await tx.wait();

        console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);
      } else {
        alert("Transaction failed! Please try again");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
