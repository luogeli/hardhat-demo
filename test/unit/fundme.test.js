const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers  = require("@nomicfoundation/hardhat-network-helpers")
const { HELPERS_TIME_INCREASE } = require("../../helper-hardhat-config")

// npx hardhat test
describe("test fundme contract", async function() {

    let fundMe;
    let firstAccount;
    let mockV3Aggregator;

    beforeEach(async function() {
        // 在test中部署所有tags为all的合约
       await deployments.fixture(["all"]);
       firstAccount = (await getNamedAccounts()).firstAccount;
       const fundMeDeployment = await deployments.get("FundMe");
       mockV3Aggregator = await deployments.get("MockV3Aggregator")
       fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
    });

    it('1. test if owner is msg.sender', async function () {
        await fundMe.waitForDeployment();
        const owner = await fundMe.owner();
        assert.equal(owner, firstAccount);
        console.log(`log: fundMe address is ${fundMe.target}`)
    });

    it("2. test if dataFeed assigned correctly", async function() {
        await fundMe.waitForDeployment();
        const dataFeed = await fundMe.dataFeed();
        assert.equal(dataFeed, mockV3Aggregator.address);
    });

    // fund, getFund, reFund
    // unit test for fund
    // window open, value greator then minium value, funder balance

    it("3. window closed, value greator then minium",
    async function() {
        console.log(`log: helpers time increase is ${HELPERS_TIME_INCREASE}`)
        // make sure the window is closed
        await helpers.time.increase(HELPERS_TIME_INCREASE);
        await helpers.mine();
        console.log(`log: time shiked ${HELPERS_TIME_INCREASE}`)
        // value is greator minium value
        expect(await fundMe.fund({value : ethers.parseEther("0.0000001")}))
            .to.be.revertedWith("window is closed!");
    });

    it("4. window open, value is less then minium value, fund failed",
    async function() {
        expect(await fundMe.fund({value : ethers.parseEther("0.0000000001")}))
            .to.be.revertedWith("Sned more ETH");
        }
    )

    it("5. window open, value is greator minium, fund success",
        async function() {

            // 先设置事件监听器，在调用 fund() 之前设置监听器
            await fundMe.once("PrintLog", (_sender, _value) => {
                console.log(`log: sender is ${_sender}, value is ${_value}`)
            });


            // call the fund function, passing in the amount that meets the minimum value
            const fundTx = await fundMe.fund({value : ethers.parseEther("0.0000001")})
            // wait for transaction confirmation
            const receipt = await fundTx.wait();

            // console.log(receipt.logs)
            // 如果交易成功，返回 receipt.logs 数组，其中包含与事件相关的日志
            receipt.logs.forEach((log, index) => {
                console.log(`log: event name is ${log.fragment.name}, index is ${index}, sender is ${log.args._sender}, value is ${log.args._value}`);
            });

            // make sure the window is closed
            await helpers.time.increase(HELPERS_TIME_INCREASE);
            await helpers.mine();
            console.log(`log: time skipped ${HELPERS_TIME_INCREASE}`)
        }
    );
})