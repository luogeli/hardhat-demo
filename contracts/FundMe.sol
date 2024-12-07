// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 需求：
// 1. 创建一个收款函数
// 2. 记录投资人并且查看
// 3. 在锁定期内，到达目标值，生产商可以提款
// 4. 在锁定期内，没有到达目标值，投资人在搜定期以后退款

contract FundMe {
    // 投资人和投资金额mapping
    mapping(address => uint256) public funderToAmount;
    // 最小值 wei, 使用常量定义 USD = 0.05 USD
    uint256 constant MINIMUN_VALUE = 0.0000001 *  10 ** 18;
    // 预言机dataFeed转换
    AggregatorV3Interface internal dataFeed;
    // 准备收集的目标值
    uint256 constant TARGET = 10 * 10 ** 18;

    address public owner;
    // 合约部署的时间点
    uint256 deploymentTimestamp;
    // 锁定时长
    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        // sepolia  testnetwork weijia
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        // 合约的部署者
        owner = msg.sender;
        // 当前区块的时间 发送合约部署交易所在的区块 当前的时间点
        deploymentTimestamp = block.timestamp;
        // 用户输入的入参
        lockTime = _lockTime;
    }

    /**
     * 装饰器: 判断资金是否大于最小值，如果不大于最小值，则返回异常信息提示
     */
    modifier requireMinAmount() {
        require(convertEthToUsd(msg.value) >= MINIMUN_VALUE, "Sned more ETH");
        _;
    }

    /**
     * 装饰器: 校验调用者必须为合约拥有者
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }

    /**
     * 收款
     */
    function fund() external payable requireMinAmount {
        // 校验当前fund()方法调用的时间 小于 合约部署的时间加锁定的时间
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed!");
        // 赋值投资人的投资金额
        funderToAmount[msg.sender] = msg.value;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
        /* uint80 roundID */,
            int answer,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    /**
     * 转换eth to usd
     *
     * @param ethAmount eth数量
     */
    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256) {
        // ethAmount is wei unit
        // ETH / USD precision = 10 ** 8
        // X / ETH precision is 10 ** 18
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    /**
     * 所有权转移
     */
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /**
     * 在锁定期内，到达目标值，生产商可以提款，
     * <P>
     *
     */
    function getFund() external onlyOwner {
        // 合约的余额的USD价值
        uint256 contractBalance = convertEthToUsd(address(this).balance);
        // 判断价值USD是否超过目标值
        require(contractBalance >= TARGET, "Target is not reached");
        // 校验当前getFund()方法调用的时间 大于等于 合约部署的时间加锁定的时间
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed, not getfund!");
        // transfer 纯转账 transfer ETH and revert if tx failed
        // PS: payable(address).transfer(value)
        // payable(msg.sender).transfer(address(this).balance);
        // send // 纯转账
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed")
        // call // 官方推荐 转账 + 写数据 带有数据的transfer 和 不带数据的transfer,
        // call: transfer ETH with data return value of function
        // payable(msg.sender).call({value : address(this).balance});
        bool success;
        (success , ) = payable(msg.sender).call{value : address(this).balance}("");
        require(success, "transfer tx failed");
        // 如果已经getFund，给flag设置为true
        getFundSuccess = true;
    }

    /**
     * 在锁定期内，没有到达目标值，投资人在搜定期以后退款
     */
    function refund() external {
        // 校验当前getFund()方法调用的时间 大于等于 合约部署的时间加锁定的时间
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed, not refund!");
        // 判断是否未到达目标值, 如果到达了则不允许退款
        uint256 contractBalance = convertEthToUsd(address(this).balance);
        require(contractBalance < TARGET, "Target is reached");
        // 判断当前用户是否已fund，如果没有fund，则返回错误提示
        uint256 amount = funderToAmount[msg.sender];
        require(amount != 0, "there is no fund for you");
        // 退款
        bool success;
        (success, ) = payable(msg.sender).call{value: amount} ("");
        require(success, "transfer tx failed");
        // 把当前用户金额设置为o
        funderToAmount[msg.sender] = 0;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "you do not have premission to call this function");
        funderToAmount[funder] = amountToUpdate;
    }
}