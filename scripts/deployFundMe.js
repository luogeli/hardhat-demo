// 1. import ethers.js
// 2. create main function
// 3. execute main function

const { ethers } = require("hardhat");

async function main() {
    // 1. create factory 创建函数工厂
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log(`contract deploying`);
    // 2. deploy contract from factory
    const fundMe
        = await fundMeFactory.deploy(10);
    // 3. 等待部署完成 等待入块
    await fundMe.waitForDeployment();
    console.log(`contract has been deployed successfully, contract address is: ${fundMe.target}`);
}

/**
 * 调用main函数
 *
 * 手动执行: npx hardhat run scripts/deployFundMe.js --network hardhat
 * 如果使用hardhat，可以隐藏 --network hardhat
 */
main().then().catch((error) => {
    // 打印错误信息
    console.error(error);
    // 0:正常退出 1:非正常退出
    process.exit(1);
});