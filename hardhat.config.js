
require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
// 对敏感信息加密,使用env-enc加密
// npx env-enc set-pw
// npx env-enc set key value
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");

const INFURA_SEPOLIA_URL= process.env.SEPOLIA_URL;
const QUICKNODE_SEPOLIA_URL = process.env.QUICKNODE_SEPOLIA_URL;
const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      // url: Alchemy, Infura, QuickNode, 这里使用的是Alchemy
      url: ALCHEMY_SEPOLIA_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    // etherscan api key
    // varify: npx hardhat verify --network sepolia 0x824d361853140f8835c6850973461F20446C3f54 "10"
    apiKey: ETHERSCAN_API_KEY,
  }
  ,sourcify: {
    enabled: false
  }

};


