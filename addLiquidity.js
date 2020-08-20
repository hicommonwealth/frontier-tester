const Web3 = require('web3');

// libraries
const ERC20 = require('./build/contracts/ERC20.json');
const UniswapV2Router01 = require('@uniswap/v2-periphery/build/UniswapV2Router01.json');
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Pair = require('@uniswap/v2-core/build/UniswapV2Pair.json');

// Initialization
const USER_ADDRESS = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
const ROUTER_ADDRESS = '0xF8cef78E923919054037a1D03662bBD884fF4edf';
const FACTORY_ADDRESS = '0x5c4242beB94dE30b922f57241f1D02f36e906915';
const web3 = new Web3('http://localhost:9933');

web3.eth.accounts.wallet.add({
   privateKey: '0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342',
   address: USER_ADDRESS,
});

const addLiquidity = async (address0, amount0, address1, amount1) => {
   // approve the tokens first
   console.log(`Approving ${amount0} tokens from ${address0}.`);
   const token0 = new web3.eth.Contract(ERC20.abi, address0);
   const receipt0 = await token0.methods.approve(ROUTER_ADDRESS, amount0)
      .send({ from: USER_ADDRESS, gas: '4294967295' });
   console.log(`Got receipt: ${JSON.stringify(receipt0, null, 2)}.`);

   console.log(`Approving ${amount1} tokens from ${address1}.`);
   const token1 = new web3.eth.Contract(ERC20.abi, address1);
   const receipt1 = await token1.methods.approve(ROUTER_ADDRESS, amount1)
      .send({ from: USER_ADDRESS, gas: '4294967295' });
   console.log(`Got receipt: ${JSON.stringify(receipt1, null, 2)}.`);

   // then, create the pair
   console.log(`Adding liquidity...`);
   const router = new web3.eth.Contract(UniswapV2Router01.abi, ROUTER_ADDRESS);
   const liquidityReceipt = await router.methods.addLiquidity(
      address0, address1, amount0, amount1, 0, 0, USER_ADDRESS, Date.now() + 60 * 60 * 24
   ).send({ from: USER_ADDRESS, gas: '4294967295' });
   console.log(`Got receipt: ${JSON.stringify(liquidityReceipt, null, 2)}.`);

   // query the pair
   const factory = new web3.eth.Contract(UniswapV2Factory.abi, FACTORY_ADDRESS);
   const pairAddress = await factory.methods.getPair(address0, address1).call();
   const nPairs = await factory.methods.allPairsLength().call();
   console.log(`Got pair: ${pairAddress} (${nPairs} total pairs).`);

   // query the pair's reserves
   const pair = new web3.eth.Contract(UniswapV2Pair.abi, pairAddress);
   const result = await pair.methods.getReserves().call();
   const date = new Date(+result[2]);
   console.log(`Got reserves of 0:${result[0]}, 1:${result[1]}, ending at ${date.toString()}.`);
}

process.argv = process.argv.slice(2);
if (process.argv.length < 4) {
   console.log('Invalid arguments, using defaults.');
   addLiquidity(
      '0xe573BCA813c741229ffB2488F7856C6cAa841041', '10000',
      '0xBb0CC0fb3e0c06725c67167501f850B4900D6DB5', '10000',
   );
} else {
   addLiquidity(process.argv[0], process.argv[1], process.argv[2], process.argv[3]);
}
