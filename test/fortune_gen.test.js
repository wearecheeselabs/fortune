const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { expandToPowers } = require("./utils/maths");
const { expect } = chai;
chai.use(solidity);

let accounts, wallet, other0, other1, other2, fortuneGen;

describe("Fortune Gen Token", () => {
  beforeEach("Deploy", async () => {
    accounts = await ethers.getSigners();
    [wallet, other0, other1, other2] = accounts;
    const FortuneGen = await ethers.getContractFactory(
      "FortuneGenesis",
      wallet
    );
    fortuneGen = await FortuneGen.deploy();
    await Promise.all([
      fortuneGen.deployed(),
      fortuneGen.setMinter(other1.address, true),
    ]);
  });

  describe("Fortune Gen token transaction", () => {
    it("deploy", async () => {
      expect(await fortuneGen.owner()).to.equal(wallet.address);
      expect(await fortuneGen.isMinter(other1.address)).to.be.true;
    });
    it("mint", async () => {
      await expect(fortuneGen.mint(other0.address, 1, 20)).to.emit(
        fortuneGen,
        "TransferSingle"
      );
      expect(await fortuneGen.balanceOf(other0.address, 1)).to.equal(20);
    });

    it("setUri", async () => {
      await expect(
        fortuneGen.connect(other0).setURI(1, "about fortune")
      ).to.revertedWith("caller is not the owner");
      await expect(fortuneGen.setURI(1, "about fortune"))
        .to.emit(fortuneGen, "URI")
        .withArgs("about fortune", 1);
      expect(await fortuneGen.uri(1)).to.equal("about fortune");
    });

    it("Set Royalty", async () => {
      await expect(
        fortuneGen.connect(other0).setRoyalty(1, 100)
      ).to.revertedWith("caller is not the owner");
      await fortuneGen.setRoyalty(1, 100);
      expect((await fortuneGen.royaltyData(1))[1]).to.equal(100);
      expect((await fortuneGen.royaltyData(1))[0]).to.equal(wallet.address);
      expect(
        (await fortuneGen.royaltyInfo(1, expandToPowers(1, 12)))[1]
      ).to.equal(expandToPowers(1, 10));
      expect(
        (await fortuneGen.royaltyInfo(1, expandToPowers(1, 12)))[0]
      ).to.equal(wallet.address);
    });

    it("mint and burn", async () => {
      await Promise.all([
        fortuneGen.mint(other0.address, 1, 20),
        fortuneGen.mint(other0.address, 2, 20),
      ]);
      await expect(fortuneGen.burn(other0.address, 1, 2)).to.emit(
        fortuneGen,
        "TransferSingle"
      );
      await expect(fortuneGen.burnBatch(other0.address, [2], [2])).to.emit(
        fortuneGen,
        "TransferBatch"
      );
    });
    it("support interfaces", async () => {
      const ERC2981MagicValue = "0x2a55205a";
      const ERC1155MetadataMagicValue = "0x0e89341c";
      expect(await fortuneGen.supportsInterface(ERC2981MagicValue)).to.be.true;
      expect(await fortuneGen.supportsInterface(ERC1155MetadataMagicValue)).to
        .be.true;
    });
  });
});
