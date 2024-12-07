const { task } = require("hardhat/config")

task("deploy-fundme", "deploy fundme contract").setAction(async(taskArgs, hre) => {
    // 1. create factory 创建函数工厂
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log(`contract deploying`);
    // 2. deploy contract from factory
    const fundMe
        = await fundMeFactory.deploy(300);
    // 3. 等待部署完成 等待入块
    await fundMe.waitForDeployment();
    console.log(`contract has been deployed successfully, contract address is: ${fundMe.target}`);
    // verify fundMe
    // if chainId != 11155111 or etherscan_api_key is null
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log(`Waiting for 5 confirmations`);
        // 4. 等待5次确认，确保交易已被区块链网络完全确认，才能进行verify验证合约
        await fundMe.deploymentTransaction().wait(5);
        // 5. verify 验证合约
        await verifyFundMe(fundMe.target, [300]);
    } else {
        console.log("verification skipped..")
    }
});

async function verifyFundMe(fundMeAddr, args) {
    // 5. verify 验证合约
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

module.exports = {}