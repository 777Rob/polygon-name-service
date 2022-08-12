const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Domains", function () {
  it("Should register a domain", async function () {
    const domainContractFactory = await hre.ethers.getContractFactory(
      "Domains"
    );
    const domainContract = await domainContractFactory.deploy("matic");
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);

    // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
    let txn = await domainContract.register("banana", {
      value: hre.ethers.utils.parseEther("0.01"),
    });
    await txn.wait();
    console.log("Minted domain banana.matic");

    txn = await domainContract.setRecord(
      "banana",
      "Am I a banana or a ninja??"
    );
    await txn.wait();
    console.log("Set record for banana.ninja");

    const address = await domainContract.getAddress("banana");
    console.log("Owner of domain banana:", address);

    const balance = await hre.ethers.provider.getBalance(
      domainContract.address
    );
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    txn = await domainContract.getAllNames();
    console.log(txn);
  });
});
