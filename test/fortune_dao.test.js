const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { expandToPowers } = require("./utils/maths");
const { expect } = chai;
chai.use(solidity);

let accounts, wallet, other0, other1, other2, fortuneDao;

const domain = (verifyingContract) => ({
  name: "Fortune Dao",
  version: "1.0.1",
  chainId: 31337,
  verifyingContract,
});

const types = {
  MintWithSig: [
    { name: "to", type: "address" },
    { name: "tokenId", type: "uint256" },
    { name: "uri", type: "string" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

describe("Fortune DAO", () => {
  beforeEach("Deploy", async () => {
    accounts = await ethers.getSigners();
    [wallet, other0, other1, other2] = accounts;
    const FortuneDao = await ethers.getContractFactory("FortuneDao", wallet);
    fortuneDao = await FortuneDao.deploy(1000, expandToPowers(1, 10), 12);
    await fortuneDao.deployed();
  });

  describe("Dao token transaction", () => {
    it("deploy", async () => {
      expect(await fortuneDao.owner()).to.equal(wallet.address);
      expect(await fortuneDao.royaltyNumerator()).to.equal(1000);
      expect(await fortuneDao.mintFees()).to.equal(expandToPowers(1, 10));
      expect(await fortuneDao.maxMint()).to.equal(12);
    });
    it("setRoyltyNumerator", async () => {
      await expect(
        fortuneDao.connect(other2).setRoyltyNumerator(100)
      ).to.be.revertedWith("caller is not the owner");
      await fortuneDao.setRoyltyNumerator(100);
      expect(await fortuneDao.royaltyNumerator()).to.equal(100);
    });
    it("safeMint", async () => {
      await expect(
        fortuneDao
          .connect(other1)
          .safeMint(other1.address, 1, "0x", { value: expandToPowers(1, 9) })
      ).to.be.revertedWith("insuff value");
      await expect(
        fortuneDao
          .connect(other1)
          .safeMint(other1.address, 1, "0x", { value: expandToPowers(1, 10) })
      ).to.emit(fortuneDao, "Transfer");
      await expect(
        fortuneDao
          .connect(other1)
          .safeMint(other1.address, 1, "0x", { value: expandToPowers(1, 10) })
      ).to.be.revertedWith("used tokenId");
      expect(await fortuneDao.tokenURI(1)).equal("0x");
      const royaltyData = await fortuneDao.royaltyData(1);
      expect(royaltyData[0]).to.equal(wallet.address);
      expect(royaltyData[1]).to.equal(1000);
      for (let i = 2; i <= 10; i++) {
        await fortuneDao.connect(other1).safeMint(other1.address, i, "0x", {
          value: expandToPowers(1, 10),
        });
      }

      await expect(
        fortuneDao
          .connect(other1)
          .safeMint(other1.address, 11, "0x", { value: expandToPowers(1, 10) })
      ).to.be.revertedWith("balance can not exceed 10");
      await Promise.all([
        fortuneDao.connect(other2).safeMint(other2.address, 11, "0x", {
          value: expandToPowers(1, 10),
        }),
        fortuneDao.connect(other2).safeMint(other2.address, 12, "0x", {
          value: expandToPowers(1, 10),
        }),
      ]);
      await expect(
        fortuneDao.connect(other2).safeMint(other2.address, 13, "0x", {
          value: expandToPowers(1, 10),
        })
      ).to.be.revertedWith("mint is over");
    });
    it("mintWithSig", async () => {
      const value = {
        to: other0.address,
        tokenId: 1,
        uri: "0xkelw",
        value: expandToPowers(1, 10).toString(),
        nonce: 1,
      };
      const sig = await wallet._signTypedData(
        domain(fortuneDao.address),
        types,
        value
      );
      const { v, r, s } = ethers.utils.splitSignature(sig);

      await expect(
        fortuneDao.mintWithSig(
          value.to,
          value.tokenId,
          value.uri,
          value.value,
          value.nonce,
          v,
          r,
          s,
          { value: expandToPowers(1, 10) }
        )
      ).to.emit(fortuneDao, "Transfer");
    });
    it("support interfaces", async () => {
      const ERC2981MagicValue = "0x2a55205a";
      const ERC721MagicValue = "0x80ac58cd";
      const ERC721MetadataMagicValue = "0x5b5e139f";
      expect(await fortuneDao.supportsInterface(ERC2981MagicValue)).to.be.true;
      expect(await fortuneDao.supportsInterface(ERC721MagicValue)).to.be.true;
      expect(await fortuneDao.supportsInterface(ERC721MetadataMagicValue)).to.be
        .true;
    });
  });
});
