// const contract = require("@truffle/contract");
// const { assert } = require("chai");
// const { account, initWeb3 } = require('../utils');
// const { deploy } = require('../deploy');

// const TokenA = require('../build/contracts/TokenA.json');
// const TokenB = require('../build/contracts/TokenB.json');

// const WETH9Meta = require('../node_modules/canonical-weth/build/contracts/WETH9.json');

// const SerranoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Serrano.json');
// const ShishitoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Shishito.json');
// const JalapenoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Jalapeno.json');
// const HabaneroMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Habanero.json');
// const PoblanoMeta = require('@picoswap/pico-test-tokens/deployments/beresheet/Poblano.json');

// const UniswapV2Router02 = require('../node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json');
// const UniswapV2Factory = require('../node_modules/@uniswap/v2-core/build/UniswapV2Factory.json');
// const UniswapV2Pair = require('../node_modules/@uniswap/v2-core/build/UniswapV2Pair.json');

// describe('Add Liquidity Test', () => {
//   let WEDG9_ADDRESS = '0x7d73424a8256C0b2BA245e5d5a3De8820E45F390';
//   let MULTICALL_ADDRESS = '0x73b647cbA2FE75Ba05B8e12ef8F8D6327D6367bF';
//   let SERRANO_ADDRESS = '0xc13697cEfc2dECB83102d857035e4C3be78d1d70';
//   let JALAPENO_ADDRESS = '0x6081DD59d190f5172946E409e053337831c1E019';
//   let HABENERO_ADDRESS = '0x294759D5191f26DA53918d207e5106eCa7b05dD3';
//   let SHISHITO_ADDRESS = '0x780675D71eBe3d3EF05fAE379063071147Dd3aEE';
//   let POBLANO_ADDRESS = '0x83271ef28CcB668893f35857761Cf62D5Be61f1d';

//   let FACTORY_ADDRESS = '0x2Ce636d6240f8955d085a896e12429f8B3c7db26';
//   let ROUTER_ADDRESS = '0x59AF421cB35fc23aB6C8ee42743e6176040031f4';

//   it('should create uniswap pair', async () => {
//     // deploy two tokens
//     const web3 = initWeb3();
//     const value = web3.utils.toWei('10', 'ether');
//     const amount0 = web3.utils.toWei('0.000001');
//     const amount1 = web3.utils.toWei('0.000001');

//     // create tokens
//     const Shishito = contract({
//       abi: ShishitoMeta.abi,
//       unlinked_binary: ShishitoMeta.bytecode,
//     });
//     Shishito.setProvider(web3.currentProvider);
//     const shishito = await Shishito.at(SHISHITO_ADDRESS);

//     console.log('Approving Shishito...');
//     const receipt0 = await shishito.approve(ROUTER_ADDRESS, amount0, {
//       from: account
//     });

//     const Jalapeno = contract({
//       abi: JalapenoMeta.abi,
//       unlinked_binary: JalapenoMeta.bytecode,
//     });
//     Jalapeno.setProvider(web3.currentProvider);
//     const jalapeno = await Jalapeno.at(JALAPENO_ADDRESS);

//     console.log('Approving Jalapeno...');
//     const receipt1 = await jalapeno.approve(ROUTER_ADDRESS, amount1, {
//       from: account
//     });

//     // deposit some WEDG
//     const WETH9 = contract({
//       abi: WETH9Meta.abi,
//       unlinked_binary: WETH9Meta.bytecode,
//     });
//     WETH9.setProvider(web3.currentProvider);
//     const weth9 = await WETH9.at(WEDG9_ADDRESS);

//     await weth9.deposit({ from: account, value });

//     // create token-token pair
//     const RouterContract = contract({
//       abi: UniswapV2Router02.abi,
//       unlinked_binary: UniswapV2Router02.bytecode,
//     });
//     RouterContract.setProvider(web3.currentProvider);
//     const router = await RouterContract.at(ROUTER_ADDRESS);
//     const args = [
//       shishito.address, jalapeno.address,
//       amount0, amount1,
//       "0", "0",
//       account,
//       Math.ceil(Date.now() / 1000) + (60 * 20), // 1 day
//       // { from: account, gas: web3.utils.toWei('100') },
//       { from: account },
//     ];
//     console.log('Adding liquidity with args: ', args);
//     const liquidityReceipt = await router.addLiquidity(...args);
//     console.log('Added liquidity');

//     // query the pair
//     const FactoryContract = contract({
//       abi: UniswapV2Factory.abi,
//       unlinked_binary: UniswapV2Factory.bytecode,
//     });
//     FactoryContract.setProvider(web3.currentProvider);
//     console.log('Querying factory for pair...');
//     const factory = await FactoryContract.at(FACTORY_ADDRESS, { from: account });
//     const pairAddress = await factory.getPair.call(address0, address1, {
//       from: account,
//     });
//     const nPairs = await factory.allPairsLength.call({ from: account });

//     // query the pair's reserves
//     console.log(`Got pair: ${pairAddress} (${nPairs} total pairs).`);
//     assert.notEqual(+nPairs, 0);
//     assert.notEqual(+(pairAddress.slice(2)), 0);
//     const PairContract = contract({
//       abi: UniswapV2Pair.abi,
//       unlinked_binary: UniswapV2Pair.bytecode,
//     });
//     PairContract.setProvider(web3.currentProvider);
//     const pair = await PairContract.at(pairAddress);
//     const result = await pair.getReserves.call({ from: account });
//     console.log('Found token0 in LP pool:', web3.utils.fromWei(result[0].toString()));
//     console.log('Found token1 in LP pool:', web3.utils.fromWei(result[1].toString()));
//     assert(result[0].toString() === amount0);
//     assert(result[1].toString() === amount1);

//     // approve swap
//     const amountIn = web3.utils.toWei('5');
//     const amountOutMin = web3.utils.toWei('1');
//     console.log('Approving token for swap...');
//     const swapApproveReceipt = await token0.approve(ROUTER_ADDRESS, amountIn, {
//       from: account
//     });

//     // swap
//     console.log(
//       'Swapping',
//       web3.utils.fromWei(amountIn),
//       'token0 for at least',
//       web3.utils.fromWei(amountOutMin),
//       'token1'
//     );
//     const deadline = (await web3.eth.getBlock('latest')).timestamp + 1000;
//     const swapReceipt = await router.swapExactTokensForTokens(
//       amountIn,
//       amountOutMin,
//       [ token0.address, token1.address ],
//       account,
//       deadline,
//       { from: account },
//     );
//     const result2 = await pair.getReserves.call({ from: account });
//     console.log('Found token0 in LP pool:', web3.utils.fromWei(result2[0].toString()));
//     console.log('Found token1 in LP pool:', web3.utils.fromWei(result2[1].toString()));
//     console.log('token0 balance:', web3.utils.fromWei(await token0.balanceOf(account)).toString());
//     console.log('token1 balance:', web3.utils.fromWei(await token1.balanceOf(account)).toString());
//     console.log('Done!');
//   });
// });
