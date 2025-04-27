const { network} = require("hardhat")
const { DEVELOPMENT_CHAINS, LOCK_TIME, WAIT_CONFIRMATIONS, networkConfig } = require("../helper-hardhat-config")
// npx hardhat deploy getNamedAccounts = hre.getNamedAccounts

module.exports = async({getNamedAccounts, deployments}) => {
    console.log("log: this is deploy fundme function")

    const { firstAccount, secondAccount } = await getNamedAccounts();
    const { deploy } = deployments;
    console.log(`log: firstAccount is ${firstAccount}, secondAccount is ${secondAccount}`)

    // mock合约
    let dataFeedAddr;
    let confirmations;

    // 判断是否是本地网络，如果是本地网络，则获取mock合约地址，否则使用sepolia网络
    if(DEVELOPMENT_CHAINS.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator");
        dataFeedAddr = mockV3Aggregator.address;
        confirmations = 0;
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        confirmations = WAIT_CONFIRMATIONS;
    }

    // 部署FundMe合约
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        // remove deployments directory or add --reset flag if you redeploy contract
        waitConfirmations: confirmations
    });

    // 判断是否是sepolia网络，如果是sepolia网络，则进行合约验证，否则跳过
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        // verify 验证合约
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    } else {
        console.log(`log: network is ${network.name} not sepolia, verification skipped...`);
    }
}

// npx hardhat deploy --tags fundme/all
module.exports.tags = ["fundme" ,"all"]