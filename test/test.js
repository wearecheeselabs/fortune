const {expect} = require("chai");
const {ethers} = require("hardhat");
const {int} = require("hardhat/internal/core/params/argumentTypes");

// const accounts = await hre.ethers.getSigners();
// const [wallet, other0, other1, other2, other3, other4, other5, other6] = accounts;


// let accounts;
let fortune;
let tokenCount = 3;
let uriBaseString = "IamanNFT";
let owner;
let allAddresses;
let addresses1;
let addresses2;
let addresses3;


before(async () => {
    allAddresses = [];
    const temp = await ethers.getSigners();
    for (i = 0; i < temp.length; i++) {
        allAddresses.push(temp[i].address);
    }
    addresses1 = allAddresses.slice(0, 10);
    addresses2 = allAddresses.slice(11, 16);
    addresses3 = allAddresses.slice(16);

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
    it("check if addresses are whitelisted before whitelisting.", async function () {
        for (let i = 0; i < allAddresses.length; i++) {
            let val = await fortune.IsWhitelisted(allAddresses[i]);
            expect(val).to.equal(0);
            expect(val).to.not.equal([1, 2]);
        }
    });
    it("whitelist addresses1", async function () {
        expect(await fortune.batchWhitelistAddress(addresses1, 1)).to.not.equal("");
    });
    it("whitelist addresses2", async function () {
        expect(await fortune.batchWhitelistAddress(addresses2, 1)).to.not.equal("");
    });

    it("check if addresses are whitelisted after whitelisting.", async function () {
        for (let i = 0; i < allAddresses.length; i++) {
            let val = parseInt(await fortune.IsWhitelisted(allAddresses[i]));
            expect(val).to.be.oneOf([1, 2]);
            // expect(val).to.be.oneOf([0,3]);
            expect(val).to.be.not.oneOf([0, 3, 4, 5, 6, 7]);
        }
    });

    it("check if second address list are whitelisted before whitelisting.", async function () {
        for (let i = 0; i < addresses2.length; i++) {
            let val = parseInt(await fortune.IsWhitelisted(addresses2[i]));
            expect(val).to.be.oneOf([1, 2]);
            expect(val).to.be.not.oneOf([0, 3, 4, 5, 6, 7]);
        }
    });
});


// describe("Initial State Test", function () {
//     it("Treasurer exists and is the owner", async function () {
//         expect(await fortune.treasurer()).to.equal("");
//     });
//
// });


//
//
// describe("Fortune", function () {
//     it("Should return the new greeting once it's changed", async function () {
//         const Fortune = await ethers.getContractFactory("Fortune");
//         const fortune = await Fortune.deploy();
//         await fortune.deployed();
//
//         expect(await fortune.uri(1)).to.equal("");
//         let uriString = "Hola, mundo!"
//         const setGreetingTx = await fortune.setURI(1, uriString);
//
//         // wait until the transaction is mined
//         await setGreetingTx.wait();
//
//         expect(await fortune.uri(1)).to.equal(uriString);
//     });
//
//     it("Check number is correct", async function () {
//         const Fortune = await ethers.getContractFactory("Fortune");
//         const fortune = await Fortune.deploy();
//         await fortune.deployed();
//         expect(await fortune.justReturnNumber(2)).to.equal(200);
//     });
// });
