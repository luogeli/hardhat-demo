const { task } = require("hardhat/config")

task("interact-fundme", "interact fundme with function contract")
    .addParam("addr", "fundme contract address")
    .setAction(async(taskArgs, hre) => {
        const fundMeFactory = await ethers.getContractFactory("FundMe");
        // 已部署的合约的地址, attach 贴上去
        const fundMe = fundMeFactory.attach(taskArgs.addr);
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
});


module.exports = {}