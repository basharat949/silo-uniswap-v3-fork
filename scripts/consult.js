const { ethers } = require("hardhat");

async function main() {

    const poolAddress = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"; // USDC/ETH 0.05% fee pool 

    // Deploy the PriceOracle contract
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    // Call the consult function to get the price
    const secondsAgo = 1;
    const amountIn = ethers.parseUnits("1", 18);
    const tokenIn = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
    const tokenOut = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // ETH
    // const tokenOut = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    // const tokenIn = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const {price, quoteAmount} = await priceOracle.getAveragePrice(poolAddress, secondsAgo, amountIn,tokenIn,tokenOut);
    
    console.log(`Price from ${secondsAgo} seconds ago:`, price.toString(), "Quote amount is:", quoteAmount.toString());

    const {price0, price1} = await priceOracle.getPrices(poolAddress);

    console.log("Price0 :", price0.toString(), "Price1 is:", price1.toString());

    // USDC to ETH Price
    const usdcAmount = ethers.parseUnits("1", 6); // amount of usdc in 6 decimals
    const UsdcToEth = await priceOracle.getQuote(tokenIn, tokenOut, poolAddress, usdcAmount);
    console.log("1 USDC <-> ETH:", ethers.formatUnits(UsdcToEth.toString(), 18) + ' ETH');

    // ETH to USDC Price
    const ethAmount = ethers.parseUnits("1", 18); // amount of eth in 18 decimals
    const EthToUsdc = await priceOracle.getQuote(tokenOut, tokenIn, poolAddress, ethAmount);
    console.log("1 ETH <-> USDC:", ethers.formatUnits(EthToUsdc.toString(), 6) + ' USDC');



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
