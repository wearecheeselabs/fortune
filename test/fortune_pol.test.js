const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { expandToPowers } = require("./utils/maths");
const { expect } = chai;
chai.use(solidity);

let accounts, wallet, other0, other1, other2, fortuneNft;

describe("Fortune Nft Polygon", () => {
  beforeEach("Deploy", async () => {
    accounts = await ethers.getSigners();
    [wallet, other0, other1, other2] = accounts;
    const FortuneNft = await ethers.getContractFactory("FortunePol", wallet);
    fortuneNft = await FortuneNft.deploy();
    await Promise.all([
      fortuneNft.deployed(),
      fortuneNft.setMinter(other1.address, true),
    ]);
  });

  describe("Test", () => {
    it("deploy", async () => {
      expect(await fortuneNft.owner()).to.equal(wallet.address);
      expect(await fortuneNft.isMinter(other1.address)).to.be.true;
    });

    it("mint", async () => {
      await expect(fortuneNft.mint(other0.address, 1, 20)).to.emit(
        fortuneNft,
        "TransferSingle"
      );
      expect(await fortuneNft.balanceOf(other0.address, 1)).to.equal(20);
    });

    it("setUri", async () => {
      await expect(
        fortuneNft.connect(other0).setURI(1, "about fortune")
      ).to.revertedWith("only owner");
      await expect(fortuneNft.setURI(1, "about fortune"))
        .to.emit(fortuneNft, "URI")
        .withArgs("about fortune", 1);
      expect(await fortuneNft.uri(1)).to.equal("about fortune");
    });

    it("Set Royalty", async () => {
      await expect(
        fortuneNft.connect(other0).setRoyalty(1, 100)
      ).to.revertedWith("only owner");
      await fortuneNft.setRoyalty(1, 100);
      expect((await fortuneNft.royaltyData(1))[1]).to.equal(100);
      expect((await fortuneNft.royaltyData(1))[0]).to.equal(wallet.address);
      expect(
        (await fortuneNft.royaltyInfo(1, expandToPowers(1, 12)))[1]
      ).to.equal(expandToPowers(1, 10));
      expect(
        (await fortuneNft.royaltyInfo(1, expandToPowers(1, 12)))[0]
      ).to.equal(wallet.address);
    });

    it("pause and unpause", async () => {
      await expect(fortuneNft.connect(other0).pause()).to.revertedWith(
        "only owner"
      );
      await expect(fortuneNft.connect(wallet).pause()).to.emit(
        fortuneNft,
        "Paused"
      );
      await expect(fortuneNft.connect(other0).unpause()).to.revertedWith(
        "only owner"
      );
      await expect(fortuneNft.connect(wallet).unpause()).to.emit(
        fortuneNft,
        "Unpaused"
      );
    });

    it("changeOwner", async () => {
      await fortuneNft.changeOwner(other0.address);
      expect(await fortuneNft.owner()).to.equal(other0.address);
    });
    it("changeTreasurer", async () => {
      await fortuneNft.changeTreasurer(other0.address);
      expect(await fortuneNft.treasurer()).to.equal(other0.address);
    });
    it("mint and burn", async () => {
      await Promise.all([
        fortuneNft.mint(other0.address, 1, 20),
        fortuneNft.mint(other0.address, 2, 20),
      ]);
      await expect(
        fortuneNft.connect(other0).burn(other0.address, 1, 2)
      ).to.emit(fortuneNft, "TransferSingle");
      await expect(
        fortuneNft.connect(other0).burnBatch(other0.address, [2], [2])
      ).to.emit(fortuneNft, "TransferBatch");
    });
    it("support interfaces", async () => {
      const ERC2981MagicValue = "0x2a55205a";
      const ERC1155MetadataMagicValue = "0x0e89341c";
      expect(await fortuneNft.supportsInterface(ERC2981MagicValue)).to.be.true;
      expect(await fortuneNft.supportsInterface(ERC1155MetadataMagicValue)).to
        .be.true;
    });
  });
});
