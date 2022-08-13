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
    const [owner, otherAccount] = await ethers.getSigners();

    console.log("Contract deployed to:", domainContract.address);

    // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
    let txn = await domainContract.register("banana", {
      value: hre.ethers.utils.parseEther("0.01"),
    });
    await txn.wait();

    txn = await domainContract.setRecord(
      "banana",
      "Am I a banana or a ninja??"
    );
    await txn.wait();

    const address = await domainContract.getAddress("banana");
    const balance = await hre.ethers.provider.getBalance(
      domainContract.address
    );
    const registredNames = await domainContract.getAllNames();
    console.log("Domain Registred");
    expect(registredNames.length).greaterThanOrEqual(1);
  });
});
