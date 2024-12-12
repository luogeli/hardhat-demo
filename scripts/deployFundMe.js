// 1. import ethers.js
// 2. create main function
// 3. execute main function

// const { ethers} = require("ethers");
// 线上
// 连接到网络（例如，本地 Hardhat 网络或 Infura/Alchemy）
// const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
// 使用私钥创建钱包（钱包用来签署交易）
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// 获取合约工厂
// const contractFactory = await ethers.getContractFactory("FundMe2", wallet);

const { ethers } = require("hardhat");

/**
 * 部署合约主函数
 *
 * @returns {Promise<void>}
 */
async function main() {
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

    //  init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();
    //  fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.0000001")});
    await fundTx.wait();
    //  check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of the contract is ${balanceOfContract}`);
    //  fund contract with second account
    const fundTxWthSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.0000002")});
    await fundTxWthSecondAccount.wait();
    //  check balance of contract
    const balanceOfContractAfterSecond = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of the contract is ${balanceOfContractAfterSecond}`);
    //  check mapping funderToAmount
    const firstAccountBalanceInFundMe = await fundMe.funderToAmount(firstAccount.address);
    const secondAccountBalanceInFundMe = await fundMe.funderToAmount(secondAccount.address);
    console.log(`Balance of first account is ${firstAccount.address} is ${firstAccountBalanceInFundMe}`);
    console.log(`Balance of first account is ${secondAccount.address} is ${secondAccountBalanceInFundMe}`);
}

/**
 * 验证fundMe合约
 *
 * @param fundMeAddr 合约地址
 * @param args 参数
 * @returns {Promise<void>}
 */
async function verifyFundMe(fundMeAddr, args) {
    // 5. verify 验证合约
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
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




