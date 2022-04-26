const {expect} = require("chai");
const {ethers} = require("hardhat");
// const assert = require("assert");
// const {string} = require("hardhat/internal/core/params/argumentTypes");

// let accounts;
let fortune;
let tokenCount = 3;
let uriBaseString = "IamanNFT";


before(async () => {
    const [owner] = await ethers.getSigners();

    console.log(owner);
    console.log("before executed.");
    // Use one of those accounts to deploy the contract
    const Fortune = await ethers.getContractFactory("Fortune");
    fortune = await Fortune.deploy();
    await fortune.deployed();
    console.log(`Contract Address: ${[fortune.address]}`);
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

describe("Initial State Test", function () {
    it("Treasurer exists and is the owner", async function () {
        expect(await fortune.treasurer()).to.equal("");
    });
    // it("URI should be changed once it is set using setURI", async function () {
    //     for (let i = 0; i < tokenCount; i++) {
    //         const setGreetingTx = await fortune.setURI(i, uriBaseString + i);
    //
    //         // wait until the transaction is mined
    //         await setGreetingTx.wait();
    //
    //         expect(await fortune.uri(i)).to.equal(uriBaseString + i);
    //         expect(await fortune.uri(i)).to.not.equal(uriBaseString + i + "something");
    //     }
    // });
});






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
