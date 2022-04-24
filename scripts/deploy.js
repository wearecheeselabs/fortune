// scripts/deploy.js

const { ethers } = require("hardhat");
async function main () {
    // We get the contract to deploy
    // const Box = await ethers.getContractFactory('Box');
    const Fortune = await ethers.getContractFactory('Fortune');
    console.log('Deploying Fortune...');
    const box = await Fortune.deploy();
    await box.deployed();
    console.log('Fortune deployed to:', box.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


// // scripts/deploy.js
// async function main () {
//     // We get the contract to deploy
//     const Box = await ethers.getContractFactory('Box');
//     console.log('Deploying Box...');
//     const box = await Box.deploy();
//     await box.deployed();
//     console.log('Box deployed to:', box.address);
// }
//
// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });