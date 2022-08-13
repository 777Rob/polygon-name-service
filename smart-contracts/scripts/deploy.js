const hre = require("hardhat");

async function main() {
  const domainContractFactory = await hre.ethers.getContractFactory("Domains");
  const domainContract = await domainContractFactory.deploy("matic");
  await domainContract.deployed();

  console.log("Contract deployed to:", domainContract.address);
  let txn = await domainContract.register("myDomain", {
    value: hre.ethers.utils.parseEther("0.01"),
  });

  await txn.wait();
  console.log("Minted domain myDomain.matic");
  txn = await domainContract.setRecord("myDomain", "Hello world");
  await txn.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
