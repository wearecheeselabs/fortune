require("@nomiclabs/hardhat-waffle");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");
const dotenv = require("dotenv");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

dotenv.config();
const { ETHERSCAN_API_KEY } = process.env;
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.12",
        hardfork: "istanbul",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 21,
    gasPriceApi: `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${ETHERSCAN_API_KEY}`,
  },
  networks: {
    hardhat: {
      localhost: {
        url: "http://localhost:8545",
      },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0xafffff,
    },

    // rinkeby: {
    //   url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
    //   accounts: { mnemonic },
    // },
    // testnet: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   chainId: 97,
    //   gasPrice: 20000000000,
    //   accounts: { mnemonic },
    // },
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
};
