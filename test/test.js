const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fortune", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Fortune = await ethers.getContractFactory("Fortune");
    const fortune = await Fortune.deploy();
    await fortune.deployed();

    expect(await fortune.uri(1)).to.equal("");
    let uriString="Hola, mundo!"
    const setGreetingTx = await fortune.setURI(1, uriString);

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await fortune.uri(1)).to.equal(uriString);
  });
});
