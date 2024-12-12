const DECIMAL = 8;
const INITIAL_ANSWER = 300000000000;
const LOCK_TIME = 180;
const HELPERS_TIME_INCREASE = 100;
const WAIT_CONFIRMATIONS = 5;
const DEVELOPMENT_CHAINS = ["hardhat", "local"];
const networkConfig = {
    // sepolia
    11155111: {
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    LOCK_TIME,
    HELPERS_TIME_INCREASE,
    WAIT_CONFIRMATIONS,
    DEVELOPMENT_CHAINS,
    networkConfig
}