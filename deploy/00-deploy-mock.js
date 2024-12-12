// npx hardhat deploy getNamedAccounts = hre.getNamedAccounts

const { DECIMAL, INITIAL_ANSWER, DEVELOPMENT_CHAINS} = require("../helper-hardhat-config")
const {network} = require("hardhat");

module.exports = async({getNamedAccounts, deployments}) => {
    console.log(`log: network name is ${network.name}`)
    if(DEVELOPMENT_CHAINS.includes(network.name)) {
        console.log("log: this is deploy mock function")
        const { firstAccount, secondAccount } = await getNamedAccounts();
        const { deploy } = deployments;
        console.log(`log: firstAccount is ${firstAccount}, secondAccount is ${secondAccount}`)

        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        })
    } else {
        console.log("log: environment is local， mock contract deployment is skipped")
    }

}

// npx hardhat deploy --tags fundme/all
module.exports.tags = ["mock" ,"all"]