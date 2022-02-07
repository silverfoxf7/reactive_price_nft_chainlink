module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {

    const DECIMALS = '18'
    const INITIAL_PRICE = '100'
    const SECOND_PRICE = '20000'
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        const Aggregator = await deploy('EthUsdAggregatorMock', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks Deployed!")
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        log(`Depolyed Pricefeed Mock contract to ${Aggregator.address}`)
        log("You are deploying to a local network, you'll need a local network running to interact")
        log("Please run `npx hardhat console` to interact with the deployed smart contracts!")
        log("////////////////////////////////////////////////////")

        const AggregatorPC = await deploy('PCAggregatorMock', {
            contract: 'MockV3AggregatorPC',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE, SECOND_PRICE]
        })
        log("Mocks Deployed!")
        log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        log(`Depolyed Changing Pricefeed Mock contract to ${AggregatorPC.address}`)
        log("You are deploying to a local network, you'll need a local network running to interact")
        log("Please run `npx hardhat console` to interact with the deployed smart contracts!")
        log("////////////////////////////////////////////////////")        

        // Deploy the external library to generate swords
        // see https://github.com/wighawag/hardhat-deploy
        const swordMakerLibraryPC = await deploy("SwordMaker", {
            from: deployer
        });
        log(`Deployed SwordMaker library contract to ${swordMakerLibraryPC.address}`)

        const NFT_PC = await deploy('Nft', {
            from: deployer,
            args: [AggregatorPC.address],
            log: true,
            libraries: {SwordMaker: swordMakerLibraryPC.address}
        })

        log(`Deployed price changing NFT contract to ${NFT_PC.address}`)

        log("Let's create an price changing NFT now")
        const PCNFTContract = await ethers.getContractFactory("Nft", {libraries: {SwordMaker: swordMakerLibraryPC.address}})          
        const accounts = await ethers.getSigners()
        const signer = accounts[0]
        const anNFTPC = new ethers.Contract(NFT_PC.address, PCNFTContract.interface, signer) // Q: what does this do? new ethers.Contract(

        tx = await anNFTPC.create()
        log(`You can view the tokenURI of anNFTPC here ${await anNFTPC.tokenURI(0)}`)
        }

}