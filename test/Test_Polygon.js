// const {expect, should, assert} = require("chai");
// const {ethers} = require("hardhat");
// const {int} = require("hardhat/internal/core/params/argumentTypes");


// let fortune;
// let owner;

// let allAddresses;
// let addresses1;
// let addresses2;
// let addresses3;
// let addresses4;

// let fortuneWhitelistedUser1;
// let fortuneWhitelistedUser2;
// let fortuneWhitelistedUser3;
// let fortuneNonWhitelistedUser;

// let provider;

// let metadata_medpack = "https://gateway.pinata.cloud/ipfs/QmSQUfykZ8iixmwhwr9XbhpaY3KdCghTXTWofyHu1ZDsXW";
// let metadata_gear = "https://gateway.pinata.cloud/ipfs/QmXpQ7EmrjwwgNcZbLUCTynyYKvGnVbpmko8wjSbbLTorN";
// let metadata_supplies = "https://gateway.pinata.cloud/ipfs/QmZFkPa1VUZ4W5aizTLyC16A2aXjWoMuAdwy2r1vsbv3bw";
// let metadata_array = [metadata_medpack, metadata_gear, metadata_supplies];
// let supplies = [3, 3, 3];
// // let supplies = [250, 250, 250];

// let token1Supply = supplies[0];
// let token2Supply = supplies[1];
// let token3Supply = supplies[2];


// before(async () => {
//     allAddresses = [];
//     let signers = await ethers.getSigners();
//     provider = signers[0].provider;
//     for (i = 0; i < signers.length; i++) {
//         allAddresses.push(signers[i].address);
//     }
//     addresses1 = allAddresses.slice(0, 5);
//     addresses2 = allAddresses.slice(6, 10);
//     addresses3 = allAddresses.slice(11, 15);
//     addresses4 = allAddresses.slice(16);

//     // console.log(addresses1)
//     // console.log(addresses2)
//     // console.log(addresses3)
//     // console.log(addresses4)

//     console.log("before executed.");
//     // Use one of those accounts to deploy the contract
//     const Fortune = await ethers.getContractFactory("FortunePol");
//     fortune = await Fortune.deploy();
//     await fortune.deployed();
//     owner = fortune.signer.address;
//     console.log(`Contract Address: ${[fortune.address]}`);
//     console.log(`Owner Address: ${[fortune.signer.address]}`);

//     fortuneWhitelistedUser1 = fortune.connect(signers[1]);
//     fortuneWhitelistedUser2 = fortune.connect(signers[6]);
//     fortuneWhitelistedUser3 = fortune.connect(signers[12]);
//     fortuneNonWhitelistedUser = fortune.connect(signers[17]);
//     console.log('******************************************************');
// });

// describe("genericFunctions", function () {
//     it("getMaxSupply", async function () {
//         for (let i = 0; i < supplies.length; i++) {
//             expect(await fortune.getMaxSupply(i + 1)).to.equal(supplies[i]);
//         }
//         ;
//     });
// });

// describe("setURI", function () {
//     it("Pause minting", async function () {
//         expect(await fortune.pause());
//     });
//     it("First URI should be empty for all token IDs", async function () {
//         for (let i = 0; i < supplies.length; i++) {
//             expect(await fortune.uri(i + 1)).to.equal("");
//         }
//     });
//     it("URI should be changed once it is set using setURI", async function () {
//         for (let i = 0; i < supplies.length; i++) {
//             expect(await fortune.setURI(i + 1, metadata_array[i]));

//             expect(await fortune.uri(i + 1)).to.equal(metadata_array[i]);
//             expect(await fortune.uri(i + 1)).to.not.equal("");
//         }
//     });
//     it("FAIL: non owner can't setURI", async function () {
//         for (let i = 0; i < supplies.length; i++) {
//             expect(await fortuneWhitelistedUser1.setURI(i + 1, metadata_array[i]));

//             expect(await fortune.uri(i + 1)).to.equal(metadata_array[i]);
//             expect(await fortune.uri(i + 1)).to.not.equal("");
//         }
//     });
// });

// describe("maxSupply", function () {
//     let token1Supply = supplies[0];
//     let token2Supply = supplies[1];
//     let token3Supply = supplies[2];

//     it("Whitelist addresses1 equal to supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("WhitelistCount for Token 1.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });
//     it("batchRemoveWhitelist addresses1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1, 1));
//     });
//     it("WhitelistCount for Token 1 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });

//     it("Whitelist addresses1 less than supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply - 1), 1));
//     });
//     it("WhitelistCount for Token 1.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply - 1).length);
//     });
//     it("batchRemoveWhitelist addresses1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1, 1));
//     });
//     it("WhitelistCount for Token 1 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("Address length is more than or equal to token1Supply+1.", async function () {
//         assert(token1Supply + 1 <= addresses1.length, "Reduce Max Supply to complete the next test case.");
//     });
//     it("Check if addresses1 are not whitelisted before whitelisting.", async function () {
//         for (let i = 0; i < addresses1.slice(0, token1Supply + 1).length; i++) {
//             expect(await fortune.isWhitelisted(addresses1.slice(0, token1Supply + 1)[i])).to.be.equal(0);
//         }
//     });

//     it("FAIL: Whitelist addresses1 more than supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply + 1), 1));
//     });
//     it("WhitelistCount for Token 1 after.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("batchRemoveWhitelist addresses1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1, 1));
//     });
//     it("WhitelistCount for Token 1 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });

//     it("WhitelistCount for Token 2 before whitelisting", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });


//     it("Whitelist addresses2 equal to supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });
//     it("WhitelistCount for Token 2.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });
//     it("batchRemoveWhitelist addresses2 bulk remove from Token 2.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2, 2));
//     });
//     // it("batchRemoveWhitelist addresses2 bulk remove from Token 1.", async function () {
//     //     expect(await fortune.batchRemoveWhitelist(addresses2, 1));
//     // });
//     it("WhitelistCount for Token 2 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });

//     it("Whitelist addresses2 less than supply", async function () {
//         // console.log(addresses2.slice(0, token2Supply-1));
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply - 1), 2));
//     });
//     it("WhitelistCount for Token 2.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply - 1).length);
//     });
//     it("batchRemoveWhitelist addresses2 Token 2 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2, 2));
//     });
//     it("batchRemoveWhitelist addresses2 Token 1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2, 1));
//     });
//     it("WhitelistCount for Token 2 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });
//     it("Address length is more than or equal to token2Supply+1.", async function () {
//         assert(token2Supply + 1 <= addresses2.length, "Reduce Max Supply to complete the next test case.");
//     });

//     it("Check if addresses2 are not whitelisted before whitelisting.", async function () {
//         for (let i = 0; i < addresses2.slice(0, token2Supply + 1).length; i++) {
//             expect(await fortune.isWhitelisted(addresses2.slice(0, token2Supply + 1)[i])).to.be.equal(0);
//         }
//     });

//     it("FAIL: Whitelist addresses2 more than supply", async function () {
//         // console.log(addresses2.slice(0, token2Supply+1));
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply + 1), 2));
//     });
//     it("WhitelistCount for Token 2 after.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });
//     it("batchRemoveWhitelist addresses2 Token 2 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2, 2));
//     });
//     it("batchRemoveWhitelist addresses2 Token 1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2, 1));
//     });
//     it("WhitelistCount for Token 2 is 0 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });

//     it("WhitelistCount for Token 1 is 0 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });


//     it("Whitelist addresses3 equal to supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses3.slice(0, token3Supply), 3));
//     });
//     it("WhitelistCount for Token 3.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(addresses3.slice(0, token3Supply).length);
//     });
//     it("batchRemoveWhitelist addresses3 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses3, 3));
//     });
//     it("WhitelistCount for Token 3 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(0);
//     });

//     it("Whitelist addresses3 less than supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses3.slice(0, token3Supply - 1), 3));
//     });
//     it("WhitelistCount for Token 3.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(addresses3.slice(0, token3Supply - 1).length);
//     });
//     it("batchRemoveWhitelist addresses3 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses3, 3));
//     });
//     it("WhitelistCount for Token 3 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(0);
//     });
//     it("Address length is more than or equal to token3Supply+1.", async function () {
//         assert(token3Supply + 1 <= addresses3.length, "Reduce Max Supply to complete the next test case.");
//     });
//     it("Check if addresses3 are not whitelisted before whitelisting.", async function () {
//         for (let i = 0; i < addresses3.slice(0, token3Supply + 1).length; i++) {
//             expect(await fortune.isWhitelisted(addresses3.slice(0, token3Supply + 1)[i])).to.be.equal(0);
//         }
//     });

//     it("FAIL: Whitelist addresses3 more than supply", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses3.slice(0, token3Supply + 1), 3));
//     });
//     it("WhitelistCount for Token 3 after.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(0);
//     });
//     it("batchRemoveWhitelist addresses3 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses3, 3));
//     });
//     it("WhitelistCount for Token 3 after bulk removal.", async function () {
//         expect(await fortune.getWhitelistCount(3)).to.be.equal(0);
//     });

//     it("WhitelistCount for Token 2 before whitelisting", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });

// });

// describe("whitelist", function () {
//     it("WhitelistCount for Token 1 at very beginning", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("WhitelistCount for Token 2 at very beginning", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });

//     it("check if addresses are whitelisted before whitelisting.", async function () {
//         for (let i = 0; i < allAddresses.length; i++) {
//             expect(await fortune.isWhitelisted(allAddresses[i])).to.be.equal(0);
//         }
//     });
//     it("FAIL: whitelist addresses1 by non owner is not possible.", async function () {
//         expect(await fortuneWhitelistedUser1.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("whitelist addresses1 by owner is possible.", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("check if addresses1 list are whitelisted.", async function () {
//         for (let i = 0; i < addresses1.slice(0, token1Supply).length; i++) {
//             expect(parseInt(await fortune.isWhitelisted(addresses1.slice(0, token1Supply)[i]))).to.be.equal(1);
//         }
//     });

//     it("batchRemoveWhitelist addresses1 Token 1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("batchRemoveWhitelist addresses2 Token 2 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });
//     it("batchRemoveWhitelist addresses2 Token 1 bulk remove.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });

//     it("FAIL: whitelist addresses2 by non owner is not possible.", async function () {
//         expect(await fortuneWhitelistedUser1.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });
//     it("whitelist addresses2", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });
//     it("WhitelistCount for Token 1 after whitelisting", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("WhitelistCount for Token 2 after whitelisting", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });

//     it("check if addresses2 list are whitelisted.", async function () {
//         for (let i = 0; i < addresses2.slice(0, token2Supply).length; i++) {
//             expect(parseInt(await fortune.isWhitelisted(addresses2.slice(0, token2Supply)[i]))).to.be.equal(2);
//         }
//     });

//     it("check if addresses3 list are not whitelisted.", async function () {
//         for (let i = 0; i < addresses3.length; i++) {
//             expect(parseInt(await fortune.isWhitelisted(addresses3[i]))).to.be.equal(0);
//         }
//     });

//     it("FAIL: batchRemoveWhitelist addresses1 by non owner is not possible.", async function () {
//         expect(await fortuneWhitelistedUser1.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("FAIL: batchRemoveWhitelist addresses2 by non owner is not possible.", async function () {
//         expect(await fortuneWhitelistedUser1.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });

//     it("batchRemoveWhitelist addresses1 by owner.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("batchRemoveWhitelist addresses2 by owner.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });
//     it("WhitelistCount for Token 1 after batchRemoveWhitelist.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("batchRemoveWhitelist addresses2 from token 1 by owner.", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 1));
//     });
//     it("WhitelistCount for address1 Token 1 after batchRemoveWhitelist.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });
//     it("WhitelistCount for Token 2 after batchRemoveWhitelist.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(0);
//     });
// });

// describe("Pause and Unpause", function () {
//     token1Supply = 2;
//     token2Supply = 2;
//     it("Whitelisting 1 possible before paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("Whitelisting 2 possible before paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });
//     it("Mint Token ID 1 possible before Pause", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });
//     it("Mint Token ID 2 possible before Pause", async function () {
//         expect(await fortune.mintAll(addresses2.slice(0, token2Supply)));
//     });
//     it("batchRemoveWhitelist 1 possible before paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("batchRemoveWhitelist addresses2 for Token 2 possible before paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });
//     it("batchRemoveWhitelist addresses2 for Token 1 possible before paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 1));
//     });

//     it("Pause minting", async function () {
//         expect(await fortune.pause());
//     });
//     it("Whitelisting 1 possible after paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("Whitelisting 2 possible after paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });
//     it("Whitelisting 2 possible after paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses3.slice(0, token3Supply), 3));
//     });

//     it("FAIL: Mint Token ID 1 not possible after Pause", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });

//     it("FAIL: Mint Token ID 2 not possible after Pause", async function () {
//         expect(await fortune.mintAll(addresses2.slice(0, token2Supply)));
//     });

//     it("WhitelistCount for Token 1 while paused", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });
//     it("WhitelistCount for Token 2 while paused", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });

//     it("batchRemoveWhitelist 1 possible after paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("batchRemoveWhitelist addresses2 for token 2 possible after paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });

//     it("batchRemoveWhitelist addresses2 for token 1 possible after paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 1));
//     });

//     it("UnPause minting", async function () {
//         expect(await fortune.unpause());
//     });

//     it("Whitelisting 1 possible after Unpause", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });
//     it("Whitelisting 2 possible after Unpause", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });

//     it("FAIL: Mint Token ID 1 after Unpause", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });
//     it("FAIL: Mint Token ID 2 after Unpause", async function () {
//         expect(await fortune.mintAll(addresses2.slice(0, token2Supply)));
//     });
//     it("Mint Token ID 3 after Unpause", async function () {
//         expect(await fortune.mintAll(addresses3.slice(0, token3Supply)));
//     });

//     it("WhitelistCount for Token 1 after Unpause", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });
//     it("WhitelistCount for Token 2 after Unpause", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });
//     it("batchRemoveWhitelist 1 possible after Unpause", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });
//     it("batchRemoveWhitelist 2 possible after Unpause", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses2.slice(0, token2Supply), 2));
//     });
// });

// describe("Minting", function () {
//     token1Supply = 2;
//     token2Supply = 2;
//     it("FAIL: Mint Token ID 1 not possible for non whitelisted address", async function () {
//         expect(await fortune.mintAll(addresses4.slice(0, token1Supply)));
//     });

//     it("FAIL: Mint Token ID 2 not possible for non whitelisted address", async function () {
//         expect(await fortune.mintAll(addresses4.slice(0, token2Supply)));
//     });

//     it("Pause minting", async function () {
//         expect(await fortune.pause());
//     });

//     it("Whitelisting 1 possible while paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });

//     it("WhitelistCount for Token 1", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });

//     it("Whitelisting 2 possible while paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses2.slice(0, token2Supply), 2));
//     });

//     it("WhitelistCount for Token 2", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });
//     it("WhitelistCount for Token 1 after whitelisting tokens 1 and 2", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });

//     it("Remove from whitelist possible while paused", async function () {
//         expect(await fortune.batchRemoveWhitelist(addresses1.slice(0, token1Supply), 1));
//     });

//     it("WhitelistCount for Token 1 after batchRemoval of Token 1", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(0);
//     });

//     it("Whitelisting 1 again while paused", async function () {
//         expect(await fortune.batchWhitelistAddress(addresses1.slice(0, token1Supply), 1));
//     });

//     it("WhitelistCount for Token 1 after whitelisting tokens 1 and 2", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });

//     it("FAIL: Minting not possible while paused", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });

//     it("UnPause minting", async function () {
//         expect(await fortune.unpause());
//     });

//     it("Mint Token ID 1", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });
//     it("FAIL: Mint Token ID 1 again is not possible", async function () {
//         expect(await fortune.mintAll(addresses1.slice(0, token1Supply)));
//     });
//     it("WhitelistCount for Token 1 after minting 1 token.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });
//     it("Mint Token ID 2", async function () {
//         expect(await fortune.mintAll(addresses2.slice(0, token2Supply)));
//     });

//     it("FAIL: Mint Token ID 2 again is not possible.", async function () {
//         expect(await fortune.mintAll(addresses2.slice(0, token2Supply)));
//     });
//     it("WhitelistCount for Token 2 after minting 1 token.", async function () {
//         expect(await fortune.getWhitelistCount(2)).to.be.equal(addresses2.slice(0, token2Supply).length);
//     });
//     it("WhitelistCount for Token 1 after minting both tokens.", async function () {
//         expect(await fortune.getWhitelistCount(1)).to.be.equal(addresses1.slice(0, token1Supply).length);
//     });
//     it("Is already minted address still whitelisted.", async function () {
//         expect(await fortune.isWhitelisted(addresses1.slice(0, token1Supply)[0])).to.equal(99);
//     });

//     it("Is all already minted address still whitelisted.", async function () {
//         for (let i = 0; i < addresses1.slice(0, token1Supply).concat(addresses2.slice(0, token2Supply)).length; i++) {
//             expect(await fortune.isWhitelisted(addresses1.slice(0, token1Supply).concat(addresses2.slice(0, token2Supply))[i])).to.equal(99);
//         }
//     });

// });



