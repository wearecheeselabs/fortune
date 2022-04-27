const {expect, should, assert} = require("chai");
const {ethers} = require("hardhat");
const {int} = require("hardhat/internal/core/params/argumentTypes");


let fortune;
let tokenCount = 3;
let uriBaseString = "IamanNFT";
let owner;
let treasurer;
let allAddresses;
let addresses1;
let addresses2;
let addresses3;
const mintPriceEther = ".001";


let fortuneWhitelistedUser1;
let fortuneWhitelistedUser2;
let fortuneNonWhitelistedUser;
let fortuneTreasurer;


let provider;

before(async () => {
    allAddresses = [];
    let signers = await ethers.getSigners();
    provider = signers[0].provider;
    for (i = 0; i < signers.length; i++) {
        allAddresses.push(signers[i].address);
    }
    addresses1 = allAddresses.slice(0, 10);
    addresses2 = allAddresses.slice(11, 16);
    addresses3 = allAddresses.slice(16);
    treasurer = addresses3.at(-1);


    // console.log(addresses1)
    // console.log(addresses2)
    // console.log(addresses3)

    console.log("before executed.");
    // Use one of those accounts to deploy the contract
    const Fortune = await ethers.getContractFactory("Fortune");
    fortune = await Fortune.deploy();
    await fortune.deployed();
    owner = fortune.signer.address;
    console.log(`Contract Address: ${[fortune.address]}`);
    console.log(`Owner Address: ${[fortune.signer.address]}`);

    fortuneWhitelistedUser1 = fortune.connect(signers[1]);
    fortuneWhitelistedUser2 = fortune.connect(signers[12]);
    fortuneNonWhitelistedUser = fortune.connect(signers[17]);
    fortuneTreasurer = fortune.connect(signers.at(-1));


    console.log('******************************************************');
});


describe("Fortune Testing", function () {
    it("First URI should be empty for all token IDs", async function () {
        for (let i = 0; i < tokenCount; i++) {
            // console.log("inside for statement")
            expect(await fortune.uri(i)).to.equal("");
            expect(await fortune.uri(i)).to.not.equal("something");
        }
    });
    it("URI should be changed once it is set using setURI", async function () {
        for (let i = 0; i < tokenCount; i++) {
            const setGreetingTx = await fortune.setURI(i, uriBaseString + i);

            // wait until the transaction is mined
            await setGreetingTx.wait();

            expect(await fortune.uri(i)).to.equal(uriBaseString + i);
            expect(await fortune.uri(i)).to.not.equal(uriBaseString + i + "something");
        }
    });
});


describe("whitelist", function () {
    it("WhitelistCount for Token 1 at very beginning", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
    });
    it("WhitelistCount for Token 2 at very beginning", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
    });

    it("check if addresses are whitelisted before whitelisting.", async function () {
        for (let i = 0; i < allAddresses.length; i++) {
            expect(await fortune.isWhitelisted(allAddresses[i])).to.be.equal(0);
        }
    });
    it("whitelist addresses1", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1)).to.not.equal("");
    });
    it("whitelist addresses2", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 2)).to.not.equal("");
    });
    it("WhitelistCount for Token 1 after whitelisting", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });
    it("WhitelistCount for Token 2 after whitelisting", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.length);
    });

    it("check if addresses are whitelisted after whitelisting.", async function () {
        for (let i = 0; i < addresses1.concat(addresses2).length; i++) {
            expect(parseInt(await fortune.isWhitelisted(addresses1.concat(addresses2)[i]))).to.be.oneOf([1, 2]);
        }
    });

    it("check if addresses3 list are not whitelisted.", async function () {
        for (let i = 0; i < addresses3.length; i++) {
            expect(parseInt(await fortune.isWhitelisted(addresses3[i]))).to.be.equal(0);
        }
    });
});

describe("Treasurer", function () {
    // before();
    it("check if contract balance is 0 before minting.", async function () {
        expect(await fortune.contractBalance()).to.equal(0);
    });
    it("Mint Token ID 1", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("Get contract balance after a mint.", async function () {
        expect(await fortune.contractBalance()).to.not.equal(0);
    });
    it("FAIL: Get contract balance by treasurer.", async function () {
        expect(await fortuneTreasurer.contractBalance());
    });
    it("FAIL: Get contract balance by a non owner.", async function () {
        expect(await fortuneWhitelistedUser1.contractBalance());
    });
    it("Treasurer should be owner initially.", async function () {
        expect(await fortune.treasurer()).to.equal(owner);
    });
    it("Treasurer address can be changed by treasurer.", async function () {
        expect(await fortune.changeTreasurer(treasurer));
    });
    it("Treasurer address should be treasurer now.", async function () {
        expect(await fortune.treasurer()).to.equal(treasurer);
    });
    it("FAIL: Treasurer address can not be changed by owner.", async function () {
        expect(await fortune.changeTreasurer(treasurer));
    });
    it("Get contract balance by owner.", async function () {
        expect(await fortune.contractBalance());
    });

    it("withdrawAll by treasurer.", async function () {
        expect(await fortuneTreasurer.withdrawAll());
    });

    it("FAIL: withdrawAll by owner.", async function () {
        expect(await fortune.withdrawAll());
    });

    it("FAIL: withdrawPart by treasurer.", async function () {
        expect(await fortuneTreasurer.withdrawPart(1000000));
    });

    it("FAIL: withdrawPart by owner.", async function () {
        expect(await fortune.withdrawPart("10000000"));
    });

});


describe("Minting", function () {
    // before();
    it("FAIL: Mint Token ID 1 not possible for non whitelisted address", async function () {
        expect(await fortune.mintAll(addresses3[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("FAIL: Mint Token ID 2 not possible for non whitelisted address", async function () {
        expect(await fortune.mintAll(addresses3[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("Pause minting", async function () {
        expect(await fortune.pause());
    });

    it("Whitelisting 1 possible while paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1));
    });

    it("WhitelistCount for Token 1", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length);
    });

    it("Whitelisting 2 possible while paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 2));
    });

    it("WhitelistCount for Token 2", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.length);
    });
    it("WhitelistCount for Token 1 after whitelisting tokens 1 and 2", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });

    it("Remove from whitelist possible while paused", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses1, 1));
    });

    it("WhitelistCount for Token 1 after batchRemoval of Token 1", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses2.length);
    });

    it("Whitelisting 1 again while paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1));
    });

    it("WhitelistCount for Token 1 after whitelisting tokens 1 and 2", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });

    it("FAIL: Minting not possible while paused", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("UnPause minting", async function () {
        expect(await fortune.unpause());
    });

    it("Mint Token ID 1", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("WhitelistCount for Token 1 after minting 1 token.", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });
    it("FAIL: Mint Token ID 1 for a second time for same address", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)}));
    });
    it("Mint Token ID 2", async function () {
        expect(await fortune.mintAll(addresses2[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("WhitelistCount for Token 2 after minting 1 token.", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.length);
    });
    it("WhitelistCount for Token 1 after minting both tokens.", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });
    it("Is already minted address still whitelisted.", async function () {
        expect(await fortune.isWhitelisted(addresses1[0])).to.equal(99);
    });

    it("Is already minted address still whitelisted.", async function () {
        expect(await fortune.isWhitelisted(addresses2[0])).to.equal(99);
    });

    // it("Address is not whitelisted now.", async function () {
    //     expect(await fortune.isWhitelisted(addresses1[0])).to.be.equal(99);
    // });


});

describe("Pause and Unpause", function () {
    it("Whitelisting 1 possible before paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1));
    });
    it("Whitelisting 2 possible before paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 2));
    });
    it("Mint Token ID 1 possible before Pause", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("Mint Token ID 2 possible before Pause", async function () {
        expect(await fortune.mintAll(addresses2[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("batchRemoveWhitelist 1 possible before paused", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses1, 1));
    });
    it("batchRemoveWhitelist 2 possible before paused", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses2, 2));
    });

    it("Pause minting", async function () {
        expect(await fortune.pause());
    });
    it("Whitelisting 1 possible after paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1));
    });
    it("Whitelisting 2 possible after paused", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 2));
    });

    it("FAIL: Mint Token ID 1 not possible after Pause", async function () {
        expect(await fortune.mintAll(addresses1[1], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("FAIL: Mint Token ID 2 not possible after Pause", async function () {
        expect(await fortune.mintAll(addresses2[1], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("WhitelistCount for Token 1 while paused", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length + addresses2.length);
    });
    it("WhitelistCount for Token 2 while paused", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.length);
    });

    it("batchRemoveWhitelist 1 possible after paused", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses1, 1));
    });
    it("batchRemoveWhitelist 2 possible after paused", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses2, 2));
    });

    it("UnPause minting", async function () {
        expect(await fortune.unpause());
    });

    it("Whitelisting 1 possible after Unpause", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1));
    });
    it("Whitelisting 2 possible after Unpause", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 2));
    });

    it("Mint Token ID 1 after Unpause", async function () {
        expect(await fortune.mintAll(addresses1[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });
    it("Mint Token ID 2 after Unpause", async function () {
        expect(await fortune.mintAll(addresses2[0], {value: ethers.utils.parseEther(mintPriceEther)})).to.not.equal("");
    });

    it("WhitelistCount for Token 1 after Unpause", async function () {
        expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.length);
    });
    it("WhitelistCount for Token 2 after Unpause", async function () {
        expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.length);
    });
    it("batchRemoveWhitelist 1 possible after Unpause", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses1, 1));
    });
    it("batchRemoveWhitelist 2 possible after Unpause", async function () {
        expect(await fortune.batchRemoveWhitelist(addresses2, 2));
    });
});

