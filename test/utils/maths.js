const { ethers } = require("hardhat");
const { BigNumber } = ethers;

const expandTo18 = (num) => BigNumber.from(num).mul(BigNumber.from(10).pow(18));
const expandToPowers = (num, pow) =>
  BigNumber.from(num).mul(BigNumber.from(10).pow(pow));
const getEtherFractionPercent = (value, fraction) =>
  expandTo18(value).mul(fraction).div(1000);

module.exports = { expandTo18, expandToPowers, getEtherFractionPercent };
