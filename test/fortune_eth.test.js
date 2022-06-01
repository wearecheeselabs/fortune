const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { expandToPowers } = require("./utils/maths");
const { expect } = chai;
chai.use(solidity);

let accounts, wallet, other0, other1, other2, fortuneNft;

async function init(contract, tokenId, supply, fees, royalty, uri) {
  return contract.initToken(tokenId, supply, fees, royalty, uri);
}

const domain = (verifyingContract) => ({
  name: "Fortune Treasure Hunting",
  version: "1.0.1",
  chainId: 31337,
  verifyingContract,
});

const types = {
  MintWithSig: [
    { name: "whitelistData", type: "bytes" },
    { name: "to", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "amount", type: "uint256" },
    // { name: "mintAirdrop", type: "bool" },
    // { name: "airdropId", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

// We don't need this data so it can be anything
const whitelistData = (addr) =>
  ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [addr, 100]);

describe("Fortune Nft", () => {
  beforeEach("Deploy", async () => {
    accounts = await ethers.getSigners();
    [wallet, other0, other1, other2] = accounts;
    const FortuneNft = await ethers.getContractFactory("FortuneEAK", wallet);
    fortuneNft = await FortuneNft.deploy(wallet.address);
    await Promise.all([
      fortuneNft.deployed(),
      fortuneNft.setMinter(wallet.address, true),
    ]);
  });

  describe("Test", () => {
    it("deploy", async () => {
      expect(await fortuneNft.owner()).to.equal(wallet.address);
      expect(await fortuneNft.isMinter(wallet.address)).to.be.true;
      expect(await fortuneNft.feeReceiver()).to.equal(wallet.address);
    });
    it("initialize tokenId", async () => {
      await init(fortuneNft, 1, 20, expandToPowers(1, 10), 100, "hello world");
      expect(await fortuneNft.uri(1)).to.equal("hello world");
      expect(await fortuneNft.rates(1)).to.equal(expandToPowers(1, 10));
      expect(await fortuneNft.supplies(1)).to.equal(20);
      expect(await fortuneNft.initializedId(1)).to.be.true;
      expect((await fortuneNft.royaltyData(1))[1]).to.equal(100);
      expect((await fortuneNft.royaltyData(1))[0]).to.equal(wallet.address);

      expect(
        (await fortuneNft.royaltyInfo(1, expandToPowers(1, 12)))[1]
      ).to.equal(expandToPowers(1, 10));
      expect(
        (await fortuneNft.royaltyInfo(1, expandToPowers(1, 12)))[0]
      ).to.equal(wallet.address);
    });
    it("mint", async () => {
      await expect(fortuneNft.mint(other0.address, 1, 20)).to.revertedWith(
        "only minter or not initialized tokenId"
      );
      await init(fortuneNft, 1, 20, expandToPowers(1, 10), 1000, "hello world");
      await expect(fortuneNft.mint(other0.address, 1, 20)).to.emit(
        fortuneNft,
        "TransferSingle"
      );
      expect(await fortuneNft.balanceOf(other0.address, 1)).to.equal(20);
    });
    it("mintWithSig", async () => {
      const value = {
        whitelistData: whitelistData(wallet.address),
        to: other0.address,
        tokenId: 1,
        amount: 1,
        // mintAirdrop: true,
        // airdropId: 2,
        nonce: 1,
      };

      const sig = await wallet._signTypedData(
        domain(fortuneNft.address),
        types,
        value
      );
      const { v, r, s } = ethers.utils.splitSignature(sig);
      await init(fortuneNft, 1, 20, expandToPowers(1, 10), 1000, "hello world");
      await expect(
        fortuneNft.connect(other0).mintWithSig(
          value.whitelistData,
          value.to,
          value.tokenId,
          value.amount,
          // value.mintAirdrop,
          // value.airdropId,
          value.nonce,
          v,
          r,
          s,
          {
            value: expandToPowers(1, 10),
          }
        )
      ).to.emit(fortuneNft, "TransferSingle");
      expect(await fortuneNft.balanceOf(other0.address, 1)).to.equal(1);
      expect(await fortuneNft.contractBalance()).to.equal(
        expandToPowers(1, 10)
      );
    });
    it("withdraw", async () => {
      const value = {
        whitelistData: whitelistData(wallet.address),
        to: other0.address,
        tokenId: 1,
        amount: 1,
        // mintAirdrop: true,
        // airdropId: 2,
        nonce: 1,
      };

      const sig = await wallet._signTypedData(
        domain(fortuneNft.address),
        types,
        value
      );
      const { v, r, s } = ethers.utils.splitSignature(sig);
      await init(fortuneNft, 1, 20, expandToPowers(1, 10), 1000, "hello world");
      await expect(
        fortuneNft.connect(other0).mintWithSig(
          value.whitelistData,
          value.to,
          value.tokenId,
          value.amount,
          // value.mintAirdrop,
          // value.airdropId,
          value.nonce,
          v,
          r,
          s,
          {
            value: expandToPowers(1, 10),
          }
        )
      ).to.emit(fortuneNft, "TransferSingle");

      await expect(fortuneNft.withdraw(expandToPowers(1, 10)))
        .to.emit(fortuneNft, "Withdraw")
        .withArgs(wallet.address, expandToPowers(1, 10));
      expect(await fortuneNft.contractBalance()).to.equal(0);
    });
    it("setUri", async () => {
      await init(fortuneNft, 1, 20, expandToPowers(1, 10), 1000, "hello world");
      await expect(
        fortuneNft.connect(other0).setURI(1, "about fortune")
      ).to.revertedWith("caller is not the owner");
      await expect(fortuneNft.setURI(1, "about fortune"))
        .to.emit(fortuneNft, "URI")
        .withArgs("about fortune", 1);
      expect(await fortuneNft.uri(1)).to.equal("about fortune");
    });

    it("mint and burn", async () => {
      await Promise.all([
        init(fortuneNft, 1, 20, expandToPowers(1, 10), 1000, "hello world"),
        init(fortuneNft, 2, 20, expandToPowers(1, 10), 1000, "hello world"),
        fortuneNft.mint(other0.address, 1, 20),
        fortuneNft.mint(other0.address, 2, 20),
      ]);
      await expect(fortuneNft.burn(other0.address, 1, 2)).to.emit(
        fortuneNft,
        "TransferSingle"
      );
      await expect(fortuneNft.burnBatch(other0.address, [2], [2])).to.emit(
        fortuneNft,
        "TransferBatch"
      );
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
