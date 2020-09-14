const EdgewarePrivateKeyProvider = require ('./private-provider')
const Web3 = require('web3');

// libraries
const ERC20 = require('./build/contracts/ERC20.json');
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Pair = require('@uniswap/v2-core/build/UniswapV2Pair.json');

// Initialization
const USER_ADDRESS = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
const FACTORY_ADDRESS = '0xF8cef78E923919054037a1D03662bBD884fF4edf';
const ROUTER_ADDRESS = '0x50275d3F95E0F2FCb2cAb2Ec7A231aE188d7319d';
// const web3 = new Web3('https://rinkeby.infura.io/v3/b19b8175e688448ead43a0ab5f03438a');

const privKey = '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342';
const provider = new EdgewarePrivateKeyProvider(privKey, "http://localhost:9933/", 42);
const web3 = new Web3(provider);

web3.eth.accounts.wallet.add({
   privateKey: '0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342',
   address: USER_ADDRESS,
});

const addLiquidity = async (address0, amount0, address1, amount1) => {
   // query the block for details
   const block = await web3.eth.getBlock('latest');
   console.log(`Latest block timestamp: ${block.timestamp}.`);

   // approve the tokens first
   console.log(`Approving ${amount0} tokens from ${address0}.`);
   const token0 = new web3.eth.Contract(ERC20.abi, address0);
   const receipt0 = await token0.methods.approve(ROUTER_ADDRESS, amount0)
      .send({ from: USER_ADDRESS, gasLimit: 10000000, gasPrice: 1000000000 });
   console.log(`Tx complete on block ${receipt0.blockNumber}, hash: ${receipt0.transactionHash}.`);

   console.log(`Approving ${amount1} tokens from ${address1}.`);
   const token1 = new web3.eth.Contract(ERC20.abi, address1);
   const receipt1 = await token1.methods.approve(ROUTER_ADDRESS, amount1)
      .send({ from: USER_ADDRESS, gasLimit: 10000000, gasPrice: 1000000000 });
   console.log(`Tx complete on block ${receipt1.blockNumber}, hash: ${receipt1.transactionHash}.`);

   // then, create the pair
   const router = new web3.eth.Contract(UniswapV2Router02.abi, ROUTER_ADDRESS);
   const args = [
      address0, address1,
      amount0, amount1,
      "0", "0",
      USER_ADDRESS,
      Math.ceil(Date.now() / 1000) + (60 * 20), // 1 day
   ];
   console.log('Adding liquidity with args: ', args);
   const liquidityReceipt = await router.methods.addLiquidity(...args)
      .send({ from: USER_ADDRESS, gasLimit: 10000000, gasPrice: 1500000000 });
   console.log(`Tx complete on block ${liquidityReceipt.blockNumber}, hash: ${liquidityReceipt.transactionHash}.`);
   
   // query the pair
   const factory = new web3.eth.Contract(UniswapV2Factory.abi, FACTORY_ADDRESS);
   const pairAddress = await factory.methods.getPair(address0, address1).call();
   console.log(pairAddress);
   const nPairs = await factory.methods.allPairsLength().call();

   // query the pair's reserves
   if (+(pairAddress.slice(2)) !== 0) {
      console.log(`Got pair: ${pairAddress} (${nPairs} total pairs).`);
      const pair = new web3.eth.Contract(UniswapV2Pair.abi, pairAddress);
      const result = await pair.methods.getReserves().call();
      const date = new Date(+result[2] * 1000);
      console.log(`Got reserves of 0:${result[0]}, 1:${result[1]}, ending at ${date.toString()}.`);
   } else {
      console.log(`Did not find pair (${nPairs} total pairs).`);
   }
}

process.argv = process.argv.slice(2);
if (process.argv.length < 4) {
   console.log('Insufficient arguments, using defaults.');
   addLiquidity(
      '0x92496871560a01551E1B4fD04540D7A519D5C19e', web3.utils.toWei('500'),
      '0x63A1519eE99d1121780FFfa1726Ed2eCc6d1611B', web3.utils.toWei('500'),
   );
} else {
   addLiquidity(process.argv[0], process.argv[1], process.argv[2], process.argv[3]);
}
