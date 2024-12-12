
require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
// 对敏感信息加密,使用env-enc加密
// npx env-enc set-pw
// npx env-enc set key value
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks/deploy-fundme")
// 使用index.js 自动找tasks下面的index.js
require("./tasks")
require("hardhat-deploy")

const INFURA_SEPOLIA_URL= process.env.SEPOLIA_URL;
const QUICKNODE_SEPOLIA_URL = process.env.QUICKNODE_SEPOLIA_URL;
const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      // url: Alchemy, Infura, QuickNode, 这里使用的是Alchemy
      url: ALCHEMY_SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      // sepolia chainId
      chainId: 11155111
    }
  },
  etherscan: {
    // etherscan api key
    // varify: npx hardhat verify --network sepolia 0x13Cb87A8e1ec291F47B09B1f84a6B804D72a0B8a "10"
    // https://sepolia.etherscan.io/address/0x13Cb87A8e1ec291F47B09B1f84a6B804D72a0B8a#code
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  }
  ,sourcify: {
    enabled: false
  },
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    }
  }

};


