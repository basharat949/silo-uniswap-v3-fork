const hre = require("hardhat");

async function main() {
    const [user] = await ethers.getSigners()
    const manager = "0xE8e8041cB5E3158A0829A19E014CA1cf91098554";
    // impersonate signer
    const siloRepsitaryManager = await ethers.getImpersonatedSigner(manager);
    await (
      await user.sendTransaction({
        to: manager,
        value: ethers.parseEther("100"),
      })
    ).wait();
  // Use the  _priceProvidersRepository address
  const priceProvidersRepositoryAddress = "0x7C2ca9D502f2409BeceAfa68E97a176Ff805029F";
  
  // Uniswap V3 Factory address (mainnet)
  const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; 

  // USDC/ETH 0.05% fee pool
  const poolAddress = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"; 

  // Tokens: USDC and WETH
  const tokenIn = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const tokenOut = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH (ETH)

  // Uniswap V3 pool address for USDC/ETH
  const uniswapV3PoolAddress = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";

  // Define the PriceCalculationData struct
  const priceCalculationData = {
    periodForAvgPrice: 1800, // 30 minutes TWAP
    blockTime: 13, // Estimated average block time in seconds
  };

  // Get contract factory for UniswapV3PriceProviderV2
  const UniswapV3PriceProviderV2 = await hre.ethers.getContractFactory("UniswapV3PriceProviderV2");
  // Deploy the contract with the constructor arguments
  const priceProvider = await UniswapV3PriceProviderV2.deploy(
    priceProvidersRepositoryAddress,
    uniswapV3FactoryAddress,
    priceCalculationData
  );

  console.log("UniswapV3PriceProviderV2 deployed to:", priceProvider.target);

  const tx = await priceProvider.connect(siloRepsitaryManager).setupAsset(tokenIn, [uniswapV3PoolAddress]);
  await tx.wait();
  console.log(`USDC token has been mapped to the USDC/WETH Uniswap V3 pool.`);

    // Call the getPrice function for USDC
    const price = await priceProvider.getPrice(tokenIn);
    console.log(
      "Price for USDC to WETH:",
      ethers.formatUnits(price.toString(), 18) + " ETH"
    );

    // Call the quotePrice function with the Uniswap V3 pool address
    const quotedPrice = await priceProvider.quotePrice(uniswapV3PoolAddress);
    console.log(
      "Quoted price from USDC/WETH Uniswap pool:",
      ethers.formatUnits(quotedPrice.toString(), 6) + " USDC"
    );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
